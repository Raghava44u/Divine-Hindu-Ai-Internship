import requests
from app.core.config import settings

def trigger_vapi_outbound_call(lead_phone: str, lead_name: str, product: str) -> dict:
    if not settings.VAPI_API_KEY:
        raise ValueError("VAPI_API_KEY is not configured.")
        
    url = "https://api.vapi.ai/call/phone"
    headers = {
        "Authorization": f"Bearer {settings.VAPI_API_KEY}",
        "Content-Type": "application/json"
    }

    # System prompt for the AI Voice Agent
    prompt = f"""You are a professional sales agent representing Divine Hindu. 
Your goal is to call {lead_name} who recently showed interest in {product}.
Be polite, energetic, and culturally respectful. 
Ask them if they are still interested in the product and if they have any questions. 
If they want to buy, let them know a payment link will be sent to their WhatsApp. 
If they are not interested, politely thank them for their time.
Keep your responses concise and conversational."""

    if not lead_phone.startswith('+'):
        lead_phone = f"+91{lead_phone}"

    payload = {
        "customer": {
            "number": lead_phone,
            "name": lead_name
        }
    }

    if settings.VAPI_ASSISTANT_ID:
        payload["assistantId"] = settings.VAPI_ASSISTANT_ID
        # Inject dynamic variables that the user can reference in their Vapi prompt as {{name}} and {{product}}
        payload["assistantOverrides"] = {
            "variableValues": {
                "name": lead_name,
                "product": product
            }
        }
    else:
        # Fallback to dynamically created assistant
        payload["assistant"] = {
            "name": "Divine Hindu Sales Agent",
            "model": {
                "provider": "openai",
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": prompt
                    }
                ]
            },
            "voice": {
                "provider": "11labs",
                "voiceId": "burt"
            }
        }

    # If the user has added a phone number ID, use it. Otherwise Vapi will try to use a fallback if possible on dev accounts.
    if settings.VAPI_PHONE_NUMBER_ID:
        payload["phoneNumberId"] = settings.VAPI_PHONE_NUMBER_ID

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()
