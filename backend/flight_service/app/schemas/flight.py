from datetime import datetime as dt
from typing import Annotated

from pydantic import BaseModel, conint, constr, model_validator


def convert_datetime_to_iso_8601_without_time_zone(datetime: dt) -> str:
    return datetime.strftime("%Y-%m-%d %H:%M")


class FlightBase(BaseModel):
    flight_number: Annotated[str, constr(max_length=20)]
    price: Annotated[int, conint(ge=1)]
    datetime: dt
    from_airport_id: Annotated[int, conint(ge=1)] | None
    to_airport_id: Annotated[int, conint(ge=1)] | None


class FlightFilter(BaseModel):
    flight_number: Annotated[str, constr(max_length=20)] | None = None
    min_price: Annotated[int, conint(ge=1)] | None = None
    max_price: Annotated[int, conint(ge=1)] | None = None
    min_datetime: dt | None = None
    max_datetime: dt | None = None


class FlightCreate(FlightBase):
    from_airport_id: Annotated[int, conint(ge=1)] | None = None
    to_airport_id: Annotated[int, conint(ge=1)] | None = None
    capacity: Annotated[int, conint(ge=0)] = 50
    available_seats: Annotated[int, conint(ge=0)] | None = None

    @model_validator(mode="after")
    def fill_available_seats(self) -> "FlightCreate":
        if self.available_seats is None:
            self.available_seats = self.capacity
        if self.available_seats > self.capacity:
            raise ValueError("available_seats cannot be greater than capacity")
        return self


class FlightUpdate(BaseModel):
    price: Annotated[int, conint(ge=1)] | None = None
    datetime: dt | None = None
    from_airport_id: Annotated[int, conint(ge=1)] | None = None
    to_airport_id: Annotated[int, conint(ge=1)] | None = None
    capacity: Annotated[int, conint(ge=0)] | None = None
    available_seats: Annotated[int, conint(ge=0)] | None = None

    @model_validator(mode="after")
    def validate_capacity(self) -> "FlightUpdate":
        if (
            self.capacity is not None
            and self.available_seats is not None
            and self.available_seats > self.capacity
        ):
            raise ValueError("available_seats cannot be greater than capacity")
        return self


class Flight(FlightBase):
    id: int
    capacity: Annotated[int, conint(ge=0)]
    available_seats: Annotated[int, conint(ge=0)]

    class Config:
        json_encoders = {
            dt: convert_datetime_to_iso_8601_without_time_zone,
        }
