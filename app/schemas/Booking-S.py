from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from datetime import date

class BookingCreate(BaseModel):
    item_id: int
    category_id: int
    start_date: date
    end_date: date
    comment: Optional[str] = Field(default=None, min_length=3, max_length=200)

    @model_validator(model='after')
    def validate_period(self): # now not at database level,
        if self.end_date < self.start_date:
            raise ValueError("Start dato må være før slutt dato")
        else:
            return self

