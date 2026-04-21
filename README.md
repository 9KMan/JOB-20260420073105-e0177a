# MedClaims Pro

Professional medical claims submission SaaS platform for surgeons and medical coders. Streamline your insurance claims process with a modern, secure, and HIPAA-compliant solution.

## Features

- **Claims Management**: Create, submit, track, and manage medical claims
- **Patient Records**: Secure patient demographic and insurance information
- **Provider Network**: Manage your network of healthcare providers with NPI validation
- **Document Management**: Upload and store supporting documents securely
- **Real-time Status Tracking**: Monitor claim status from submission to payment
- **Role-based Access**: Flexible user roles (Admin, Provider, Biller, Viewer)

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy** - ORM
- **Redis** - Caching and task queue
- **MinIO** - S3-compatible object storage
- **Celery** - Async task processing

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Hook Form** - Form handling

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

```bash
cd code
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/v1

### Local Development

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://medclaims:medclaims123@localhost:5432/medclaims
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=medclaims
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## API Documentation

Once the backend is running, visit http://localhost:8000/api/v1/docs for interactive API documentation powered by Swagger UI.

## Deployment

### Vercel (Frontend)

```bash
cd frontend
vercel
```

### Railway (Backend)

Connect your Railway project to the backend directory and configure the environment variables.

## Security

- All API endpoints require authentication (except registration and login)
- Passwords are hashed using bcrypt
- JWT tokens for session management
- HIPAA-compliant data handling practices
- S3-compatible storage for secure document retention

## License

Proprietary - All rights reserved