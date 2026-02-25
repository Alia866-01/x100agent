# Архитектура Фронтенда X100

## Оглавление

1. [Обзор проекта](#обзор-проекта)
2. [Технологический стек](#технологический-стек)
3. [Структура проекта](#структура-проекта)
4. [Система интернационализации](#система-интернационализации)
5. [Компоненты](#компоненты)
6. [Стилизация](#стилизация)
7. [Роутинг и навигация](#роутинг-и-навигация)
8. [Сборка и деплой](#сборка-и-деплой)

---

## Обзор проекта

**X100** — это современное веб-приложение для создания и управления AI-сотрудниками. Фронтенд построен на React + TypeScript с использованием Vite в качестве сборщика.

### Основные возможности:
- 🌍 Полная интернационализация (EN/RU)
- 🎨 Премиум дизайн с анимациями
- 📱 Адаптивная верстка (mobile-first)
- ⚡ Высокая производительность
- 🎭 Интерактивные UI компоненты

---

## Технологический стек

### Основные технологии

| Технология | Версия | Назначение |
|-----------|---------|-----------|
| **React** | 18.x | UI библиотека |
| **TypeScript** | 5.x | Типизация |
| **Vite** | 5.x | Сборщик и dev-сервер |
| **Framer Motion** | 11.x | Анимации |
| **TailwindCSS** | 3.x | CSS фреймворк |

### Дополнительные библиотеки

```json
{
  "react-router-dom": "Роутинг между страницами",
  "framer-motion": "Анимации и transitions",
  "react-i18next": "Интернационализация (концепция)"
}
```

---

## Структура проекта

```
/Users/user/ai-01/
│
├── components/              # React компоненты
│   ├── ui/                 # UI kit компоненты
│   │   ├── Button.tsx
│   │   ├── ComparisonTable.tsx
│   │   ├── TestimonialMarquee.tsx
│   │   └── TypingQuotes.tsx
│   │
│   ├── About.tsx           # Страница "О нас"
│   ├── Blog.tsx            # Блог
│   ├── Careers.tsx         # Карьера
│   ├── Contact.tsx         # Контакты
│   ├── CookieConsent.tsx   # Cookie уведомление
│   ├── Dashboard.tsx       # Дашборд приложения
│   ├── Features.tsx        # Особенности продукта
│   ├── Footer.tsx          # Подвал сайта
│   ├── GeminiAdvisor.tsx   # AI советники
│   ├── Header.tsx          # Шапка сайта
│   ├── Hero.tsx            # Главный экран
│   ├── Icons.tsx           # SVG иконки
│   ├── LanguageContext.tsx # Контекст переводов
│   ├── Legal.tsx           # Юридическая информация
│   ├── LoginPage.tsx       # Страница входа
│   ├── ProductDemo.tsx     # Демо продукта
│   ├── ProductSections.tsx # Секции продукта
│   ├── TargetAudienceSection.tsx # Целевая аудитория
│   └── Testimonials.tsx    # Отзывы клиентов
│
├── App.tsx                  # Главный компонент приложения
├── index.tsx               # Entry point
├── index.css               # Глобальные стили
├── index.html              # HTML шаблон
│
├── vite.config.ts          # Конфигурация Vite
├── tailwind.config.js      # Конфигурация Tailwind
├── tsconfig.json           # Конфигурация TypeScript
├── postcss.config.js       # Конфигурация PostCSS
│
├── backend/                # Backend код (Python)
├── docs/                   # Документация
└── dist/                   # Собранный проект
```

---

## Система интернационализации

### Архитектура

Система i18n построена на **React Context API** и находится в `components/LanguageContext.tsx`.

### Основные компоnenты:

#### 1. LanguageContext
```typescript
interface LanguageContextType {
  language: 'en' | 'ru';
  setLanguage: (lang: 'en' | 'ru') => void;
  t: (key: string) => string;
}
```

#### 2. Структура переводов
```typescript
const translations = {
  en: {
    'nav.products': 'Products',
    'nav.pricing': 'Pricing',
    'hero.title': 'Simulate your workforce',
    // ... 600+ ключей
  },
  ru: {
    'nav.products': 'Продукты',
    'nav.pricing': 'Цены',
    'hero.title': 'Симулируйте свой штат сотрудников',
    // ... 600+ ключей
  }
}
```

#### 3. Использование в компонентах
```typescript
import { useTranslation } from './LanguageContext';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <h1>{t('hero.title')}</h1>;
};
```

### Организация ключей переводов

Ключи организованы по секциям:

| Префикс | Описание | Примеры |
|---------|----------|---------|
| `nav.*` | Навигация | `nav.products`, `nav.pricing` |
| `hero.*` | Главный экран | `hero.title`, `hero.subtitle` |
| `advisor.*` | AI Советники | `advisor.agent.sales.name` |
| `pricing.*` | Цены | `pricing.starter`, `pricing.pro` |
| `testim.*` | Отзывы | `testim.quote1`, `testim.author1` |
| `target.*` | Целевая аудитория | `target.ind.real_estate` |
| `footer.*` | Подвал | `footer.title`, `footer.cta` |
| `login.*` | Авторизация | `login.email`, `login.password` |
| `features.*` | Функции | `features.title` |

---

## Компоненты

### Layout компоненты

#### Header.tsx
Шапка сайта с навигацией и языковым переключателем.

**Основные элементы:**
- Логотип
- Навигационное меню (Products, Solutions, Pricing, etc.)
- Кнопка "Login"
- Переключатель языка (EN/RU)

**Технологии:**
- Sticky позиционирование
- Backdrop blur эффект
- Адаптивное меню (мобильная версия)

```typescript
// Пример использования
<Header />
```

#### Footer.tsx
Подвал сайта с дополнительной информацией и ссылками.

**Секции:**
- Визуальные карточки (Growth Engine, Revenue, etc.)
- Колонки ссылок (Roles, Company, Legal)
- Email форма подписки
- Copyright информация

---

### Page компоненты

#### Hero.tsx
Главный экран с героическим блоком.

**Особенности:**
- Typing effect для поисковой строки
- Анимированные кнопки CTA
- Градиентные фоны
- Адаптивная типографика

**Ключевые анимации:**
```typescript
// Typing effect
const searchBarTexts = [
  "Find a local plumber",
  "Book a dentist appointment",
  // ...
];
```

#### ProductSections.tsx
Основные секции продукта.

**Включает:**
1. **HowItWorksSection** - Как это работает (3 шага)
2. **IntegrationsSection** - Интеграции с сервисами
3. **PricingSection** - Тарифные планы

**Анимации:**
- Framer Motion для transitions
- Hover эффекты
- Автоматическая смена активного шага

#### GeminiAdvisor.tsx
Интерактивная демонстрация AI сотрудников.

**Архитектура:**
```typescript
type AgentType = 'sales' | 'support' | 'receptionist' | 'recruiter';

interface Agent {
  id: AgentType;
  name: string;
  role: string;
  description: string;
  benefit: string;
  salary: string;
  humanSalary: string;
  color: string;
  image: string;
}
```

**Визуальные компоненты:**
- `SalesVisual` - Уведомления о продажах
- `SupportVisual` - Inbox Zero демо
- `ReceptionistVisual` - Календарь встреч
- `RecruiterVisual` - Отбор кандидатов

**Состояние:**
```typescript
const [activeAgentId, setActiveAgentId] = useState<AgentType>('sales');
const AGENTS: Record<AgentType, Agent> = useMemo(/* ... */);
```

#### LoginPage.tsx
Страница авторизации.

**Функционал:**
- Форма входа (email + password)
- Валидация полей
- Анимированные шаги регистрации
- Dark theme дизайн

---

### UI Kit компоненты

#### ui/Button.tsx
Переиспользуемая кнопка с вариантами стилей.

**Варианты:**
- `primary` - Основная кнопка
- `secondary` - Вторичная кнопка
- `ghost` - Прозрачная кнопка

#### ui/ComparisonTable.tsx
Таблица сравнения X100 vs Traditional Hiring.

**Колонки:**
- Метрика
- Human Employee
- AI Employee

**Особенности:**
- Адаптивный дизайн
- Highlighter эффекты
- Интернационализация

#### ui/TestimonialMarquee.tsx
Бегущая строка с отзывами клиентов.

**Технология:**
- CSS animations для прокрутки
- Infinite loop
- Hover pause эффект

**Структура данных:**
```typescript
{
  text: string;
  image: string;
  name: string;
  role: string;
}
```

#### ui/TypingQuotes.tsx
Печатающиеся цитаты с эффектом печатной машинки.

---

### Utility компоненты

#### Icons.tsx
Коллекция SVG иконок.

**Доступные иконки:**
- `CheckIcon`
- `ArrowRight`
- `MenuIcon`
- `CloseIcon`
- И другие...

**Использование:**
```typescript
import { CheckIcon } from './Icons';

<CheckIcon className="w-6 h-6 text-green-500" />
```

#### CookieConsent.tsx
Уведомление о cookie.

**Функции:**
- Появляется при первом визите
- Сохраняет состояние в localStorage
- Dismiss анимация

---

## Стилизация

### TailwindCSS конфигурация

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Кастомные цвета
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        // Кастомные анимации
      }
    }
  },
  plugins: []
}
```

### Глобальные стили

`index.css` содержит:
- CSS reset
- Шрифты (Google Fonts)
- Tailwind директивы
- Кастомные CSS классы

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Дизайн система

#### Цветовая палитра
- **Background**: `#000000`, `#0A0A0A`, `#1A1A1A`
- **Text**: `#FFFFFF`, `#E5E5E5`, `#A0A0A0`
- **Accent**: Градиенты (blue, green, purple, orange)

#### Типографика
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Code**: JetBrains Mono (monospace)

#### Spacing
- Базируется на Tailwind spacing scale (4px increments)

---

## Роутинг и навигация

### React Router

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<About />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/careers" element={<Careers />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/legal" element={<Legal />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</BrowserRouter>
```

### Навигационная структура

```
/                  → Главная страница (Hero + Sections)
/about             → О компании
/blog              → Блог
/careers           → Вакансии
/contact           → Контакты
/login             → Авторизация
/legal             → Юридическая информация
/dashboard         → Дашборд (защищенная страница)
```

---

## Сборка и деплой

### Vite конфигурация

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
})
```

### Команды

```bash
# Разработка
npm run dev       # Запуск dev-сервера на :3000

# Сборка
npm run build     # Prod сборка в /dist

# Предпросмотр
npm run preview   # Локальный просмотр prod сборки
```

### Процесс сборки

1. **TypeScript компиляция** → JavaScript
2. **CSS обработка** → TailwindCSS → PostCSS → Minified CSS
3. **Bundling** → Vite/Rollup → Optimized chunks
4. **Asset optimization** → Images, fonts, etc.

### Оптимизация

**Текущие оптимизации:**
- Tree-shaking неиспользуемого кода
- Code-splitting по роутам
- Минификация JS/CSS
- Compression (gzip)

**Рекомендации для улучшения:**
- Lazy loading компонентов
- Image optimization (WebP, lazy load)
- Дополнительный code-splitting
- CDN для статических ресурсов

---

## Performance метрики

### Текущие показатели

- **Initial bundle size**: ~1.09 MB (gzipped: ~295 KB)
- **CSS bundle size**: ~118 KB (gzipped: ~16.6 KB)
- **Dev server start**: ~200ms
- **Build time**: ~2.8s

### Предупреждения

```
⚠️ Some chunks are larger than 500 KB after minification
```

**Решение:**
- Использовать dynamic import() для code-splitting
- Настроить build.rollupOptions.output.manualChunks

---

## Архитектурные решения

### State Management

**Текущий подход:**
- React Context для языка (LanguageContext)
- Local state (useState, useReducer)
- useMemo для мемоизации

**Для масштабирования:**
- Рассмотреть Zustand / Redux для глобального state
- React Query для server state

### Паттерны

#### Composition over Inheritance
Компоненты построены через композицию:

```typescript
<Hero>
  <SearchBar />
  <CTAButtons />
</Hero>
```

#### Separation of Concerns
- UI компоненты отделены от бизнес-логики
- Переводы вынесены в отдельный контекст
- Стили управляются через Tailwind классы

#### DRY (Don't Repeat Yourself)
- Переиспользуемые UI компоненты (ui/)
- Общие иконки (Icons.tsx)
- Централизованные переводы

---

## Дальнейшие улучшения

### Краткосрочные (1-2 недели)
- [ ] Исправить lint ошибки в GeminiAdvisor.tsx
- [ ] Оптимизировать bundle size (code-splitting)
- [ ] Добавить E2E тесты (Playwright/Cypress)
- [ ] Улучшить SEO (meta tags, structured data)

### Среднесрочные (1-2 месяца)
- [ ] Добавить больше языков (ES, DE, FR)
- [ ] Реализовать Server-Side Rendering (SSR)
- [ ] Интеграция с real backend API
- [ ] Добавить аналитику (Google Analytics/Mixpanel)

### Долгосрочные (3+ месяца)
- [ ] Мобильное приложение (React Native)
- [ ] A/B тестирование
- [ ] Advanced персонализация
- [ ] Offline режим (PWA)

---

## Техническая документация

### Требования к окружению

```json
{
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

### Установка зависимостей

```bash
cd /Users/user/ai-01
npm install
```

### Переменные окружения

См. `.env.example` для списка необходимых переменных.

---

## Контакты и поддержка

Для вопросов по архитектуре фронтенда:
- Документация проекта: `/docs`
- Issues: GitHub Issues
- Email: dev@x100.ai

---

**Версия документа:** 1.0  
**Последнее обновление:** 2026-02-17  
**Автор:** X100 Development Team
