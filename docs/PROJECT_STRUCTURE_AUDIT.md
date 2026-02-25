# Project Structure Audit & Refactoring Plan

**Дата:** 2026-02-17
**Статус:** Обнаружены проблемы структуры

---

## 🔍 Текущая структура

```
/Users/user/ai-01/
├── 📁 components/                    (24 компонента)
│   ├── About.tsx
│   ├── Blog.tsx
│   ├── Careers.tsx
│   ├── Contact.tsx
│   ├── CookieConsent.tsx
│   ├── Dashboard.tsx                 (1235 строк - ОГРОМНЫЙ!)
│   ├── Features.tsx
│   ├── Footer.tsx
│   ├── GeminiAdvisor.tsx
│   ├── GlowingButton.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Icons.tsx
│   ├── InsightRecapSection.tsx
│   ├── LanguageContext.tsx           (CONTEXT в components/ ❌)
│   ├── Legal.tsx
│   ├── LoginPage.tsx                 (⚠️ РЕГИСТРАЦИЯ или ЛОГИН?)
│   ├── ProductDemo.tsx
│   ├── ProductSections.tsx
│   ├── TargetAudienceSection.tsx
│   ├── Testimonials.tsx
│   └── ui/
│       ├── card.tsx
│       ├── ImpactFeatures.tsx
│       ├── TestimonialMarquee.tsx
│       └── shader-animation.tsx
│
├── 📁 services/                       (⚠️ Только 1 файл)
│   └── geminiService.ts
│
├── 📁 lib/
│   └── utils.ts
│
├── 📁 backend/                        (Python)
│   ├── agents/
│   ├── api/
│   ├── services/
│   └── workers/
│
├── 📁 docs/                           (Документация - OK ✅)
│
├── 📄 types.ts                        (⚠️ В корне, не в types/)
├── 📄 App.tsx
├── 📄 index.tsx
└── 📄 vite.config.ts
```

---

## 🚨 Обнаруженные проблемы

### 1. 🔴 КРИТИЧНО: LoginPage путаница

**Проблема:**
`LoginPage.tsx` содержит форму с текстом:
```
"Already have an account? Log in"
```

Это текст для **REGISTRATION PAGE**, но компонент называется `LoginPage`!

**Что не так:**
- Если это Login страница → текст должен быть "Don't have an account? **Sign up**"
- Если это Registration страница → компонент должен называться `RegisterPage`

**Текущее состояние:**
- Форма имеет поля: email, password
- Кнопка: "Log In"
- Футер: "Already have an account? Log in"

**Вывод:** Это страница **LOGIN**, но футер перепутан с Registration текстом.

### 2. 🟡 Структурные проблемы

#### A. Все компоненты в одной папке
Нет разделения на:
- `pages/` - страницы (About, Blog, Login, Dashboard)
- `features/` - feature-specific компоненты (Hero, Pricing, GeminiAdvisor)
- `shared/` или `common/` - переиспользуемые компоненты (Header, Footer, Icons)
- `ui/` - UI kit компоненты (Button, Card, etc.)

#### B. Context в components/
`LanguageContext.tsx` находится в `components/`, а должен быть в `contexts/`

#### C. types.ts в корне
Должен быть в `types/` папке для масштабируемости

#### D. Огромный Dashboard.tsx
1235 строк кода в одном файле! Содержит:
- WorkforceView
- ChatView
- AnalyticsView
- SettingsView
- AgentEditorPanel
- AgentTemplatesModal
- Множество utility компонентов

**Должно быть разбито на:**
```
Dashboard/
├── Dashboard.tsx           (главный контейнер)
├── WorkforceView.tsx
├── ChatView.tsx
├── AnalyticsView.tsx
├── SettingsView.tsx
├── AgentEditorPanel.tsx
└── AgentTemplatesModal.tsx
```

---

## ✅ Предлагаемая структура (Refactoring)

