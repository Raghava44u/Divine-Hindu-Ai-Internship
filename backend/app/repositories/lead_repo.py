from typing import Optional
from sqlalchemy.orm import Session
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate
from app.repositories.base import CRUDBase

class CRUDLead(CRUDBase[Lead, LeadCreate, LeadUpdate]):
    def get_by_lead_id(self, db: Session, *, lead_id: str) -> Optional[Lead]:
        return db.query(Lead).filter(Lead.lead_id == lead_id).first()
        
    def get_by_email_or_phone(self, db: Session, *, email: str = None, phone_number: str = None) -> Optional[Lead]:
        query = db.query(Lead)
        if email and phone_number:
            query = query.filter((Lead.email == email) | (Lead.phone_number == phone_number))
        elif email:
            query = query.filter(Lead.email == email)
        elif phone_number:
            query = query.filter(Lead.phone_number == phone_number)
        else:
            return None
        return query.first()

lead_repo = CRUDLead(Lead)
