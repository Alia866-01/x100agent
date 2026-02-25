# X100 Architecture Diagram

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  FRONTEND                                        │
│                         React + TypeScript + Vite                                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP/REST
                                      │ Authorization: Bearer <JWT>
                                      │ x-tenant-id: <UUID>
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  BACKEND                                         │
│                          FastAPI + Agno OS                                       │
│                                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                   │
│  │  /api/auth     │  │  /api/agents   │  │  /api/channels │                   │
│  │  - login       │  │  - list        │  │  - list        │                   │
│  │  - register    │  │  - create      │  │  - create      │                   │
│  │  - me          │  │  - update      │  │  - toggle      │                   │
│  └────────────────┘  │  - delete      │  └────────────────┘                   │
│                      │  - invoke      │                                         │
│  ┌────────────────┐  │  - stats       │  ┌────────────────┐                   │
│  │ /api/integr..  │  └────────────────┘  │  /api/billing  │                   │
│  │  - connect     │                      │  - checkout    │                   │
│  │  - list        │                      │  - webhook     │                   │
│  │  - disconnect  │                      └────────────────┘                   │
│  └────────────────┘                                                             │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
        ┌───────────────┐  ┌────────────┐  ┌──────────────┐
        │  PostgreSQL   │  │  Composio  │  │    Stripe    │
        │  + pgvector   │  │   OAuth    │  │   Payments   │
        └───────────────┘  └────────────┘  └──────────────┘
```

---

## 📱 Frontend Component Tree

```
App.tsx (Root)
├── AuthProvider (Context)
│   └── user, tenantId, login(), logout()
│
├── LanguageProvider (Context)
│   └── language, t()
│
├── ToastProvider (Context)
│   └── showToast()
│
└── Routes
    ├── Landing Page
    │   ├── Header
    │   │   └── Login button → setView('login')
    │   ├── Hero
    │   │   └── CTA buttons → setView('login')
    │   ├── ProductSections
    │   │   └── PricingSection
    │   │       └── Plan buttons → billingService.createCheckout()
    │   ├── GeminiAdvisor
    │   └── Footer
    │
    ├── LoginPage
    │   ├── Google OAuth button → authService.loginWithGoogle()
    │   ├── Email input
    │   ├── Password input
    │   └── Submit → authService.login() → setView('dashboard')
    │
    ├── AuthCallback (OAuth handler)
    │   └── Handles /auth/callback redirect
    │
    └── Dashboard
        ├── Sidebar
        │   ├── New Agent Chat
        │   ├── My Workforce
        │   ├── Analytics
        │   └── Settings
        │
        └── Main Content
            ├── ChatView
            │   ├── Message list
            │   └── Input → agentService.invoke()
            │
            ├── WorkforceView
            │   ├── Agent cards → agentService.list()
            │   └── Deploy button → AgentTemplatesModal
            │       └── Select template → AgentEditorPanel
            │
            ├── AnalyticsView
            │   ├── KPI cards → agentService.getStats()
            │   └── Charts
            │
            └── SettingsView
                ├── Profile
                └── Subscription

AgentEditorPanel (Slide-over)
├── Profile (avatar, name, role)
├── Behavior (description, workflow)
├── Integrations
│   ├── Channel list → channelService.list()
│   ├── Toggle → channelService.toggle()
│   └── Add channel → channelService.create()
├── Tools
│   ├── Connected tools → integrationService.list()
│   └── Connect new → integrationService.connect() → OAuth popup
├── Knowledge Base
│   ├── File list
│   └── Upload → knowledgeService.upload()
└── Save button → agentService.create() or update()
```

---

## 🔄 Data Flow Diagrams

### 1. Google OAuth Login Flow

```
User clicks "Login with Google"
        │
        ▼
LoginPage → authService.loginWithGoogle()
        │
        ▼
Redirect to Google OAuth
        │
        ▼
User authorizes
        │
        ▼
Redirect to /auth/callback
        │
        ▼
AuthCallback.tsx loads
        │
        ▼
handleOAuthCallback()
        │
        ▼
authClient.getSession()
→ session.data.user + session.data.session
        │
        ▼
POST /api/users/sync
        │
        ▼
Backend creates/updates user
        │
        ▼
Return { user, tenant, is_new }
        │
        ▼
Store: token, tenant_id, user
        │
        ▼
Update AuthContext
        │
        ▼
Navigate to Dashboard
```

### 2. Load Agents Flow

```
Dashboard mounts
        │
        ▼
