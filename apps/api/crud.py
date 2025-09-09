from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from typing import Optional
import models
import schemas

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """
    Retrieve a user by email address.
    
    Args:
        db: Database session
        email: User's email address
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """
    Retrieve a user by ID.
    
    Args:
        db: Database session
        user_id: User's ID
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """
    Create a new user with hashed password.
    
    Args:
        db: Database session
        user: UserCreate schema with user data
        
    Returns:
        Newly created User object
        
    Raises:
        IntegrityError: If email already exists
    """
    # Hash the password before storing
    hashed_password = get_password_hash(user.password)
    
    # Create new user instance
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        role=user.role,
        is_active=True,
        email_verified=False,
        phone_verified=False,
        identity_verified=False
    )
    
    try:
        # Add to session and commit
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise ValueError("Email already registered")


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    """
    Update user profile information.
    
    Args:
        db: Database session
        user_id: User's ID
        user_update: UserUpdate schema with updated data
        
    Returns:
        Updated User object if found, None otherwise
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    # Update only provided fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise ValueError("Update failed due to data conflict")


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    """
    Authenticate a user by email and password.
    
    Args:
        db: Database session
        email: User's email address
        password: Plain-text password
        
    Returns:
        User object if authentication successful, None otherwise
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


def deactivate_user(db: Session, user_id: int) -> bool:
    """
    Deactivate a user account.
    
    Args:
        db: Database session
        user_id: User's ID
        
    Returns:
        True if successful, False if user not found
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    db_user.is_active = False
    db.commit()
    db.refresh(db_user)
    return True


def verify_user_email(db: Session, user_id: int) -> bool:
    """
    Mark user's email as verified.
    
    Args:
        db: Database session
        user_id: User's ID
        
    Returns:
        True if successful, False if user not found
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    db_user.email_verified = True
    db.commit()
    db.refresh(db_user)
    return True


def verify_user_phone(db: Session, user_id: int) -> bool:
    """
    Mark user's phone as verified.
    
    Args:
        db: Database session
        user_id: User's ID
        
    Returns:
        True if successful, False if user not found
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    db_user.phone_verified = True
    db.commit()
    db.refresh(db_user)
    return True


def verify_user_identity(db: Session, user_id: int) -> bool:
    """
    Mark user's identity as verified (KYC completion).
    
    Args:
        db: Database session
        user_id: User's ID
        
    Returns:
        True if successful, False if user not found
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    db_user.identity_verified = True
    db.commit()
    db.refresh(db_user)
    return True