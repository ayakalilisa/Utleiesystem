from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.schemas.User-S import UserLogin
from app.services.User-service import authenticate_user
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid")

    access_token = create_access_token(
        data={"user_id": user.id, "role": user.role}
    )

    return {"access_token": access_token, "token_type": "bearer"}
