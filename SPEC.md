# SPEC.md — MedClaims Pro: SaaS Launch for Surgeons & Medical Coders

**Job:** [Upwork Full Stack Developer Needed for SaaS Launch](https://www.upwork.com/jobs/Full-Stack-Developer-Needed-for-SaaS-Launch_~022046087232201842766)
**Budget:** TBD (hourly) | **Duration:** 1–3 months | **Type:** Ongoing project
**Client:** Healthcare SaaS for surgeons/medical coders (claims submission to insurance)
**Tech Stack:** React, TypeScript, FastAPI, Python, SQL, Vercel, Railway
**GitHub:** https://github.com/9KMan/JOB-20260420073105-e0177a

---

## 1. Project Overview

**Product:** Medical claims SaaS platform — web app is ~80% built (developed with Claude Code), needs refinement and market-ready preparation for launch.
**Goal:** Refine existing application, make it a fully sellable SaaS service.
**Stack:** Vercel (frontend) + Railway (backend)
**Current State:** Fully functioning prototype, needs polish + launch readiness

---

## 2. Technical Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React (TypeScript), Vercel, Tailwind CSS |
| Backend     | FastAPI (Python), Railway |
| Database    | PostgreSQL, SQL |
| Auth        | JWT + OAuth2 |
| Deployment  | Vercel (FE) + Railway (BE) |
| Monitoring  | Sentry, DataDog |

---

## 3. Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │────▶│  Railway     │────▶│  PostgreSQL  │
│   React FE   │◀────│  FastAPI     │◀────│              │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 4. Core Features

### 4.1 Claims Management (Core)
- Create, edit, submit medical claims (CMS-1500, UB-04 formats)
- CPT code lookup and validation
- ICD-10 diagnosis code integration
- Insurance payer database (major payers: Aetna, Cigna, United, Medicare, Medicaid)
- Claim status tracking (submitted → under review → paid/denied)
- EDI 837P generation for electronic submission

### 4.2 User Management
- Email/password + OAuth (Google, Microsoft)
- Role-based access: Admin, Biller, Doctor, Staff
- Multi-practice/organization support
- Audit logging (HIPAA compliance)

### 4.3 Patient Management
- Patient demographics
- Insurance information (payer ID, group number, member ID)
- Visit history and claims关联

### 4.4 Billing & Payments
- Service line itemization
- Payment posting (ERA/EOB matching)
- Patient ledger
- Outstanding balance tracking
- Basic reporting (A/R aging, collection rates)

### 4.5 Reporting & Analytics
- Claims submission rate
- Denial rate by payer/code
- Revenue by provider
- Average days to payment
- Provider productivity metrics

### 4.6 HIPAA Compliance
- Role-based data access
- Data encryption at rest + in transit
- Audit trail for all PHI access
- BAA (Business Associate Agreement) ready infrastructure
- Session timeout + MFA

### 4.7 Integrations
- Clearinghouse API (Availity, Change Healthcare)
- Insurance payer portals (real-time eligibility)
- Google Calendar (appointment linking)
- Zapier / webhook for automation

---

## 5. Database Schema

### Users
```
id, email, password_hash, name, role, organization_id,
mfa_enabled, last_login, created_at, updated_at
```

### Organizations
```
id, name, address, phone, npi, tax_id, settings_json, created_at
```

### Patients
```
id, organization_id, first_name, last_name, dob,
address, phone, email,
insurance_payer_id, member_id, group_number,
created_at, updated_at
```

### Claims
```
id, organization_id, patient_id, provider_id,
claim_number, service_date, submission_date,
status (draft/submitted/paid/denied/appealed),
total_amount, paid_amount, payer_id,
edi_837_content, created_at, updated_at
```

### Claim Service Lines
```
id, claim_id, cpt_code, icd10_codes[],
units, charge_amount, paid_amount, denial_code
```

### Payments
```
id, claim_id, amount, payment_date,
payment_method, reference_number, era_eob_id
```

### Audit Logs
```
id, user_id, action, resource_type, resource_id,
ip_address, user_agent, created_at
```

---

## 6. API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/mfa/enable`

### Claims
- `GET /api/claims` — List (filter by status, payer, date)
- `POST /api/claims` — Create draft
- `GET /api/claims/:id`
- `PUT /api/claims/:id` — Update
- `POST /api/claims/:id/submit` — Submit to clearinghouse
- `DELETE /api/claims/:id`

### Patients
- `GET /api/patients` — List/search
- `POST /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `GET /api/patients/:id/claims` — Patient claim history

### Billing
- `GET /api/claims/:id/payment` — Payment history
- `POST /api/claims/:id/payment` — Post payment
- `GET /api/reports/ar-aging` — A/R aging report
- `GET /api/reports/denial-rate` — Denial analysis

### Admin
- `GET /api/admin/users`
- `POST /api/admin/users`
- `GET /api/admin/audit-logs`
- `GET /api/admin/practices`

---

## 7. HIPAA Compliance Checklist

- [ ] All API endpoints behind authentication
- [ ] PHI encrypted in transit (TLS 1.3) and at rest (AES-256)
- [ ] Role-based access control on all resources
- [ ] Audit logging on all PHI access
- [ ] Session timeout (15 min inactivity)
- [ ] MFA available for all users
- [ ] BAA signed with cloud providers (Vercel, Railway)
- [ ] Data backup + disaster recovery plan
- [ ] Security scanning (Snyk, dependabot)
- [ ] Penetration testing before launch

---

## 8. Market Readiness Checklist

- [ ] Clean, professional UI (not prototype-looking)
- [ ] Onboarding flow (first-time user setup)
- [ ] Email notifications (claim status changes)
- [ ] Help/docs (how to use CPT codes, claim submission process)
- [ ] Error messages that guide users, not confuse them
- [ ] Mobile responsive
- [ ] Performance: <2s page load
- [ ] SSL + custom domain configured
- [ ] Privacy policy + terms of service
- [ ] Cookie consent banner

---

## 9. Milestones

| Milestone | Deliverable | Est. Time |
|-----------|-------------|-----------|
| M1        | Code audit, bug fixes, security hardening | 1 week |
| M2        | HIPAA compliance checklist complete | 1 week |
| M3        | Market-ready UI polish + onboarding | 1 week |
| M4        | Integrations (clearinghouse, payer portals) | 1 week |
| M5        | Billing/payments, reporting | 1 week |
| M6        | Launch prep: SEO, docs, marketing site | 1 week |

**Total: 6 weeks**

---

## 10. Testing

| Type       | Tool         | Target |
|------------|--------------|--------|
| Unit       | pytest + Jest | >80% |
| Integration| Supertest    | All API endpoints |
| E2E        | Playwright   | Claims flow, auth |
| Security   | Snyk + OWASP | No critical vulns |

**Critical flows:**
1. Create claim → Add service lines → Submit → Verify EDI output
2. Post payment → Update claim status → Verify ledger
3. User registration → MFA → Login → Audit log verified

---

## 11. Deployment

### Environments
- Development: `localhost:3000` / `localhost:8000`
- Staging: `staging.vercel.app` + `staging.railway.app`
- Production: Custom domain

### CI/CD (GitHub Actions)
1. PR → build + test
2. Merge to `main` → auto-deploy to staging
3. Manual promotion → production

### Environment Variables
```
DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_API_URL,
VERCEL_URL, RAILWAY_STATIC_URL,
OPENAI_API_KEY (for assistance),
SENTRY_DSN, DATADOG_API_KEY
```

---

## 12. Risk Factors

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| HIPAA non-compliance | High | Legal review of BAA, security audit before launch |
| Clearinghouse integration delays | Medium | Mock/simulate first, integrate later |
| Claims data migration complexity | Medium | Migrate in batches, validate each |
| Scope creep (healthcare is complex) | High | Lock M1–M3 scope, defer M4+ |
| Railway cold starts | Low | Keep instance warm, use Railway Pro |

---

## 13. Nice-to-Have (Post-Launch)

- AI-assisted claim coding (suggest CPT/ICD-10)
- Auto denial appeal generation
- Patient self-service portal
- Mobile app (React Native)
- Multi-tenant white-label for billing companies
