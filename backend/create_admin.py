import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user import User, RoleEnum
from app.models.agent import Agent
from app.core.security import get_password_hash

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_admin_user():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@divinehindu.com").first()
        if admin:
            print("Admin user already exists!")
            return

        # Create Admin User
        new_admin = User(
            email="admin@divinehindu.com",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            role=RoleEnum.ADMIN,
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)

        # Create corresponding Agent profile
        agent_profile = Agent(
            user_id=new_admin.id,
            is_active_for_assignment=True,
            current_workload=0
        )
        db.add(agent_profile)
        db.commit()

        print(f"Admin user created successfully!")
        print(f"Email: admin@divinehindu.com")
        print(f"Password: admin123")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
