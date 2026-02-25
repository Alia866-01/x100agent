# 🚀 Quick Start Guide - X100 Platform

## 📚 Documentation

### 📄 Main Documents

1. **[TRACTION.md](../TRACTION.md)** - Project roadmap & progress tracking
   - Overall progress: 15/60 tasks (25%)
   - Phase 0: Auth ✅ COMPLETE
   - Phase 1-4: Roadmap and TODO items
   - Current sprint priorities

2. **[AUTH_READY.md](../AUTH_READY.md)** - Authentication architecture
   - Google OAuth flow (production ready)
   - Email/password authentication
   - User sync logic
   - Testing results

3. **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - System architecture
   - System diagrams
   - Data flow diagrams
   - Database schema
   - Request/Response examples

4. **[INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)** - Consolidated into TRACTION.md

---

## 🎯 Current Status

**Phase 0 (Auth):** ✅ COMPLETE
- Google OAuth integration working
- User sync with database
- Email-based duplicate prevention

**Phase 1 (Foundation):** 🔴 IN PROGRESS (25%)
- ✅ services/api.ts - HTTP client
- ✅ services/authService.ts - Auth logic
- ✅ .env.local - Configuration
- ⚪ types/api.ts - TODO
- ⚪ services/agentService.ts - TODO
- ⚪ services/channelService.ts - TODO

**Next Steps:** See [TRACTION.md](../TRACTION.md) for detailed TODO list

---

## 📦 Файловая структура (что создать)

```
/Users/user/ai-01/
├── services/                    ← СОЗДАТЬ
│   ├── api.ts
│   ├── authService.ts
│   ├── agentService.ts
│   ├── channelService.ts
│   ├── integrationService.ts
│   ├── billingService.ts
│   └── knowledgeService.ts
│
├── types/                       ← СОЗДАТЬ
│   ├── api.ts
│   ├── agent.ts
│   ├── channel.ts
│   └── integration.ts
│
├── contexts/                    ← СОЗДАТЬ
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
│
├── .env.local                   ← СОЗДАТЬ
└── .env.example                 ← СОЗДАТЬ
```

---

## 🔧 Environment Setup

### 1. Backend (.env)

```bash
cd backend
cp .env.example .env
```

Добавить в `backend/.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ai01
JWT_SECRET_KEY=your-super-secret-key-here-min-32-chars
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
COMPOSIO_API_KEY=your-composio-key
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=sk_test_...
```

### 2. Frontend (.env.local)

Создать `/Users/user/ai-01/.env.local`:
```env
VITE_API_URL=http://localhost:8000
VITE_APP_URL=http://localhost:3000
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_STRIPE=false
```

---

## 🚀 Launch

### Backend
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend: http://localhost:8000
API docs: http://localhost:8000/docs

### Frontend
```bash
npm run dev
```

Frontend: http://localhost:3000

### Test OAuth Flow
1. Open http://localhost:3000
2. Click "Login" → "Google"
3. Authorize with Google
4. Should redirect to Dashboard ✅

---

## 📋 Development Roadmap

**For detailed TODO list and progress tracking, see [TRACTION.md](../TRACTION.md)**

### ✅ Phase 0: Auth (COMPLETE)
- Google OAuth integration
- User/tenant sync
- Email-based duplicate prevention
- JWT token management

### 🔴 Phase 1: Foundation (IN PROGRESS - 25%)
- API service layer
- TypeScript types
- Agent CRUD operations
- Error handling

### ⚪ Phase 2: Dashboard Core (NOT STARTED)
- Agent list view
- Agent editor panel
- Chat integration
- Analytics view

### ⚪ Phase 3: Channels & Integrations (NOT STARTED)
- WhatsApp, Telegram, Email channels
- OAuth integrations (Gmail, Calendar, CRM)
- Knowledge base upload

### ⚪ Phase 4: Analytics & Payments (NOT STARTED)
- Stripe integration
- Error boundaries
- Toast notifications

---

## 🔗 API Endpoints Reference

### Authentication
```
POST   /api/auth/login      - Логин
POST   /api/auth/register   - Регистрация
GET    /api/auth/me         - Текущий пользователь
```

