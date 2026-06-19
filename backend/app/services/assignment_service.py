from sqlalchemy.orm import Session
from app.models.lead import Lead, LeadStatusEnum
from app.models.agent import Agent
from app.models.activity import Activity, ActivityActionEnum

class AssignmentService:
    @staticmethod
    def get_intelligent_agent(db: Session, lead: Lead, exclude_agent_id: int = None) -> Agent:
        # Step 1: Get all active agents
        query = db.query(Agent).filter(Agent.is_active_for_assignment == True)
        if exclude_agent_id is not None:
            query = query.filter(Agent.id != exclude_agent_id)
        active_agents = query.all()
        if not active_agents:
            return None

        # Step 2: Location Match (Priority 1)
        # Try to find agents in the exact same city
        location_matched_agents = [a for a in active_agents if a.city and lead.city and a.city.lower() == lead.city.lower()]
        
        # If we have agents in the same city, only consider them. Otherwise, consider all active agents.
        candidate_agents = location_matched_agents if location_matched_agents else active_agents

        # Step 3: Free Agent (Priority 2)
        # Find the minimum workload among candidates
        min_workload = min(a.current_workload for a in candidate_agents)
        free_agents = [a for a in candidate_agents if a.current_workload == min_workload]

        # Step 4: Convince Power / Conversion Rate (Priority 3)
        # Sort the free agents by conversion rate descending
        free_agents.sort(key=lambda a: a.conversion_rate, reverse=True)

        # The winner is the first one in the sorted list
        return free_agents[0]

    @staticmethod
    def assign_lead(db: Session, lead: Lead, strategy: str = "intelligent", exclude_agent_id: int = None):
        agent = AssignmentService.get_intelligent_agent(db, lead, exclude_agent_id=exclude_agent_id)
            
        if agent:
            lead.agent_id = agent.id
            lead.status = LeadStatusEnum.ASSIGNED
            agent.current_workload += 1
            
            # Log Activity
            activity = Activity(
                lead_id=lead.id,
                action=ActivityActionEnum.ASSIGNED,
                remarks=f"Intelligently assigned to {agent.id} (City: {agent.city}, Workload: {agent.current_workload - 1}, ConvRate: {agent.conversion_rate}%)"
            )
            db.add(activity)
            db.add(lead)
            db.add(agent)
            db.commit()
            db.refresh(lead)
