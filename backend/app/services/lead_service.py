from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.lead import Lead, LeadSourceEnum
from app.schemas.lead import LeadCreate
from app.repositories.lead_repo import lead_repo
from app.services.assignment_service import AssignmentService
import datetime

class LeadService:
    @staticmethod
    def calculate_score(lead_in: LeadCreate) -> int:
        score = 0
        if lead_in.source == LeadSourceEnum.WEBSITE:
            score += 50
        elif lead_in.source in [LeadSourceEnum.FACEBOOK, LeadSourceEnum.INSTAGRAM]:
            score += 40
        elif lead_in.source == LeadSourceEnum.WHATSAPP:
            score += 30
        else:
            score += 10
        return score

    @staticmethod
    def generate_lead_id(db: Session) -> str:
        from sqlalchemy import func
        year = datetime.datetime.now().year
        max_id = db.query(func.max(Lead.id)).scalar() or 0
        return f"DH-{year}-{(max_id + 1):06d}"

    @staticmethod
    def create_lead(db: Session, lead_in: LeadCreate) -> Lead:
        # Duplicate detection
        duplicate = lead_repo.get_by_email_or_phone(db, email=lead_in.email, phone_number=lead_in.phone_number)
        if duplicate:
            # Instead of failing, we could just log an activity and return the duplicate or raise an error
            # as per requirements: "Do not create a new lead, Update existing lead activity"
            # Here we just raise an exception to be handled by the router
            raise HTTPException(status_code=400, detail="Duplicate lead detected")

        lead_id = LeadService.generate_lead_id(db)
        score = LeadService.calculate_score(lead_in)

        db_lead = Lead(
            **lead_in.model_dump(),
            lead_id=lead_id,
            lead_score=score
        )
        db.add(db_lead)
        db.commit()
        db.refresh(db_lead)
        
        # Trigger assignment (can also be done async via celery)
        AssignmentService.assign_lead(db, db_lead)
        
        return db_lead
