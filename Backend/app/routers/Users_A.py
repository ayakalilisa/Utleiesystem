from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.User import User
from app.schemas.User_S import UserRegister, UserResponse
from app.services.User_service import CreateUser, get_all_users,get_user_by_id, update_user_service, delete_user_service
from app.core.security import get_current_user
from app.core.dependency import require_admin
from app.schemas.item_S import CreateItem

router = APIRouter(
    prefix="/admin/users",
    tags=["admin"],
    dependencies=[Depends(require_admin)]
)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_by_admin(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    return CreateUser(db, user_data)

@router.get("/", response_model=list[UserResponse])
def read_users(
    db: Session = Depends(get_db)
):
    return get_all_users(db)


@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bruker ikke funnet"
        )

    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user_route(
    user_id: int,
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    updated_user = update_user_service(db, user_id, user_data)

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bruker ikke funnet"
        )

    return updated_user

@router.delete("/{user_id}")
def delete_item_route(user_id: int,db: Session = Depends(get_db)):
    deleted_item = delete_user_service(db, user_id)

    if not deleted_item:
        raise HTTPException(status_code=404, detail="User not found")

    return deleted_item