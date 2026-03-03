from fastapi import Depends, HTTPException
from app.core.security import get_current_user

# For checking role
def require_admin(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user