from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.claim import Claim
from app.models.document import Document, DocumentType
from app.schemas.document import DocumentResponse
from app.api.auth import get_current_user
import boto3
from botocore.client import Config
import uuid

router = APIRouter(prefix="/documents", tags=["Documents"])

minio_client = boto3.client(
    's3',
    endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
    aws_access_key_id=settings.MINIO_ACCESS_KEY,
    aws_secret_access_key=settings.MINIO_SECRET_KEY,
    config=Config(signature_version='s3v4')
)


@router.get("/claim/{claim_id}", response_model=List[DocumentResponse])
def list_claim_documents(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != UserRole.ADMIN and claim.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these documents")

    documents = db.query(Document).filter(Document.claim_id == claim_id).all()
    return documents


@router.post("/upload/{claim_id}", response_model=DocumentResponse)
async def upload_document(
    claim_id: int,
    file: UploadFile = File(...),
    document_type: DocumentType = DocumentType.OTHER,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != UserRole.ADMIN and claim.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload to this claim")

    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    object_name = f"claims/{claim_id}/{uuid.uuid4().hex}.{file_extension}"

    try:
        content = await file.read()
        minio_client.put_object(
            Bucket=settings.MINIO_BUCKET,
            Key=object_name,
            Body=content,
            ContentType=file.content_type or "application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

    document = Document(
        claim_id=claim_id,
        file_name=file.filename,
        file_type=document_type,
        mime_type=file.content_type,
        file_size=len(content),
        minio_object_name=object_name,
        uploaded_by=current_user.id
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("/download/{document_id}")
def get_download_url(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    claim = db.query(Claim).filter(Claim.id == document.claim_id).first()
    if current_user.role != UserRole.ADMIN and claim.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to download this document")

    try:
        url = minio_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': settings.MINIO_BUCKET, 'Key': document.minio_object_name},
            ExpiresIn=3600
        )
        return {"download_url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    claim = db.query(Claim).filter(Claim.id == document.claim_id).first()
    if current_user.role != UserRole.ADMIN and claim.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")

    try:
        minio_client.delete_object(Bucket=settings.MINIO_BUCKET, Key=document.minio_object_name)
    except Exception:
        pass

    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully"}