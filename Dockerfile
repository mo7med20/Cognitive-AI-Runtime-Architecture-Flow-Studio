# ==============================================================================
# Stage 1: Build & Verify the ShiftCore Calculator Runtime Studio
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy application source
COPY . .

# Run deterministic unit tests and TypeScript verification during image build
RUN npx tsx --test src/lib/runtimeEngine.test.ts
RUN npm run lint

# Build production bundle into /app/dist
RUN npm run build

# ==============================================================================
# Stage 2: Lightweight Production Nginx Runtime Image
# ==============================================================================
FROM nginx:1.27-alpine AS runtime

# Copy custom SPA Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy verified production build from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
