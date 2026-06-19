from sqlalchemy import Column, Integer, Boolean, ForeignKey, String, Float
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.base import TimestampMixin

class Agent(Base, TimestampMixin):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    city = Column(String(100), nullable=True)
    conversion_rate = Column(Float, default=0.0)
    is_active_for_assignment = Column(Boolean, default=True)
    current_workload = Column(Integer, default=0)

    user = relationship("User", back_populates="agent_profile")
    leads = relationship("Lead", back_populates="agent")
