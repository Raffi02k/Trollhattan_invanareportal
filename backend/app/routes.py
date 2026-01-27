from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import models, auth
from app.database import get_db
from pydantic import BaseModel

router = APIRouter()

class UserOut(BaseModel):
    id: int
    username: str
    email: str | None = None
    full_name: str | None = None
    role: str
    auth_method: str

    class Config:
        from_ = True

@router.post("/token", response_model=auth.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# Setup script endpoint (Remove in production)
@router.post("/setup")
async def setup_users(db: Session = Depends(get_db)):
    # Create a test user if not exists
    if not db.query(models.User).filter(models.User.username == "raffi").first():
        hashed = auth.get_password_hash("password123")
        user = models.User(username="raffi", hashed_password=hashed, role="Admin", auth_method="local", full_name="Raffi")
        db.add(user)
        db.commit()
    return {"message": "User created"}
