from uuid import UUID

import requests
from cruds.interfaces.bonus import IBonusCRUD
from cruds.interfaces.flight import IFlightCRUD
from cruds.interfaces.ticket import ITicketCRUD
from enums.sort import SortFlights
from enums.status import PrivilegeHistoryStatus, PrivilegeStatus, TicketStatus
from exceptions.http_exceptions import (
    ConflictException,
    NotFoundException,
    ServiceUnavailableException,
)
from fastapi.security import HTTPAuthorizationCredentials
from schemas.bonus import (
    BalanceHistory,
    PrivilegeCreate,
    PrivilegeHistoryCreate,
    PrivilegeHistoryFilter,
    PrivilegeInfoResponse,
    PrivilegeShortInfo,
    PrivilegeUpdate,
)
from schemas.flight import (
    FlightFilter,
    FlightFilterGateway,
    FlightResponse,
    FlightUpdate,
    PaginationResponse,
)
from schemas.ticket import (
    TicketCreate,
    TicketPurchaseRequest,
    TicketPurchaseResponse,
    TicketResponse,
    TicketUpdate,
)
from schemas.user import UserInfoResponse
from utils.request_queue import RequestQueue
from utils.settings import get_settings


class GatewayService:
    def __init__(
        self,
        flightCRUD: type[IFlightCRUD],
        ticketCRUD: type[ITicketCRUD],
        bonusCRUD: type[IBonusCRUD],
        token: HTTPAuthorizationCredentials | None = None,
    ) -> None:
        self._flightCRUD = flightCRUD(token)
        self._ticketCRUD = ticketCRUD(token)
        self._bonusCRUD = bonusCRUD(token)

        settings = get_settings()
        gateway_host = settings["services"]["gateway"]["host"]
        gateway_port = settings["services"]["gateway"]["port"]

        self.http_path = f"http://{gateway_host}:{gateway_port}/api/v1/"

    async def get_list_of_flights(
        self,
        flight_filter: FlightFilterGateway,
        sort: SortFlights,
        page: int,
        size: int,
    ) -> PaginationResponse:
        if sort not in [
            SortFlights.FromAirportmAsc,
            SortFlights.FromAirportDesc,
            SortFlights.ToAirportmAsc,
            SortFlights.ToAirportDesc,
        ]:
            sort_flights = sort
        else:
            sort_flights = SortFlights.IdAsc

        flight_list = await self._flightCRUD.get_all_flights(
            flight_filter=FlightFilter(
                flightNumber=flight_filter.flightNumber,
                minDatetime=flight_filter.minDatetime,
                maxDatetime=flight_filter.maxDatetime,
                minPrice=flight_filter.minPrice,
                maxPrice=flight_filter.maxPrice,
            ),
            sort=sort_flights,
            page=1,
            size=100000,
        )

        flights = []
        for flight_dict in flight_list:
            from_airport = await self.__get_airport_by_id(
                flight_dict.get("from_airport_id"),
            )
            to_airport = await self.__get_airport_by_id(
                flight_dict.get("to_airport_id"),
            )

            if (
                not flight_filter.fromAirport
                or flight_filter.fromAirport in from_airport
            ) and (
                not flight_filter.toAirport
                or flight_filter.toAirport in to_airport
            ):
                flights.append(
                    FlightResponse(
                        flightNumber=flight_dict["flight_number"],
                        fromAirport=from_airport,
                        toAirport=to_airport,
                        date=flight_dict["datetime"],
                        price=flight_dict["price"],
                        capacity=flight_dict.get("capacity", 0),
                        availableSeats=flight_dict.get(
                            "available_seats",
                            flight_dict.get("capacity", 0),
                        ),
                    ),
                )

        if sort == SortFlights.FromAirportmAsc:
            flights = sorted(
                flights,
                key=lambda flight: flight.fromAirport,
            )
        elif sort == SortFlights.FromAirportDesc:
            flights = sorted(
                flights,
                key=lambda flight: flight.fromAirport,
                reverse=True,
            )
        elif sort == SortFlights.ToAirportmAsc:
            flights = sorted(
                flights,
                key=lambda flight: flight.toAirport,
            )
        elif sort == SortFlights.ToAirportDesc:
            flights = sorted(
                flights,
                key=lambda flight: flight.toAirport,
                reverse=True,
            )

        total_elements = len(flights)
        offset = (page - 1) * size
        limit = offset + size

        return PaginationResponse(
            page=page,
            pageSize=size,
            totalElements=total_elements,
            items=flights[offset:limit],
        )

    async def get_info_on_all_user_tickets(
        self,
        user_name: str,
    ) -> list[TicketResponse]:
        ticket_list = await self._ticketCRUD.get_all_tickets(
            username=user_name,
        )

        tickets = []
        for ticket_dict in ticket_list:
            tickets.append(await self.__build_ticket_response(ticket_dict))

        return tickets

    async def get_info_on_user_ticket(
        self,
        user_name: str,
        ticket_uid: UUID,
    ) -> TicketResponse:
        ticket_dict = await self._ticketCRUD.get_ticket_by_uid(ticket_uid)
        if not ticket_dict or ticket_dict["username"] != user_name:
            raise NotFoundException(
                prefix="Get Ticket",
                message="Билета с таким UID у данного пользователя не существует",
            )

        return await self.__build_ticket_response(ticket_dict)

    async def buy_ticket(
        self,
        user_name: str,
        ticket_purchase_request: TicketPurchaseRequest,
    ) -> TicketPurchaseResponse:
        flight_dict = await self.__get_flight_by_number(
            ticket_purchase_request.flightNumber,
        )
        if flight_dict is None:
            raise NotFoundException(
                prefix="Buy Ticket",
                message="Рейса с таким номером не существует",
            )

        quantity = ticket_purchase_request.quantity
        available_seats = flight_dict.get(
            "available_seats",
            flight_dict.get("capacity", 0),
        )
        if quantity > available_seats:
            raise ConflictException(
                prefix="Buy Ticket",
                message=(
                    f"на рейсе осталось {available_seats} мест, "
                    f"а запрошено {quantity}"
                ),
            )

        await self.__set_available_seats(
            flight_dict,
            available_seats - quantity,
        )

        created_tickets: list[dict] = []
        try:
            privilege_dict = await self.__get_privilege_by_username(user_name)
            remaining_balance = privilege_dict["balance"]
            updated_privilege = privilege_dict
            total_paid_by_bonuses = 0
            total_paid_by_money = 0

            for _ in range(quantity):
                paid_by_bonuses, paid_by_money = await self.__paid_ticket(
                    price=ticket_purchase_request.price,
                    balance=remaining_balance,
                    paid_from_balance=ticket_purchase_request.paidFromBalance,
                )

                ticket_dict = await self.__get_new_ticket(
                    username=user_name,
                    flight_number=ticket_purchase_request.flightNumber,
                    price=paid_by_money,
                )
                created_tickets.append(ticket_dict)

                if ticket_purchase_request.paidFromBalance:
                    updated_privilege = await self.__write_off_bonuses(
                        privilege_dict=updated_privilege,
                        ticket_uid=ticket_dict["ticket_uid"],
                        balance_diff=paid_by_bonuses,
                    )
                    remaining_balance = updated_privilege["balance"]
                else:
                    coeff = self.__get_bonus_accrual_coeff(
                        updated_privilege["status"],
                    )
                    updated_privilege = await self.__add_bonuses(
                        privilege_dict=updated_privilege,
                        ticket_uid=ticket_dict["ticket_uid"],
                        balance_diff=round(paid_by_money * coeff),
                    )

                total_paid_by_bonuses += paid_by_bonuses
                total_paid_by_money += paid_by_money
        except Exception:
            await self.__safe_delete_tickets(created_tickets)
            await self.__safe_restore_seats(flight_dict, available_seats)
            raise

        try:
            from_airport = await self.__get_airport_by_id(
                flight_dict.get("from_airport_id"),
            )
            to_airport = await self.__get_airport_by_id(
                flight_dict.get("to_airport_id"),
            )
        except ServiceUnavailableException:
            from_airport = (
                f"from_airport_id: {flight_dict.get('from_airport_id')}"
            )
            to_airport = f"to_airport_id: {flight_dict.get('to_airport_id')}"

        ticket_responses = []
        for ticket_dict in created_tickets:
            ticket_responses.append(
                TicketResponse(
                    ticketUid=ticket_dict["ticket_uid"],
                    flightNumber=flight_dict["flight_number"],
                    fromAirport=from_airport,
                    toAirport=to_airport,
                    date=flight_dict["datetime"],
                    price=ticket_dict["price"],
                    status=ticket_dict["status"],
                ),
            )

        first_ticket = created_tickets[0]
        return TicketPurchaseResponse(
            ticketUid=first_ticket["ticket_uid"],
            flightNumber=flight_dict["flight_number"],
            fromAirport=from_airport,
            toAirport=to_airport,
            date=flight_dict["datetime"],
            price=ticket_purchase_request.price,
            paidByMoney=total_paid_by_money,
            paidByBonuses=total_paid_by_bonuses,
            status=first_ticket["status"],
            privilege=PrivilegeShortInfo(**updated_privilege),
            quantity=quantity,
            totalPrice=ticket_purchase_request.price * quantity,
            tickets=ticket_responses,
        )

    async def ticket_refund(self, user_name: str, ticket_uid: UUID) -> dict:
        ticket_dict = await self._ticketCRUD.get_ticket_by_uid(ticket_uid)
        if not ticket_dict or ticket_dict["username"] != user_name:
            raise NotFoundException(
                prefix="Get Ticket",
                message="Билета с таким UID у данного пользователя не существует",
            )

        if ticket_dict["status"] == TicketStatus.Canceled.value:
            return ticket_dict

        updated_ticket_dict = await self._ticketCRUD.update_ticket(
            ticket_uid=ticket_uid,
            ticket_update=TicketUpdate(
                status=TicketStatus.Canceled.value,
            ),
        )

        try:
            flight_dict = await self.__get_flight_by_number(
                ticket_dict["flight_number"],
            )
            if flight_dict:
                available_seats = flight_dict.get(
                    "available_seats",
                    flight_dict.get("capacity", 0),
                )
                capacity = flight_dict.get("capacity", available_seats)
                await self.__set_available_seats(
                    flight_dict,
                    min(capacity, available_seats + 1),
                )
        except ServiceUnavailableException:
            pass

        try:
            privilege_histories = (
                await self._bonusCRUD.get_all_privilege_histories(
                    PrivilegeHistoryFilter(
                        ticket_uid=ticket_uid,
                    ),
                )
            )
            last_history_dict = privilege_histories[-1]
            privilege_dict = await self._bonusCRUD.get_privilege_by_id(
                privilege_id=last_history_dict["privilege_id"],
            )

            if (
                last_history_dict["operation_type"]
                == PrivilegeHistoryStatus.FILL_IN_BALANCE
            ):
                await self.__write_off_bonuses(
                    privilege_dict=privilege_dict,
                    ticket_uid=ticket_uid,
                    balance_diff=last_history_dict["balance_diff"],
                )
            else:
                await self.__add_bonuses(
                    privilege_dict=privilege_dict,
                    ticket_uid=ticket_uid,
                    balance_diff=last_history_dict["balance_diff"],
                )
        except ServiceUnavailableException:
            RequestQueue.add_http_request(
                url=f"{self.http_path}tickets/{ticket_uid}",
                headers={"X-User-Name": user_name},
                http_method=requests.delete,
            )

        return updated_ticket_dict

    async def get_user_information(self, user_name: str) -> UserInfoResponse:
        tickets = []
        tickets_unavailable = False
        tickets_message = None
        try:
            tickets = await self.get_info_on_all_user_tickets(user_name)
        except ServiceUnavailableException:
            tickets_unavailable = True
            tickets_message = (
                "Сервис билетов временно недоступен. "
                "Профиль и бонусный счёт отображаются, а список покупок "
                "будет загружен после восстановления ticket-service."
            )

        try:
            privilege_dict = await self.__get_privilege_by_username(user_name)
        except ServiceUnavailableException:
            privilege_dict = {}

        return UserInfoResponse(
            tickets=tickets,
            privilege=privilege_dict,
            ticketsUnavailable=tickets_unavailable,
            ticketsMessage=tickets_message,
        )

    async def get_info_about_bonus_account(
        self,
        user_name: str,
    ) -> PrivilegeInfoResponse:
        privilege_dict = await self.__get_privilege_by_username(user_name)
        privilege_histories = (
            await self._bonusCRUD.get_all_privilege_histories(
                PrivilegeHistoryFilter(
                    privilege_id=privilege_dict["id"],
                ),
            )
        )

        histories = []
        for history in privilege_histories:
            histories.append(
                BalanceHistory(
                    date=history["datetime"],
                    ticketUid=history["ticket_uid"],
                    balanceDiff=history["balance_diff"],
                    operationType=history["operation_type"],
                ),
            )

        return PrivilegeInfoResponse(
            balance=privilege_dict["balance"] if privilege_dict else None,
            status=privilege_dict["status"] if privilege_dict else None,
            history=histories,
        )

    async def __build_ticket_response(self, ticket_dict: dict) -> TicketResponse:
        try:
            flight_dict = await self.__get_flight_by_number(
                ticket_dict["flight_number"],
            )
            from_airport = await self.__get_airport_by_id(
                flight_dict.get("from_airport_id"),
            )
            to_airport = await self.__get_airport_by_id(
                flight_dict.get("to_airport_id"),
            )
        except ServiceUnavailableException:
            flight_dict = None
            from_airport = f"flight_number: {ticket_dict['flight_number']}"
            to_airport = f"flight_number: {ticket_dict['flight_number']}"

        return TicketResponse(
            ticketUid=ticket_dict["ticket_uid"],
            flightNumber=ticket_dict["flight_number"],
            fromAirport=from_airport,
            toAirport=to_airport,
            date=flight_dict["datetime"] if flight_dict else "",
            price=ticket_dict["price"],
            status=ticket_dict["status"],
        )

    async def __write_off_bonuses(
        self,
        privilege_dict: dict,
        ticket_uid: UUID,
        balance_diff: int,
    ) -> dict:
        if balance_diff > privilege_dict["balance"]:
            balance_diff = privilege_dict["balance"]

        updated_privilege = await self._bonusCRUD.update_privilege_by_id(
            privilege_id=privilege_dict["id"],
            privilege_update=PrivilegeUpdate(
                balance=privilege_dict["balance"] - balance_diff,
            ),
        )

        await self._bonusCRUD.create_new_privilege_history(
            PrivilegeHistoryCreate(
                privilege_id=privilege_dict["id"],
                ticket_uid=ticket_uid,
                balance_diff=balance_diff,
                operation_type=PrivilegeHistoryStatus.DEBIT_THE_ACCOUNT.value,
            ),
        )

        return updated_privilege

    async def __add_bonuses(
        self,
        privilege_dict: dict,
        ticket_uid: UUID,
        balance_diff: int,
    ) -> dict:
        updated_privilege = await self._bonusCRUD.update_privilege_by_id(
            privilege_id=privilege_dict["id"],
            privilege_update=PrivilegeUpdate(
                balance=privilege_dict["balance"] + balance_diff,
            ),
        )

        await self._bonusCRUD.create_new_privilege_history(
            PrivilegeHistoryCreate(
                privilege_id=privilege_dict["id"],
                ticket_uid=ticket_uid,
                balance_diff=balance_diff,
                operation_type=PrivilegeHistoryStatus.FILL_IN_BALANCE.value,
            ),
        )

        return updated_privilege

    def __get_bonus_accrual_coeff(self, privilege_status: str) -> float:
        if privilege_status == PrivilegeStatus.GOLD.value:
            coeff = 0.1
        elif privilege_status == PrivilegeStatus.SILVER.value:
            coeff = 0.1
        else:
            coeff = 0.1

        return coeff

    async def __paid_ticket(
        self,
        price: int,
        balance: int,
        paid_from_balance: bool,
    ) -> list[int]:
        paid_by_bonuses = min(price, balance) if paid_from_balance else 0
        paid_by_money = price - paid_by_bonuses

        return paid_by_bonuses, paid_by_money

    async def __get_airport_by_id(self, airport_id: int | None) -> str | None:
        if airport_id:
            airport_dict = await self._flightCRUD.get_airport_by_id(airport_id)
            airport = f"{airport_dict['city']} {airport_dict['name']}"
        else:
            airport = None

        return airport

    async def __get_flight_by_number(self, flight_number: str) -> dict | None:
        flight_list = await self._flightCRUD.get_all_flights(
            flight_filter=FlightFilter(
                flightNumber=flight_number,
            ),
        )
        return flight_list[0] if len(flight_list) else None

    async def __set_available_seats(
        self,
        flight_dict: dict,
        available_seats: int,
    ) -> dict:
        return await self._flightCRUD.update_flight_by_id(
            flight_id=flight_dict["id"],
            flight_update=FlightUpdate(
                available_seats=available_seats,
            ),
        )

    async def __safe_restore_seats(
        self,
        flight_dict: dict,
        available_seats: int,
    ) -> None:
        try:
            await self.__set_available_seats(flight_dict, available_seats)
        except Exception as err:
            print(f"[gateway capacity rollback error] {err}", flush=True)

    async def __safe_delete_tickets(self, tickets: list[dict]) -> None:
        for ticket_dict in tickets:
            try:
                await self._ticketCRUD.delete_ticket(ticket_dict["ticket_uid"])
            except Exception as err:
                print(f"[gateway ticket rollback error] {err}", flush=True)

    async def __get_privilege_by_username(self, username: str) -> dict:
        privilege_list = await self._bonusCRUD.get_all_privileges(
            username=username,
        )
        if len(privilege_list):
            privilege_dict = privilege_list[0]
        else:
            privilege_dict = await self.__get_new_privilege(username)

        return privilege_dict

    async def __get_new_privilege(self, username: str) -> dict:
        privilege_id = await self._bonusCRUD.create_new_privilege(
            PrivilegeCreate(
                username=username,
                balance=0,
            ),
        )
        return await self._bonusCRUD.get_privilege_by_id(privilege_id)

    async def __get_new_ticket(
        self,
        username: str,
        flight_number: str,
        price: int,
    ) -> dict:
        ticket_uid = await self._ticketCRUD.create_new_ticket(
            TicketCreate(
                username=username,
                flight_number=flight_number,
                price=price,
                status=TicketStatus.Paid.value,
            ),
        )
        return await self._ticketCRUD.get_ticket_by_uid(ticket_uid)
