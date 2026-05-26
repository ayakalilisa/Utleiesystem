from app.models.Category import Category

def create_category(db, category_data):
    category = Category(category_name = category_data.category_name,
                        description = category_data.description)
    db.add(category)
    db.commit()
    db.refresh(category)

    return category

def delete_category(db, category_id: int):
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        return None

    db.delete(category)
    db.commit()

    return {"message": f"Category {category_id} deleted"}
