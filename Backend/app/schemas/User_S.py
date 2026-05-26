from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from app.models.User import User
# User Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=50)

class UserRegister(BaseModel):
    email: EmailStr
    first_name: str = Field(min_length=1, max_length=20)
    middle_name: Optional[str] = Field(default=None, max_length=20)
    last_name: str = Field(min_length=1, max_length=20)
    contact: Optional[str] = Field(default=None, max_length = 15)

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    contact: Optional[str] = None
    active: bool

    model_config = ConfigDict(from_attributes=True)


def get_all_users(db):
    return db.query(User).all()




