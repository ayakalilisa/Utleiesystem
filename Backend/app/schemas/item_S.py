from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from app.core.enums import ItemEnum


class CreateItem(BaseModel):
    name: str
    status: ItemEnum
    category_id: Optional[int] = None
    comments: Optional[str] = Field(default=None, max_length=100)


class UpdateItem(BaseModel):
    name: Optional[str] = None
    status: Optional[ItemEnum] = None
    category_id: Optional[int] = None
    comments: Optional[str] = Field(default=None, max_length=100)


class ItemResponse(BaseModel):
    id: int
    name: str
    status: ItemEnum
    category_id: Optional[int] = None
    comments: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
