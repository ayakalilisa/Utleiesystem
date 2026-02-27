from app.database import Base
from sqlalchemy import Column, Integer, String, Boolean,Enum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)  # Primary key is unique
    first_name = Column(String, nullable=False, index=True)
    middle_name = Column(String, index=True) # Optional middle name
    last_name = Column(String, nullable=False, index=True)
    email = Column(String, nullable=False, unique=True, index=True) # index enable fast search
    password = Column(String, nullable=False)
    # Default all as user, admin is only one account!
    role = Column(Enum("user", "admin"), default="user")
    contact = Column(String, unique=True)  # numbers stored as string
    active = Column(Boolean, default=True)

