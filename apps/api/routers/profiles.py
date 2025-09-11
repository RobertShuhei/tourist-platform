from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
import crud
import schemas
import models
from database import get_db
from routers.auth import get_current_active_user

router = APIRouter()


def require_guide_role(current_user: schemas.User = Depends(get_current_active_user)):
    """
    Dependency to ensure the current user has GUIDE role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user if they have GUIDE role
        
    Raises:
        HTTPException: If user doesn't have GUIDE role
    """
    if current_user.role != models.UserRole.GUIDE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. GUIDE role required."
        )
    return current_user


def require_tourist_role(current_user: schemas.User = Depends(get_current_active_user)):
    """
    Dependency to ensure the current user has TOURIST role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user if they have TOURIST role
        
    Raises:
        HTTPException: If user doesn't have TOURIST role
    """
    if current_user.role != models.UserRole.TOURIST:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. TOURIST role required."
        )
    return current_user


@router.post("/guide", response_model=schemas.GuideProfile, status_code=status.HTTP_201_CREATED)
async def create_guide_profile(
    profile: schemas.GuideProfileCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(require_guide_role)
):
    """
    Create a new guide profile for the current user.
    
    Args:
        profile: Guide profile data
        db: Database session
        current_user: Current authenticated user (must have GUIDE role)
        
    Returns:
        Created guide profile
        
    Raises:
        HTTPException: If profile creation fails
    """
    try:
        db_profile = crud.create_guide_profile(db, profile, current_user.id)
        return db_profile
    except ValueError as e:
        if "already has a guide profile" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has a guide profile"
            )
        elif "must have GUIDE role" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. GUIDE role required."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create guide profile"
        )


@router.get("/guide/me", response_model=schemas.GuideProfile)
async def get_my_guide_profile(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(require_guide_role)
):
    """
    Get the current user's guide profile.
    
    Args:
        db: Database session
        current_user: Current authenticated user (must have GUIDE role)
        
    Returns:
        Current user's guide profile
        
    Raises:
        HTTPException: If profile not found
    """
    db_profile = crud.get_guide_profile_by_user_id(db, current_user.id)
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guide profile not found. Create one first."
        )
    return db_profile


@router.put("/guide/me", response_model=schemas.GuideProfile)
async def update_my_guide_profile(
    profile_update: schemas.GuideProfileUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(require_guide_role)
):
    """
    Update the current user's guide profile.
    
    Args:
        profile_update: Updated profile data
        db: Database session
        current_user: Current authenticated user (must have GUIDE role)
        
    Returns:
        Updated guide profile
        
    Raises:
        HTTPException: If profile not found or update fails
    """
    try:
        db_profile = crud.update_guide_profile(db, current_user.id, profile_update)
        if not db_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Guide profile not found. Create one first."
            )
        return db_profile
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update guide profile"
        )


@router.get("/guide/{user_id}", response_model=schemas.GuideProfile)
async def get_guide_profile_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Get a guide profile by user ID (public endpoint).
    
    Args:
        user_id: ID of the user whose guide profile to retrieve
        db: Database session
        current_user: Current authenticated user (any role)
        
    Returns:
        Guide profile for the specified user
        
    Raises:
        HTTPException: If user or profile not found, or user is not a guide
    """
    # Check if the user exists and has GUIDE role
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role != models.UserRole.GUIDE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a guide"
        )
    
    # Get the guide profile
    db_profile = crud.get_guide_profile_by_user_id(db, user_id)
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guide profile not found"
        )
    
    return db_profile


@router.get("/guides", response_model=List[schemas.GuideProfilePublic])
async def get_all_guides(
    db: Session = Depends(get_db)
):
    """
    Get all guide profiles for public browsing (no authentication required).
    
    Args:
        db: Database session
        
    Returns:
        List of all active guide profiles with user information
    """
    try:
        db_profiles = crud.get_all_guide_profiles(db)
        
        # Transform the data to include user information
        public_profiles = []
        for profile in db_profiles:
            public_profile = {
                "id": profile.id,
                "user_id": profile.user_id,
                "bio": profile.bio,
                "experience_years": profile.experience_years,
                "city": profile.city,
                "country": profile.country,
                "languages": profile.languages,
                "guide_name": f"{profile.user.first_name} {profile.user.last_name}".strip() or "Guide",
                "guide_email": profile.user.email,
                "member_since": profile.user.created_at,
                "created_at": profile.created_at,
                "updated_at": profile.updated_at
            }
            public_profiles.append(public_profile)
        
        return public_profiles
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch guide profiles"
        )


@router.get("/guide/profile/{profile_id}", response_model=schemas.GuideProfilePublic)
async def get_guide_profile_public(
    profile_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific guide profile by profile ID (public endpoint, no authentication required).
    
    Args:
        profile_id: ID of the guide profile to retrieve
        db: Database session
        
    Returns:
        Guide profile with user information
        
    Raises:
        HTTPException: If profile not found
    """
    try:
        db_profile = crud.get_guide_profile_by_id(db, profile_id)
        if not db_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Guide profile not found"
            )
        
        # Transform the data to include user information
        public_profile = {
            "id": db_profile.id,
            "user_id": db_profile.user_id,
            "bio": db_profile.bio,
            "experience_years": db_profile.experience_years,
            "city": db_profile.city,
            "country": db_profile.country,
            "languages": db_profile.languages,
            "guide_name": f"{db_profile.user.first_name} {db_profile.user.last_name}".strip() or "Guide",
            "guide_email": db_profile.user.email,
            "member_since": db_profile.user.created_at,
            "created_at": db_profile.created_at,
            "updated_at": db_profile.updated_at
        }
        
        return public_profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch guide profile"
        )


