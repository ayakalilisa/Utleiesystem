from app.models.item import Item


def create_item(db, item_data):
    new_item = Item(
        name=item_data.name,
        status=item_data.status,
        category_id=item_data.category_id,
        comments=item_data.comments
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


def get_all_items(db):
    return db.query(Item).all()


def get_item(db, item_id: int):
    return db.query(Item).filter(Item.id == item_id).first()


def update_item(db, item_id: int, item_data):
    item = db.query(Item).filter(Item.id == item_id).first()

    if not item:
        return None

    update_data = item_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)

    return item


def delete_item(db, item_id: int):
    item = db.query(Item).filter(Item.id == item_id).first()

    if not item:
        return None

    deleted_item_id = item.id

    db.delete(item)
    db.commit()

    return {"message": f"Item {deleted_item_id} has been deleted"}