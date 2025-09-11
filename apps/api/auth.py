"""
Authentication utilities for the Tourist Platform API.

This module provides authentication functions that can be imported by other modules.
"""

from routers.auth import get_current_user, get_current_active_user

__all__ = ["get_current_user", "get_current_active_user"]