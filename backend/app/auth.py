from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app import models
import os
from dotenv import load_dotenv
from app.database import get_db
from pydantic import BaseModel

# Configuration
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
_raw_expire_minutes = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

if not SECRET_KEY or not ALGORITHM or not _raw_expire_minutes:
    raise RuntimeError("Missing required environment variables: SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES")

try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(_raw_expire_minutes)
except ValueError as exc:
    raise RuntimeError("ACCESS_TOKEN_EXPIRE_MINUTES must be an integer") from exc

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Defaults to 30 minutes if not specified
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # [IMPORTANT] The "sub" (subject) claim holds the unique identifier (username)
    # This is standard JWT practice.
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# [CRITICAL] Dependency Injection
# This function is used by FastAPI "Depends()" to protect routes.
# It automatically:
# 1. Extracts the Bearer token from the Authorization header
# 2. Decodes and validates the signature
# 3. Fetches the user from the database
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if not isinstance(username, str) or not username:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user
