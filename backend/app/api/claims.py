from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import uuid
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.claim import Claim, ClaimStatus
from app.schemas.claim import ClaimCreate, ClaimUpdate, ClaimResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/claims", tags=["Claims"])


@router.get("/", response_model=List[ClaimResponse])
def list_claims(
    skip: int = 0,
    limit: int = 100,
    status: Optional[ClaimStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Claim).options(
        joinedload(Claim.patient),
        joinedload(Claim.provider)
    )

    if current_user.role == UserRole.VIEWER:
        query = query.filter(Claim.user_id == current_user.id)
    elif status:
        query = query.filter(Claim.status == status)

    claims = query.offset(skip).limit(limit).all()
    return claims


@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != UserRole.ADMIN and claim.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this claim")
    return claim


@router.post("/", response_model=ClaimResponse)
def create_claim(
    claim_data: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim_number = f"CLM-{uuid.uuid4().hex[:10].upper()}"

    claim = Claim(
        claim_number=claim_number,
        user_id=current_user.id,
        patient_id=claim_data.patient_id,
        provider_id=claim_data.provider_id,
        claim_type=claim_data.claim_type,
        service_date=claim_data.service_date,
        diagnosis_codes=claim_data.diagnosis_codes,
        procedure_codes=claim_data.procedure_codes,
        payer_name=claim_data.payer_name,
        payer_id=claim_data.payer_id,
        notes=claim_data.notes,
        amount=claim_data.amount
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim


@router.put("/{claim_id}", response_model=ClaimResponse)
def update_claim(
    claim_id: int,
    claim_data: ClaimUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != UserRole.ADMIN and claim.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this claim")

    update_data = claim_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(claim, field, value)

    db.commit()
    db.refresh(claim)
    return claim


@router.post("/{claim_id}/submit", response_model=ClaimResponse)
def submit_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = ClaimStatus.SUBMITTED
    claim.submission_date = datetime.utcnow()
    db.commit()
    db.refresh(claim)
    return claim


@router.delete("/{claim_id}")
def delete_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != UserRole.ADMIN and claim.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this claim")

    db.delete(claim)
    db.commit()
    return {"message": "Claim deleted successfully"}