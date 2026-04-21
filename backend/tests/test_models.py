import pytest
from app.models.user import User, UserRole
from app.models.claim import Claim, ClaimStatus, ClaimType
from app.models.patient import Patient
from app.models.provider import Provider
from datetime import datetime


def test_user_model_creation():
    user = User(
        email="test@example.com",
        hashed_password="hashedpassword",
        full_name="Test User",
        role=UserRole.PROVIDER,
        organization_name="Test Org",
        npi="1234567890"
    )
    assert user.email == "test@example.com"
    assert user.full_name == "Test User"
    assert user.role == UserRole.PROVIDER
    assert user.is_active is True
    assert user.is_verified is False


def test_patient_model_creation():
    patient = Patient(
        user_id=1,
        first_name="John",
        last_name="Doe",
        date_of_birth=datetime(1990, 1, 15).date(),
        gender="male",
        member_id="MEM123456",
        phone="555-123-4567",
        email="john@example.com"
    )
    assert patient.first_name == "John"
    assert patient.last_name == "Doe"
    assert patient.member_id == "MEM123456"
    assert patient.is_active is True


def test_provider_model_creation():
    provider = Provider(
        user_id=1,
        npi="1234567890",
        first_name="Jane",
        last_name="Smith",
        credentials="MD",
        specialty="Surgery",
        tax_id="12-3456789"
    )
    assert provider.npi == "1234567890"
    assert provider.first_name == "Jane"
    assert provider.credentials == "MD"
    assert provider.specialty == "Surgery"


def test_claim_model_creation():
    claim = Claim(
        claim_number="CLM-TEST123",
        user_id=1,
        patient_id=1,
        provider_id=1,
        claim_type=ClaimType.PROFESSIONAL,
        status=ClaimStatus.DRAFT,
        amount=1500.00,
        diagnosis_codes="J06.9",
        procedure_codes="99213",
        payer_name="Blue Cross",
        payer_id="BCBS001"
    )
    assert claim.claim_number == "CLM-TEST123"
    assert claim.claim_type == ClaimType.PROFESSIONAL
    assert claim.status == ClaimStatus.DRAFT
    assert claim.amount == 1500.00


def test_claim_status_transitions():
    claim = Claim(
        claim_number="CLM-TEST456",
        user_id=1,
        patient_id=1,
        provider_id=1,
        status=ClaimStatus.DRAFT
    )
    claim.status = ClaimStatus.SUBMITTED
    assert claim.status == ClaimStatus.SUBMITTED
    claim.status = ClaimStatus.ACCEPTED
    assert claim.status == ClaimStatus.ACCEPTED
    claim.status = ClaimStatus.PAID
    assert claim.status == ClaimStatus.PAID