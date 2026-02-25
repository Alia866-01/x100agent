# ✅ Authentication - Production Ready

## 🎯 Architecture Overview

### Google OAuth Flow
```
USER → LoginPage (click "Google")
         ↓
   authService.loginWithGoogle()
         ↓
   authClient.signIn.social({ provider: 'google' })
         ↓
   Redirect to Google OAuth
         ↓
   User authorizes
         ↓
   Redirect to /auth/callback?neon_auth_session_verifier=...
         ↓
   AuthCallback component loads
         ↓
   authService.handleOAuthCallback()
         ↓
   authClient.getSession() → session.data.user + session.data.session
         ↓
   POST /api/users/sync (with auth_provider_id, email)
         ↓
   Backend checks: auth_provider_id exists? → Return user
                   email exists? → Update auth_provider_id, return user
                   New user? → Create tenant + user
         ↓
   Store: token, tenant_id, user in localStorage
         ↓
   Navigate to Dashboard ✅
```

### Email/Password Flow
```
USER → LoginPage/RegisterPage
         ↓
   authService.login() / register()
         ↓
   authClient.signIn.email() / signUp.email()
         ↓
   Neon Auth validates credentials
         ↓
   Returns JWT token + session
         ↓
   POST /api/users/sync
         ↓
   Create/update tenant + user in PostgreSQL
         ↓
   Store in localStorage → Dashboard ✅
```

---

## 📁 Files Structure

### ✅ Frontend (Clean)

```
lib/
  └─ authClient.ts          ← Neon SDK client (BetterAuthReactAdapter)
services/
  ├─ api.ts                 ← HTTP client with auth headers
  └─ authService.ts         ← OAuth + email auth + DB sync
contexts/
  └─ AuthContext.tsx        ← Auth state (user, tenant_id, isAuthenticated)
components/
  ├─ LoginPage.tsx          ← Google OAuth + email login
  ├─ RegisterPage.tsx       ← Google OAuth + email signup
  └─ AuthCallback.tsx       ← OAuth callback handler (NEW)
```

### ✅ Backend (Clean)

```
backend/api/
  ├─ users.py              ← User/tenant sync (NEW)
  ├─ agents.py             ← (unchanged)
  ├─ channels.py           ← (unchanged)
  ├─ integrations.py       ← (unchanged)
  └─ webhooks.py           ← (unchanged)
```

### ❌ Removed (Лишнее удалено)

```
❌ backend/api/auth.py      (custom auth - 360 строк)
❌ bcrypt dependency
❌ Custom JWT generation
❌ Password hashing logic
```

---

## 🔄 Auth Flow Details

### Google OAuth Login:
1. User clicks "Login with Google"
2. `authService.loginWithGoogle()` → `authClient.signIn.social({ provider: 'google', callbackURL: '/auth/callback' })`
3. Redirects to Google OAuth consent screen
4. User authorizes → redirects to `http://localhost:3000/auth/callback?neon_auth_session_verifier=...`
5. `AuthCallback.tsx` component mounts and calls `authService.handleOAuthCallback()`
6. Gets session: `session.data.user` (id, email, name) and `session.data.session` (token, expiresAt)
7. `POST /api/users/sync` with `auth_provider_id` and `email`
8. Backend checks:
   - User exists by `auth_provider_id`? → Return existing
   - User exists by `email`? → Update `auth_provider_id`, return user
   - New user? → Create tenant + user
9. Store: token, tenant_id, user in localStorage
10. Navigate to Dashboard

### Email/Password Registration:
1. User fills: email, password, company name
2. `authClient.signUp.email()` → Neon Auth
3. Neon Auth creates user, returns JWT
4. `POST /api/users/sync` creates:
   - Tenant record (company name)
   - User record (auth_provider_id = Neon Auth user.id)
5. Store: token, tenant_id, user in localStorage
6. Navigate to Dashboard

### Email/Password Login:
1. User fills: email, password
2. `authClient.signIn.email()` → Neon Auth
3. Neon Auth validates, returns JWT
4. `POST /api/users/sync` syncs user (if exists, returns existing)
5. Store: token, tenant_id, user in localStorage
6. Navigate to Dashboard

### Logout:
1. `authClient.signOut()` → Neon Auth
2. Clear localStorage (token, tenant_id, user)
3. Navigate to Landing

---

## 🗄️ Database Schema

### Tenants Table
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,              ← Company name
  plan_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ
);
```

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'member',      ← admin for first user
  auth_provider_id TEXT,           ← Neon Auth user.id
  created_at TIMESTAMPTZ
);
```

**Ключевое**: `auth_provider_id` вместо `password_hash` — пароли НЕ хранятся!

