from app.database import Base
from app.core.enums import ItemEnum
from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy import Enum as SQLEnum


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True) # primary_key automatically has index
    name = Column(String, index=True)
    status = Column(SQLEnum(ItemEnum), nullable = False)
    category_id = Column(Integer, ForeignKey('categories.id'))
    comments = Column(Text)


