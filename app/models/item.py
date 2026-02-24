from app.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey,Enum, Text

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True) # primary_key automatically has index
    name = Column(String, index=True)
    status = Column(Enum("Helt ny","Treng repersjon","Kan ikke leie ut"))
    category_id = Column(Integer, ForeignKey('categories.id'))
    comments = Column(Text)


