from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.core.enums import ItemEnum

# Create item
class CreateItem(BaseModel):
    item_status:ItemEnum
    description:Optional[str] = Field(default=None, min_length = 10, max_length=200)


