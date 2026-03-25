from pydantic import BaseModel
from typing import Optional, List

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: str
    auth_method: str
    oidc_id: Optional[str] = None

    class Config:
        from_attributes = True

class UserMe(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    role: str
    personnummer: Optional[str] = None
    party_id: Optional[str] = None
    auth_method: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    phone_number: Optional[str] = None

import datetime

class Document(BaseModel):
    id: str
    filename: str
    type: str  # e.g., "Beslut", "Bilaga", "Ansökan"
    created: datetime.datetime
    linked_to: Optional[str] = None # e.g., "Ärende", "Beslut"

class Message(BaseModel):
    id: str
    sender: str
    sender_role: str
    content: str
    created: datetime.datetime

class Case(BaseModel):
    caseId: str
    flowInstanceId: str
    title: str
    status: str
    externalStatus: str
    system: str
    created: datetime.datetime
    updated: datetime.datetime
    documents: List[Document] = []
    messages: List[Message] = []

    class Config:
        from_attributes = True
        json_encoders = {
            datetime.datetime: lambda v: v.isoformat() + "Z"
        }

class MessageRequest(BaseModel):
    content: str
