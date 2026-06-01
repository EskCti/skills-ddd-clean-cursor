# Bootstrap contract — Java Gradle multi-module

Arquivos gerados por `project-init-java.mjs`:

| Arquivo | Propósito |
|---------|-----------|
| `settings.gradle` | Inclui `apps:backend-java`, `packages:shared` |
| `build.gradle` | Plugins Java 21, Spring Boot 3.3 |
| `gradle.properties` | JVM args, parallel |
| `packages/shared/` | Shared kernel pure Java |
| `apps/backend-java/` | Spring Boot app, porta 4000 |
| `docker-compose.yml` | Postgres 16 dev |
| `.env.example` | `DATABASE_URL`, `JWT_SECRET` |
| `modules/health/` | HealthController GET `/health` |

Idempotente: arquivos existentes são preservados (`[skip]`).
