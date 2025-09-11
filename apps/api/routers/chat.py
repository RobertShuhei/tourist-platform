from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict, Set
import json
import crud
import schemas
import models
from database import get_db
from auth import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

# WebSocket connection manager for real-time messaging
class ConnectionManager:
    """Manages WebSocket connections for real-time chat."""
    
    def __init__(self):
        # Store active connections by booking_id -> set of websockets
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Store user_id for each websocket for authorization
        self.websocket_users: Dict[WebSocket, int] = {}
    
    async def connect(self, websocket: WebSocket, booking_id: int, user_id: int):
        """Accept a WebSocket connection and add to booking room."""
        await websocket.accept()
        
        if booking_id not in self.active_connections:
            self.active_connections[booking_id] = set()
        
        self.active_connections[booking_id].add(websocket)
        self.websocket_users[websocket] = user_id
        
        print(f"User {user_id} connected to booking {booking_id}")
    
    def disconnect(self, websocket: WebSocket, booking_id: int):
        """Remove WebSocket connection from booking room."""
        if booking_id in self.active_connections:
            self.active_connections[booking_id].discard(websocket)
            if not self.active_connections[booking_id]:
                del self.active_connections[booking_id]
        
        if websocket in self.websocket_users:
            user_id = self.websocket_users[websocket]
            del self.websocket_users[websocket]
            print(f"User {user_id} disconnected from booking {booking_id}")
    
    async def send_to_booking(self, message: str, booking_id: int, exclude_websocket: WebSocket = None):
        """Send message to all connections in a booking room."""
        if booking_id in self.active_connections:
            disconnected_websockets = []
            for websocket in self.active_connections[booking_id]:
                if websocket != exclude_websocket:
                    try:
                        await websocket.send_text(message)
                    except Exception:
                        disconnected_websockets.append(websocket)
            
            # Clean up disconnected websockets
            for websocket in disconnected_websockets:
                self.disconnect(websocket, booking_id)

# Global connection manager instance
manager = ConnectionManager()


@router.post("/messages", response_model=schemas.Message, status_code=status.HTTP_201_CREATED)
async def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Send a new message in a booking conversation.
    
    Args:
        message: Message data including booking_id, recipient_id, and content
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Created message with sender information
        
    Raises:
        HTTPException: If message creation fails or access denied
    """
    try:
        db_message = crud.create_message(db=db, message=message, sender_id=current_user.id)
        
        # Format response with sender information
        message_response = schemas.Message(
            id=db_message.id,
            booking_id=db_message.booking_id,
            sender_id=db_message.sender_id,
            recipient_id=db_message.recipient_id,
            content=db_message.content,
            created_at=db_message.created_at,
            sender_name=f"{db_message.sender.first_name} {db_message.sender.last_name}".strip() if db_message.sender.first_name or db_message.sender.last_name else None,
            sender_email=db_message.sender.email
        )
        
        # Broadcast message to WebSocket connections in this booking
        message_data = {
            "type": "new_message",
            "message": {
                "id": db_message.id,
                "booking_id": db_message.booking_id,
                "sender_id": db_message.sender_id,
                "recipient_id": db_message.recipient_id,
                "content": db_message.content,
                "created_at": db_message.created_at.isoformat(),
                "sender_name": message_response.sender_name,
                "sender_email": message_response.sender_email
            }
        }
        
        await manager.send_to_booking(
            json.dumps(message_data, default=str),
            db_message.booking_id
        )
        
        return message_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/bookings/{booking_id}/messages", response_model=List[schemas.Message])
async def get_booking_messages(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get chat history for a specific booking.
    
    Args:
        booking_id: ID of the booking
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of messages in the booking conversation
        
    Raises:
        HTTPException: If access denied or booking not found
    """
    try:
        messages = crud.get_messages_for_booking(db=db, booking_id=booking_id, user_id=current_user.id)
        
        # Format messages with sender information
        message_responses = []
        for message in messages:
            message_response = schemas.Message(
                id=message.id,
                booking_id=message.booking_id,
                sender_id=message.sender_id,
                recipient_id=message.recipient_id,
                content=message.content,
                created_at=message.created_at,
                sender_name=f"{message.sender.first_name} {message.sender.last_name}".strip() if message.sender.first_name or message.sender.last_name else None,
                sender_email=message.sender.email
            )
            message_responses.append(message_response)
        
        return message_responses
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.websocket("/ws/{booking_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    booking_id: int,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time messaging in a booking conversation.
    
    Handles:
    - Connection authentication via token
    - Real-time message broadcasting
    - Connection management
    
    Args:
        websocket: WebSocket connection
        booking_id: ID of the booking conversation
        db: Database session
    """
    # Get token from query parameters for WebSocket authentication
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication required")
        return
    
    try:
        # Authenticate user via token (simplified approach)
        # In production, you'd want to properly validate the JWT token
        from routers.auth import verify_token, get_current_user
        from fastapi import HTTPException
        
        # For WebSocket, we need to manually authenticate
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
        
        token_data = verify_token(token, credentials_exception)
        user = crud.get_user_by_email(db, email=token_data.email)
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid user")
            return
        
        # Verify user has access to this booking
        booking = crud.get_booking_by_id(db, booking_id)
        if not booking:
            await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA, reason="Booking not found")
            return
        
        if user.id not in [booking.user_id, booking.guide_id]:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Access denied")
            return
        
        # Connect user to booking room
        await manager.connect(websocket, booking_id, user.id)
        
        # Send connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connected",
            "booking_id": booking_id,
            "message": "Connected to chat"
        }))
        
        try:
            while True:
                # Wait for messages from client
                data = await websocket.receive_text()
                
                try:
                    message_data = json.loads(data)
                    
                    # Handle different message types
                    if message_data.get("type") == "ping":
                        # Respond to ping with pong
                        await websocket.send_text(json.dumps({"type": "pong"}))
                    
                    elif message_data.get("type") == "typing":
                        # Broadcast typing indicator to other users
                        typing_data = {
                            "type": "typing",
                            "user_id": user.id,
                            "user_name": f"{user.first_name} {user.last_name}".strip() or user.email,
                            "is_typing": message_data.get("is_typing", False)
                        }
                        await manager.send_to_booking(
                            json.dumps(typing_data),
                            booking_id,
                            exclude_websocket=websocket
                        )
                    
                    # Note: Actual message sending should still use the REST API endpoint
                    # WebSocket is primarily for receiving real-time updates
                    
                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Invalid JSON format"
                    }))
        
        except WebSocketDisconnect:
            manager.disconnect(websocket, booking_id)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR, reason="Server error")