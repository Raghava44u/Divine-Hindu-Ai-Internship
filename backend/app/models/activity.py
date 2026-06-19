from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.database.session import Base
from app.models.base import TimestampMixin

class ActivityActionEnum(str, enum.Enum):
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    ASSIGNED = "ASSIGNED"
    CONTACTED = "CONTACTED"
    STATUS_CHANGED = "STATUS_CHANGED"
    FOLLOW_UP_ADDED = "FOLLOW_UP_ADDED"
    FOLLOW_UP_COMPLETED = "FOLLOW_UP_COMPLETED"
    CONVERTED = "CONVERTED"
    REASSIGNED = "REASSIGNED"

class Activity(Base, TimestampMixin):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # The user who performed the action
    
    action = Column(Enum(ActivityActionEnum), nullable=False)
    remarks = Column(Text, nullable=True)
    
    lead = relationship("Lead", back_populates="activities")
    user = relationship("User")
