# ==============================================================================
# Stage 1: Build & Verify ShiftCore Full-Stack Governance Runtime
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy application source
COPY . .

# Run deterministic unit test suite (8/8 tests) and TypeScript verification during build
RUN npx tsx --test src/lib/runtimeEngine.test.ts
RUN npm run lint

# Build production frontend bundle into /app/dist
RUN npm run build

# ==============================================================================
# Stage 2: Full-Stack Production Runtime (Express API + Built SPA + Tier-3 Store)
# ==============================================================================
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV OLLAMA_HOST=http://localhost:11434
ENV OLLAMA_MODEL=qwen2.5-coder:7b
ENV OLLAMA_VERIFIER_MODEL=deepseek-coder:6.7b

# Copy package manifests and installed node_modules from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Copy verified production SPA assets and backend runtime source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src

# Ensure persistent Tier-3 Knowledge Store directory exists with clean permissions
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health > /dev/null || exit 1

CMD ["npm", "run", "start"]
