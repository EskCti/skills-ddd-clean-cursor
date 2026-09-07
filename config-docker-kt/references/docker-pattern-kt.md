# Docker Pattern (Kotlin — Spring Boot)

## apps/backend-kt/Dockerfile

```dockerfile
# Stage 1: Builder — usa imagem Gradle com JDK
FROM gradle:8.8-jdk21-alpine AS builder
WORKDIR /app

# Cache de dependências
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY apps/backend-kt/build.gradle.kts ./apps/backend-kt/
COPY packages/shared/build.gradle.kts ./packages/shared/
RUN gradle dependencies --no-daemon || true

# Build da aplicação
COPY . .
RUN gradle :apps:backend-kt:bootJar --no-daemon -x test

# Stage 2: Runner — JRE enxuto
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/apps/backend-kt/build/libs/*.jar app.jar

EXPOSE 4000
ENTRYPOINT ["java", "-jar", "app.jar"]
```

> Para produção, adicionar flags JVM: `-Xms256m -Xmx512m -XX:+UseContainerSupport`

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

  backend-kt:
    build:
      context: .
      dockerfile: apps/backend-kt/Dockerfile
    ports:
      - "4000:4000"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## .dockerignore

```
.gradle
build
.env
.env.*
*.log
.git
out
```

## Checklist

- [ ] `bootJar` task configurado em `build.gradle.kts`
- [ ] `.dockerignore` criado na raiz
- [ ] Variáveis sensíveis via `.env`
- [ ] `docker build` testado localmente
- [ ] Imagem final < 300MB (JRE alpine + fat JAR)
- [ ] Considerar Spring Boot Layered JAR para cache de camadas
