from pydantic import BaseModel, Field, model_validator, ConfigDict
from datetime import date
from typing import Optional


class BookingCreate(BaseModel):
    user_id: int
    item_id: int
    start_date: date
    end_date: date
    comment: Optional[str] = Field(default=None, min_length=3, max_length=200)

    @model_validator(mode="after")
    def validate_period(self):
        if self.end_date < self.start_date:
            raise ValueError("Start dato må være før slutt dato")
        return self


class BookingResponse(BaseModel):
    id: int
    user_id: int
    item_id: int
    start_date: date
    end_date: date
    active: bool
    comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)