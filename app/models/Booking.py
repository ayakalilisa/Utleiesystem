from app.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Date

class Booking(Base):
    __tablename__ = 'bookings'

    id = Column(Integer, primary_key=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    user_id = Column(Integer, ForeignKey('users.id'))
    item_id = Column(Integer, ForeignKey('items.id'))

