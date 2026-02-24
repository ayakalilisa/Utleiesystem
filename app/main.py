from fastapi import FastAPI
# Temp
from app.database import engine, Base
from app.models.test import Test

Base.metadata.create_all(bind=engine)
app = FastAPI()

@app.get("/")
def root():
    return{"message": "System running"}
