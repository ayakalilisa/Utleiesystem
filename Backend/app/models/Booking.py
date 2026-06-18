import uuid
from sqlalchemy import Column, Integer, ForeignKey, Date, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True)
    group_id = Column(
        PG_UUID(as_uuid=True),
        default=uuid.uuid4,
        nullable=False,
        index=True
    )

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    active = Column(Boolean, default=True, nullable=False)
    comment = Column(Text)