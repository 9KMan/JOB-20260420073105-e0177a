from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.schemas.provider import ProviderCreate, ProviderUpdate, ProviderResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("/", response_model=List[ProviderResponse])
def list_providers(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    specialty: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Provider)

    if current_user.role == UserRole.VIEWER:
        query = query.filter(Provider.user_id == current_user.id)

    if search:
        query = query.filter(
            (Provider.first_name.ilike(f"%{search}%")) |
            (Provider.last_name.ilike(f"%{search}%")) |
            (Provider.npi.ilike(f"%{search}%"))
        )

    if specialty:
        query = query.filter(Provider.specialty == specialty)

    providers = query.offset(skip).limit(limit).all()
    return providers


@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    if current_user.role != UserRole.ADMIN and provider.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this provider")
    return provider


@router.post("/", response_model=ProviderResponse)
def create_provider(
    provider_data: ProviderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Provider).filter(Provider.npi == provider_data.npi).first()
    if existing:
        raise HTTPException(status_code=400, detail="Provider with this NPI already exists")

    provider = Provider(
        user_id=current_user.id,
        npi=provider_data.npi,
        first_name=provider_data.first_name,
        last_name=provider_data.last_name,
        credentials=provider_data.credentials,
        specialty=provider_data.specialty,
        tax_id=provider_data.tax_id,
        address_line1=provider_data.address_line1,
        address_line2=provider_data.address_line2,
        city=provider_data.city,
        state=provider_data.state,
        zip_code=provider_data.zip_code,
        phone=provider_data.phone,
        fax=provider_data.fax
    )
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


@router.put("/{provider_id}", response_model=ProviderResponse)
def update_provider(
    provider_id: int,
    provider_data: ProviderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    if current_user.role != UserRole.ADMIN and provider.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this provider")

    update_data = provider_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(provider, field, value)

    db.commit()
    db.refresh(provider)
    return provider


@router.delete("/{provider_id}")
def delete_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    if current_user.role != UserRole.ADMIN and provider.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this provider")

    db.delete(provider)
    db.commit()
    return {"message": "Provider deleted successfully"}