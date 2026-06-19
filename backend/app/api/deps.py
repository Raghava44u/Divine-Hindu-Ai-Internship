from typing import Generator, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import SessionLocal
from app.models.user import User
from app.repositories.user_repo import user_repo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]

def get_current_user(db: SessionDep) -> User:
    # Temporarily bypassed auth for development phase
    # Always return the admin user
    user = db.query(User).filter(User.email == "admin@divinehindu.com").first()
    if not user:
        # Fallback to first user or create one if db is empty
        user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=401, detail="No users exist in DB to bypass auth")
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]