# Tourist Profile Endpoints

@router.post("/tourist", response_model=schemas.TouristProfile, status_code=status.HTTP_201_CREATED)
async def create_tourist_profile(
    profile: schemas.TouristProfileCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(require_tourist_role)
):
    """
    Create a new tourist profile for the current user.
    
    Args:
        profile: Tourist profile data
        db: Database session
        current_user: Current authenticated user (must have TOURIST role)
        
    Returns:
        Created tourist profile
        
    Raises:
        HTTPException: If profile creation fails
    """
    try:
        db_profile = crud.create_tourist_profile(db, profile, current_user.id)
        return db_profile
    except ValueError as e:
        if "already has a tourist profile" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has a tourist profile"
            )
        elif "must have TOURIST role" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. TOURIST role required."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tourist profile"
        )


@router.get("/tourist/me", response_model=schemas.TouristProfile)
async def get_my_tourist_profile(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(require_tourist_role)
):
    """
    Get the current user's tourist profile.
    
    Args:
        db: Database session
        current_user: Current authenticated user (must have TOURIST role)
        
    Returns:
        Current user's tourist profile
        
    Raises:
        HTTPException: If profile not found
    """
    db_profile = crud.get_tourist_profile_by_user_id(db, current_user.id)
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tourist profile not found. Create one first."
        )
    return db_profile


@router.put("/tourist/me", response_model=schemas.TouristProfile)
async def update_my_tourist_profile(
    profile_update: schemas.TouristProfileUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(require_tourist_role)
):
    """
    Update the current user's tourist profile.
    
    Args:
        profile_update: Updated profile data
        db: Database session
        current_user: Current authenticated user (must have TOURIST role)
        
    Returns:
        Updated tourist profile
        
    Raises:
        HTTPException: If profile not found or update fails
    """
    try:
        db_profile = crud.update_tourist_profile(db, current_user.id, profile_update)
        if not db_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tourist profile not found. Create one first."
            )
        return db_profile
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update tourist profile"
        )


# Updated Guide Profile Endpoints (using new schemas)

@router.post("/guide/new", response_model=schemas.NewGuideProfile, status_code=status.HTTP_201_CREATED)
async def create_new_guide_profile(
    profile: schemas.NewGuideProfileCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(require_guide_role)
):
    """
    Create a new guide profile for the current user (with updated fields).
    
    Args:
        profile: Guide profile data
        db: Database session
        current_user: Current authenticated user (must have GUIDE role)
        
    Returns:
        Created guide profile
        
    Raises:
        HTTPException: If profile creation fails
    """
    try:
        db_profile = crud.create_new_guide_profile(db, profile, current_user.id)
        return db_profile
    except ValueError as e:
        if "already has a guide profile" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has a guide profile"
            )
        elif "must have GUIDE role" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. GUIDE role required."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create guide profile"
        )


@router.put("/guide/new/me", response_model=schemas.NewGuideProfile)
async def update_my_new_guide_profile(
    profile_update: schemas.NewGuideProfileUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(require_guide_role)
):
    """
    Update the current user's guide profile (with updated fields).
    
    Args:
        profile_update: Updated profile data
        db: Database session
        current_user: Current authenticated user (must have GUIDE role)
        
    Returns:
        Updated guide profile
        
    Raises:
        HTTPException: If profile not found or update fails
    """
    try:
        db_profile = crud.update_new_guide_profile(db, current_user.id, profile_update)
        if not db_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Guide profile not found. Create one first."
            )
        return db_profile
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update guide profile"
        )