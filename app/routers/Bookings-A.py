from app.services.Booking-S import check_booking
from sqlalchemy.orm import Session

@router.post("/booking/{id}/approve")
def approve_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Ingen Autoritet.")
    return check_booking.approve_booking(db, booking_id)