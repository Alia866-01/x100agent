# План интеграции Frontend-Backend для X100

**Дата:** 2026-02-17
**Статус:** Планирование
**Версия:** 1.0

---

## 📋 Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Текущее состояние](#текущее-состояние)
3. [API Endpoints аудит](#api-endpoints-аудит)
4. [Frontend компоненты аудит](#frontend-компоненты-аудит)
5. [План интеграции](#план-интеграции)
6. [Детальная разбивка задач](#детальная-разбивка-задач)
7. [Типы и интерфейсы](#типы-и-интерфейсы)
8. [Приоритеты](#приоритеты)

---

## 🏗️ Обзор архитектуры

### Backend Stack
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL + pgvector
- **Architecture:** Multi-tenant SaaS
- **Auth:** JWT (планируется Better Auth)
- **Agent Framework:** Agno OS
- **Integrations:** Composio (Gmail, HubSpot, Calendar, etc.)

### Frontend Stack
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **State Management:** React Context + useState
- **Styling:** TailwindCSS 4
- **Animations:** Framer Motion 12
- **Routing:** Client-side state-based navigation

### API Communication
- **Base URL:** `http://localhost:8000` (dev), `TBD` (prod)
- **Protocol:** REST API
- **Auth:** JWT в Header `Authorization: Bearer <token>`
- **Tenant Isolation:** Header `x-tenant-id: <uuid>`

---

## 📊 Текущее состояние

### ✅ Что уже есть

**Backend:**
- ✅ FastAPI сервер с CORS middleware
- ✅ API endpoints для управления агентами
- ✅ API endpoints для каналов (WhatsApp, Telegram, Email)
- ✅ API endpoints для интеграций (OAuth flow)
- ✅ Database schema с multi-tenant RLS
- ✅ Agent invocation endpoint для Motia
- ✅ WebSocket support (через Agno OS)

**Frontend:**
- ✅ Полный UI/UX дизайн
- ✅ Все компоненты интерфейса
- ✅ Интернационализация (EN/RU)
- ✅ Анимации и transitions
- ✅ Responsive дизайн
- ✅ Dark/Light theme toggle

### ❌ Что отсутствует

**Frontend:**
- ❌ API сервисный слой
- ❌ TypeScript типы для API
- ❌ Реальная аутентификация
- ❌ Загрузка данных с сервера
- ❌ Error handling
- ❌ Loading states
- ❌ JWT token management
- ❌ Environment configuration

**Backend:**
- ❌ Better Auth интеграция (опциональная)
- ❌ Rate limiting
- ❌ API documentation (Swagger автогенерируется)

---

## 🔌 API Endpoints аудит

### 1. Аутентификация (TODO)

**Текущее состояние:** Не реализовано
**Необходимые endpoints:**

```typescript
POST /api/auth/register
Body: { email, password, company_name }
Response: { user, token, tenant_id }

POST /api/auth/login
Body: { email, password }
Response: { user, token, tenant_id, expires_at }

POST /api/auth/refresh
Body: { refresh_token }
Response: { token, expires_at }

GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user, tenant }
```

### 2. Управление агентами ✅

**Base URL:** `/api/agents`

#### GET `/api/agents`
**Назначение:** Получить список всех агентов для текущего tenant
**Headers:** `x-tenant-id: uuid`
**Query:** `?include_inactive=false`
**Response:**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "name": "Alex",
    "config": { "role": "Sales Manager", ... },
    "is_active": true,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
]
```

**Frontend использование:**
- `Dashboard > WorkforceView` - отображение карточек агентов
- `Dashboard > AnalyticsView` - список для фильтрации

#### POST `/api/agents`
**Назначение:** Создать нового агента
**Body:**
```json
{
  "tenant_id": "uuid",
  "name": "Sarah",
  "config": {
    "role": "Receptionist",
    "description": "Manages bookings",
    "model": "claude-sonnet-4-5",
    "system_prompt": "You are a professional receptionist..."
  },
  "whatsapp_number": "+1234567890",
  "telegram_username": "@bot_name",
  "email": "sarah@example.com"
}
```

**Frontend использование:**
- `Dashboard > AgentEditorPanel` - кнопка "Deploy Agent"
- `Dashboard > AgentTemplatesModal` - выбор шаблона

#### PATCH `/api/agents/{agent_id}`
**Назначение:** Обновить конфигурацию агента
**Body:**
```json
{
  "name": "Alex V2",
  "config": { "role": "Senior Sales Manager" },
  "is_active": true
}
```

**Frontend использование:**
- `Dashboard > AgentEditorPanel` - кнопка "Save Changes"

#### DELETE `/api/agents/{agent_id}`
**Назначение:** Soft delete агента (is_active = false)

**Frontend использование:**
- `Dashboard > AgentEditorPanel` - кнопка "Pause Agent"

#### GET `/api/agents/{agent_id}/stats`
**Назначение:** Получить статистику агента
**Response:**
```json
{
  "agent_id": "uuid",
  "total_messages": 1240,
  "total_conversations": 85,
  "last_activity": "2026-02-17T08:30:00Z",
  "avg_response_time_seconds": 2.5,
  "conversion_rate": null
}
```

**Frontend использование:**
- `Dashboard > WorkforceView` - stats карточки агента
- `Dashboard > AnalyticsView` - детальная статистика

#### POST `/api/agents/invoke`
**Назначение:** Инвокация агента (вызов для обработки сообщения)
**Body:**
```json
{
  "agent_id": "uuid",
  "message": "Hello, I need help",
  "context": "RAG context from Motia",
  "tenant_id": "uuid",
  "customer_id": "user123",
  "conversation_id": "conv-uuid",
  "metadata": {}
}
```

**Frontend использование:**
- `Dashboard > ChatView` - отправка сообщений

### 3. Управление каналами ✅

**Base URL:** `/api/agents/{agent_id}/channels`

#### GET `/api/agents/{agent_id}/channels`
**Назначение:** Получить все каналы агента
**Response:**
```json
{
  "channels": [
    {
      "id": "uuid",
      "agent_id": "uuid",
      "channel_type": "whatsapp",
      "channel_config": {
        "phone_number_id": "123456789",
        "access_token": "EAAG..."
      },
      "is_active": true,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

**Frontend использование:**
- `Dashboard > AgentEditorPanel > Integrations` - список каналов

#### POST `/api/agents/{agent_id}/channels`
**Назначение:** Добавить канал к агенту
**Body:**
```json
{
  "agent_id": "uuid",
  "tenant_id": "uuid",
  "channel_type": "telegram",
  "channel_config": {
    "bot_token": "123456:ABC-DEF..."
  }
}
```

**Frontend использование:**
- `Dashboard > AgentEditorPanel` - добавление нового канала

#### PATCH `/api/channels/{channel_id}`
**Назначение:** Обновить конфигурацию канала

#### POST `/api/channels/{channel_id}/toggle`
**Назначение:** Включить/выключить канал
**Body:** `{ "is_active": false }`

**Frontend использование:**
- `Dashboard > AgentEditorPanel` - Toggle для каналов

#### DELETE `/api/channels/{channel_id}`
**Назначение:** Удалить канал

### 4. Интеграции (OAuth) ✅

**Base URL:** `/api/integrations`

#### GET `/api/integrations/apps`
**Назначение:** Получить список доступных интеграций
**Response:**
```json
{
  "apps": [
    {
      "name": "gmail",
      "display_name": "Gmail",
      "description": "Send and read emails",
      "icon": "📧",
      "category": "communication"
    }
  ]
}
```

**Frontend использование:**
- `Dashboard > AgentEditorPanel > Connect New Tool` - модальное окно

#### POST `/api/integrations/connect`
**Назначение:** Инициировать OAuth flow
**Body:**
```json
{
  "app_name": "gmail",
  "agent_id": "uuid",
  "tenant_id": "uuid",
  "redirect_url": "http://localhost:3000/dashboard"
}
```

**Response:**
```json
{
  "oauth_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "entity_id": "composio-entity-id",
  "app_name": "gmail"
}
```

**Frontend использование:**
- `Dashboard > AgentEditorPanel` - кнопка интеграции
- Открыть `oauth_url` в новом окне

#### GET `/api/integrations/callback`
**Назначение:** OAuth callback endpoint (backend обрабатывает автоматически)

#### GET `/api/agents/{agent_id}/integrations`
**Назначение:** Получить подключенные интеграции
**Response:**
```json
{
  "agent_id": "uuid",
  "integrations": [
    {
      "id": "connection-uuid",
      "app_name": "gmail",
      "status": "active",
      "connected_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

#### DELETE `/api/integrations/{connection_id}`
**Назначение:** Отключить интеграцию

---

## 🎨 Frontend компоненты аудит

### Компоненты требующие интеграции

#### 1. **LoginPage.tsx** 🔴 КРИТИЧНО

**Текущее состояние:** Мок данные
**Кнопки/формы:**
- ✅ Email input
- ✅ Password input
- ❌ Submit кнопка (нет API вызова)
- ❌ Social auth кнопки (Google)

**Требуется:**
```typescript
// services/authService.ts
async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) throw new Error('Login failed');

  const data = await response.json();
  // Store token in localStorage or Context
  localStorage.setItem('token', data.token);
  localStorage.setItem('tenant_id', data.tenant_id);

  return data;
}
```

**Интеграция в компонент:**
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const result = await authService.login(email, password);
    // Save to context
    setUser(result.user);
    setTenantId(result.tenant_id);
    // Navigate to dashboard
    if (onLoginSuccess) onLoginSuccess();
  } catch (error) {
    setError('Invalid credentials');
  } finally {
    setLoading(false);
  }
};
```

#### 2. **Dashboard.tsx** 🔴 КРИТИЧНО

**WorkforceView:**
- ❌ Загрузка списка агентов (`GET /api/agents`)
- ❌ Отображение статистики (`agents.filter(a => a.status === 'active').length`)
- ❌ Кнопка "Deploy New Agent" (модал шаблонов)

**ChatView:**
- ❌ Отправка сообщения агенту (`POST /api/agents/invoke`)
- ❌ Загрузка истории сообщений

**AnalyticsView:**
- ❌ Загрузка статистики (`GET /api/agents/{id}/stats`)
- ❌ Revenue data
- ❌ Lead sources data

**SettingsView:**
- ❌ Загрузка профиля пользователя
- ❌ Обновление профиля
- ❌ Управление подпиской

**AgentEditorPanel:**
- ❌ Сохранение агента (`POST /api/agents` или `PATCH /api/agents/{id}`)
- ❌ Загрузка файлов Knowledge Base
- ❌ Подключение интеграций (`POST /api/integrations/connect`)
- ❌ Управление каналами

#### 3. **Hero.tsx** 🟡 СРЕДНЕ

**Кнопки:**
- "Start Building" → Navigate to login/register
- "Watch Demo" → Scroll to demo section

**Требуется:** Просто навигация, API не требуется

#### 4. **ProductSections.tsx** 🟡 СРЕДНЕ

**PricingSection:**
- Кнопки "Start Free", "Get Started", "Contact Sales"
- ❌ Интеграция с Stripe Checkout

**Требуется:**
```typescript
// services/billingService.ts
async function createCheckoutSession(plan: 'starter' | 'pro' | 'scale') {
  const response = await fetch(`${API_BASE_URL}/api/billing/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ plan })
  });

  const { checkout_url } = await response.json();
  window.location.href = checkout_url; // Redirect to Stripe
}
```

#### 5. **GeminiAdvisor.tsx** 🟢 НИЗКО

**Состояние:** Демо компонент, не требует немедленной интеграции
**Возможная интеграция:** "Try this agent" кнопка → создать агента из шаблона

#### 6. **Header.tsx** 🟡 СРЕДНЕ

**Кнопки:**
- "Login" → Navigate to login page ✅
- Navigation links → Navigate to pages ✅

**Требуется:**
- Показывать имя пользователя если залогинен
- Кнопка "Dashboard" вместо "Login" если авторизован

---

## 📝 План интеграции

### Фаза 1: Foundation (2-3 дня) 🔴 КРИТИЧНО

#### 1.1. Создать API Service Layer

**Файл:** `services/api.ts`

```typescript
// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenant_id');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new ApiError(response.status, error.detail);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();
```

#### 1.2. Создать TypeScript типы

**Файл:** `types/api.ts`

```typescript
// User & Auth
export interface User {
  id: string;
  email: string;
  tenant_id: string;
  role: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  tenant_id: string;
  expires_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  company_name: string;
}

// Agents
export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  config: AgentConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentConfig {
  role: string;
  description?: string;
  model?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface CreateAgentRequest {
  tenant_id: string;
  name: string;
  config: AgentConfig;
  whatsapp_number?: string;
  telegram_username?: string;
  email?: string;
}

export interface UpdateAgentRequest {
  name?: string;
  config?: AgentConfig;
  is_active?: boolean;
}

export interface AgentStats {
  agent_id: string;
  total_messages: number;
  total_conversations: number;
  last_activity: string | null;
  avg_response_time_seconds: number | null;
  conversion_rate: number | null;
}

// Channels
export interface Channel {
  id: string;
  agent_id: string;
  channel_type: 'whatsapp' | 'telegram' | 'instagram' | 'email';
  channel_config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateChannelRequest {
  agent_id: string;
  tenant_id: string;
  channel_type: string;
  channel_config: Record<string, any>;
}

// Integrations
export interface Integration {
  id: string;
  app_name: string;
  status: 'active' | 'inactive';
  connected_at: string;
}

export interface ConnectIntegrationRequest {
  app_name: string;
  agent_id: string;
  tenant_id: string;
  redirect_url?: string;
}

export interface ConnectIntegrationResponse {
  oauth_url: string;
  entity_id: string;
  app_name: string;
}

// Messages
export interface InvokeAgentRequest {
  agent_id: string;
  message: string;
  context?: string;
  tenant_id: string;
  customer_id: string;
  conversation_id?: string;
  metadata?: Record<string, any>;
}

export interface InvokeAgentResponse {
  content: string;
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, any>;
    result?: any;
  }>;
  metadata?: Record<string, any>;
}
```

#### 1.3. Создать сервисы для каждого домена

**Файл:** `services/authService.ts`

```typescript
import { api } from './api';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/api';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/api/auth/login', credentials);
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/api/auth/register', data);
  },

  async getMe(): Promise<User> {
    return api.get<User>('/api/auth/me');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tenant_id');
  },
};
```

**Файл:** `services/agentService.ts`

```typescript
import { api } from './api';
import {
  Agent,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentStats,
  InvokeAgentRequest,
  InvokeAgentResponse,
} from '../types/api';

