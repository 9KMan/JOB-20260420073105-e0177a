from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProviderBase(BaseModel):
    npi: str
    first_name: str
    last_name: str
    credentials: Optional[str] = None
    specialty: Optional[str] = None
    tax_id: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None


class ProviderCreate(ProviderBase):
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None


class ProviderUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    credentials: Optional[str] = None
    specialty: Optional[str] = None
    tax_id: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None


class ProviderResponse(ProviderBase):
    id: int
    user_id: int
    address_line1: Optional[str]
    address_line2: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True