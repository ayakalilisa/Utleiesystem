from fastapi import Depends, HTTPException
from app.core.security import get_current_user

# For checking role
def require_admin(current_admin = Depends(get_current_user)):
    return current_admin