export const agentService = {
  async list(includeInactive = false): Promise<Agent[]> {
    return api.get<Agent[]>(`/api/agents?include_inactive=${includeInactive}`);
  },

  async get(agentId: string): Promise<Agent> {
    return api.get<Agent>(`/api/agents/${agentId}`);
  },

  async create(data: CreateAgentRequest): Promise<Agent> {
    return api.post<Agent>('/api/agents', data);
  },

  async update(agentId: string, data: UpdateAgentRequest): Promise<Agent> {
    return api.patch<Agent>(`/api/agents/${agentId}`, data);
  },

  async delete(agentId: string): Promise<void> {
    return api.delete(`/api/agents/${agentId}`);
  },

  async getStats(agentId: string): Promise<AgentStats> {
    return api.get<AgentStats>(`/api/agents/${agentId}/stats`);
  },

  async invoke(request: InvokeAgentRequest): Promise<InvokeAgentResponse> {
    return api.post<InvokeAgentResponse>('/api/agents/invoke', request);
  },
};
```

**Файл:** `services/channelService.ts`

```typescript
import { api } from './api';
import { Channel, CreateChannelRequest } from '../types/api';

export const channelService = {
  async list(agentId: string): Promise<Channel[]> {
    const response = await api.get<{ channels: Channel[] }>(`/api/agents/${agentId}/channels`);
    return response.channels;
  },

  async create(agentId: string, data: CreateChannelRequest): Promise<Channel> {
    const response = await api.post<{ channel: Channel }>(`/api/agents/${agentId}/channels`, data);
    return response.channel;
  },

  async toggle(channelId: string, isActive: boolean): Promise<void> {
    await api.post(`/api/channels/${channelId}/toggle`, { is_active: isActive });
  },

  async delete(channelId: string): Promise<void> {
    await api.delete(`/api/channels/${channelId}`);
  },
};
```

**Файл:** `services/integrationService.ts`

```typescript
import { api } from './api';
import {
  Integration,
  ConnectIntegrationRequest,
  ConnectIntegrationResponse,
} from '../types/api';

