from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# User Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=50)

class UserRegister(BaseModel):
    email: EmailStr
    first_name: str = Field(min_length=1, max_length=20)
    middle_name: Optional[str] = Field(default=None, max_length=20)
    last_name: str = Field(min_length=1, max_length=20)
    password: str = Field(min_length=6, max_length=50)






