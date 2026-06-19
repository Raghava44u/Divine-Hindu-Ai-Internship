from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.sla_tasks", "app.tasks.notification_tasks", "app.tasks.voice_tasks"]
)

celery_app.conf.beat_schedule = {
    'monitor_sla_violations_every_5_minutes': {
        'task': 'app.tasks.sla_tasks.monitor_slas',
        'schedule': 300.0, # 5 minutes
    },
}
celery_app.conf.timezone = 'UTC'
