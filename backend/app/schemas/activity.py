from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.activity import ActivityActionEnum

class ActivityBase(BaseModel):
    action: ActivityActionEnum
    remarks: Optional[str] = None

class ActivityCreate(ActivityBase):
    lead_id: int
    user_id: Optional[int] = None

class ActivityResponse(ActivityBase):
    id: int
    lead_id: int
    user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
