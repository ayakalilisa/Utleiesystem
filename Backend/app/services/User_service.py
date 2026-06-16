from pydantic import BaseModel, EmailStr
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

def CreateAdmin(db, admin_data):
    existing_admin = db.query(Admin).filter(Admin.email == admin_data.email).first()

    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Denne e-postadressen er allerede registrert som admin."
        )

    if admin_data.contact:
        existing_contact = db.query(Admin).filter(Admin.contact == admin_data.contact).first()

        if existing_contact:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dette telefonnummeret er allerede registrert."
            )

    new_admin = Admin(
        first_name=admin_data.first_name,
        middle_name=admin_data.middle_name,
        last_name=admin_data.last_name,
        email=admin_data.email,
        password=admin_data.password,
        contact=admin_data.contact,
        active=True
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return new_admin

def AdminAuth(db, email: str, password: str):
    admin = db.query(Admin).filter(Admin.email == email).first()

    if not admin:
        return "email_not_found"

    if admin.password != password:
        return "wrong_password"

    if not admin.active:
        return "inactive"

    return admin

# Moved from User_S to here since schema is only in charge with the table
def get_all_users(db):
    return db.query(User).all()