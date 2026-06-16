from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from app.core.enums import ItemEnum


class CreateItem(BaseModel):
    brand: Optional[str]
    size: Optional[str]
    status: ItemEnum

    category_id: Optional[int] = None
    comments: Optional[str] = Field(default=None, max_length=100)


class UpdateItem(BaseModel):
    brand: Optional[str] = None
    size: Optional[str] = None
    status: Optional[ItemEnum] = None
    category_id: Optional[int] = None
    comments: Optional[str] = Field(default=None, max_length=100)


class ItemResponse(BaseModel):
    id: int
    status: ItemEnum
    brand: Optional[str] = None
    size: Optional[int] = None
    category_id: int
    comments: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
