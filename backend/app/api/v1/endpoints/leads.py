from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from app.api import deps
from app.schemas.lead import Lead, LeadCreate, LeadUpdate
from app.schemas.activity import ActivityResponse
from app.schemas.followup import FollowUpCreate, FollowUpResponse
from app.models.activity import Activity, ActivityActionEnum
from app.models.followup import FollowUp, FollowUpStatusEnum
from app.repositories.lead_repo import lead_repo
from app.services.lead_service import LeadService
from app.tasks.voice_tasks import trigger_voice_call_task

router = APIRouter()

@router.get("/", response_model=List[Lead])
def read_leads(
    db: deps.SessionDep,
    current_user: deps.CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve leads.
    """
    # Should be filtered by role (e.g. agent only sees their own leads)
    leads = lead_repo.get_multi(db, skip=skip, limit=limit)
    return leads

@router.post("/", response_model=Lead)
def create_lead(
    *,
    db: deps.SessionDep,
    lead_in: LeadCreate,
    # current_user: deps.CurrentUser # Depending on if we want public endpoint
) -> Any:
    """
    Create new lead.
    """
    try:
        lead = LeadService.create_lead(db, lead_in=lead_in)
        
        # Trigger outbound AI Voice call via Celery
        # We pass "our services" as fallback if product_interested is empty
        trigger_voice_call_task.delay(
            lead.phone_number, 
            lead.customer_name, 
            lead.product_interested or "our services"
        )
        
        return lead
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/followups/pending", response_model=List[FollowUpResponse])
def get_pending_followups(
    db: deps.SessionDep,
) -> Any:
    """
    Get all pending follow-ups (useful for dashboard).
    """
    followups = db.query(FollowUp).filter(FollowUp.status == FollowUpStatusEnum.PENDING).all()
    return followups

@router.get("/{id}", response_model=Lead)
def get_lead(
    *,
    db: deps.SessionDep,
    id: int,
) -> Any:
    """
    Get lead by ID.
    """
    lead = lead_repo.get(db, id=id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.get("/{id}/activities", response_model=List[ActivityResponse])
def get_lead_activities(
    *,
    db: deps.SessionDep,
    id: int,
) -> Any:
    """
    Get activities for a lead.
    """
    activities = db.query(Activity).filter(Activity.lead_id == id).order_by(Activity.created_at.desc()).all()
    return activities

@router.post("/{id}/followups", response_model=FollowUpResponse)
def create_followup(
    *,
    db: deps.SessionDep,
    id: int,
    followup_in: FollowUpCreate,
) -> Any:
    """
    Create a follow-up for a lead.
    """
    from datetime import datetime
    
    lead = lead_repo.get(db, id=id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    scheduled_datetime = datetime.combine(followup_in.follow_up_date, followup_in.follow_up_time)
    
    followup = FollowUp(
        lead_id=lead.id,
        agent_id=lead.agent_id,
        follow_up_date=followup_in.follow_up_date,
        follow_up_time=followup_in.follow_up_time,
        scheduled_datetime=scheduled_datetime,
        remarks=followup_in.remarks,
        reminder_type=followup_in.reminder_type,
        status=FollowUpStatusEnum.PENDING
    )
    db.add(followup)
    
    # Log Activity
    activity = Activity(
        lead_id=lead.id,
        action=ActivityActionEnum.FOLLOW_UP_ADDED,
        remarks=f"Scheduled follow-up for {scheduled_datetime.strftime('%b %d, %I:%M %p')}. Remarks: {followup_in.remarks or 'None'}"
    )
    db.add(activity)
    
    db.commit()
    db.refresh(followup)
    return followup

@router.get("/{id}/followups", response_model=List[FollowUpResponse])
def get_lead_followups(
    *,
    db: deps.SessionDep,
    id: int,
) -> Any:
    """
    Get follow-ups for a specific lead.
    """
    followups = db.query(FollowUp).filter(FollowUp.lead_id == id).order_by(FollowUp.scheduled_datetime.desc()).all()
    return followups

@router.put("/{id}", response_model=Lead)
def update_lead(
    *,
    db: deps.SessionDep,
    id: int,
    lead_in: LeadUpdate,
    # current_user: deps.CurrentUser
) -> Any:
    """
    Update a lead (e.g. changing status from Kanban).
    """
    lead = lead_repo.get(db, id=id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Store old status to check if it changed
    old_status = lead.status
    
    lead = lead_repo.update(db, db_obj=lead, obj_in=lead_in)
    
    if old_status != lead.status:
        activity = Activity(
            lead_id=lead.id,
            action=ActivityActionEnum.STATUS_CHANGED,
            remarks=f"Status changed from {old_status.value if old_status else 'None'} to {lead.status.value}"
        )
        db.add(activity)
        db.commit()
        
    return lead
