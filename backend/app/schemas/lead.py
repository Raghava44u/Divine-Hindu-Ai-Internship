from pydantic import BaseModel, Field
from typing import Optional
from app.models.lead import LeadSourceEnum, LeadStatusEnum

class LeadBase(BaseModel):
    customer_name: str
    phone_number: str
    email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    product_interested: Optional[str] = None
    source: LeadSourceEnum
    priority: Optional[str] = "NORMAL"

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    customer_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    product_interested: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[LeadStatusEnum] = None
    agent_id: Optional[int] = None

class LeadInDBBase(LeadBase):
    id: int
    lead_id: str
    lead_score: int
    status: LeadStatusEnum
    agent_id: Optional[int] = None

    class Config:
        from_attributes = True

class Lead(LeadInDBBase):
    pass
