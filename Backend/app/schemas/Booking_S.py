from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, model_validator


class BookingCreate(BaseModel):
    user_id: int
    item_id: int
    start_date: date
    end_date: date
    comment: Optional[str] = Field(default=None, min_length=3, max_length=200)

    # optional, because normal single booking can generate its own group_id
    group_id: Optional[UUID] = None

    @model_validator(mode="after")
    def validate_period(self):
        if self.end_date < self.start_date:
            raise ValueError("Start dato må være før slutt dato")
        return self


class BookingGroupCreate(BaseModel):
    user_id: int
    item_ids: list[int]
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
    group_id: UUID
    user_id: int
    item_id: int
    start_date: date
    end_date: date
    active: bool
    comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)