from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File
from fastapi.responses import FileResponse
from typing import List
import os
import shutil
import uuid
import datetime
from .. import models, schemas
from ..auth import get_current_user_hybrid
from ..oep_api import fetch_cases_for_party, fetch_all_documents_for_party
from sqlalchemy.orm import Session
from ..db import get_db
import datetime
import uuid

router = APIRouter(prefix="/api", tags=["bff"])

@router.get("/me", response_model=schemas.UserMe)
async def get_me(current_user: models.User = Depends(get_current_user_hybrid)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "role": current_user.role,
        "party_id": current_user.party_id,
        "personnummer": current_user.personnummer,
        "auth_method": current_user.auth_method
    }

@router.patch("/me", response_model=schemas.UserMe)
async def update_me(
    update_data: schemas.UserUpdate, 
    current_user: models.User = Depends(get_current_user_hybrid),
    db: Session = Depends(get_db)
):
    if update_data.email is not None:
        current_user.email = update_data.email
    if update_data.phone_number is not None:
        current_user.phone_number = update_data.phone_number
        
    db.commit()
    db.refresh(current_user)
    return await get_me(current_user)

@router.get("/cases", response_model=List[schemas.Case])
async def get_cases(
    current_user: models.User = Depends(get_current_user_hybrid),
    db: Session = Depends(get_db)
):
    if not current_user.party_id:
        return []
    
    # Aggregates cases from the mock integrator using the user's partyId
    cases = fetch_cases_for_party(current_user.party_id, db)
    return cases

@router.get("/cases/{case_id}", response_model=schemas.Case)
async def get_case_details(case_id: str, current_user: models.User = Depends(get_current_user_hybrid)):
    cases = await get_cases(current_user)
    for c in cases:
        if c.get("caseId") == case_id:
            return c
    raise HTTPException(status_code=404, detail="Case not found")

@router.post("/cases/{case_id}/messages", response_model=schemas.Message)
async def send_case_message(
    case_id: str,
    msg_req: schemas.MessageRequest,
    current_user: models.User = Depends(get_current_user_hybrid),
    db: Session = Depends(get_db)
):
    # Save message to database for persistence
    new_msg = models.CaseMessage(
        case_id=case_id,
        sender=current_user.full_name or current_user.username,
        sender_role="Sökande", # Default role for portal users
        content=msg_req.content,
        created=datetime.datetime.utcnow()
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return {
        "id": str(new_msg.id),
        "sender": new_msg.sender,
        "sender_role": new_msg.sender_role,
        "content": new_msg.content,
        "created": new_msg.created
    }

@router.get("/documents", response_model=List[schemas.Document])
async def get_all_documents(
    current_user: models.User = Depends(get_current_user_hybrid),
    db: Session = Depends(get_db)
):
    if not current_user.party_id:
        return []
    return fetch_all_documents_for_party(current_user.party_id, db)

@router.post("/cases/{case_id}/documents", response_model=schemas.Document)
async def upload_case_document(
    case_id: str,
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user_hybrid),
    db: Session = Depends(get_db)
):
    """
    Handle document upload for a specific case.
    """
    # Create upload directory if it doesn't exist
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    # Generate a unique path for the file
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{case_id}_{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save metadata to database
    new_doc = models.CaseDocument(
        case_id=case_id,
        filename=file.filename,
        content_type=file.content_type,
        file_path=file_path,
        created=datetime.datetime.utcnow()
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return {
        "id": f"upload-{new_doc.id}",
        "filename": new_doc.filename,
        "type": "Bilaga",  # Default type for user uploads
        "created": new_doc.created,
        "linked_to": "Ärende"
    }

@router.get("/documents/{doc_id}/download")
async def download_document(
    doc_id: str,
    current_user: models.User = Depends(get_current_user_hybrid),
    db: Session = Depends(get_db)
):
    """
    Serve a real PDF file for download.
    Supports both mock documents and user-uploaded documents.
    """
    # Check if it's an uploaded document
    if doc_id.startswith("upload-"):
        try:
            db_id = int(doc_id.replace("upload-", ""))
            db_doc = db.query(models.CaseDocument).filter(models.CaseDocument.id == db_id).first()
            if not db_doc:
                raise HTTPException(status_code=404, detail="Document not found")
            
            if not os.path.exists(db_doc.file_path):
                raise HTTPException(status_code=404, detail="File missing on server")
                
            return FileResponse(
                db_doc.file_path,
                media_type=db_doc.content_type,
                filename=db_doc.filename
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid document ID")

    # Fallback to dummy PDF for mock documents
    dummy_pdf_path = "/tmp/dummy_document.pdf"
    if not os.path.exists(dummy_pdf_path):
        minimal_pdf = (
            b"%PDF-1.4\n"
            b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
            b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
            b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n"
            b"4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Detta ar ett testdokument) Tj ET\nendstream\nendobj\n"
            b"trailer\n<< /Root 1 0 R /Size 5 >>\n"
            b"%%EOF"
        )
        with open(dummy_pdf_path, "wb") as f:
            f.write(minimal_pdf)

    filename = f"dokument_{doc_id}.pdf"
    return FileResponse(
        dummy_pdf_path,
        media_type="application/pdf",
        filename=filename
    )

@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user: models.User = Depends(get_current_user_hybrid),
    db: Session = Depends(get_db)
):
    """
    Delete a user-uploaded document.
    """
    if not doc_id.startswith("upload-"):
        raise HTTPException(status_code=403, detail="Only uploaded documents can be deleted")

    try:
        db_id = int(doc_id.replace("upload-", ""))
        db_doc = db.query(models.CaseDocument).filter(models.CaseDocument.id == db_id).first()
        
        if not db_doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Delete from filesystem
        if os.path.exists(db_doc.file_path):
            os.remove(db_doc.file_path)

        # Delete from database
        db.delete(db_doc)
        db.commit()

        return {"status": "success", "message": "Document deleted"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID")
