import pytest
from app.services.lead_service import LeadService
from app.schemas.lead import LeadCreate
from app.models.lead import LeadSourceEnum

def test_calculate_score():
    lead_in = LeadCreate(
        customer_name="John Doe",
        phone_number="1234567890",
        source=LeadSourceEnum.WEBSITE
    )
    score = LeadService.calculate_score(lead_in)
    assert score == 50

    lead_in.source = LeadSourceEnum.WHATSAPP
    assert LeadService.calculate_score(lead_in) == 30
