from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
import models
import schemas
import crud

router = APIRouter(
    prefix="/bookings",
    tags=["bookings"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.Booking, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new booking request.
    
    Only tourists can create bookings for guides.
    """
    try:
        db_booking = crud.create_booking(db=db, booking=booking, user_id=current_user.id)
        
        # Format response with user information
        booking_response = schemas.Booking(
            id=db_booking.id,
            user_id=db_booking.user_id,
            guide_id=db_booking.guide_id,
            tour_date=db_booking.tour_date,
            message=db_booking.message,
            status=db_booking.status,
            created_at=db_booking.created_at,
            updated_at=db_booking.updated_at,
            tourist_name=f"{db_booking.tourist.first_name} {db_booking.tourist.last_name}".strip() if db_booking.tourist.first_name or db_booking.tourist.last_name else None,
            tourist_email=db_booking.tourist.email,
            guide_name=f"{db_booking.guide.first_name} {db_booking.guide.last_name}".strip() if db_booking.guide.first_name or db_booking.guide.last_name else None,
            guide_email=db_booking.guide.email
        )
        
        return booking_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/my-bookings", response_model=List[schemas.Booking])
async def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get all bookings for the current user.
    
    - Tourists see bookings they created
    - Guides see bookings they received
    """
    try:
        bookings = crud.get_bookings_for_user(db=db, user_id=current_user.id, role=current_user.role)
        
        # Format response with user information for each booking
        booking_responses = []
        for booking in bookings:
            booking_response = schemas.Booking(
                id=booking.id,
                user_id=booking.user_id,
                guide_id=booking.guide_id,
                tour_date=booking.tour_date,
                message=booking.message,
                status=booking.status,
                created_at=booking.created_at,
                updated_at=booking.updated_at,
                tourist_name=f"{booking.tourist.first_name} {booking.tourist.last_name}".strip() if booking.tourist.first_name or booking.tourist.last_name else None,
                tourist_email=booking.tourist.email,
                guide_name=f"{booking.guide.first_name} {booking.guide.last_name}".strip() if booking.guide.first_name or booking.guide.last_name else None,
                guide_email=booking.guide.email
            )
            booking_responses.append(booking_response)
        
        return booking_responses
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.patch("/{booking_id}/status", response_model=schemas.Booking)
async def update_booking_status(
    booking_id: int,
    status_update: schemas.BookingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update booking status.
    
    Only the guide who received the booking can update its status.
    """
    try:
        db_booking = crud.update_booking_status(
            db=db, 
            booking_id=booking_id, 
            status=status_update.status, 
            user_id=current_user.id
        )
        
        if not db_booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Format response with user information
        booking_response = schemas.Booking(
            id=db_booking.id,
            user_id=db_booking.user_id,
            guide_id=db_booking.guide_id,
            tour_date=db_booking.tour_date,
            message=db_booking.message,
            status=db_booking.status,
            created_at=db_booking.created_at,
            updated_at=db_booking.updated_at,
            tourist_name=f"{db_booking.tourist.first_name} {db_booking.tourist.last_name}".strip() if db_booking.tourist.first_name or db_booking.tourist.last_name else None,
            tourist_email=db_booking.tourist.email,
            guide_name=f"{db_booking.guide.first_name} {db_booking.guide.last_name}".strip() if db_booking.guide.first_name or db_booking.guide.last_name else None,
            guide_email=db_booking.guide.email
        )
        
        return booking_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{booking_id}", response_model=schemas.Booking)
async def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get a specific booking by ID.
    
    Only the tourist or guide involved in the booking can access it.
    """
    db_booking = crud.get_booking_by_id(db=db, booking_id=booking_id)
    
    if not db_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check authorization - only the tourist or guide involved can access
    if current_user.id != db_booking.user_id and current_user.id != db_booking.guide_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only view your own bookings."
        )
    
    # Format response with user information
    booking_response = schemas.Booking(
        id=db_booking.id,
        user_id=db_booking.user_id,
        guide_id=db_booking.guide_id,
        tour_date=db_booking.tour_date,
        message=db_booking.message,
        status=db_booking.status,
        created_at=db_booking.created_at,
        updated_at=db_booking.updated_at,
        tourist_name=f"{db_booking.tourist.first_name} {db_booking.tourist.last_name}".strip() if db_booking.tourist.first_name or db_booking.tourist.last_name else None,
        tourist_email=db_booking.tourist.email,
        guide_name=f"{db_booking.guide.first_name} {db_booking.guide.last_name}".strip() if db_booking.guide.first_name or db_booking.guide.last_name else None,
        guide_email=db_booking.guide.email
    )
    
    return booking_response