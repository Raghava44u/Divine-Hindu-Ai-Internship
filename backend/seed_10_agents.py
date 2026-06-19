import os
import sys

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.user import User, RoleEnum
from app.models.agent import Agent
from app.core.security import get_password_hash

def seed_agents():
    db = SessionLocal()
    try:
        created = 0
        for i in range(1, 11):
            email = f"agent{i}@divinehindu.com"
            if not db.query(User).filter(User.email == email).first():
                user = User(
                    email=email,
                    full_name=f"Sales Agent {i}",
                    hashed_password=get_password_hash("password123"),
                    role=RoleEnum.AGENT,
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                
                agent = Agent(
                    user_id=user.id,
                    is_active_for_assignment=True,
                    current_workload=0
                )
                db.add(agent)
                db.commit()
                created += 1
        print(f"Successfully seeded {created} agents into the database.")
    except Exception as e:
        print(f"Error seeding agents: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_agents()
