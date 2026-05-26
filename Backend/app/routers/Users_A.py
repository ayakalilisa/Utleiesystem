from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.User import User
from app.schemas.User_S import UserRegister, UserResponse, get_all_users
from app.services.User_service import CreateUser
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

