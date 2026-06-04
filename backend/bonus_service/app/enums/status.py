from enum import Enum


class PrivilegeStatus(str, Enum):
    STANDARD = "STANDARD"
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"


class PrivilegeHistoryStatus(str, Enum):
    FILL_IN_BALANCE = "FILL_IN_BALANCE"
    DEBIT_THE_ACCOUNT = "DEBIT_THE_ACCOUNT"