WorkforceView.useEffect()
        │
        ▼
agentService.list()
        │
        ▼
GET /api/agents
Headers:
  Authorization: Bearer <token>
  x-tenant-id: <uuid>
        │
        ▼
Backend queries database
SELECT * FROM agents
WHERE tenant_id = <uuid>
AND is_active = true
        │
        ▼
Return Agent[] JSON
        │
        ▼
setAgents(data)
        │
        ▼
Render agent cards
```

### 3. Create Agent Flow

```
User clicks "Deploy New Agent"
        │
        ▼
AgentTemplatesModal opens
        │
        ▼
User selects template
        │
        ▼
AgentEditorPanel opens
        │
        ▼
User configures agent
(name, role, description, channels, integrations)
        │
        ▼
User clicks "Deploy Agent"
        │
        ▼
agentService.create({ tenant_id, name, config })
        │
        ▼
POST /api/agents
Body: { tenant_id, name, config }
        │
        ▼
Backend creates agent in DB
INSERT INTO agents ...
        │
        ▼
Backend emits event to Motia
agent.provisioned
        │
        ▼
Return new Agent object
        │
        ▼
Update local state
setAgents([...agents, newAgent])
        │
        ▼
Close panel, show toast
```

### 4. Send Message to Agent Flow

```
User types message in ChatView
        │
        ▼
User clicks send
        │
        ▼
chatView.handleSend()
        │
        ▼
Add user message to UI
setMessages([...messages, userMsg])
        │
        ▼
agentService.invoke({
  agent_id,
  message,
  tenant_id,
  customer_id,
  conversation_id
})
        │
        ▼
POST /api/agents/invoke
        │
        ▼
Backend loads agent config from DB
        │
        ▼
Backend creates Sales Agent (Agno)
        │
        ▼
Agno loads conversation history
FROM sales_agent_sessions
WHERE session_id = conversation_id
        │
        ▼
Agno invokes agent with context
        │
        ▼
Agent processes message
(may call tools: CRM, Calendar, etc.)
        │
        ▼
Agent generates response
        │
        ▼
Agno saves to database
INSERT INTO sales_agent_sessions
        │
        ▼
Return { content, tool_calls, metadata }
        │
        ▼
Add AI message to UI
setMessages([...messages, aiMsg])
```

### 5. OAuth Integration Flow

```
User clicks "Connect Gmail"
        │
        ▼
integrationService.connect({ app_name: 'gmail', agent_id, tenant_id })
        │
        ▼
POST /api/integrations/connect
        │
        ▼
Backend calls Composio API
composio.get_or_create_entity(tenant_id)
composio.get_oauth_url(app_name)
        │
        ▼
Return { oauth_url, entity_id }
        │
        ▼
Frontend opens oauth_url in popup
window.open(oauth_url, 'oauth', ...)
        │
        ▼
User authorizes on Google
        │
        ▼
Google redirects to /api/integrations/callback?code=...
        │
        ▼
Backend handles token exchange
(Composio does this automatically)
        │
        ▼
Redirect to frontend with success
        │
        ▼
Frontend receives postMessage
event.data.type === 'oauth_success'
        │
        ▼
Close popup
        │
        ▼
Reload integrations list
integrationService.list(agent_id)
```

---

## 🗄️ Database Schema (Simplified)

```
┌─────────────┐
│   tenants   │
├─────────────┤
│ id          │◄──┐
│ name        │   │
│ plan_tier   │   │
└─────────────┘   │
                  │
┌─────────────┐   │
│    users    │   │
├─────────────┤   │
│ id          │   │
│ tenant_id   │───┘
│ email       │
│ role        │
└─────────────┘

┌─────────────────┐
│     agents      │
├─────────────────┤
│ id              │◄──┐
│ tenant_id       │   │
│ name            │   │
│ config (JSONB)  │   │
│ is_active       │   │
└─────────────────┘   │
                      │
┌─────────────────────┤
│  agent_channels     │
├─────────────────────┤
│ id                  │
│ agent_id            │───┘
│ channel_type        │ (whatsapp, telegram, email)
│ channel_config      │ (JSONB)
│ is_active           │
└─────────────────────┘

┌─────────────────────┐
│   conversations     │
├─────────────────────┤
│ id                  │◄──┐
│ agent_id            │   │
│ channel_id          │   │
│ user_identifier     │   │
│ status              │   │
└─────────────────────┘   │
                          │
