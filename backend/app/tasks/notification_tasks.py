from app.tasks.celery_app import celery_app
from app.core.config import settings
import emails
from emails.template import JinjaTemplate

@celery_app.task
def send_email(email_to: str, subject: str, html_content: str):
    message = emails.Message(
        subject=JinjaTemplate(subject),
        html=JinjaTemplate(html_content),
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    response = message.send(to=email_to, smtp=smtp_options)
    return response.status_code

@celery_app.task
def send_sla_warning_email(agent_email: str, lead_id: str):
    subject = f"SLA WARNING: Lead {lead_id} requires attention"
    content = f"<p>Please contact Lead {lead_id} immediately. The 30-minute SLA is breached.</p>"
    send_email(agent_email, subject, content)
    return True
