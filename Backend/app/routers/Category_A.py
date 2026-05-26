from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependency import require_admin
from app.models.Category import Category
from app.schemas.Category_S import CreateCategory
from app.services.Category_service import delete_category, create_category

from http.client import HTTPException

router = APIRouter(
    prefix="/category",
    tags=["category"],
    dependencies=[Depends(require_admin)]
)


@router.post("/")
def create_new_category(
    category_data: CreateCategory,
    db: Session = Depends(get_db)
):
    return create_category(db, category_data)


@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.delete("/{category_id}")
def delete_existing_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    result = delete_category(db, category_id)

    if not result:
        raise HTTPException(status_code=404, detail="Category not found")

    return result