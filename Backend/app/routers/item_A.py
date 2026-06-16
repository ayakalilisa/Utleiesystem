from http.client import HTTPException

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.User import User
from app.core.security import get_current_user
from app.core.dependency import require_admin
from app.schemas.item_S import CreateItem
from app.services.Item_service import (create_item, get_all_items, get_item, update_item, delete_item)


router = APIRouter(prefix="/item", tags=["item"], dependencies=[Depends(require_admin)])

'''Only admin can create new item
   Note only in router with item_ rather than .data'''
@router.post("/", response_model=CreateItem)
# this is referring to the schema function
def create_new_item(item_data:CreateItem, db: Session = Depends(get_db)):
    return create_item(db, item_data)  # return to the service

@router.get("/")
def read_items(db:Session = Depends(get_db)):
    return get_all_items(db)

@router.get("/{item_id}")
def read_item(item_id:int, db:Session = Depends(get_db)):
    item = get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{item_id}")
def update_item_router(item_id:int, item_data:CreateItem, db:Session = Depends(get_db)):
    updated_item = update_item(db, item_id, item_data)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item

@router.delete("/{item_id}")
def delete_item_route(item_id: int,db: Session = Depends(get_db)):
    deleted_item = delete_item(db, item_id)

    if not deleted_item:
        raise HTTPException(status_code=404, detail="Item not found")

    return deleted_item

