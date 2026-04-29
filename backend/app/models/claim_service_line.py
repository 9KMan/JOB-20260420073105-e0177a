from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ClaimServiceLine(Base):
    __tablename__ = "claim_service_lines"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    line_number = Column(Integer, default=1)
    cpt_code = Column(String(10), nullable=False)
    icd10_codes = Column(Text)
    units = Column(Integer, default=1)
    charge_amount = Column(Numeric(10, 2))
    paid_amount = Column(Numeric(10, 2))
    denial_code = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("Claim", back_populates="service_lines")
