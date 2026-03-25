from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/mock", tags=["mocks"])

class PartyLookupRequest(BaseModel):
    identityNumber: str
    type: str

class PartyResponse(BaseModel):
    partyId: str
    name: str

class CaseResponse(BaseModel):
    caseId: str
    flowInstanceId: str
    title: str
    status: str
    externalStatus: str
    system: str
    created: str
    updated: str

# Mock Database
MOCK_PARTIES = {
    "199001011234": {"partyId": str(uuid.uuid4()), "name": "Anna Jenny Pettersson"},
    "198505054321": {"partyId": str(uuid.uuid4()), "name": "Erik Svensson"},
    "5560001111": {"partyId": str(uuid.uuid4()), "name": "Trollhättan AB"} # Organisation
}

MOCK_CASES = [
    {
        "caseId": "OEP-123456",
        "flowInstanceId": "101",
        "title": "Ansökan om parkeringstillstånd",
        "status": "Inkommen",
        "externalStatus": "Under behandling",
        "system": "OeP",
        "created": "2026-01-15T10:00:00Z",
        "updated": "2026-02-10T14:30:00Z"
    },
    {
        "caseId": "OEP-789012",
        "flowInstanceId": "202",
        "title": "Bygglov för altan",
        "status": "Avslutad",
        "externalStatus": "Beviljad",
        "system": "OeP",
        "created": "2025-11-20T09:00:00Z",
        "updated": "2025-12-05T16:00:00Z"
    }
]

@router.post("/party/lookup", response_model=PartyResponse)
async def party_lookup(request: PartyLookupRequest):
    if request.identityNumber in MOCK_PARTIES:
        return MOCK_PARTIES[request.identityNumber]
    
    # Generate a consistent UUID for unknown users just for the prototype
    return {
        "partyId": str(uuid.uuid5(uuid.NAMESPACE_DNS, request.identityNumber)),
        "name": "Okänd Användare"
    }

@router.get("/case-status/{partyId}", response_model=List[CaseResponse])
async def get_case_status(partyId: str):
    # In a real scenario, we'd filter by partyId. 
    # For the prototype, we return the same list for everyone.
    return MOCK_CASES

@router.get("/oep/cases/{partyId}")
async def get_oep_cases(partyId: str):
    return [c for c in MOCK_CASES if c["system"] == "OeP"]

@router.get("/oep/pdf/{flowInstanceId}")
async def get_oep_pdf(flowInstanceId: str):
    return {"pdf_base64": "JVBERi0xLjQKJ...[MOCK_PDF_DATA]...", "filename": f"beslut_{flowInstanceId}.pdf"}
