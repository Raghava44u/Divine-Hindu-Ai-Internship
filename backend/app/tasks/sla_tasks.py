from app.tasks.celery_app import celery_app
from app.database.session import SessionLocal
from app.models.lead import Lead, LeadStatusEnum
from app.models.activity import Activity, ActivityActionEnum
from app.tasks.notification_tasks import send_sla_warning_email
from app.services.assignment_service import AssignmentService
import datetime

@celery_app.task
def monitor_slas():
    # SLA Logic: 
    # 30 mins: Warning
    # 60 mins: Notify Manager
    # 90 mins: Reassign
    
    db = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        thirty_mins_ago = now - datetime.timedelta(minutes=30)
        sixty_mins_ago = now - datetime.timedelta(minutes=60)
        ninety_mins_ago = now - datetime.timedelta(minutes=90)
        
        # 1. 30 Min Warning
        warning_leads = db.query(Lead).filter(
            Lead.status == LeadStatusEnum.ASSIGNED,
            Lead.updated_at <= thirty_mins_ago,
            Lead.updated_at > sixty_mins_ago
        ).all()
        for lead in warning_leads:
            # Check if warning was already sent via activity log, etc.
            # Send warning email to agent
            if lead.agent and lead.agent.user:
                send_sla_warning_email.delay(lead.agent.user.email, lead.lead_id)
        
        # 2. 90 Min Escalation & Reassignment
        escalation_leads = db.query(Lead).filter(
            Lead.status == LeadStatusEnum.ASSIGNED,
            Lead.updated_at <= ninety_mins_ago
        ).all()
        
        for lead in escalation_leads:
            lazy_agent_id = lead.agent_id
            
            # Log the escalation activity
            activity = Activity(
                lead_id=lead.id,
                action=ActivityActionEnum.STATUS_CHANGED,
                remarks=f"SLA Escalation: Lead was idle for >90 minutes. Unassigned from agent {lazy_agent_id}."
            )
            db.add(activity)
            
            # Decrease workload of the lazy agent
            if lead.agent:
                lead.agent.current_workload = max(0, lead.agent.current_workload - 1)
                db.add(lead.agent)
                
            # Reassign bypassing the lazy agent
            lead.agent_id = None
            db.commit() # commit the unassignment and activity first
            
            # Now trigger assignment again, but exclude the lazy agent
            AssignmentService.assign_lead(db, lead, exclude_agent_id=lazy_agent_id)
        
    finally:
        db.close()
    return "SLA Monitor completed"
