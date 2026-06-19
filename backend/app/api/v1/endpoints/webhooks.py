from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.lead import Lead, LeadStatusEnum
from app.models.activity import Activity, ActivityActionEnum

router = APIRouter()

@router.post("/vapi")
async def vapi_webhook(request: Request, db: Session = Depends(deps.get_db)):
    payload = await request.json()
    message = payload.get("message", {})
    
    if message.get("type") == "end-of-call-report":
        call_data = message.get("call", {})
        customer_number = call_data.get("customer", {}).get("number")
        transcript = message.get("transcript", "")
        summary = message.get("summary", "")
        recording_url = message.get("recordingUrl", "")
        
        if customer_number:
            # Find the lead by phone number
            lead = db.query(Lead).filter(Lead.phone_number == customer_number).first()
            if lead:
                # Update lead status based on summary (simple heuristic)
                summary_lower = summary.lower()
                if "interested" in summary_lower or "yes" in summary_lower or "buy" in summary_lower:
                    lead.status = LeadStatusEnum.CONVERTED
                    action_remarks = "Call ended: Lead converted! Recording and transcript attached."
                elif "not interested" in summary_lower or "no" in summary_lower:
                    lead.status = LeadStatusEnum.LOST
                    action_remarks = "Call ended: Lead not interested."
                else:
                    lead.status = LeadStatusEnum.CONTACTED
                    action_remarks = "Call ended: Lead contacted."
                
                # Create an activity log
                full_remarks = f"{action_remarks}\n\n**Summary:**\n{summary}\n\n**Transcript:**\n{transcript}\n\n**Recording URL:** {recording_url}"
                
                activity = Activity(
                    lead_id=lead.id,
                    action=ActivityActionEnum.CONTACTED,
                    remarks=full_remarks
                )
                
                db.add(activity)
                db.add(lead)
                db.commit()
    
    return {"status": "success"}
