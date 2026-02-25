# X100 - AI Agent Workforce Platform

Multi-tenant SaaS platform for deploying AI agents with multi-channel support (WhatsApp, Telegram, Email), OAuth integrations (Gmail, Calendar, CRM), and real-time analytics.

## Quick Start

### 1. Start Backend
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend: http://localhost:8000

### 2. Start Frontend
```bash
npm run dev
```
Frontend: http://localhost:3000

### 3. Test OAuth
1. Open http://localhost:3000
2. Click "Login" → "Google"
3. Authorize with Google
4. Redirects to Dashboard

## Documentation

### 🚀 Setup & Configuration
- **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - ⭐ Quick setup checklist (start here!)
- **[MISSING_CONFIG.md](MISSING_CONFIG.md)** - 🔴 Complete list of TODOs, missing keys, and placeholders
- **[docs/QUICK_START.md](docs/QUICK_START.md)** - Detailed setup guide

### 🔒 Security & Testing
- **[SECURITY_FIXES.md](SECURITY_FIXES.md)** - All security vulnerabilities fixed
- **[TEST_RESULTS.md](TEST_RESULTS.md)** - Test results and validation

### 📋 Project Management
- **[TRACTION.md](TRACTION.md)** - Project tracking, roadmap, and TODO list
- **[AUTH_READY.md](AUTH_READY.md)** - Authentication architecture and flow
- **[docs/ARCHITECTURE_DIAGRAM.md](docs/ARCHITECTURE_DIAGRAM.md)** - System architecture and data flows

### 🛠️ Quick Commands
```bash
# Check environment configuration
python backend/check_env.py

# Run all tests
pytest backend/tests/

# Start backend
uvicorn backend.main:app --reload
```

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** FastAPI + Agno OS
- **Database:** PostgreSQL (Neon) + pgvector
- **Auth:** Neon Auth with Google OAuth
- **Integrations:** Composio OAuth
- **Payments:** Stripe

## Key Features

- Multi-tenant architecture with Row Level Security
- Google OAuth authentication
- Agent management with real-time chat
- Multi-channel deployment (WhatsApp, Telegram, Email)
- OAuth app integrations (Gmail, Calendar, CRM)
- Real-time analytics dashboard
- Knowledge base with vector search

## Project Status

**Phase 0 (Auth):** ✅ COMPLETE
**Phase 1 (Foundation):** 🔴 IN PROGRESS (25%)

See [TRACTION.md](TRACTION.md) for detailed progress tracking.
