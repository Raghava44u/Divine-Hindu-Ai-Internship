from fastapi import APIRouter
from app.api import deps
from app.models.agent import Agent
from app.models.user import User
from app.models.lead import Lead
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/")
def get_agents(db: deps.SessionDep):
    # Fetch agents and their associated user profiles
    agents = db.query(Agent, User).join(User, Agent.user_id == User.id).all()
    result = []
    for agent, user in agents:
        result.append({
            "id": agent.id,
            "name": user.full_name,
            "email": user.email,
            "workload": agent.current_workload,
            "is_active": agent.is_active_for_assignment
        })
    # Sort by workload descending for dashboard
    result.sort(key=lambda x: x["workload"], reverse=True)
    result.sort(key=lambda x: x["workload"], reverse=True)
    return result

@router.get("/{id}/leads")
def get_agent_leads(id: int, db: deps.SessionDep):
    leads = db.query(Lead).filter(Lead.agent_id == id).order_by(Lead.created_at.desc()).all()
    # Serialize for frontend
    return [{
        "id": lead.id,
        "lead_id": lead.lead_id,
        "customer_name": lead.customer_name,
        "product_interested": lead.product_interested,
        "status": lead.status.value,
        "created_at": lead.created_at.isoformat() if lead.created_at else None
    } for lead in leads]
