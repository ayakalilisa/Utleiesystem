from datetime import datetime

from app.database import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy import Enum as SQLEnum

from app.core.enums import ItemEnum


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    name = Column(String, index=True)
    status = Column(
        SQLEnum(ItemEnum, name="item_status_enum"),
        nullable=False
    )
    category_id = Column(Integer, ForeignKey("categories.id"))
    comments = Column(Text)