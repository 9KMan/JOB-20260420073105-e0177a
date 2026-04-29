from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from fastapi import status
from app.core.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.core.security import decode_access_token
from sqlalchemy.orm import Session
import json


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to audit all PHI access for HIPAA compliance"""

    PHI_RESOURCES = ["patients", "claims", "providers", "documents", "users"]

    async def dispatch(self, request: Request, call_next):
        # Skip non-API paths
        if not request.url.path.startswith("/api/"):
            return await call_next(request)

        # Skip auth endpoints for logging
        if request.url.path.startswith("/api/v1/auth/"):
            return await call_next(request)

        response = await call_next(request)

        # Only log successful authenticated requests
        if response.status_code < 400:
            await self.log_access(request)

        return response

    async def log_access(self, request: Request):
        """Log PHI access to audit log"""
        # Extract user from token
        auth_header = request.headers.get("authorization", "")
        if not auth_header.startswith("Bearer "):
            return

        token = auth_header[7:]
        payload = decode_access_token(token)
        if not payload:
            return

        user_id = payload.get("sub")
        if not user_id:
            return

        # Check if this is a PHI resource
        path_parts = request.url.path.split("/")
        resource_type = None
        for i, part in enumerate(path_parts):
            if part in self.PHI_RESOURCES and i + 1 < len(path_parts):
                resource_type = part
                break

        if not resource_type:
            return

        # Log the access
        try:
            from app.core.database import SessionLocal
            db = SessionLocal()
            try:
                audit_log = AuditLog(
                    user_id=int(user_id),
                    action=f"{request.method} {request.url.path}",
                    resource_type=resource_type,
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent", "")[:500],
                    details=json.dumps({
                        "method": request.method,
                        "path": request.url.path,
                        "query": dict(request.query_params)
                    })
                )
                db.add(audit_log)
                db.commit()
            finally:
                db.close()
        except Exception:
            pass  # Don't fail requests due to audit logging errors
