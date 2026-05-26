from app.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Text


class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    category_name = Column(String, nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)


