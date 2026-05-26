from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.User import User, Admin
from fastapi import HTTPException, status


def CreateUser(db, user_data):
    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Denne e-postadressen har allerede blitt brukt."
        )

    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        middle_name=user_data.middle_name,
        last_name=user_data.last_name,
        contact=user_data.contact,
        active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
def UserAuth (db, email: str, password:str):
    user = db.query(User).filter_by(email=email).first()
    if not user:
        return None

    if user.password != password:
        return {"Feil Passord"}

    return user


def AdminAuth(db, email: str, password: str):
    admin = db.query(Admin).filter(Admin.email == email).first()

    if not admin:
        return None

    if admin.password != password:
        return None

    if not admin.active:
        return None

    return admin