export const integrationService = {
  async listAvailable() {
    return api.get<{ apps: any[] }>('/api/integrations/apps');
  },

  async connect(data: ConnectIntegrationRequest): Promise<ConnectIntegrationResponse> {
    return api.post<ConnectIntegrationResponse>('/api/integrations/connect', data);
  },

  async list(agentId: string): Promise<Integration[]> {
    const response = await api.get<{ integrations: Integration[] }>(
      `/api/agents/${agentId}/integrations`
    );
    return response.integrations;
  },

  async disconnect(connectionId: string): Promise<void> {
    await api.delete(`/api/integrations/${connectionId}`);
  },
};
```

#### 1.4. Environment Configuration

**Файл:** `.env.example`

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Frontend URL (for OAuth redirects)
VITE_APP_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_STRIPE=true
```

**Файл:** `.env.local` (создать для локальной разработки)

```env
VITE_API_URL=http://localhost:8000
VITE_APP_URL=http://localhost:3000
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_STRIPE=false
```

### Фаза 2: Authentication (1-2 дня) 🔴 КРИТИЧНО

#### 2.1. Создать AuthContext

**Файл:** `contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedTenantId = localStorage.getItem('tenant_id');

    if (token && savedTenantId) {
      authService.getMe()
        .then(user => {
          setUser(user);
          setTenantId(savedTenantId);
        })
        .catch(() => {
          // Token is invalid, clear it
          authService.logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem('token', response.token);
    localStorage.setItem('tenant_id', response.tenant_id);
    setUser(response.user);
    setTenantId(response.tenant_id);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setTenantId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenantId,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### 2.2. Обновить LoginPage.tsx

```typescript
// В начале компонента
const { login } = useAuth();
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await login(email, password);
    if (onLoginSuccess) onLoginSuccess();
  } catch (err: any) {
    setError(err.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

// В JSX
{error && (
  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
    <p className="text-red-400 text-sm">{error}</p>
  </div>
)}

<button
  type="submit"
  disabled={loading}
  className="w-full bg-white text-black font-bold text-sm py-4 rounded-xl hover:bg-gray-200 transition-colors mt-2 shadow-lg disabled:opacity-50"
>
  {loading ? 'Logging in...' : t('login.submit')}
</button>
```

#### 2.3. Обновить App.tsx

```typescript
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-black text-white">
        {/* Existing code */}
      </div>
    </AuthProvider>
  );
}
```

### Фаза 3: Dashboard Integration (3-4 дня) 🔴 КРИТИЧНО

#### 3.1. WorkforceView - Загрузка агентов

```typescript
const WorkforceView = ({ darkMode }: { darkMode: boolean }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await agentService.list();
      setAgents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // Existing render code
};
```

#### 3.2. AgentEditorPanel - Сохранение агента

```typescript
const handleSave = async () => {
  setLoading(true);
  setError('');

  try {
    const agentData: CreateAgentRequest | UpdateAgentRequest = {
      name,
      config: {
        role,
        description,
      },
    };

    let savedAgent: Agent;

    if (agent.id.startsWith('new')) {
      // Create new agent
      savedAgent = await agentService.create({
        tenant_id: tenantId!,
        ...agentData,
      });
    } else {
      // Update existing agent
      savedAgent = await agentService.update(agent.id, agentData);
    }

    onSave(savedAgent);
    onClose();
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

#### 3.3. ChatView - Отправка сообщений

```typescript
const handleSend = async () => {
  if (!input.trim()) return;

  const userMsg: Message = {
    id: Date.now(),
    text: input,
    sender: 'user',
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMsg]);
  setInput("");
  setLoading(true);

  try {
    const response = await agentService.invoke({
      agent_id: selectedAgentId, // Need to track selected agent
      message: input,
      tenant_id: tenantId!,
      customer_id: user!.id,
      conversation_id: currentConversationId,
    });

    const aiMsg: Message = {
      id: Date.now() + 1,
      text: response.content,
      sender: 'ai',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMsg]);
  } catch (err: any) {
    // Show error message
    console.error('Failed to send message:', err);
  } finally {
    setLoading(false);
  }
};
```

#### 3.4. AnalyticsView - Загрузка статистики

```typescript
const AnalyticsView = ({ darkMode }: { darkMode: boolean }) => {
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      const agents = await agentService.list();
      const statsPromises = agents.map(agent =>
        agentService.getStats(agent.id)
      );
      const allStats = await Promise.all(statsPromises);
      setStats(allStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregated metrics
  const totalMessages = stats.reduce((sum, s) => sum + s.total_messages, 0);
  const totalConversations = stats.reduce((sum, s) => sum + s.total_conversations, 0);

  // Existing render code with real data
};
```

### Фаза 4: Channels & Integrations (2-3 дня) 🟡 СРЕДНЕ

#### 4.1. Управление каналами в AgentEditorPanel

```typescript
// Load channels when agent is selected
useEffect(() => {
  if (agent.id && !agent.id.startsWith('new')) {
    loadChannels();
  }
}, [agent.id]);

const loadChannels = async () => {
  try {
    const channels = await channelService.list(agent.id);
    // Update state with channels
    setChannels(channels);
  } catch (err) {
    console.error('Failed to load channels:', err);
  }
};

const toggleChannel = async (channelId: string, isActive: boolean) => {
  try {
    await channelService.toggle(channelId, isActive);
    // Update local state
    setChannels(prev =>
      prev.map(ch => ch.id === channelId ? { ...ch, is_active: isActive } : ch)
    );
  } catch (err) {
    console.error('Failed to toggle channel:', err);
  }
};
```

#### 4.2. OAuth интеграции

```typescript
const handleAddTool = async (tool: { name: string }) => {
  try {
    const response = await integrationService.connect({
      app_name: tool.name.toLowerCase(),
      agent_id: agent.id,
      tenant_id: tenantId!,
      redirect_url: `${window.location.origin}/dashboard`,
    });

    // Open OAuth URL in popup
    const popup = window.open(
      response.oauth_url,
      'oauth',
      'width=600,height=700'
    );

    // Listen for OAuth callback
    window.addEventListener('message', (event) => {
      if (event.data.type === 'oauth_success') {
        popup?.close();
        loadIntegrations(); // Reload integrations list
      }
    });
  } catch (err) {
    console.error('Failed to connect integration:', err);
  }
};
```

### Фаза 5: Pricing & Payments (2 дня) 🟡 СРЕДНЕ

#### 5.1. Stripe Checkout интеграция

**Backend endpoint (нужно добавить):**

```python
# backend/api/billing.py
@router.post("/billing/checkout")
async def create_checkout_session(
    plan: str,
    tenant_id: str = Header(..., alias="x-tenant-id")
):
    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

    prices = {
        "starter": "price_starter_id",
        "pro": "price_pro_id",
        "scale": "price_scale_id"
    }

    session = stripe.checkout.Session.create(
        customer_email=user.email,
        mode="subscription",
        line_items=[{
            "price": prices[plan],
            "quantity": 1
        }],
        success_url=f"{os.getenv('FRONTEND_URL')}/dashboard?payment=success",
        cancel_url=f"{os.getenv('FRONTEND_URL')}?payment=cancelled",
    )

    return {"checkout_url": session.url}
```

**Frontend:**

```typescript
// services/billingService.ts
export const billingService = {
  async createCheckout(plan: 'starter' | 'pro' | 'scale'): Promise<string> {
    const response = await api.post<{ checkout_url: string }>(
      '/api/billing/checkout',
      { plan }
    );
    return response.checkout_url;
  },
};

// In PricingSection.tsx
const handleSelectPlan = async (plan: string) => {
  try {
    const checkoutUrl = await billingService.createCheckout(plan);
    window.location.href = checkoutUrl;
  } catch (err) {
    console.error('Failed to create checkout:', err);
  }
};
```

### Фаза 6: Error Handling & UX (1-2 дня) 🟢 НИЗКО

#### 6.1. Глобальный error handler

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  // Standard error boundary implementation
}

// components/ErrorMessage.tsx
export const ErrorMessage = ({ message, onRetry }: Props) => (
  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
    <p className="text-red-400">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-2 text-sm text-red-300 underline">
        Retry
      </button>
    )}
  </div>
);

