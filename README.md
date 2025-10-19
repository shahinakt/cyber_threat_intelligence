# Cyber Threat Intelligence

Lightweight Cyber Threat Intelligence platform (backend + frontend) for reporting and tracking threat reports.

Repository structure
- backend: FastAPI backend and database models
- frontend: React single-page app

Status
- Backend: FastAPI (development-ready)
- Frontend: React (create-react-app)

Quick start

1) Backend (Python)

Prerequisites: Python 3.10+ and pip. Create a virtual environment, install dependencies, and start the API.

```bash
python -m venv .venv
source .venv/Scripts/activate   # on Windows with bash (Git Bash / WSL)
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

The API root will be available at http://localhost:8000 and the automatic docs at http://localhost:8000/docs

Environment variables
- Create a `.env` file in `backend/` for sensitive configs. The backend expects (examples):
  - MONGODB_URI: mongodb connection string
  - JWT_SECRET: secret key for JWT tokens
  - TOKEN_EXPIRE_MINUTES: token expiration (optional)

2) Frontend (React)

Prerequisites: Node.js (16+) and npm or yarn.

```bash
cd frontend
npm install
npm start
```

The frontend dev server runs on http://localhost:3000 and proxies API calls to the backend in development.

Project overview
- backend/main.py — FastAPI app that includes routers for `auth` and `threat` and CORS setup.
- backend/requirements.txt — backend Python dependencies.
- frontend/src/pages — React pages: Login, Register, ReportThreat, UserDashboard.
- frontend/src/services/api.js — axios wrapper for API calls.

API (basic)
- GET / — health check (returns {"message": "Cyber Threat Intel API Running"})
- Auth and threat routes are registered under routers; check `backend/routers` for available endpoints and payload shapes.

Contributing
- Open issues for bugs and feature requests.
- For code changes, create a branch, add tests where appropriate, and open a pull request.

Notes & next steps
- Add explicit API docs for each router and example .env.sample file.
- Add database migration scripts and tests.

License
- MIT

Contact
- Maintainer: shahinakt (GitHub)
