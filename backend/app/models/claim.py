from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class ClaimStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    APPEALED = "appealed"
    PAID = "paid"


class ClaimType(str, enum.Enum):
    PROFESSIONAL = "professional"
    INSTITUTIONAL = "institutional"


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_number = Column(String(50), unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)

    claim_type = Column(Enum(ClaimType), default=ClaimType.PROFESSIONAL)
    status = Column(Enum(ClaimStatus), default=ClaimStatus.DRAFT)

    service_date = Column(DateTime)
    submission_date = Column(DateTime)
    amount = Column(Numeric(10, 2))

    diagnosis_codes = Column(Text)
    procedure_codes = Column(Text)

    payer_name = Column(String(255))
    payer_id = Column(String(50))

    notes = Column(Text)
    rejection_reason = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="claims")
    patient = relationship("Patient", back_populates="claims")
    provider = relationship("Provider", back_populates="claims")
    documents = relationship("Document", back_populates="claim")