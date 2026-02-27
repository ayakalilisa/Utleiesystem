from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Create category
class CreateCategory(BaseModel):
    category_name:str
    description:Optional[str] = Field(default=None, min_length = 10, max_length=200)