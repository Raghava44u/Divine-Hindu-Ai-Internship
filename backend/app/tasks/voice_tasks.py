import logging
from app.tasks.celery_app import celery_app
from app.services.voice_agent_service import trigger_vapi_outbound_call

logger = logging.getLogger(__name__)

@celery_app.task(name="app.tasks.voice_tasks.trigger_voice_call")
def trigger_voice_call_task(lead_phone: str, lead_name: str, product: str):
    try:
        logger.info(f"Triggering AI Voice Call for Lead: {lead_name} ({lead_phone})")
        response = trigger_vapi_outbound_call(lead_phone, lead_name, product)
        logger.info(f"Vapi Call Triggered Successfully: {response}")
        return response
    except Exception as e:
        logger.error(f"Failed to trigger Vapi call: {e}")
        # We catch the exception so it doesn't crash the worker continuously 
        # (in production we might retry depending on the error)
        pass