```
/Users/user/ai-01/
│
├── 📁 src/                           (⭐ Новая папка)
│   │
│   ├── 📁 pages/                     (Страницы приложения)
│   │   ├── LandingPage.tsx          (было в App.tsx)
│   │   ├── LoginPage.tsx            (✅ Чистый Login)
│   │   ├── RegisterPage.tsx         (✅ Новый - Регистрация)
│   │   ├── DashboardPage.tsx        (контейнер для Dashboard)
│   │   ├── AboutPage.tsx
│   │   ├── BlogPage.tsx
│   │   ├── CareersPage.tsx
│   │   ├── ContactPage.tsx
│   │   └── LegalPage.tsx
│   │
│   ├── 📁 features/                  (Feature-specific компоненты)
│   │   │
│   │   ├── 📁 landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── ProductDemo.tsx
│   │   │   ├── GeminiAdvisor.tsx
│   │   │   ├── ProductSections.tsx
│   │   │   ├── TargetAudienceSection.tsx
│   │   │   └── Testimonials.tsx
│   │   │
│   │   ├── 📁 dashboard/
│   │   │   ├── Dashboard.tsx        (главный)
│   │   │   ├── WorkforceView.tsx
│   │   │   ├── ChatView.tsx
│   │   │   ├── AnalyticsView.tsx
│   │   │   ├── SettingsView.tsx
│   │   │   ├── AgentEditorPanel.tsx
│   │   │   └── AgentTemplatesModal.tsx
│   │   │
│   │   └── 📁 auth/
│   │       ├── LoginForm.tsx
│   │       └── RegisterForm.tsx
│   │
│   ├── 📁 components/                (Shared компоненты)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── CookieConsent.tsx
│   │   ├── Icons.tsx
│   │   └── ui/                      (UI Kit)
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorMessage.tsx
│   │       ├── Toast.tsx
│   │       └── shader-animation.tsx
│   │
│   ├── 📁 contexts/                  (React Contexts)
│   │   ├── AuthContext.tsx          (✅ Новый)
│   │   ├── LanguageContext.tsx      (переместить)
│   │   └── ToastContext.tsx         (✅ Новый)
│   │
│   ├── 📁 services/                  (API Services)
│   │   ├── api.ts                   (✅ Новый - Base client)
│   │   ├── authService.ts           (✅ Новый)
│   │   ├── agentService.ts          (✅ Новый)
│   │   ├── channelService.ts        (✅ Новый)
│   │   ├── integrationService.ts    (✅ Новый)
│   │   ├── billingService.ts        (✅ Новый)
│   │   ├── knowledgeService.ts      (✅ Новый)
│   │   └── geminiService.ts         (существующий)
│   │
│   ├── 📁 types/                     (TypeScript типы)
│   │   ├── api.ts                   (✅ Новый - API types)
│   │   ├── agent.ts                 (✅ Новый)
│   │   ├── channel.ts               (✅ Новый)
│   │   ├── integration.ts           (✅ Новый)
│   │   └── index.ts                 (переместить types.ts)
│   │
│   ├── 📁 hooks/                     (Custom React Hooks)
│   │   ├── useAuth.ts               (✅ Новый)
│   │   ├── useApi.ts                (✅ Новый)
│   │   ├── useToast.ts              (✅ Новый)
│   │   └── useTranslation.ts        (из LanguageContext)
│   │
│   ├── 📁 utils/                     (Утилиты)
│   │   ├── api.ts                   (API helpers)
│   │   ├── validation.ts            (Form validation)
│   │   └── format.ts                (Date/number formatting)
│   │
│   ├── 📄 App.tsx                   (Root component)
│   └── 📄 main.tsx                  (Entry point - переименовать index.tsx)
│
├── 📁 backend/                       (Python - без изменений)
├── 📁 docs/                          (Документация - без изменений)
├── 📁 public/                        (Static assets)
├── 📄 .env.local                    (✅ Новый)
├── 📄 .env.example                  (✅ Новый)
├── 📄 vite.config.ts
├── 📄 tailwind.config.js
├── 📄 tsconfig.json
└── 📄 package.json
```

---

## 🔧 План рефакторинга

### Phase 0: Исправить LoginPage (СРОЧНО!)

**Сейчас:**
```tsx
// LoginPage.tsx - строка 175
<p className="text-sm text-gray-400">{t('login.footer')}
  <a href="#">{t('login.footer_link')}</a>
</p>

// LanguageContext.tsx
'login.footer': 'Already have an account?',
'login.footer_link': 'Log in',
```

**Исправить на:**

#### Вариант 1: Сделать единый компонент с переключением
```tsx
const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div>
      {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      <p>
        {mode === 'login'
          ? "Don't have an account?"
          : "Already have an account?"}
        <a onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </a>
      </p>
    </div>
  );
};
```

#### Вариант 2: Две отдельные страницы (РЕКОМЕНДУЕТСЯ ✅)
```tsx
// LoginPage.tsx
<p>Don't have an account?
  <a onClick={() => navigate('register')}>Sign up</a>
</p>

// RegisterPage.tsx
<p>Already have an account?
  <a onClick={() => navigate('login')}>Log in</a>
</p>
```

**Обновить переводы:**
```tsx
// Для Login
'login.footer': "Don't have an account?",
'login.footer_link': 'Sign up',

// Для Register
'register.footer': 'Already have an account?',
'register.footer_link': 'Log in',
```

