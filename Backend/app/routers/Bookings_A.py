from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependency import require_admin
from app.services.Booking_service import activate_booking

from app.schemas.Booking_S import BookingCreate, BookingResponse
from app.services.Booking_service import create_booking


router = APIRouter(
    prefix="/booking",
    tags=["booking"],
    dependencies=[Depends(require_admin)]
)


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_new_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db)
):
    return create_booking(db, booking_data)


@router.post("/{booking_id}/approve")
def approve_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    result = activate_booking(db, booking_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking ikke funnet"
        )

    return result