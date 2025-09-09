from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Import routers
from routers import users

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

# Include API routers
app.include_router(
    users.router,
    prefix="/users",
    tags=["users"]
)

@app.get("/")
async def root():
    return {"message": "Tourist Platform API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}