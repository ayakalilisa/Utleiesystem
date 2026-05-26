from app.database import SessionLocal, Base, engine
from app.models.User import Admin

Base.metadata.create_all(bind=engine)


def create_admin():
    db = SessionLocal()

    try:
        admin_email = "admin@example.com"
        admin_password = "admin123"

        existing_admin = db.query(Admin).filter(Admin.email == admin_email).first()

        if existing_admin:
            print("Admin already exists.")
            return

        admin = Admin(
            first_name="Admin",
            middle_name=None,
            last_name="User",
            email=admin_email,
            password=admin_password,
            contact="00000000",
            active=True
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("Admin created successfully.")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()