### Phase 1: Создать новые файлы (НЕ ТРОГАЯ старые)

**Цель:** Не ломать текущую работу

1. Создать `src/` папку
2. Создать структуру папок
3. Создать новые файлы (services, contexts, types)
4. Оставить старые компоненты на месте

### Phase 2: Постепенная миграция

**Неделя 1:**
- Создать RegisterPage.tsx (копия LoginPage с изменениями)
- Создать API service layer в новой структуре
- Обновить App.tsx для поддержки register route

**Неделя 2:**
- Мигрировать LanguageContext → src/contexts/
- Создать AuthContext
- Разбить Dashboard на модули

**Неделя 3:**
- Мигрировать все страницы в src/pages/
- Мигрировать features
- Обновить импорты

**Неделя 4:**
- Удалить старую структуру
- Финальная проверка
- Обновить документацию

---

## 🎯 Приоритеты рефакторинга

### 🔴 СЕЙЧАС (до начала интеграции API)

**1. Исправить Login/Register путаницу**
- [ ] Создать RegisterPage.tsx
- [ ] Обновить переводы
- [ ] Добавить navigation между Login/Register
- [ ] Обновить App.tsx с register route

**2. Создать базовую структуру для API**
- [ ] Создать `services/` с новыми файлами
- [ ] Создать `types/` с API types
- [ ] Создать `contexts/` (AuthContext, ToastContext)

### 🟡 В ПРОЦЕССЕ интеграции API

**3. Постепенно мигрировать компоненты**
- [ ] Создать `src/features/dashboard/` и разбить Dashboard
- [ ] Мигрировать auth компоненты
- [ ] Создать UI kit в `src/components/ui/`

### 🟢 ПОСЛЕ интеграции API

**4. Полный рефакторинг**
- [ ] Создать полную `src/` структуру
- [ ] Мигрировать все компоненты
- [ ] Удалить старые файлы
- [ ] Обновить документацию

---

## 📝 Обновленный план интеграции

### Week 1 - Foundation + Auth Fix

**Day 1:**
- [ ] ✅ Создать RegisterPage.tsx
- [ ] ✅ Обновить переводы (login.footer, register.footer)
- [ ] ✅ Добавить navigation Login ↔ Register
- [ ] ✅ Обновить App.tsx

**Day 2:**
- [ ] Создать `services/api.ts`
- [ ] Создать `types/api.ts`
- [ ] Создать `services/authService.ts`

**Day 3:**
- [ ] Создать `contexts/AuthContext.tsx`
- [ ] Обновить LoginPage с реальным API
- [ ] Обновить RegisterPage с реальным API

---

## 🔗 Файлы для создания (обновленный список)

### Новые компоненты
```
components/
├── RegisterPage.tsx              ✅ НОВЫЙ (Priority 1)
└── ui/
    ├── Button.tsx                ✅ НОВЫЙ
    ├── Input.tsx                 ✅ НОВЫЙ
    ├── LoadingSpinner.tsx        ✅ НОВЫЙ
    ├── ErrorMessage.tsx          ✅ НОВЫЙ
    └── Toast.tsx                 ✅ НОВЫЙ
```

### API Integration
```
services/
├── api.ts                        ✅ НОВЫЙ
├── authService.ts                ✅ НОВЫЙ (с register())
├── agentService.ts               ✅ НОВЫЙ
├── channelService.ts             ✅ НОВЫЙ
├── integrationService.ts         ✅ НОВЫЙ
├── billingService.ts             ✅ НОВЫЙ
└── knowledgeService.ts           ✅ НОВЫЙ
```

### Contexts
```
contexts/
├── AuthContext.tsx               ✅ НОВЫЙ
└── ToastContext.tsx              ✅ НОВЫЙ
```

### Types
```
types/
└── api.ts                        ✅ НОВЫЙ
```

---

## 🚀 Immediate Actions (Сегодня)

### 1. Исправить Login/Register

**Создать `components/RegisterPage.tsx`:**

