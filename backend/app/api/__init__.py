from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.claims import router as claims_router
from app.api.patients import router as patients_router
from app.api.providers import router as providers_router
from app.api.documents import router as documents_router

__all__ = [
    "auth_router",
    "users_router",
    "claims_router",
    "patients_router",
    "providers_router",
    "documents_router"
]