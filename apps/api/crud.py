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


# Guide Profile CRUD operations

def create_guide_profile(db: Session, profile: schemas.GuideProfileCreate, user_id: int) -> models.GuideProfile:
    """
    Create a new guide profile for a user.
    
    Args:
        db: Database session
        profile: GuideProfileCreate schema with profile data
        user_id: ID of the user (must have GUIDE role)
        
    Returns:
        Newly created GuideProfile object
        
    Raises:
        IntegrityError: If user already has a guide profile
        ValueError: If user is not found or doesn't have GUIDE role
    """
    # Verify user exists and has GUIDE role
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("User not found")
    if user.role != models.UserRole.GUIDE:
        raise ValueError("User must have GUIDE role to create a guide profile")
    
    # Check if guide profile already exists
    existing_profile = get_guide_profile_by_user_id(db, user_id)
    if existing_profile:
        raise ValueError("User already has a guide profile")
    
    # Create new guide profile
    db_profile = models.GuideProfile(
        user_id=user_id,
        bio=profile.bio,
        experience_years=profile.experience_years,
        city=profile.city,
        country=profile.country,
        languages=profile.languages
    )
    
    try:
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile
    except IntegrityError:
        db.rollback()
        raise ValueError("Failed to create guide profile")


def get_guide_profile_by_user_id(db: Session, user_id: int) -> Optional[models.GuideProfile]:
    """
    Retrieve a guide profile by user ID.
    
    Args:
        db: Database session
        user_id: User's ID
        
    Returns:
        GuideProfile object if found, None otherwise
    """
    return db.query(models.GuideProfile).filter(models.GuideProfile.user_id == user_id).first()


def get_guide_profile(db: Session, profile_id: int) -> Optional[models.GuideProfile]:
    """
    Retrieve a guide profile by profile ID.
    
    Args:
        db: Database session
        profile_id: Profile's ID
        
    Returns:
        GuideProfile object if found, None otherwise
    """
    return db.query(models.GuideProfile).filter(models.GuideProfile.id == profile_id).first()


def update_guide_profile(db: Session, user_id: int, profile_update: schemas.GuideProfileUpdate) -> Optional[models.GuideProfile]:
    """
    Update guide profile information.
    
    Args:
        db: Database session
        user_id: User's ID
        profile_update: GuideProfileUpdate schema with updated data
        
    Returns:
        Updated GuideProfile object if found, None otherwise
    """
    db_profile = get_guide_profile_by_user_id(db, user_id)
    if not db_profile:
        return None
    
    # Update only provided fields
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    try:
        db.commit()
        db.refresh(db_profile)
        return db_profile
    except IntegrityError:
        db.rollback()
        raise ValueError("Update failed due to data conflict")


from sqlalchemy.orm import joinedload


def get_all_guide_profiles(db: Session) -> list[models.GuideProfile]:
    """
    Retrieve all guide profiles with associated user information.
    
    Args:
        db: Database session
        
    Returns:
        List of GuideProfile objects with user relationships loaded
    """
    return (
        db.query(models.GuideProfile)
        .join(models.User, models.GuideProfile.user_id == models.User.id)
        .options(joinedload(models.GuideProfile.user))
        .filter(
            models.User.role == models.UserRole.GUIDE,
            models.User.is_active == True,
        )
        .all()
    )


def get_guide_profile_by_id(db: Session, profile_id: int) -> Optional[models.GuideProfile]:
    """
    Retrieve a specific guide profile by profile ID with associated user information.
    
    Args:
        db: Database session
        profile_id: Guide profile ID
        
    Returns:
        GuideProfile object with user relationship loaded, None if not found
    """
    return db.query(models.GuideProfile).join(models.User, models.GuideProfile.user_id == models.User.id).filter(
        models.GuideProfile.id == profile_id,
        models.User.role == models.UserRole.GUIDE,
        models.User.is_active == True
    ).first()


# Booking CRUD operations

def create_booking(db: Session, booking: schemas.BookingCreate, user_id: int) -> models.Booking:
    """
    Create a new booking for a tourist.
    
    Args:
        db: Database session
        booking: BookingCreate schema with booking data
        user_id: ID of the tourist creating the booking
        
    Returns:
        Newly created Booking object
        
    Raises:
        ValueError: If validation fails or guide not found
    """
    # Verify tourist exists and has TOURIST role
    tourist = get_user_by_id(db, user_id)
    if not tourist:
        raise ValueError("User not found")
    if tourist.role != models.UserRole.TOURIST:
        raise ValueError("Only tourists can create bookings")
    
    # Verify guide exists and has GUIDE role
    guide = get_user_by_id(db, booking.guide_id)
    if not guide:
        raise ValueError("Guide not found")
    if guide.role != models.UserRole.GUIDE:
        raise ValueError("Selected user is not a guide")
    if not guide.is_active:
        raise ValueError("Guide account is not active")
    
    # Prevent self-booking
    if user_id == booking.guide_id:
        raise ValueError("Cannot book yourself as a guide")
    
    # Create new booking
    db_booking = models.Booking(
        user_id=user_id,
        guide_id=booking.guide_id,
        tour_date=booking.tour_date,
        message=booking.message
    )
    
    try:
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        return db_booking
    except IntegrityError:
        db.rollback()
        raise ValueError("Failed to create booking")


