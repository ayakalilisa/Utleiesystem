from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.User_S import UserRegister,AdminRegister, AdminResponse
from app.services.User_service import AdminAuth, CreateAdmin
from app.core.security import get_tolken

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
@router.post("/login")
def login(user_data: UserRegister, db: Session = Depends(get_db)):
    result = AdminAuth(db, user_data.email, user_data.password)

    if result == "email_not_found":
        raise HTTPException(
            status_code=404,
            detail="Admin finnes ikke, registrer først."
        )

    if result == "wrong_password":
        raise HTTPException(
            status_code=401,
            detail="Feil passord."
        )

    if result == "inactive":
        raise HTTPException(
            status_code=403,
            detail="Admin-kontoen er deaktivert."
        )

    admin = result

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

@router.post("/register", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def register_admin(
    admin_data: AdminRegister,
    db: Session = Depends(get_db)
):
    return CreateAdmin(db, admin_data)
