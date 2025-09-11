from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, BookingStatus


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


# Guide Profile Schemas

class GuideProfileBase(BaseModel):
    """Base guide profile schema with common fields."""
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    city: Optional[str] = None
    country: Optional[str] = None
    languages: Optional[List[str]] = None

    @validator('experience_years')
    def validate_experience_years(cls, v):
        """Validate experience years is positive."""
        if v is not None and v < 0:
            raise ValueError('Experience years must be non-negative')
        if v is not None and v > 50:
            raise ValueError('Experience years must be realistic (≤ 50 years)')
        return v

    @validator('languages')
    def validate_languages(cls, v):
        """Validate languages list."""
        if v is not None:
            if len(v) == 0:
                raise ValueError('Languages list cannot be empty if provided')
            # Remove duplicates and ensure non-empty strings
            unique_languages = list(set(lang.strip() for lang in v if lang.strip()))
            if len(unique_languages) == 0:
                raise ValueError('At least one valid language must be provided')
            return unique_languages
        return v


class GuideProfileCreate(GuideProfileBase):
    """Schema for creating a new guide profile."""
    pass


class GuideProfileUpdate(GuideProfileBase):
    """Schema for updating guide profile information."""
    pass


class GuideProfile(GuideProfileBase):
    """Schema for reading guide profile data from the database."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class GuideProfilePublic(GuideProfileBase):
    """Schema for public guide profile listing with user information."""
    id: int
    user_id: int
    # User information for public display
    guide_name: str
    guide_email: str
    member_since: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Booking Schemas

class BookingBase(BaseModel):
    """Base booking schema with common fields."""
    guide_id: int
    tour_date: datetime
    message: Optional[str] = None

    @validator('tour_date')
    def validate_tour_date(cls, v):
        """Validate tour date is in the future."""
        if v <= datetime.utcnow():
            raise ValueError('Tour date must be in the future')
        return v

    @validator('message')
    def validate_message(cls, v):
        """Validate message length."""
        if v is not None:
            if len(v.strip()) == 0:
                return None  # Convert empty strings to None
            if len(v) > 1000:
                raise ValueError('Message must be less than 1000 characters')
        return v


class BookingCreate(BookingBase):
    """Schema for creating a new booking."""
    pass


class BookingUpdate(BaseModel):
    """Schema for updating booking status (for guides)."""
    status: BookingStatus


class Booking(BookingBase):
    """Schema for reading booking data from the database."""
    id: int
    user_id: int  # Tourist who made the booking
    status: BookingStatus
    created_at: datetime
    updated_at: datetime
    
    # Include related user information
    tourist_name: Optional[str] = None
    tourist_email: Optional[str] = None
    guide_name: Optional[str] = None
    guide_email: Optional[str] = None

    class Config:
        orm_mode = True


# Message Schemas

class MessageBase(BaseModel):
    """Base message schema with common fields."""
    content: str

    @validator('content')
    def validate_content(cls, v):
        """Validate message content."""
        if not v or not v.strip():
            raise ValueError('Message content cannot be empty')
        if len(v) > 5000:
            raise ValueError('Message content must be less than 5000 characters')
        return v.strip()


class MessageCreate(MessageBase):
    """Schema for creating a new message."""
    booking_id: int
    recipient_id: int


class Message(MessageBase):
    """Schema for reading message data from the database."""
    id: int
    booking_id: int
    sender_id: int
    recipient_id: int
    created_at: datetime
    
    # Include sender information
    sender_name: Optional[str] = None
    sender_email: Optional[str] = None

    class Config:
        orm_mode = True


class MessageWithUsers(Message):
    """Extended message schema with full user information."""
    recipient_name: Optional[str] = None
    recipient_email: Optional[str] = None

    class Config:
        orm_mode = True