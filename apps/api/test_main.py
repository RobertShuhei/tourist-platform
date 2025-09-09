import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    """Test the /health endpoint returns correct status and response."""
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_root_endpoint():
    """Test the root endpoint returns correct status and response."""
    response = client.get("/")
    
    assert response.status_code == 200
    assert response.json() == {"message": "Tourist Platform API is running"}