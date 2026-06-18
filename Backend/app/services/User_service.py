from pydantic import BaseModel, EmailStr
from app.models.User import User, Admin
from fastapi import HTTPException, status


def CreateUser(db, user_data):
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Denne e-posten er allerede i bruk"
        )

    if user_data.contact:
        existing_contact = db.query(User).filter(User.contact == user_data.contact).first()
        if existing_contact:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Dette telefonnummeret er allerede i bruk"
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

def get_user_by_id(db, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def update_user_service(db, user_id: int, user_data):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return None

    update_data = user_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)

    return user


def delete_user_service(db, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return None

    deleted_user_id = user.id

    db.delete(user)
    db.commit()

    return {"message": f"User {deleted_user_id} has been deleted"}