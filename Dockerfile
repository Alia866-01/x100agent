# ===== Stage 1: Build frontend =====
FROM node:20-alpine AS build

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

RUN npm run build

# ===== Stage 2: Serve with nginx =====
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback — all routes return index.html
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml text/javascript image/svg+xml; \
    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; } \
    location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

RUN rm -f /etc/nginx/sites-enabled/default 2>/dev/null; true

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