### Agents
```
GET    /api/agents                    - Список агентов
POST   /api/agents                    - Создать агента
GET    /api/agents/{id}               - Получить агента
PATCH  /api/agents/{id}               - Обновить агента
DELETE /api/agents/{id}               - Удалить агента
GET    /api/agents/{id}/stats         - Статистика агента
POST   /api/agents/invoke             - Вызвать агента
```

### Channels
```
GET    /api/agents/{id}/channels      - Список каналов
POST   /api/agents/{id}/channels      - Создать канал
POST   /api/channels/{id}/toggle      - Вкл/выкл канал
DELETE /api/channels/{id}             - Удалить канал
```

### Integrations
```
GET    /api/integrations/apps                - Доступные интеграции
POST   /api/integrations/connect             - Подключить интеграцию
GET    /api/agents/{id}/integrations         - Список подключенных
DELETE /api/integrations/{connection_id}     - Отключить интеграцию
```

---

## 🎨 Component Integration Map

| Component | Кнопка/Форма | API Endpoint | Статус |
|-----------|--------------|--------------|--------|
| **LoginPage** | Submit форма | `POST /api/auth/login` | ❌ TODO |
| **WorkforceView** | - | `GET /api/agents` | ❌ TODO |
| **WorkforceView** | "Deploy Agent" | Открыть модал | ❌ TODO |
| **AgentEditorPanel** | "Save Changes" | `POST/PATCH /api/agents` | ❌ TODO |
| **AgentEditorPanel** | Channel toggle | `POST /api/channels/{id}/toggle` | ❌ TODO |
| **AgentEditorPanel** | "Connect Tool" | `POST /api/integrations/connect` | ❌ TODO |
| **ChatView** | Send message | `POST /api/agents/invoke` | ❌ TODO |
| **AnalyticsView** | - | `GET /api/agents/{id}/stats` | ❌ TODO |
| **PricingSection** | "Get Started" | `POST /api/billing/checkout` | ❌ TODO |

---

## 📖 Key Files

### Authentication
- [lib/authClient.ts](../lib/authClient.ts) - Neon SDK client
- [services/authService.ts](../services/authService.ts) - Auth logic (OAuth + email)
- [contexts/AuthContext.tsx](../contexts/AuthContext.tsx) - Auth state
- [components/AuthCallback.tsx](../components/AuthCallback.tsx) - OAuth callback handler

### API Layer
- [services/api.ts](../services/api.ts) - HTTP client with auth headers

### Backend
- [backend/api/users.py](../backend/api/users.py) - User sync with email fallback

### Environment
- [.env.local](../.env.local) - Frontend configuration
- Backend uses same .env.local file

---

## ✅ Current Achievements

### Phase 0 Complete
- [x] Google OAuth login working end-to-end
- [x] Email/password authentication
- [x] User sync with database
- [x] Email-based duplicate prevention
- [x] JWT token management
- [x] Multi-tenant architecture

### Next Milestones
See [TRACTION.md](../TRACTION.md) for:
- Phase 1 tasks (Foundation)
- Phase 2 tasks (Dashboard Core)
- Current sprint priorities

---

## 🐛 Troubleshooting

### CORS Error
```
Access to fetch at 'http://localhost:8000/api/agents' from origin
'http://localhost:3000' has been blocked by CORS policy
```

**Решение:** Проверить backend CORS middleware:
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ← Проверить
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 401 Unauthorized
```
{"detail":"Not authenticated"}
```

**Решение:**
1. Проверить что token в localStorage
2. Проверить что Header `Authorization: Bearer <token>` отправляется
3. Проверить что token не истек

### Backend не запускается
```
ModuleNotFoundError: No module named 'fastapi'
```

**Решение:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📚 Documentation Links

- **[TRACTION.md](../TRACTION.md)** - Project roadmap and TODO tracking
- **[AUTH_READY.md](../AUTH_READY.md)** - Authentication architecture
- **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - System diagrams
- **Backend API Docs:** http://localhost:8000/docs (Swagger)

---

**Last Updated:** 2026-02-17
**Version:** 2.0 - Consolidated with TRACTION.md