def get_bookings_for_user(db: Session, user_id: int, role: models.UserRole) -> list[models.Booking]:
    """
    Get all bookings for a user (either as tourist or guide).
    
    Args:
        db: Database session
        user_id: User's ID
        role: User's role to determine which bookings to fetch
        
    Returns:
        List of Booking objects with relationships loaded
    """
    if role == models.UserRole.TOURIST:
        # Return bookings where user is the tourist
        return db.query(models.Booking).filter(
            models.Booking.user_id == user_id
        ).order_by(models.Booking.created_at.desc()).all()
    elif role == models.UserRole.GUIDE:
        # Return bookings where user is the guide
        return db.query(models.Booking).filter(
            models.Booking.guide_id == user_id
        ).order_by(models.Booking.created_at.desc()).all()
    else:
        return []


def get_booking_by_id(db: Session, booking_id: int) -> Optional[models.Booking]:
    """
    Retrieve a booking by ID with relationships loaded.
    
    Args:
        db: Database session
        booking_id: Booking's ID
        
    Returns:
        Booking object if found, None otherwise
    """
    return db.query(models.Booking).filter(models.Booking.id == booking_id).first()


def update_booking_status(db: Session, booking_id: int, status: models.BookingStatus, user_id: int) -> Optional[models.Booking]:
    """
    Update booking status (only by the guide who received the booking).
    
    Args:
        db: Database session
        booking_id: Booking's ID
        status: New booking status
        user_id: ID of the user updating (must be the guide)
        
    Returns:
        Updated Booking object if successful, None if booking not found
        
    Raises:
        ValueError: If user is not authorized to update the booking
    """
    db_booking = get_booking_by_id(db, booking_id)
    if not db_booking:
        return None
    
    # Only the guide can update booking status
    if db_booking.guide_id != user_id:
        raise ValueError("Only the guide can update booking status")
    
    db_booking.status = status
    
    try:
        db.commit()
        db.refresh(db_booking)
        return db_booking
    except IntegrityError:
        db.rollback()
        raise ValueError("Update failed due to data conflict")


# Message CRUD operations

def create_message(db: Session, message: schemas.MessageCreate, sender_id: int) -> models.Message:
    """
    Create a new message in a booking conversation.
    
    Args:
        db: Database session
        message: MessageCreate schema with message data
        sender_id: ID of the user sending the message
        
    Returns:
        Newly created Message object
        
    Raises:
        ValueError: If validation fails or booking access denied
    """
    # Verify booking exists
    booking = get_booking_by_id(db, message.booking_id)
    if not booking:
        raise ValueError("Booking not found")
    
    # Verify sender is involved in the booking (either tourist or guide)
    if sender_id not in [booking.user_id, booking.guide_id]:
        raise ValueError("Access denied. You can only send messages in your own bookings")
    
    # Verify recipient is the other party in the booking
    if message.recipient_id == sender_id:
        raise ValueError("Cannot send message to yourself")
    
    if message.recipient_id not in [booking.user_id, booking.guide_id]:
        raise ValueError("Recipient must be involved in this booking")
    
    # Create new message
    db_message = models.Message(
        booking_id=message.booking_id,
        sender_id=sender_id,
        recipient_id=message.recipient_id,
        content=message.content
    )
    
    try:
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        return db_message
    except IntegrityError:
        db.rollback()
        raise ValueError("Failed to create message")


def get_messages_for_booking(db: Session, booking_id: int, user_id: int) -> list[models.Message]:
    """
    Get all messages for a specific booking conversation.
    
    Args:
        db: Database session
        booking_id: ID of the booking
        user_id: ID of the user requesting messages (for authorization)
        
    Returns:
        List of Message objects ordered by creation time
        
    Raises:
        ValueError: If user is not authorized to view messages
    """
    # Verify booking exists and user is authorized
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise ValueError("Booking not found")
    
    # Only participants in the booking can view messages
    if user_id not in [booking.user_id, booking.guide_id]:
        raise ValueError("Access denied. You can only view messages from your own bookings")
    
    # Get all messages for this booking, ordered by creation time
    messages = db.query(models.Message).filter(
        models.Message.booking_id == booking_id
    ).order_by(models.Message.created_at.asc()).all()
    
    return messages


def get_message_by_id(db: Session, message_id: int) -> Optional[models.Message]:
    """
    Retrieve a message by ID.
    
    Args:
        db: Database session
        message_id: Message's ID
        
    Returns:
        Message object if found, None otherwise
    """
    return db.query(models.Message).filter(models.Message.id == message_id).first()


