from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class DocumentType(str, enum.Enum):
    CLAIM_FORM = "claim_form"
    SUPPORTING_DOCUMENT = "supporting_document"
    EOB = "eob"
    APPEAL_LETTER = "appeal_letter"
    OTHER = "other"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)

    file_name = Column(String(255), nullable=False)
    file_type = Column(Enum(DocumentType))
    mime_type = Column(String(100))
    file_size = Column(BigInteger)

    minio_object_name = Column(String(500))

    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("Claim", back_populates="documents")