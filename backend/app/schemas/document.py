from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.document import DocumentType


class DocumentResponse(BaseModel):
    id: int
    claim_id: int
    file_name: str
    file_type: Optional[DocumentType]
    mime_type: Optional[str]
    file_size: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True