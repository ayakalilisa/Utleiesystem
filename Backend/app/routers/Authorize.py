from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.User_S import UserLogin
from app.services.User_service import AdminAuth
from app.core.security import get_tolken


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    admin = AdminAuth(db, user_data.email, user_data.password)

    if not admin:
        raise HTTPException(status_code=401, detail="Ugyldig pålogging")

    access_token = get_tolken(
        data={
            "admin_id": admin.id,
            "email": admin.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }