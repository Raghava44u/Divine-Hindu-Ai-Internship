from fastapi import APIRouter
from app.api.v1.endpoints import auth, leads, users, agents, webhooks

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
