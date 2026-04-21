import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module")
def test_client():
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)
    yield client
    Base.metadata.drop_all(bind=engine)


def test_health_check(test_client):
    response = test_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_register_user(test_client):
    response = test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
            "organization_name": "Test Org"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data


def test_login_user(test_client):
    test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "testpassword123",
            "full_name": "Login User"
        }
    )
    response = test_client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "testpassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(test_client):
    response = test_client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_create_patient(test_client):
    test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "provider@example.com",
            "password": "testpassword123",
            "full_name": "Provider User"
        }
    )
    login_response = test_client.post(
        "/api/v1/auth/login",
        json={"email": "provider@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]

    response = test_client.post(
        "/api/v1/patients/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-15",
            "gender": "male",
            "member_id": "MEM123456",
            "phone": "555-123-4567",
            "email": "john.doe@example.com"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["member_id"] == "MEM123456"


def test_create_provider(test_client):
    login_response = test_client.post(
        "/api/v1/auth/login",
        json={"email": "provider@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]

    response = test_client.post(
        "/api/v1/providers/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "npi": "1234567890",
            "first_name": "Jane",
            "last_name": "Smith",
            "credentials": "MD",
            "specialty": "Surgery",
            "phone": "555-987-6543"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["npi"] == "1234567890"
    assert data["first_name"] == "Jane"
    assert data["credentials"] == "MD"


def test_create_claim(test_client):
    login_response = test_client.post(
        "/api/v1/auth/login",
        json={"email": "provider@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]

    patient_response = test_client.post(
        "/api/v1/patients/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "first_name": "Patient",
            "last_name": "ClaimTest",
            "member_id": "CLM001"
        }
    )
    patient_id = patient_response.json()["id"]

    provider_response = test_client.post(
        "/api/v1/providers/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "npi": "9876543210",
            "first_name": "Provider",
            "last_name": "ClaimTest"
        }
    )
    provider_id = provider_response.json()["id"]

    response = test_client.post(
        "/api/v1/claims/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "patient_id": patient_id,
            "provider_id": provider_id,
            "claim_type": "professional",
            "amount": 1500.00,
            "diagnosis_codes": "J06.9",
            "procedure_codes": "99213",
            "payer_name": "Blue Cross Blue Shield",
            "payer_id": "BCBS001"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == "1500.00"
    assert data["claim_type"] == "professional"
    assert "claim_number" in data
    assert data["status"] == "draft"


def test_list_claims(test_client):
    login_response = test_client.post(
        "/api/v1/auth/login",
        json={"email": "provider@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]

    response = test_client.get(
        "/api/v1/claims/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)