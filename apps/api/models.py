from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, Enum as SQLEnum, ForeignKey, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class UserRole(enum.Enum):
    """User role enumeration for RBAC system."""
    TOURIST = "tourist"
    GUIDE = "guide"
    BUSINESS = "business"
    ADMIN = "admin"


class BookingStatus(enum.Enum):
    """Booking status enumeration for tracking booking lifecycle."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELED = "canceled"
    COMPLETED = "completed"


class Gender(enum.Enum):
    """Gender enumeration for user profiles."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class User(Base):
    """
    User model for the tourism platform.
    
    Supports multiple user types: tourists, guides, local businesses, and admins.
    Includes basic authentication fields and audit timestamps.
    """
    __tablename__ = "users"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Authentication fields
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # User management
    is_active = Column(Boolean, default=True, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.TOURIST, nullable=False)
    
    # Profile information
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(20))
    
    # Verification status
    email_verified = Column(Boolean, default=False, nullable=False)
    phone_verified = Column(Boolean, default=False, nullable=False)
    identity_verified = Column(Boolean, default=False, nullable=False)
    
    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.value}')>"


class TouristProfile(Base):
    """
    Tourist profile model for users with TOURIST role.
    
    Stores personal information and preferences for tourists
    looking for unique travel experiences.
    """
    __tablename__ = "tourist_profiles"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key to User (one-to-one relationship)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Personal information
    full_name = Column(String(200), nullable=True)
    nationality = Column(String(100), nullable=True)
    home_city = Column(String(100), nullable=True)
    gender = Column(SQLEnum(Gender), nullable=True)
    
    # Languages spoken (array of language codes/names)
    spoken_languages = Column(ARRAY(String), nullable=True)
    
    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship to User model
    user = relationship("User", backref="tourist_profile")
    
    def __repr__(self):
        return f"<TouristProfile(id={self.id}, user_id={self.user_id}, nationality='{self.nationality}')>"


class GuideProfile(Base):
    """
    Guide profile model for users with GUIDE role.
    
    Stores professional information, experience, and service details
    for guides offering tours and experiences.
    """
    __tablename__ = "guide_profiles"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key to User (one-to-one relationship)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Personal information
    full_name = Column(String(200), nullable=True)
    
    # Professional information
    bio = Column(Text, nullable=True)
    guide_experience_years = Column(Integer, nullable=True)
    
    # Location information  
    city = Column(String(100), nullable=True)
    
    # Languages spoken (array of language codes/names)
    spoken_languages = Column(ARRAY(String), nullable=True)
    
    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship to User model
    user = relationship("User", backref="guide_profile")
    
    def __repr__(self):
        return f"<GuideProfile(id={self.id}, user_id={self.user_id}, city='{self.city}')>"


class Booking(Base):
    """
    Booking model for tour reservations between tourists and guides.
    
    Manages the booking lifecycle from initial request to completion,
    including status tracking and communication.
    """
    __tablename__ = "bookings"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # Tourist who made the booking
    guide_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # Guide being booked
    
    # Booking details
    tour_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    message = Column(Text, nullable=True)  # Optional message from tourist to guide
    
    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    tourist = relationship("User", foreign_keys=[user_id], backref="bookings_as_tourist")
    guide = relationship("User", foreign_keys=[guide_id], backref="bookings_as_guide")
    
    def __repr__(self):
        return f"<Booking(id={self.id}, tourist_id={self.user_id}, guide_id={self.guide_id}, status='{self.status.value}')>"


class Message(Base):
    """
    Message model for real-time chat between tourists and guides.
    
    Stores chat messages associated with specific bookings, enabling
    communication throughout the booking lifecycle.
    """
    __tablename__ = "messages"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Message content
    content = Column(Text, nullable=False)
    
    # Timestamp (using created_at pattern for consistency)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    booking = relationship("Booking", backref="messages")
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], backref="received_messages")
    
    def __repr__(self):
        return f"<Message(id={self.id}, booking_id={self.booking_id}, sender_id={self.sender_id})>"