def get_recent_messages_for_user(db: Session, user_id: int, limit: int = 50) -> list[models.Message]:
    """
    Get recent messages where the user is sender or recipient.
    
    Args:
        db: Database session
        user_id: User's ID
        limit: Maximum number of messages to return
        
    Returns:
        List of recent Message objects
    """
    messages = db.query(models.Message).filter(
        (models.Message.sender_id == user_id) | 
        (models.Message.recipient_id == user_id)
    ).order_by(
        models.Message.created_at.desc()
    ).limit(limit).all()
    
    return messages


# Tourist Profile CRUD operations

def create_tourist_profile(db: Session, profile: schemas.TouristProfileCreate, user_id: int) -> models.TouristProfile:
    """
    Create a new tourist profile for a user.
    
    Args:
        db: Database session
        profile: TouristProfileCreate schema with profile data
        user_id: ID of the user (must have TOURIST role)
        
    Returns:
        Newly created TouristProfile object
        
    Raises:
        ValueError: If user is not found, doesn't have TOURIST role, or already has a profile
    """
    # Verify user exists and has TOURIST role
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("User not found")
    if user.role != models.UserRole.TOURIST:
        raise ValueError("User must have TOURIST role to create a tourist profile")
    
    # Check if tourist profile already exists
    existing_profile = get_tourist_profile_by_user_id(db, user_id)
    if existing_profile:
        raise ValueError("User already has a tourist profile")
    
    # Create new tourist profile
    db_profile = models.TouristProfile(
        user_id=user_id,
        full_name=profile.full_name,
        nationality=profile.nationality,
        home_city=profile.home_city,
        gender=profile.gender,
        spoken_languages=profile.spoken_languages
    )
    
    try:
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile
    except IntegrityError:
        db.rollback()
        raise ValueError("Failed to create tourist profile")


def get_tourist_profile_by_user_id(db: Session, user_id: int) -> Optional[models.TouristProfile]:
    """
    Retrieve a tourist profile by user ID.
    
    Args:
        db: Database session
        user_id: User's ID
        
    Returns:
        TouristProfile object if found, None otherwise
    """
    return db.query(models.TouristProfile).filter(models.TouristProfile.user_id == user_id).first()


def update_tourist_profile(db: Session, user_id: int, profile_update: schemas.TouristProfileUpdate) -> Optional[models.TouristProfile]:
    """
    Update tourist profile information.
    
    Args:
        db: Database session
        user_id: User's ID
        profile_update: TouristProfileUpdate schema with updated data
        
    Returns:
        Updated TouristProfile object if found, None otherwise
    """
    db_profile = get_tourist_profile_by_user_id(db, user_id)
    if not db_profile:
        return None
    
    # Update only provided fields
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    try:
        db.commit()
        db.refresh(db_profile)
        return db_profile
    except IntegrityError:
        db.rollback()
        raise ValueError("Update failed due to data conflict")


# Updated Guide Profile CRUD operations

def create_new_guide_profile(db: Session, profile: schemas.NewGuideProfileCreate, user_id: int) -> models.GuideProfile:
    """
    Create a new guide profile for a user.
    
    Args:
        db: Database session
        profile: NewGuideProfileCreate schema with profile data
        user_id: ID of the user (must have GUIDE role)
        
    Returns:
        Newly created GuideProfile object
        
    Raises:
        ValueError: If user is not found, doesn't have GUIDE role, or already has a profile
    """
    # Verify user exists and has GUIDE role
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("User not found")
    if user.role != models.UserRole.GUIDE:
        raise ValueError("User must have GUIDE role to create a guide profile")
    
    # Check if guide profile already exists
    existing_profile = get_guide_profile_by_user_id(db, user_id)
    if existing_profile:
        raise ValueError("User already has a guide profile")
    
    # Create new guide profile
    db_profile = models.GuideProfile(
        user_id=user_id,
        full_name=profile.full_name,
        bio=profile.bio,
        guide_experience_years=profile.guide_experience_years,
        city=profile.city,
        spoken_languages=profile.spoken_languages
    )
    
    try:
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile
    except IntegrityError:
        db.rollback()
        raise ValueError("Failed to create guide profile")


def update_new_guide_profile(db: Session, user_id: int, profile_update: schemas.NewGuideProfileUpdate) -> Optional[models.GuideProfile]:
    """
    Update guide profile information.
    
    Args:
        db: Database session
        user_id: User's ID
        profile_update: NewGuideProfileUpdate schema with updated data
        
    Returns:
        Updated GuideProfile object if found, None otherwise
    """
    db_profile = get_guide_profile_by_user_id(db, user_id)
    if not db_profile:
        return None
    
    # Update only provided fields
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    try:
        db.commit()
        db.refresh(db_profile)
        return db_profile
    except IntegrityError:
        db.rollback()
        raise ValueError("Update failed due to data conflict")
