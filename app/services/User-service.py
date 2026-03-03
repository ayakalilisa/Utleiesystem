from pydantic import BaseModel, EmailStr
from typing import Optional

class CreateUser(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    middleName: Optional[str]
    lastName: str
    contact: Optional[str]

