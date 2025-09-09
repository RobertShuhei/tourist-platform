from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from models import UserRole


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.TOURIST

    @validator('password')
    def validate_password(cls, v):
        """Validate password requirements."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format."""
        if v is not None:
            # Remove common separators
            cleaned = v.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
            if not cleaned.replace('+', '').isdigit():
                raise ValueError('Phone number must contain only digits and + symbol')
            if len(cleaned) < 10:
                raise ValueError('Phone number must be at least 10 digits')
        return v


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format."""
        if v is not None:
            cleaned = v.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
            if not cleaned.replace('+', '').isdigit():
                raise ValueError('Phone number must contain only digits and + symbol')
            if len(cleaned) < 10:
                raise ValueError('Phone number must be at least 10 digits')
        return v


class User(UserBase):
    """Schema for reading user data from the database."""
    id: int
    is_active: bool
    role: UserRole
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email_verified: bool
    phone_verified: bool
    identity_verified: bool
    created_at: datetime

    class Config:
        orm_mode = True


class UserProfile(User):
    """Extended user schema with additional profile information."""
    updated_at: datetime

    class Config:
        orm_mode = True


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Schema for token payload data."""
    email: Optional[str] = None
    user_id: Optional[int] = None