// components/LoadingSpinner.tsx
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);
```

#### 6.2. Toast notifications

```typescript
// contexts/ToastContext.tsx
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};
```

### Фаза 7: Testing & Documentation (2 дня) 🟢 НИЗКО

#### 7.1. Тестирование каждого endpoint

**Создать:** `tests/api.test.ts`

```typescript
describe('Agent API', () => {
  it('should list agents', async () => {
    const agents = await agentService.list();
    expect(Array.isArray(agents)).toBe(true);
  });

  it('should create agent', async () => {
    const agent = await agentService.create({
      tenant_id: 'test-tenant',
      name: 'Test Agent',
      config: { role: 'Test' },
    });
    expect(agent.name).toBe('Test Agent');
  });
});
```

#### 7.2. Обновить документацию

**Создать:** `docs/api-integration.md`

---

## 📦 Детальная разбивка задач

### ✅ Checklist для интеграции

**Foundation:**
- [ ] Создать `services/api.ts` базовый API client
- [ ] Создать `types/api.ts` с TypeScript типами
- [ ] Создать `services/authService.ts`
- [ ] Создать `services/agentService.ts`
- [ ] Создать `services/channelService.ts`
- [ ] Создать `services/integrationService.ts`
- [ ] Настроить `.env` файлы
- [ ] Добавить environment variables в Vite config

**Authentication:**
- [ ] Создать `contexts/AuthContext.tsx`
- [ ] Обновить `App.tsx` с AuthProvider
- [ ] Обновить `LoginPage.tsx` с реальным API
- [ ] Добавить protected routes logic
- [ ] Добавить JWT token refresh logic

**Dashboard - WorkforceView:**
- [ ] Загрузка списка агентов из API
- [ ] Отображение статистики агентов
- [ ] Кнопка "Deploy New Agent" → модал
- [ ] Сохранение нового агента через API
- [ ] Редактирование существующего агента
- [ ] Удаление/пауза агента

**Dashboard - AgentEditorPanel:**
- [ ] Загрузка конфигурации агента
- [ ] Сохранение изменений через API
- [ ] Загрузка списка каналов
- [ ] Добавление нового канала
- [ ] Toggle канала (вкл/выкл)
- [ ] Удаление канала
- [ ] Загрузка доступных интеграций
- [ ] OAuth flow для интеграций
- [ ] Отображение подключенных интеграций
- [ ] Загрузка файлов Knowledge Base

**Dashboard - ChatView:**
- [ ] Отправка сообщения через API
- [ ] Получение ответа от агента
- [ ] Загрузка истории сообщений
- [ ] Отображение typing indicator
- [ ] Error handling для failed messages

**Dashboard - AnalyticsView:**
- [ ] Загрузка статистики всех агентов
- [ ] Расчет агрегированных метрик
- [ ] Отображение графиков с реальными данными
- [ ] Фильтрация по временным периодам

**Dashboard - SettingsView:**
- [ ] Загрузка профиля пользователя
- [ ] Обновление профиля
- [ ] Отображение информации о подписке
- [ ] Кнопка "Manage Subscription" → Stripe portal

**Pricing & Payments:**
- [ ] Добавить backend endpoint `/api/billing/checkout`
- [ ] Создать `services/billingService.ts`
- [ ] Обновить PricingSection с Stripe integration
- [ ] Добавить payment success/cancel pages

**Error Handling:**
- [ ] Создать ErrorBoundary component
- [ ] Создать ErrorMessage component
- [ ] Создать LoadingSpinner component
- [ ] Создать ToastContext для notifications
- [ ] Добавить error handling во все API calls

**Testing:**
- [ ] Написать unit tests для services
- [ ] Написать integration tests для API
- [ ] Протестировать все flows end-to-end
- [ ] Протестировать error scenarios

**Documentation:**
- [ ] Обновить README с инструкциями по запуску
- [ ] Написать API integration guide
- [ ] Документировать environment variables
- [ ] Добавить troubleshooting guide

---

## 🎯 Приоритеты

### 🔴 КРИТИЧНО (Неделя 1)
1. API Service Layer (services/api.ts)
2. TypeScript типы (types/api.ts)
3. Auth services + AuthContext
4. LoginPage интеграция
5. Dashboard WorkforceView - загрузка агентов
6. Dashboard AgentEditorPanel - сохранение агентов

### 🟡 ВЫСОКО (Неделя 2)
7. Dashboard ChatView - отправка сообщений
8. Dashboard AnalyticsView - загрузка статистики
9. Channels management (WhatsApp, Telegram)
10. OAuth integrations (Gmail, HubSpot)
11. Knowledge Base file upload

### 🟢 СРЕДНЕ (Неделя 3)
12. Stripe payments integration
13. Hero/Footer CTA buttons
14. Error handling + loading states
15. Toast notifications
16. JWT token refresh

### ⚪ НИЗКО (Неделя 4+)
17. Testing suite
18. Documentation
19. Performance optimization
20. Analytics integration

---

## 📚 Дополнительные ресурсы

### Backend документация
- FastAPI docs: `/docs` (Swagger UI)
- Database schema: `/docs/database-schema.md`
- API endpoints: `/docs/api-endpoints.md`

### Frontend документация
- Component library: `/docs/component-library.md`
- Design system: `/docs/design-system.md`
- State management: `/docs/state-management.md`

### Deployment
- Backend: Railway/Render/DigitalOcean
- Frontend: Vercel/Netlify
- Database: Supabase/Neon

---

## ✅ Следующие шаги

1. **Сегодня (2026-02-17):**
   - Создать services/api.ts
   - Создать types/api.ts
   - Создать authService.ts

2. **Завтра:**
   - Создать AuthContext
   - Обновить LoginPage
   - Тестировать login flow

3. **Эта неделя:**
   - Закончить все КРИТИЧНЫЕ задачи
   - Начать ВЫСОКИЕ задачи
   - Регулярно тестировать интеграцию

---

**Версия:** 1.0
**Последнее обновление:** 2026-02-17
**Автор:** X100 Development Team
