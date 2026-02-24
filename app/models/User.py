from app.database import Base
from sqlalchemy import Column, Integer, String, Boolean,Enum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)  # Primary key is unique
    first_name = Column(String, nullable=False, index=True)
    last_name = Column(String, nullable=False, index=True)
    email = Column(String, nullable=False, unique=True, index=True) # index enable fast search
    password = Column(String, nullable=False)
    role = Column(Enum("user", "admin"))
    contact = Column(String, unique=True)  # numbers stored as string
    active = Column(Boolean, default=True)

