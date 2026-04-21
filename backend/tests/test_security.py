import pytest
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from datetime import timedelta


def test_password_hashing():
    password = "testpassword123"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed)


def test_password_verification_wrong_password():
    password = "testpassword123"
    hashed = get_password_hash(password)
    assert not verify_password("wrongpassword", hashed)


def test_create_access_token():
    data = {"sub": "123", "role": "admin"}
    token = create_access_token(data)
    assert isinstance(token)
    assert len(token) > 0


def test_decode_access_token():
    data = {"sub": "123", "role": "admin"}
    token = create_access_token(data)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "123"
    assert decoded["role"] == "admin"


def test_decode_invalid_token():
    decoded = decode_access_token("invalid.token.here")
    assert decoded is None