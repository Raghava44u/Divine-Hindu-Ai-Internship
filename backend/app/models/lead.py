from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
import enum
from app.database.session import Base
from app.models.base import TimestampMixin

class LeadStatusEnum(str, enum.Enum):
    NEW = "NEW"
    ASSIGNED = "ASSIGNED"
    CONTACTED = "CONTACTED"
    FOLLOW_UP = "FOLLOW_UP"
    CONVERTED = "CONVERTED"
    NOT_INTERESTED = "NOT_INTERESTED"
    INVALID = "INVALID"
    LOST = "LOST"

class LeadSourceEnum(str, enum.Enum):
    MOBILE_APP = "MOBILE_APP"
    WEBSITE = "WEBSITE"
    FACEBOOK = "FACEBOOK"
    INSTAGRAM = "INSTAGRAM"
    WHATSAPP = "WHATSAPP"
    MANUAL = "MANUAL"
    CSV = "CSV"

class Lead(Base, TimestampMixin):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. DH-2026-000001
    
    customer_name = Column(String(255), nullable=False)
    phone_number = Column(String(50), index=True, nullable=False)
    email = Column(String(255), index=True, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    product_interested = Column(String(255), nullable=True)
    
    source = Column(Enum(LeadSourceEnum), nullable=False)
    priority = Column(String(50), default="NORMAL") # HIGH, NORMAL, LOW
    lead_score = Column(Integer, default=0)
    
    status = Column(Enum(LeadStatusEnum), default=LeadStatusEnum.NEW, nullable=False)
    
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True)
    
    agent = relationship("Agent", back_populates="leads")
    activities = relationship("Activity", back_populates="lead", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="lead", cascade="all, delete-orphan")
