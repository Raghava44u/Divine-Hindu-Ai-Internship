import os
import sys
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.agent import Agent

cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"]

def update_agents():
    db = SessionLocal()
    try:
        agents = db.query(Agent).all()
        for agent in agents:
            agent.city = random.choice(cities)
            agent.conversion_rate = round(random.uniform(10.0, 95.0), 1)
            agent.current_workload = random.randint(0, 3) # randomize workload
            db.add(agent)
        db.commit()
        print("Updated all agents with intelligent metrics!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_agents()
