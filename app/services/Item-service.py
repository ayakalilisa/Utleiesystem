from pydantic import BaseModel, Field, model_validator
from typing import Optional
from app.core.enums import ItemEnum


# Action to actually add item

class CreateItem(BaseModel):
    item_id: int
    item_name: Optional[str]
    item_status: ItemEnum
    comment: Optional[str] = Field(default = None, max_length=100)


