from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.user import User
from app.models.claim import Claim, ClaimStatus
from app.models.payment import Payment
from app.api.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/ar-aging")
def get_ar_aging(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """A/R Aging Report - outstanding balances by age bucket"""
    thirty_days = datetime.utcnow() - timedelta(days=30)
    sixty_days = datetime.utcnow() - timedelta(days=60)
    ninety_days = datetime.utcnow() - timedelta(days=90)

    claims = db.query(Claim).filter(
        Claim.status.in_([ClaimStatus.SUBMITTED, ClaimStatus.ACCEPTED, ClaimStatus.REJECTED])
    ).all()

    aging_buckets = {
        "0-30": {"count": 0, "amount": 0},
        "31-60": {"count": 0, "amount": 0},
        "61-90": {"count": 0, "amount": 0},
        "90+": {"count": 0, "amount": 0},
    }

    for claim in claims:
        if claim.status == ClaimStatus.PAID:
            continue
        amount = float(claim.amount or 0) - float(claim.paid_amount or 0)
        if amount <= 0:
            continue
        age = (datetime.utcnow() - claim.created_at).days
        if age <= 30:
            aging_buckets["0-30"]["count"] += 1
            aging_buckets["0-30"]["amount"] += amount
        elif age <= 60:
            aging_buckets["31-60"]["count"] += 1
            aging_buckets["31-60"]["amount"] += amount
        elif age <= 90:
            aging_buckets["61-90"]["count"] += 1
            aging_buckets["61-90"]["amount"] += amount
        else:
            aging_buckets["90+"]["count"] += 1
            aging_buckets["90+"]["amount"] += amount

    return {
        "buckets": aging_buckets,
        "total_outstanding": sum(b["amount"] for b in aging_buckets.values()),
        "total_claims": sum(b["count"] for b in aging_buckets.values()),
    }


@router.get("/denial-rate")
def get_denial_rate(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Denial rate analysis by payer and code"""
    total_claims = db.query(Claim).count()
    denied_claims = db.query(Claim).filter(Claim.status == ClaimStatus.REJECTED).count()

    denial_rate = (denied_claims / total_claims * 100) if total_claims > 0 else 0

    payer_stats = db.query(
        Claim.payer_name,
        func.count(Claim.id).label("total"),
        func.sum(func.cast(Claim.status == ClaimStatus.REJECTED, Integer)).label("denied")
    ).group_by(Claim.payer_name).all()

    return {
        "overall_denial_rate": round(denial_rate, 2),
        "total_claims": total_claims,
        "denied_claims": denied_claims,
        "by_payer": [
            {"payer": p, "total": t, "denied": d, "rate": round((d/t*100) if t > 0 else 0, 2)}
            for p, t, d in payer_stats
        ]
    }


@router.get("/submission-rate")
def get_submission_rate(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Claims submission rate over time"""
    total_claims = db.query(Claim).count()
    submitted_claims = db.query(Claim).filter(Claim.status == ClaimStatus.SUBMITTED).count()
    paid_claims = db.query(Claim).filter(Claim.status == ClaimStatus.PAID).count()

    return {
        "total_claims": total_claims,
        "submitted_claims": submitted_claims,
        "paid_claims": paid_claims,
        "submission_rate": round((submitted_claims / total_claims * 100) if total_claims > 0 else 0, 2),
        "paid_rate": round((paid_claims / total_claims * 100) if total_claims > 0 else 0, 2),
    }


@router.get("/revenue")
def get_revenue_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revenue by provider report"""
    results = db.query(
        Claim.provider_id,
        func.sum(Claim.amount).label("total_billed"),
        func.sum(Claim.paid_amount).label("total_paid")
    ).group_by(Claim.provider_id).all()

    return {
        "providers": [
            {"provider_id": p, "total_billed": float(b or 0), "total_paid": float(pd or 0)}
            for p, b, pd in results
        ]
    }
