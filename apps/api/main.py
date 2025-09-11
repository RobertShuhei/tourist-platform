from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os

# Import routers
from routers import users, auth, profiles, bookings, chat

load_dotenv()

app = FastAPI(
    title="Tourist Platform API",
    description="AI-powered platform for inbound tourism in Japan",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for 401 errors to ensure JSON responses
@app.exception_handler(status.HTTP_401_UNAUTHORIZED)
async def custom_401_handler(request: Request, exc: HTTPException):
    """
    Custom exception handler for 401 Unauthorized errors.
    
    Ensures that all 401 errors return JSON responses instead of HTML,
    preventing frontend SyntaxError when parsing responses.
    """
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": exc.detail},
        headers={"WWW-Authenticate": "Bearer"},
    )

# Include API routers
app.include_router(
    users.router,
    prefix="/users",
    tags=["users"]
)

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"]
)

app.include_router(
    profiles.router,
    prefix="/profiles",
    tags=["profiles"]
)

app.include_router(
    bookings.router,
    prefix="/api",
    tags=["bookings"]
)

app.include_router(
    chat.router,
    prefix="/api",
    tags=["chat"]
)

@app.get("/")
async def root():
    return {"message": "Tourist Platform API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}