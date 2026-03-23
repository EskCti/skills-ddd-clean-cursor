# Kotlin Project Bootstrap Contract

## Goal

Padronizar o bootstrap de um projeto Kotlin com Clean Architecture para:

- `apps/backend-kt` (Spring Boot)
- `packages/shared` (Kotlin library — domínio puro, sem Spring)

## Steps Applied

1. Inicializar projeto Gradle (se ausente) com wrapper e `settings.gradle.kts`.
2. Configurar `build.gradle.kts` root com plugins Kotlin e Spring Boot (apply false).
3. Criar `apps/backend-kt/` com:
   - `build.gradle.kts` com dependências:
     - `spring-boot-starter-web`
     - `spring-boot-starter-data-jpa`
     - `spring-boot-starter-security`
     - `spring-boot-starter-validation`
     - `jackson-module-kotlin`
     - `kotlin-reflect`
     - `postgresql` (runtime)
     - `flyway-core` + `flyway-database-postgresql`
     - `spring-boot-starter-test` (test)
     - `project(":packages:shared")` (implementation)
   - `Application.kt` com `@SpringBootApplication` e `main`.
   - `config/CorsConfig.kt` com CORS para `http://localhost:3000`.
   - `application.yml` com datasource, JPA, Flyway, server port.
4. Criar `packages/shared/` com:
   - `build.gradle.kts` como biblioteca Kotlin pura (sem Spring).
   - Diretórios `src/main/kotlin` e `src/test/kotlin`.
5. Configurar `settings.gradle.kts` incluindo ambos os módulos.
6. Criar/atualizar `.gitignore` com patterns Kotlin/Gradle.
7. Criar/atualizar `.env` e `.env.example` com:
   - `DATABASE_URL=jdbc:postgresql://localhost:5432/appdb`
   - `DATABASE_USER=postgres`
   - `DATABASE_PASSWORD=postgres`
   - `JWT_SECRET=change-me`
   - `PORT=4000`
8. Criar `docker-compose.yml` com Postgres.
9. Validar build: `./gradlew build`.

## `.gitignore` esperado

```
.gradle/
build/
!gradle/wrapper/gradle-wrapper.jar
*.class
*.jar
*.war
*.log
.idea/
*.iml
.env
!.env.example
.DS_Store
```

## Dependência entre módulos

- `apps/backend-kt` depende de `packages/shared`:
  ```kotlin
  // apps/backend-kt/build.gradle.kts
  dependencies {
      implementation(project(":packages:shared"))
  }
  ```
- `packages/shared` é independente (sem dependências de framework).

## Application.kt mínimo

```kotlin
package com.example

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class Application

fun main(args: Array<String>) {
    runApplication<Application>(*args)
}
```

## CorsConfig.kt mínimo

```kotlin
package com.example.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class CorsConfig {
    @Bean
    fun corsConfigurer(): WebMvcConfigurer = object : WebMvcConfigurer {
        override fun addCorsMappings(registry: CorsRegistry) {
            registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true)
        }
    }
}
```

## Notes

- O setup é idempotente: pula etapas já atendidas.
- Kotlin JVM toolchain configurado para Java 21.
- Spring Boot version gerenciada no root `build.gradle.kts`.
- Módulos de domínio adicionais seguem o padrão `packages/<module>/`.
