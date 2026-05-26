from pydantic import BaseModel, Field
from typing import Optional


class CreateCategory(BaseModel):
    category_name: str
    description: Optional[str] = Field(default=None, min_length=10, max_length=200)


class CategoryResponse(BaseModel):
    id: int
    category_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

