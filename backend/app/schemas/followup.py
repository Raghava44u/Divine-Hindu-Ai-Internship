from typing import Optional
from datetime import date, time, datetime
from pydantic import BaseModel
from app.models.followup import FollowUpStatusEnum, ReminderTypeEnum

class FollowUpBase(BaseModel):
    follow_up_date: date
    follow_up_time: time
    remarks: Optional[str] = None
    reminder_type: Optional[ReminderTypeEnum] = ReminderTypeEnum.NONE

class FollowUpCreate(FollowUpBase):
    pass

class FollowUpResponse(FollowUpBase):
    id: int
    lead_id: int
    agent_id: int
    scheduled_datetime: datetime
    status: FollowUpStatusEnum

    class Config:
        from_attributes = True
