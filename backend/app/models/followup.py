from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, Date, Time, DateTime
from sqlalchemy.orm import relationship
import enum
from app.database.session import Base
from app.models.base import TimestampMixin

class FollowUpStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class ReminderTypeEnum(str, enum.Enum):
    NONE = "NONE"
    EXACT_TIME = "EXACT_TIME"
    ONE_HOUR_BEFORE = "ONE_HOUR_BEFORE"
    TWENTY_FOUR_HOURS_BEFORE = "TWENTY_FOUR_HOURS_BEFORE"

class FollowUp(Base, TimestampMixin):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    
    follow_up_date = Column(Date, nullable=False)
    follow_up_time = Column(Time, nullable=False)
    scheduled_datetime = Column(DateTime, nullable=False) # For easier querying
    
    remarks = Column(Text, nullable=True)
    status = Column(Enum(FollowUpStatusEnum), default=FollowUpStatusEnum.PENDING, nullable=False)
    reminder_type = Column(Enum(ReminderTypeEnum), default=ReminderTypeEnum.NONE)
    
    lead = relationship("Lead", back_populates="followups")
    agent = relationship("Agent")
