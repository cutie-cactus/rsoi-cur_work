from abc import ABC, abstractmethod

from fastapi.security import HTTPAuthorizationCredentials
from enums.sort import SortFlights
from schemas.flight import FlightFilter, FlightUpdate


class IFlightCRUD(ABC):
    def __init__(self, token: HTTPAuthorizationCredentials | None = None) -> None:
        self.token = token

    @abstractmethod
    async def get_all_flights(
        self,
        flight_filter: FlightFilter,
        sort: SortFlights = SortFlights.IdAsc,
        page: int = 1,
        size: int = 100,
    ) -> list[dict]:
        pass

    @abstractmethod
    async def get_airport_by_id(
        self,
        airport_id: int,
    ) -> dict:
        pass

    @abstractmethod
    async def update_flight_by_id(
        self,
        flight_id: int,
        flight_update: FlightUpdate,
    ) -> dict:
        pass
