import os
import pymysql
from sqlalchemy import create_engine, text
from app.database.session import Base
# Import all models to ensure they are registered with Base.metadata
from app.models.user import User
from app.models.agent import Agent
from app.models.lead import Lead
from app.models.activity import Activity
from app.models.followup import FollowUp

from app.core.config import settings

# Parse the base URL from the settings.DATABASE_URL
# e.g., mysql+pymysql://root:root@host.docker.internal:3306/divine_hindu_crm -> mysql+pymysql://root:root@host.docker.internal:3306
db_url_no_db = settings.DATABASE_URL.rsplit('/', 1)[0]
engine_no_db = create_engine(db_url_no_db)

with engine_no_db.connect() as conn:
    conn.execute(text("CREATE DATABASE IF NOT EXISTS divine_hindu_crm"))
    print("Database 'divine_hindu_crm' ensured.")

# Connect to the created database and create all tables
engine = create_engine(settings.DATABASE_URL)

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("All tables created successfully!")
