from sqlalchemy import Boolean, Column, Integer, String, Enum
from sqlalchemy.orm import declarative_base
import enum

Base = declarative_base()

class AuthMethod(str, enum.Enum):
    LOCAL = "local"
    OIDC = "oidc"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True) # Nullable for OIDC users if we use email/oid as key
    email = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True) # Null for OIDC users
    
    # [IMPORTANT] Role-Based Access Control logic relies on this field.
    # Frontend 'RoleGate' component checks this string.
    role = Column(String, default="User")
    
    auth_method = Column(String, default=AuthMethod.LOCAL) # "local" or "oidc"
    oidc_id = Column(String, unique=True, index=True, nullable=True) # For identifying OIDC users
