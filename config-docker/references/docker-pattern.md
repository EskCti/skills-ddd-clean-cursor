# Docker Pattern (TypeScript — NestJS + Next.js)

## apps/backend/Dockerfile

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci --workspace=apps/backend

COPY apps/backend ./apps/backend
COPY packages ./packages
RUN npm run build --workspace=apps/backend

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
RUN npm ci --omit=dev

EXPOSE 4000
CMD ["node", "dist/main"]
```

## apps/web/Dockerfile

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm ci --workspace=apps/web

COPY apps/web ./apps/web
COPY packages ./packages

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/web

# Stage 2: Runner (standalone output)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

> Requer `output: 'standalone'` em `next.config.ts`.

## docker-compose.prod.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:4000
    depends_on:
      - backend

volumes:
  postgres_data:
```

## .dockerignore

```
node_modules
.next
dist
.env
.env.local
.env.*.local
*.log
.git
.turbo
coverage
```

## Checklist

- [ ] `output: 'standalone'` no `next.config.ts` do frontend
- [ ] `.dockerignore` criado na raiz
- [ ] Variáveis de ambiente sensíveis via `.env` (nunca hardcoded)
- [ ] `docker build` testado localmente para ambos
- [ ] Imagem final < 200MB (backend) e < 150MB (frontend)
