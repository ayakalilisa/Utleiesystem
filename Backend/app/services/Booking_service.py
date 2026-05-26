from http.client import HTTPException

from app.models.Booking import Booking
from app.schemas.Booking_S import BookingCreate
from sqlalchemy.orm import Session
from datetime import date
from app.core.enums import BookingEnum

from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.Booking import Booking
from app.models.User import User
from app.models.item import Item


def check_booking(db: Session, item_id: int, start: date, end: date):
    """
    Checks if an item is already actively booked in the selected period.
    Overlap condition:
    existing.start_date <= requested.end_date
    existing.end_date >= requested.start_date
    """
    return db.query(Booking).filter(
        Booking.item_id == item_id,
        Booking.start_date <= end,
        Booking.end_date >= start,
        Booking.active == True
    ).all()


def create_booking(db: Session, booking_data):
    """
    Creates a new active booking if:
    - user exists
    - item exists
    - item is not already booked in the same period
    """

    user = db.query(User).filter(User.id == booking_data.user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bruker ikke funnet"
        )

    item = db.query(Item).filter(Item.id == booking_data.item_id).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Varen ikke funnet"
        )

    conflicts = check_booking(
        db=db,
        item_id=booking_data.item_id,
        start=booking_data.start_date,
        end=booking_data.end_date
    )

    if conflicts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Varen er ikke tilgjenglig"
        )

    new_booking = Booking(
        user_id=booking_data.user_id,
        item_id=booking_data.item_id,
        start_date=booking_data.start_date,
        end_date=booking_data.end_date,
        active=True,
        comment=booking_data.comment
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking


def get_all_bookings(db: Session):
    return db.query(Booking).all()


def get_booking_by_id(db: Session, booking_id: int):
    return db.query(Booking).filter(Booking.id == booking_id).first()


def deactivate_booking(db: Session, booking_id: int):
    """
    Sets active=False when the booking is finished/cancelled/expired.
    """

    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        return None

    booking.active = False

    db.commit()
    db.refresh(booking)

    return booking


def activate_booking(db: Session, booking_id: int):
    """
    Reactivates a booking only if it does not conflict with another active booking.
    """

    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        return None

    conflicts = check_booking(
        db=db,
        item_id=booking.item_id,
        start=booking.start_date,
        end=booking.end_date
    )

    # Remove itself from conflict list if it is already active
    conflicts = [conflict for conflict in conflicts if conflict.id != booking.id]

    if conflicts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Varen er allerede booket"
        )

    booking.active = True

    db.commit()
    db.refresh(booking)

    return booking


def delete_booking(db: Session, booking_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        return None

    db.delete(booking)
    db.commit()

    return {"message": f"Bestilling {booking_id} er slettet"}