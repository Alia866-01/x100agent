# ===== Stage 1: Build frontend =====
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY index.html index.tsx index.css vite.config.ts tsconfig.json postcss.config.js tailwind.config.js ./
COPY components/ ./components/
COPY contexts/ ./contexts/
COPY services/ ./services/
COPY lib/ ./lib/
COPY types/ ./types/
COPY types.ts App.tsx vite-env.d.ts ./
COPY public/ ./public/
COPY metadata.json ./metadata.json

ARG VITE_API_URL
ARG VITE_APP_URL
ARG VITE_NEON_AUTH_URL
ARG VITE_ENABLE_ANALYTICS=false
ARG VITE_ENABLE_STRIPE=false
ARG GEMINI_API_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_NEON_AUTH_URL=$VITE_NEON_AUTH_URL
ENV VITE_ENABLE_ANALYTICS=$VITE_ENABLE_ANALYTICS
ENV VITE_ENABLE_STRIPE=$VITE_ENABLE_STRIPE
ENV GEMINI_API_KEY=$GEMINI_API_KEY

RUN npm run build

# ===== Stage 2: Final image =====
FROM python:3.11-slim

# Install nginx + system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    build-essential \
    libpq-dev \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Backend code
COPY backend/ ./backend/

# Frontend build output
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Supervisor config — runs nginx + uvicorn
RUN cat > /etc/supervisor/conf.d/app.conf << 'EOF'
[supervisord]
nodaemon=true
user=root
logfile=/dev/stdout
logfile_maxbytes=0

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:backend]
command=uvicorn backend.main:app --host 127.0.0.1 --port 8000 --workers 2
directory=/app
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
EOF

# Fix nginx upstream: in single-container mode, backend is on localhost, not "backend" hostname
RUN sed -i 's|proxy_pass http://backend:8000|proxy_pass http://127.0.0.1:8000|g' /etc/nginx/conf.d/default.conf

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
    CMD curl -f http://localhost/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
