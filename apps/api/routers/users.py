from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db

# Create router for user endpoints
router = APIRouter()


@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new user account.
    
    Args:
        user: User registration data
        db: Database session dependency
        
    Returns:
        Newly created user data
        
    Raises:
        HTTPException: 400 if email already exists
        HTTPException: 422 if validation fails
    """
    # Check if user with this email already exists
    existing_user = crud.get_user_by_email(db, email=user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create new user
        db_user = crud.create_user(db=db, user=user)
        return db_user
    except ValueError as e:
        # Handle any additional validation errors from CRUD layer
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/me", response_model=schemas.User)
def get_current_user_profile(
    db: Session = Depends(get_db),
    # TODO: Add JWT authentication dependency here
):
    """
    Get current authenticated user's profile.
    
    Note: Authentication dependency will be added in future implementation.
    """
    # Placeholder - will be implemented with JWT authentication
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Authentication not yet implemented"
    )


@router.get("/{user_id}", response_model=schemas.User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get user by ID.
    
    Args:
        user_id: User's unique identifier
        db: Database session dependency
        
    Returns:
        User data
        
    Raises:
        HTTPException: 404 if user not found
    """
    db_user = crud.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user


@router.put("/me", response_model=schemas.User)
def update_current_user_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    # TODO: Add JWT authentication dependency here
):
    """
    Update current authenticated user's profile.
    
    Note: Authentication dependency will be added in future implementation.
    """
    # Placeholder - will be implemented with JWT authentication
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Authentication not yet implemented"
    )


@router.post("/verify/email/{user_id}")
def verify_email(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Verify user's email address.
    
    Args:
        user_id: User's unique identifier
        db: Database session dependency
        
    Returns:
        Success message
        
    Raises:
        HTTPException: 404 if user not found
    """
    success = crud.verify_user_email(db, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "Email verified successfully"}


@router.post("/verify/phone/{user_id}")
def verify_phone(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Verify user's phone number.
    
    Args:
        user_id: User's unique identifier
        db: Database session dependency
        
    Returns:
        Success message
        
    Raises:
        HTTPException: 404 if user not found
    """
    success = crud.verify_user_phone(db, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "Phone verified successfully"}


@router.post("/verify/identity/{user_id}")
def verify_identity(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Verify user's identity (KYC completion).
    
    Args:
        user_id: User's unique identifier
        db: Database session dependency
        
    Returns:
        Success message
        
    Raises:
        HTTPException: 404 if user not found
    """
    success = crud.verify_user_identity(db, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "Identity verified successfully"}


@router.delete("/{user_id}")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Deactivate user account (soft delete).
    
    Args:
        user_id: User's unique identifier
        db: Database session dependency
        
    Returns:
        Success message
        
    Raises:
        HTTPException: 404 if user not found
    """
    success = crud.deactivate_user(db, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "User account deactivated successfully"}