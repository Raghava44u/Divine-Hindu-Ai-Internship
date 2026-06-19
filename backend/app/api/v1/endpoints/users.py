from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from app.api import deps
from app.schemas.user import User, UserCreate, UserUpdate
from app.repositories.user_repo import user_repo

router = APIRouter()

@router.get("/", response_model=List[User])
def read_users(
    db: deps.SessionDep,
    current_user: deps.CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve users.
    """
    users = user_repo.get_multi(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=User)
def create_user(
    *,
    db: deps.SessionDep,
    user_in: UserCreate,
    # current_user: deps.CurrentUser
) -> Any:
    """
    Create new user.
    """
    user = user_repo.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = user_repo.create(db, obj_in=user_in)
    return user