```tsx
import React, { useState } from 'react';
import { useTranslation } from './LanguageContext';
import { ShaderAnimation } from './ui/shader-animation';

interface RegisterPageProps {
  onBack: () => void;
  onRegisterSuccess?: () => void;
  onSwitchToLogin: () => void;  // ✅ Новый prop
}

const RegisterPage: React.FC<RegisterPageProps> = ({
  onBack,
  onRegisterSuccess,
  onSwitchToLogin
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');  // ✅ Новое поле

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to API
    console.log('Register:', { email, password, companyName });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex overflow-hidden">
      {/* Копия структуры из LoginPage */}

      <form onSubmit={handleRegister}>
        {/* Email input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
        />

        {/* Company Name - ✅ НОВОЕ поле */}
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company Name"
        />

        {/* Password input */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 characters)"
        />

        {/* Submit button */}
        <button type="submit">
          {t('register.submit')}  {/* "Create Account" */}
        </button>
      </form>

      {/* Footer - ✅ ПРАВИЛЬНЫЙ текст */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-400">
          {t('register.footer')}  {/* "Already have an account?" */}
          {' '}
          <a
            onClick={onSwitchToLogin}
            className="text-white font-medium hover:underline cursor-pointer"
          >
            {t('register.footer_link')}  {/* "Log in" */}
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
```

**Обновить `components/LanguageContext.tsx` переводы:**

```typescript
// В en секции ИЗМЕНИТЬ:
'login.footer': "Don't have an account?",  // ← ИЗМЕНИТЬ
'login.footer_link': 'Sign up',            // ← ИЗМЕНИТЬ

// ДОБАВИТЬ новые ключи для Register:
'register.title': 'Create your',
'register.title_suffix': 'digital workforce',
'register.subtitle': 'Start building AI employees in minutes',
'register.form.title': 'Create your account',
'register.form.subtitle': 'Join thousands of businesses automating with AI',
'register.company': 'Company Name',
'register.submit': 'Create Account',
'register.footer': 'Already have an account?',
'register.footer_link': 'Log in',

// В ru секции:
'login.footer': 'Нет аккаунта?',           // ← ИЗМЕНИТЬ
'login.footer_link': 'Зарегистрироваться', // ← ИЗМЕНИТЬ

'register.title': 'Создайте своих',
'register.title_suffix': 'цифровых сотрудников',
'register.subtitle': 'Начните создавать AI сотрудников за минуты',
'register.form.title': 'Создать аккаунт',
'register.form.subtitle': 'Присоединяйтесь к тысячам компаний',
'register.company': 'Название компании',
'register.submit': 'Создать аккаунт',
'register.footer': 'Уже есть аккаунт?',
'register.footer_link': 'Войти',
```

**Обновить `App.tsx`:**

```typescript
type ViewState = 'landing' | 'login' | 'register' | 'dashboard' | ...;

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');

  return (
    <>
      {/* Login Page */}
      {currentView === 'login' && (
        <LoginPage
          onBack={() => setCurrentView('landing')}
          onLoginSuccess={() => setCurrentView('dashboard')}
          onSwitchToRegister={() => setCurrentView('register')}  // ✅ Новый
        />
      )}

      {/* Register Page - ✅ НОВЫЙ */}
      {currentView === 'register' && (
        <RegisterPage
          onBack={() => setCurrentView('landing')}
          onRegisterSuccess={() => setCurrentView('dashboard')}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}
    </>
  );
}
```

**Обновить `components/LoginPage.tsx`:**

```tsx
interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess?: () => void;
  onSwitchToRegister: () => void;  // ✅ Добавить
}

const LoginPage: React.FC<LoginPageProps> = ({
  onBack,
  onLoginSuccess,
  onSwitchToRegister  // ✅ Добавить
}) => {
  // ... existing code ...

  return (
    // ... existing JSX ...

    {/* Footer - ✅ ИЗМЕНИТЬ */}
    <div className="text-center mt-8">
      <p className="text-sm text-gray-400">
        {t('login.footer')}  {/* "Don't have an account?" */}
        {' '}
        <a
          onClick={onSwitchToRegister}  // ✅ ИЗМЕНИТЬ
          className="text-white font-medium hover:underline cursor-pointer"
        >
          {t('login.footer_link')}  {/* "Sign up" */}
        </a>
      </p>
    </div>
  );
};
```

---

## 📊 Обновленный TODO List

### 🔴 Week 1 - Priority 1

**Auth Pages:**
- [ ] Создать RegisterPage.tsx
- [ ] Обновить переводы (login/register)
- [ ] Добавить navigation Login ↔ Register
- [ ] Обновить LoginPage footer
- [ ] Обновить App.tsx с register route

**API Foundation:**
- [ ] Создать services/api.ts
- [ ] Создать types/api.ts
- [ ] Создать services/authService.ts (с register())

**Authentication:**
- [ ] Создать contexts/AuthContext.tsx
- [ ] Подключить LoginPage к API
- [ ] Подключить RegisterPage к API

---

**Версия:** 2.0
**Последнее обновление:** 2026-02-17 (добавлена Register страница)
