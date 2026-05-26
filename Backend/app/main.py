from fastapi import FastAPI

from app.database import engine, Base

# Import models so SQLAlchemy knows about the tables
from app.models.User import User
from app.models.item import Item
from app.models.Booking import Booking
from app.models.Category import Category

# Import routers
from app.routers import Authorize
from app.routers import item_A
from app.routers import Users_A
from app.routers import Bookings_A
from app.routers import Category_A


Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def root():
    return {"message": "System running"}


app.include_router(Authorize.router)
app.include_router(item_A.router)
app.include_router(Users_A.router)
app.include_router(Bookings_A.router)
app.include_router(Category_A.router)