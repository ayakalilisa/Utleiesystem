from app.models.User import User, Admin
from app.database import get_db

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# Password hashing setup
pwd_context = CryptContext(schemes = ["bcrypt"], deprecated = "auto")
# JWT setup
SECRET_KEY = "yoursecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # Expire time set to 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "auth/login")

# Define function for hash password and verify password
def hash_password(password:str):
    return pwd_context.hash(password)

def verify_password(plain_password:str, hashed_password:str):
    return pwd_context.verify(plain_password, hashed_password)

# TOLKEN section
def get_tolken(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes =ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Current user Auth function
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Define to raise error
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="ERROR, Kan ikke valideres",
    )
    # Set the conditions, payload contains all info needed, token, secrect key as well as the user's id
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id: int = payload.get("admin_id")
        if admin_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Check the user's id
    admin = db.query(Admin).filter(Admin.id == admin_id).first()

    if admin is None:
        raise credentials_exception

    if not admin.active:
        raise HTTPException(status_code=403, detail="Admin er ikke aktivert")

    return admin