---

## 🔧 Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000
VITE_NEON_AUTH_URL=https://ep-bitter-tooth-ai9nnvdb.neonauth.c-4.us-east-1.aws.neon.tech/neondb/auth
```

### Backend (.env.local)
```env
DATABASE_URL=postgresql://...
NEON_AUTH_URL=https://ep-bitter-tooth-ai9nnvdb.neonauth.c-4.us-east-1.aws.neon.tech/neondb/auth
NEON_AUTH_JWKS_URL=https://.../.well-known/jwks.json
```

---

## ✅ Production Checklist

### Database
- [x] Schema applied: `psql $DATABASE_URL < schema.sql`
- [x] Tables exist: tenants, users
- [x] RLS enabled
- [x] Email-based user lookup added

### Backend
- [x] Dependencies installed: `pip install -r requirements.txt`
- [x] Environment configured: `.env.local`
- [x] No custom auth code (removed auth.py)
- [x] Users API with email fallback logic
- [x] OAuth callback handling

### Frontend
- [x] SDK installed: `@neondatabase/neon-js`
- [x] Auth client configured with BetterAuthReactAdapter
- [x] Environment: `VITE_NEON_AUTH_URL`
- [x] Google OAuth flow working
- [x] Email/password auth working
- [x] AuthCallback component for OAuth redirect
- [x] Session structure fixed (session.data.user/session.data.session)
- [x] UI визуал не изменен

---

## 🚀 Launch Commands

### 1. Start Backend
```bash
cd backend
source venv/bin/activate  # if needed
python -m backend.main
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger)
```

### 2. Start Frontend
```bash
npm run dev
# → http://localhost:3000
```

### 3. Test Flow
1. Open http://localhost:3000
2. Click "Login" → "Sign up"
3. Register: email + password + company name
4. Should create tenant + user in DB
5. Should redirect to Dashboard
6. Logout → Login with same credentials
7. Should login successfully

---

## ✅ Testing Results

- [x] Backend starts without errors
- [x] Frontend starts without errors
- [x] Can navigate to Login page
- [x] Can navigate to Register page
- [x] **Google OAuth works end-to-end**
  - [x] Redirects to Google consent screen
  - [x] Callback handled at /auth/callback
  - [x] Session extracted correctly (session.data structure)
  - [x] User synced to database
  - [x] Redirects to Dashboard
- [x] Email-based user lookup prevents duplicates
- [x] Register creates user in Neon Auth
- [x] Register creates tenant + user in DB
- [x] Register redirects to Dashboard
- [x] Logout clears session
- [x] Login works with existing user
- [x] Token stored in localStorage
- [x] tenant_id stored correctly
- [x] OAuth session structure handled (session.data.user/session.data.session)

---

## 🔍 Issues Solved

### ✅ Issue: OAuth callback not handled
**Cause**: No route or component at /auth/callback
**Solution**: Created AuthCallback.tsx component and added routing in App.tsx

### ✅ Issue: "Cannot read properties of undefined (reading 'id')"
**Cause**: Incorrect session structure - tried `session.user.id` but actual is `session.data.user.id`
**Solution**: Updated authService.ts to use `session.data.user` and `session.data.session`

### ✅ Issue: Duplicate key constraint "users_email_key"
**Cause**: User already existed with same email but different auth_provider_id
**Solution**: Added email-based lookup in backend/api/users.py that updates auth_provider_id

### 🔧 Common Issues

**Error: "VITE_NEON_AUTH_URL is not set"**
Fix: Restart frontend after adding env var

**Error: "Failed to sync user with database"**
Fix: Check backend is running, DATABASE_URL correct

**Error: "signUp.email is not a function"**
Fix: Check @neondatabase/neon-js installed correctly

---

## 📊 Code Quality

| Metric | Status |
|--------|--------|
| Custom auth removed | ✅ |
| Neon SDK integrated | ✅ |
| DB sync working | ✅ |
| Визуал не изменен | ✅ |
| Архитектура clean | ✅ |
| Ready for prod | ✅ |

---

## 📚 Related Documentation

- **[TRACTION.md](TRACTION.md)** - Full project roadmap and TODO tracking
- **[docs/ARCHITECTURE_DIAGRAM.md](docs/ARCHITECTURE_DIAGRAM.md)** - System architecture diagrams
- **[docs/QUICK_START.md](docs/QUICK_START.md)** - Setup and launch guide

---

**Created**: 2026-02-17
**Last Updated**: 2026-02-17
**Status**: ✅ Production Ready - OAuth Fully Functional
**Architecture**: Multi-tenant with Neon Auth + Google OAuth
