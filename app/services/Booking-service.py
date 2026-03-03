from http.client import HTTPException

from app.models.Booking import Booking
from app.schemas.Booking-S import BookingCreate
from sqlalchemy.orm import Session
from datetime import date
from app.core.enums import BookingEnum

# Check when frontend requested
def check_booking(db: Session, item_id: int, start:date, end:date ):
    return(db.query(Booking).filter(
        Booking.item_id == item_id,
        Booking.start_date <= end,
        Booking.end_date >= start,
        Booking.status == BookingEnum.confirmed
    ).all())




