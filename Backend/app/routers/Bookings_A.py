from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependency import require_admin
from app.database import get_db
from app.schemas.Booking_S import BookingCreate, BookingResponse, BookingGroupCreate
from app.services.Booking_service import (
    create_booking,
    create_booking_group,
    get_all_bookings,
    get_booking_by_id,
    deactivate_booking,
    delete_booking
)

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

@router.post("/group", response_model=list[BookingResponse], status_code=status.HTTP_201_CREATED)
def create_new_booking_group(
    booking_data: BookingGroupCreate,
    db: Session = Depends(get_db)
):
    return create_booking_group(db, booking_data)

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_new_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db)
):
    return create_booking(db, booking_data)


@router.get("/", response_model=list[BookingResponse])
def read_all_bookings(
    db: Session = Depends(get_db)
):
    return get_all_bookings(db)


@router.get("/{booking_id}", response_model=BookingResponse)
def read_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    booking = get_booking_by_id(db, booking_id)

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking ikke funnet"
        )

    return booking


@router.put("/{booking_id}/deactivate", response_model=BookingResponse)
def deactivate_existing_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    booking = deactivate_booking(db, booking_id)

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking ikke funnet"
        )

    return booking


@router.delete("/{booking_id}")
def delete_existing_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    result = delete_booking(db, booking_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking ikke funnet"
        )

    return result