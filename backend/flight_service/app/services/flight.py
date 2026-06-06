from cruds.interfaces.flight import IFlightCRUD
from enums.sort import SortFlights
from exceptions.http_exceptions import ConflictException, NotFoundException
from models.flight import FlightModel
from schemas.flight import FlightCreate, FlightFilter, FlightUpdate
from sqlalchemy.orm import Session


class FlightService:
    def __init__(self, flightCRUD: type[IFlightCRUD], db: Session) -> None:
        self._flightCRUD = flightCRUD(db)

    async def get_all(
        self,
        flight_filter: FlightFilter,
        sort: SortFlights,
        page: int = 1,
        size: int = 100,
    ) -> list[FlightModel]:
        return await self._flightCRUD.get_all(
            flight_filter=flight_filter,
            sort=sort,
            offset=(page - 1) * size,
            limit=size,
        )

    async def get_by_id(self, flight_id: int) -> FlightModel:
        flight = await self._flightCRUD.get_by_id(flight_id)
        if flight is None:
            raise NotFoundException(prefix="Get flight")

        return flight

    async def add(self, flight_create: FlightCreate) -> FlightModel:
        flight_data = flight_create.model_dump()
        if flight_data.get("available_seats") is None:
            flight_data["available_seats"] = flight_data["capacity"]
        flight = FlightModel(**flight_data)
        flight = await self._flightCRUD.add(flight)
        if flight is None:
            raise ConflictException(
                prefix="Add flight",
                message="либо flight_number уже занят, "
                "либо такого(их) аэропорта(ов) не существует",
            )

        return flight

    async def patch(
        self,
        flight_id: int,
        flight_update: FlightUpdate,
    ) -> FlightModel:
        flight = await self._flightCRUD.get_by_id(flight_id)
        if flight is None:
            raise NotFoundException(prefix="Update flight")

        if (
            flight_update.capacity is not None
            and flight_update.available_seats is not None
            and flight_update.available_seats > flight_update.capacity
        ):
            raise ConflictException(
                prefix="Update flight",
                message="количество доступных мест не может быть больше вместимости",
            )

        if (
            flight_update.capacity is None
            and flight_update.available_seats is not None
            and flight_update.available_seats > flight.capacity
        ):
            raise ConflictException(
                prefix="Update flight",
                message="количество доступных мест не может быть больше вместимости",
            )

        flight = await self._flightCRUD.patch(flight, flight_update)
        if flight is None:
            raise ConflictException(prefix="Update flight")

        return flight

    async def delete(self, flight_id: int) -> FlightModel:
        flight = await self._flightCRUD.get_by_id(flight_id)
        if flight is None:
            raise NotFoundException(prefix="Delete flight")

        return await self._flightCRUD.delete(flight)