┌───────────────────────┤
│      messages         │
├───────────────────────┤
│ id                    │
│ conversation_id       │───┘
│ sender                │ (user, agent)
│ content               │
│ timestamp             │
└───────────────────────┘

┌─────────────────────┐
│ knowledge_sources   │
├─────────────────────┤
│ id                  │◄──┐
│ agent_id            │   │
│ filename            │   │
│ processed           │   │
└─────────────────────┘   │
                          │
┌───────────────────────┤
│     embeddings        │
├───────────────────────┤
│ id                    │
│ source_id             │───┘
│ content               │
│ embedding (vector)    │
└───────────────────────┘
```

---

## 🔐 Authentication Flow Detail

### Google OAuth Flow (Current Implementation)
```
┌──────────────────────────────────────────────────────────────┐
│                    OAuth Flow Architecture                    │
└──────────────────────────────────────────────────────────────┘

User clicks "Login with Google"
        │
        ▼
authService.loginWithGoogle()
        │
        ▼
authClient.signIn.social({
  provider: 'google',
  callbackURL: '/auth/callback'
})
        │
        ▼
Redirect to Google OAuth
        │
        ▼
User authorizes on Google
        │
        ▼
Redirect to:
/auth/callback?neon_auth_session_verifier=...
        │
        ▼
AuthCallback.tsx component mounts
        │
        ▼
authService.handleOAuthCallback()
        │
        ▼
authClient.getSession()
→ Returns: {
    data: {
      user: { id, email, name },
      session: { token, expiresAt }
    }
  }
        │
        ▼
POST /api/users/sync
Body: {
  auth_provider_id: session.data.user.id,
  email: session.data.user.email,
  name: session.data.user.name
}
        │
        ▼
Backend checks:
1. User with auth_provider_id exists? → Return
2. User with email exists? → Update auth_provider_id
3. New user? → Create tenant + user
        │
        ▼
Store in localStorage:
- token: session.data.session.token
- tenant_id: response.tenant.id
- user: response.user
        │
        ▼
Navigate to Dashboard ✅
```

### JWT Token Structure (Neon Auth)
```
┌──────────────────────────────────────────────────────────────┐
│ Token generated by Neon Auth Service                         │
├──────────────────────────────────────────────────────────────┤
│ Stored in localStorage as: token                             │
│ Sent in requests as: Authorization: Bearer <token>           │
│                                                               │
│ Contains:                                                     │
│   - User ID (auth_provider_id)                              │
│   - Email                                                     │
│   - Session metadata                                          │
│   - Expiration time                                           │
└──────────────────────────────────────────────────────────────┘
```

### Request Authentication Flow
```
Frontend Request
        │
        ▼
Add Headers:
  Authorization: Bearer <token>
  x-tenant-id: <tenant_id>
        │
        ▼
Backend Middleware
        │
        ▼
Verify JWT signature (Neon Auth)
        │
        ▼
Extract tenant_id from token
        │
        ▼
Check token expiration
        │
        ▼
Set app.current_tenant in DB session
        │
        ▼
Row Level Security (RLS) filters data
SELECT * FROM agents
WHERE tenant_id = app.current_tenant
        │
        ▼
Return filtered results
```

---

## 🔄 State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Context Tree                        │
└─────────────────────────────────────────────────────────────┘

App
├── AuthContext
│   ├── State:
│   │   ├── user: User | null
│   │   ├── tenantId: string | null
│   │   ├── isAuthenticated: boolean
│   │   └── isLoading: boolean
│   │
│   └── Methods:
│       ├── login(email, password)
│       ├── logout()
│       └── refreshToken()
│
├── LanguageContext
│   ├── State:
│   │   └── language: 'en' | 'ru'
│   │
│   └── Methods:
│       ├── setLanguage(lang)
│       └── t(key) - translate function
│
└── ToastContext
    ├── State:
    │   └── toasts: Toast[]
    │
    └── Methods:
        └── showToast(message, type)


┌─────────────────────────────────────────────────────────────┐
│                  Component Local State                       │
└─────────────────────────────────────────────────────────────┘

Dashboard
├── currentView: 'chat' | 'agents' | 'analytics' | 'settings'
├── agents: Agent[]
├── editingAgent: Agent | null
├── darkMode: boolean
└── showTemplates: boolean

WorkforceView
├── agents: Agent[] (from API)
├── loading: boolean
├── error: string
└── stats: AggregatedStats

ChatView
├── messages: Message[]
├── input: string
├── loading: boolean
└── selectedAgentId: string

AgentEditorPanel
├── name: string
├── role: string
├── description: string
├── channels: Channel[]
├── integrations: Integration[]
├── knowledgeBase: File[]
└── saving: boolean
```

