from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import declarative_base
import enum
import datetime

Base = declarative_base()

class AuthMethod(str, enum.Enum):
    LOCAL = "local"
    OIDC = "oidc"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    phone_number = Column(String, nullable=True)

    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)  # Null för OIDC users

    role = Column(String, default="User", nullable=False)

    # Spara som sträng (enklast)
    auth_method = Column(String, default=AuthMethod.LOCAL.value, nullable=False)

    personnummer = Column(String, index=True, nullable=True)
    party_id = Column(String, index=True, nullable=True)

    oidc_id = Column(String, unique=True, index=True, nullable=True)
    oidc_tenant_id = Column(String, index=True, nullable=True)
    is_disabled = Column(Boolean, default=False, nullable=False)

class CaseMessage(Base):
    __tablename__ = "case_messages"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, index=True, nullable=False)
    sender = Column(String, nullable=False)
    sender_role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created = Column(DateTime, default=datetime.datetime.utcnow)

class CaseDocument(Base):
    __tablename__ = "case_documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, index=True, nullable=False)
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    created = Column(DateTime, default=datetime.datetime.utcnow)
