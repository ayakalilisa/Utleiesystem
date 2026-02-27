from enum import Enum

'''This script contains all the status choices classes (enums)'''

# item status
class ItemEnum(str, Enum):
    new = "Helt ny"
    repair = "Treng repersjon"
    unavailable = "Kan ikke leie ut"

# Booking status
class BookingEnum(str, Enum):
    requested = "Forespurt"
    confirmed = "Bekreftet"

