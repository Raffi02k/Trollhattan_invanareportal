import datetime
from typing import List
from sqlalchemy.orm import Session
from . import models

# Mock Cases Database for OeP
MOCK_CASES = [
    {
        "caseId": "BN-2026-OEP-12",
        "partyId": "mock-party-raffi", # Matches seed.py for local user 'raffi'
        "flowInstanceId": "101",
        "title": "Ansökan om parkeringstillstånd",
        "status": "Inkommet",
        "externalStatus": "Under behandling",
        "system": "OeP",
        "created": datetime.datetime(2026, 1, 15, 10, 0),
        "updated": datetime.datetime(2026, 2, 10, 14, 30),
        "documents": [
            {
                "id": "doc-1",
                "filename": "Ansökan_parkeringskort.pdf",
                "type": "Ansökan",
                "created": datetime.datetime(2026, 1, 15, 10, 0),
                "linked_to": "Ärende"
            },
            {
                "id": "doc-2",
                "filename": "Läkarintyg.pdf",
                "type": "Bilaga",
                "created": datetime.datetime(2026, 1, 15, 10, 5),
                "linked_to": "Ärende"
            }
        ],
        "messages": [
            {
                "id": "msg-1",
                "sender": "Maria Svensson",
                "sender_role": "Handläggare",
                "content": "Hej! Vi har tagit emot din ansökan och börjat titta på den.",
                "created": datetime.datetime(2026, 1, 16, 9, 0)
            }
        ]
    },
    {
        "caseId": "BN-2025-OEP-45",
        "partyId": "mock-party-raffi",
        "flowInstanceId": "202",
        "title": "Bygglov för altan",
        "status": "Avslutad",
        "externalStatus": "Beviljad",
        "system": "OeP",
        "created": datetime.datetime(2025, 11, 20, 9, 0),
        "updated": datetime.datetime(2026, 2, 1, 16, 0),
        "documents": [
            {
                "id": "doc-3",
                "filename": "Ansökan_bygglov.pdf",
                "type": "Ansökan",
                "created": datetime.datetime(2025, 11, 20, 9, 0),
                "linked_to": "Ärende"
            },
            {
                "id": "doc-4",
                "filename": "Fasadritning.pdf",
                "type": "Bilaga",
                "created": datetime.datetime(2025, 11, 20, 9, 10),
                "linked_to": "Ärende"
            },
            {
                "id": "doc-5",
                "filename": "Beslut_bygglov_beviljat.pdf",
                "type": "Beslut",
                "created": datetime.datetime(2026, 2, 1, 16, 0),
                "linked_to": "Beslut"
            }
        ],
        "messages": [
            {
                "id": "msg-2",
                "sender": "Anna Pettersson",
                "sender_role": "Handläggare",
                "content": "Hej, vi behöver kompletterande ritningar för att kunna fortsätta handläggningen av din ansökan. Vänligen skicka in fasadritningar och sektionsritning.",
                "created": datetime.datetime(2026, 2, 10, 11, 0)
            }
        ]
    }
]

# Shared generic cases for anyone who isn't Raffi (to avoid 0 cases for OIDC users)
GENERIC_CASES = [
    {
        "caseId": "BN-2026-OEP-99",
        "flowInstanceId": "999",
        "title": "Ansökan om försörjningsstöd",
        "status": "Inkommet",
        "externalStatus": "Under utredning",
        "system": "OeP",
        "created": datetime.datetime(2026, 2, 20, 11, 0),
        "updated": datetime.datetime(2026, 2, 25, 15, 0),
        "documents": [
            {
                "id": "doc-99",
                "filename": "Inkomstuppgifter.pdf",
                "type": "Bilaga",
                "created": datetime.datetime(2026, 2, 20, 11, 0),
                "linked_to": "Ärende"
            }
        ],
        "messages": []
    }
]

def fetch_cases_for_party(party_id: str, db: Session = None) -> List[dict]:
    """
    Mock service to fetch cases from OeP for a specific partyId.
    Enriches mock cases with persisted messages from the database.
    """
    # Filter by party_id
    user_cases = [c for c in MOCK_CASES if c.get("partyId") == party_id]
    
    # Fallback for other users (OIDC etc) so they don't see an empty list
    if not user_cases and party_id != "mock-party-raffi":
        user_cases = [c.copy() for c in GENERIC_CASES]
        for c in user_cases:
            c["partyId"] = party_id

    enriched_cases = []
    for c in user_cases:
        case_copy = c.copy()
        if db:
            # 1. Fetch persisted messages
            db_messages = db.query(models.CaseMessage).filter(models.CaseMessage.case_id == c["caseId"]).all()
            persisted_msgs = [
                {
                    "id": str(m.id),
                    "sender": m.sender,
                    "sender_role": m.sender_role,
                    "content": m.content,
                    "created": m.created
                } for m in db_messages
            ]
            case_copy["messages"] = c.get("messages", []) + persisted_msgs
            case_copy["messages"].sort(key=lambda x: x["created"])

            # 2. Fetch persisted documents (uploaded by citizen)
            db_docs = db.query(models.CaseDocument).filter(models.CaseDocument.case_id == c["caseId"]).all()
            persisted_docs = [
                {
                    "id": f"upload-{d.id}",
                    "filename": d.filename,
                    "type": "Bilaga",
                    "created": d.created,
                    "linked_to": "Ärende"
                } for d in db_docs
            ]
            case_copy["documents"] = c.get("documents", []) + persisted_docs
            case_copy["documents"].sort(key=lambda x: x["created"], reverse=True)
            
        enriched_cases.append(case_copy)
        
    return enriched_cases

def fetch_all_documents_for_party(party_id: str, db: Session = None) -> List[dict]:
    """
    Mock service to fetch all documents across all cases for the Beslut & dokument view.
    """
    all_docs = []
    cases = fetch_cases_for_party(party_id, db)
    for c in cases:
        for doc in c.get("documents", []):
            # Add some context about where it came from
            doc_with_context = doc.copy()
            doc_with_context["linked_to"] = f"{c['title']} ({c['caseId']})"
            all_docs.append(doc_with_context)
    
    # Sort by created date descending
    all_docs.sort(key=lambda x: x["created"], reverse=True)
    return all_docs
