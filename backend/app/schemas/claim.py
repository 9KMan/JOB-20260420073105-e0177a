from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.claim import ClaimStatus, ClaimType


class ClaimBase(BaseModel):
    claim_type: ClaimType = ClaimType.PROFESSIONAL
    service_date: Optional[datetime] = None
    diagnosis_codes: Optional[str] = None
    procedure_codes: Optional[str] = None
    payer_name: Optional[str] = None
    payer_id: Optional[str] = None
    notes: Optional[str] = None


class ClaimCreate(ClaimBase):
    patient_id: int
    provider_id: int
    amount: Optional[Decimal] = None


class ClaimUpdate(BaseModel):
    claim_type: Optional[ClaimType] = None
    status: Optional[ClaimStatus] = None
    service_date: Optional[datetime] = None
    diagnosis_codes: Optional[str] = None
    procedure_codes: Optional[str] = None
    payer_name: Optional[str] = None
    payer_id: Optional[str] = None
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None


class ClaimResponse(ClaimBase):
    id: int
    claim_number: str
    user_id: int
    patient_id: int
    provider_id: int
    status: ClaimStatus
    submission_date: Optional[datetime]
    amount: Optional[Decimal]
    rejection_reason: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True