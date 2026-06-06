from typing import Annotated

from enums.auth import RoleEnum
from pydantic import BaseModel, EmailStr, constr
from schemas.bonus import PrivilegeShortInfo
from schemas.ticket import TicketResponse


class UserPayloadDto(BaseModel):
    login: Annotated[str, constr(max_length=80)]
    email: EmailStr
    lastname: Annotated[str, constr(max_length=80)]
    firstname: Annotated[str, constr(max_length=80)]
    phone: Annotated[str, constr(max_length=20)]
    role: RoleEnum


class UserInfoResponse(BaseModel):
    tickets: list[TicketResponse]
    privilege: PrivilegeShortInfo | dict
    ticketsUnavailable: bool = False
    ticketsMessage: str | None = None