---

## 🚀 API Request/Response Examples

### Login
```
Request:
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
200 OK
Content-Type: application/json

{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "tenant_id": "789e4567-e89b-12d3-a456-426614174000",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenant_id": "789e4567-e89b-12d3-a456-426614174000",
  "expires_at": "2026-02-24T08:30:00Z"
}
```

### List Agents
```
Request:
GET /api/agents
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-tenant-id: 789e4567-e89b-12d3-a456-426614174000

Response:
200 OK
Content-Type: application/json

[
  {
    "id": "agent-uuid-1",
    "tenant_id": "789e4567-e89b-12d3-a456-426614174000",
    "name": "Alex",
    "config": {
      "role": "Sales Manager",
      "description": "Qualifies leads and closes deals",
      "model": "claude-sonnet-4-5",
      "temperature": 0.7
    },
    "is_active": true,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-02-10T14:30:00Z"
  }
]
```

### Create Agent
```
Request:
POST /api/agents
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-tenant-id: 789e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "tenant_id": "789e4567-e89b-12d3-a456-426614174000",
  "name": "Sarah",
  "config": {
    "role": "Receptionist",
    "description": "Manages bookings and appointments",
    "model": "claude-sonnet-4-5"
  },
  "whatsapp_number": "+1234567890"
}

Response:
201 Created
Content-Type: application/json

{
  "id": "agent-uuid-2",
  "tenant_id": "789e4567-e89b-12d3-a456-426614174000",
  "name": "Sarah",
  "config": { ... },
  "is_active": true,
  "created_at": "2026-02-17T08:45:00Z",
  "updated_at": "2026-02-17T08:45:00Z"
}
```

### Invoke Agent
```
Request:
POST /api/agents/invoke
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "agent_id": "agent-uuid-1",
  "message": "I'm interested in your product. Can you tell me more?",
  "tenant_id": "789e4567-e89b-12d3-a456-426614174000",
  "customer_id": "customer-123",
  "conversation_id": "conv-uuid-456"
}

Response:
200 OK
Content-Type: application/json

{
  "content": "Of course! I'd be happy to tell you about our product. We offer...",
  "tool_calls": [
    {
      "name": "search_knowledge_base",
      "arguments": { "query": "product features" },
      "result": { "found": 5, "documents": [...] }
    }
  ],
  "metadata": {
    "agent_id": "agent-uuid-1",
    "conversation_id": "conv-uuid-456",
    "session_id": "conv-uuid-456",
    "timestamp": "2026-02-17T08:50:00Z"
  }
}
```

---

## 📊 Performance Considerations

### Frontend Optimizations
- Code splitting by route
- Lazy loading for Dashboard components
- Memoization for expensive calculations
- Virtual scrolling for long lists
- Debouncing for search inputs
- Image lazy loading and WebP format

### Backend Optimizations
- Database connection pooling
- Query result caching (Redis)
- Rate limiting per tenant
- Database indexes on frequently queried fields
- Async/await for I/O operations
- Batch operations where possible

### Network Optimizations
- gzip compression
- API response pagination
- WebSocket for real-time updates
- CDN for static assets
- HTTP/2 multiplexing

---

## 🔒 Security Checklist

- [x] HTTPS enforced in production
- [x] JWT tokens with expiration (Neon Auth)
- [x] CORS configured properly
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (React auto-escaping)
- [x] CSRF protection (SameSite cookies)
- [x] Rate limiting on auth endpoints
- [x] OAuth 2.0 flow (Google)
- [x] No password storage (Neon Auth handles auth)
- [x] Input validation on all endpoints
- [x] Row Level Security (RLS) for multi-tenancy
- [x] Email-based duplicate prevention
- [ ] API key rotation
- [ ] Audit logging
- [ ] Security headers (CSP, HSTS, etc.)

---

## 📚 Related Documentation

- **[TRACTION.md](../TRACTION.md)** - Project roadmap and progress tracking
- **[AUTH_READY.md](../AUTH_READY.md)** - Authentication setup and flows
- **[QUICK_START.md](./QUICK_START.md)** - Setup instructions

---

**Last Updated:** 2026-02-17
**Version:** 1.1 - OAuth flow updated
