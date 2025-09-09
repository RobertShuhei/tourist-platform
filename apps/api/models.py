from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from datetime import datetime
import enum
from database import Base

class UserRole(enum.Enum):
    """User role enumeration for RBAC system."""
    TOURIST = "tourist"
    GUIDE = "guide"
    BUSINESS = "business"
    ADMIN = "admin"

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