# Matriz Completa de Stacks Full-Stack

**Versão**: 1.1.0  
**Última atualização**: 2026-05-21  
**Status**: ✅ **COMPLETO**

> **Matriz canônica (orquestrador)**: [`config-project-fullstack/references/fullstack-stack-matrix.md`](../../config-project-fullstack/references/fullstack-stack-matrix.md) — inclui **Rust (Axum)**, **Java (Spring Boot)** e tutoriais [`rust-vue-flutter.md`](../tutorial/stacks/rust-vue-flutter.md), [`java-vue-flutter.md`](../tutorial/stacks/java-vue-flutter.md).

---

## 🎯 **Visão Geral**

Esta matriz documenta todas as combinações possíveis de stacks suportadas pelo sistema OpenSpec com Skills. Cada combinação tem seu próprio workflow, agents específicos e templates correspondentes.

### **Stacks Disponíveis**

| Categoria | Opções | Skills Correspondentes |
|-----------|--------|------------------------|
| **Backend** | C# (ASP.NET Core), TypeScript (NestJS), Kotlin (Spring Boot), **Java (Spring Boot)**, **Rust (Axum)** | `config-project-cs`, `config-project`, `config-project-kt`, **`config-project-java`**, **`config-project-rs`** |
| **Frontend Web** | Next.js, Angular + PrimeNG, Vue + PrimeVue | `config-shared-web`, `config-shared-web-angular`, `config-shared-web-vue` |
| **Mobile** | Android (Kotlin + Compose), Flutter (Dart) | `config-project-android`, `config-project-flutter` |

---

## 📊 **Matriz de Combinações Válidas**

### **1. Backend C# (ASP.NET Core)**

| Frontend | Mobile | Status | Skills Recomendadas | Exemplo de Projeto |
|----------|--------|--------|---------------------|-------------------|
| **Angular + PrimeNG** | Android | ✅ Suportado | `config-project-cs` + `config-project-angular` + `config-project-android` | RetailOps (atual) |
| **Angular + PrimeNG** | Flutter | ✅ Suportado | `config-project-cs` + `config-project-angular` + `config-project-flutter` | E-commerce B2B |
| **Angular + PrimeNG** | Nenhum | ✅ Suportado | `config-project-cs` + `config-project-angular` | Dashboard Admin |
| **Vue + PrimeVue** | Android | ✅ Suportado | `config-project-cs` + `config-project-vue` + `config-project-android` | App de Delivery |
| **Vue + PrimeVue** | Flutter | ✅ Suportado | `config-project-cs` + `config-project-vue` + `config-project-flutter` | App de Saúde |
| **Vue + PrimeVue** | Nenhum | ✅ Suportado | `config-project-cs` + `config-project-vue` | Portal Cliente |
| **Next.js** | Android | ⚠️ Parcial | `config-project-cs` + `config-project` + `config-project-android` | (Necessário adapter) |
| **Next.js** | Flutter | ⚠️ Parcial | `config-project-cs` + `config-project` + `config-project-flutter` | (Necessário adapter) |
| **Next.js** | Nenhum | ⚠️ Parcial | `config-project-cs` + `config-project` | (Necessário adapter) |

### **2. Backend TypeScript (NestJS)**

| Frontend | Mobile | Status | Skills Recomendadas | Exemplo de Projeto |
|----------|--------|--------|---------------------|-------------------|
| **Next.js** | Android | ✅ Suportado | `config-project` + `config-shared-web` + `config-project-android` | SaaS Platform |
| **Next.js** | Flutter | ✅ Suportado | `config-project` + `config-shared-web` + `config-project-flutter` | App Financeiro |
| **Next.js** | Nenhum | ✅ Suportado | `config-project` + `config-shared-web` | Startup MVP |
| **Angular + PrimeNG** | Android | ✅ Suportado | `config-project` + `config-project-angular` + `config-project-android` | ERP Corporativo |
| **Angular + PrimeNG** | Flutter | ✅ Suportado | `config-project` + `config-project-angular` + `config-project-flutter` | App Educacional |
| **Angular + PrimeNG** | Nenhum | ✅ Suportado | `config-project` + `config-project-angular` | Intranet |
| **Vue + PrimeVue** | Android | ✅ Suportado | `config-project` + `config-project-vue` + `config-project-android` | App de Turismo |
| **Vue + PrimeVue** | Flutter | ✅ Suportado | `config-project` + `config-project-vue` + `config-project-flutter` | App de Fitness |
| **Vue + PrimeVue** | Nenhum | ✅ Suportado | `config-project` + `config-project-vue` | E-commerce |

### **3. Backend Kotlin (Spring Boot)**

| Frontend | Mobile | Status | Skills Recomendadas | Exemplo de Projeto |
|----------|--------|--------|---------------------|-------------------|
| **Angular + PrimeNG** | Android | ✅ Suportado | `config-project-kt` + `config-project-angular` + `config-project-android` | App Bancário |
| **Angular + PrimeNG** | Flutter | ✅ Suportado | `config-project-kt` + `config-project-angular` + `config-project-flutter` | App de Seguros |
| **Angular + PrimeNG** | Nenhum | ✅ Suportado | `config-project-kt` + `config-project-angular` | Portal Governo |
| **Vue + PrimeVue** | Android | ✅ Suportado | `config-project-kt` + `config-project-vue` + `config-project-android` | App de Logística |
| **Vue + PrimeVue** | Flutter | ✅ Suportado | `config-project-kt` + `config-project-vue` + `config-project-flutter` | App de Agricultura |
| **Vue + PrimeVue** | Nenhum | ✅ Suportado | `config-project-kt` + `config-project-vue` | Plataforma SaaS |
| **Next.js** | Android | ⚠️ Parcial | `config-project-kt` + `config-project` + `config-project-android` | (Necessário adapter) |
| **Next.js** | Flutter | ⚠️ Parcial | `config-project-kt` + `config-project` + `config-project-flutter` | (Necessário adapter) |
| **Next.js** | Nenhum | ⚠️ Parcial | `config-project-kt` + `config-project` | (Necessário adapter) |

### **4. Backend Java (Spring Boot)**

| Frontend | Mobile | Status | Skills Recomendadas | Exemplo de Projeto |
|----------|--------|--------|---------------------|-------------------|
| **Vue + PrimeVue** | Flutter | ✅ Suportado | `config-project-java` + `config-project-vue` + `config-project-flutter` | Domínio puro Java + Spring |
| **Angular + PrimeNG** | Flutter | ✅ Suportado | `config-project-java` + `config-project-angular` + `config-project-flutter` | Enterprise Java |
| **Vue + PrimeVue** | Nenhum | ✅ Suportado | `config-project-java` + `config-project-vue` | Portal admin |
| **Nenhum** | Flutter | ✅ Suportado | `config-project-java` + `config-project-flutter` | API Java + mobile |

> API default `:4000`. Layout: `config-shared-core-java/references/java-namespace-layout.md`. Tutorial: [`java-vue-flutter.md`](../tutorial/stacks/java-vue-flutter.md).

### **5. Backend Rust (Axum + sqlx)**

| Frontend | Mobile | Status | Skills Recomendadas | Exemplo de Projeto |
|----------|--------|--------|---------------------|-------------------|
| **Vue + PrimeVue** | Flutter | ✅ Suportado | `config-project-rs` + `config-project-vue` + `config-project-flutter` | API performance + UI Vue |
| **Angular + PrimeNG** | Flutter | ✅ Suportado | `config-project-rs` + `config-project-angular` + `config-project-flutter` | Sistemas críticos |
| **Vue + PrimeVue** | Nenhum | ✅ Suportado | `config-project-rs` + `config-project-vue` | API-only + admin |
| **Nenhum** | Flutter | ✅ Suportado | `config-project-rs` + `config-project-flutter` | Backend Rust + app mobile |

> API default `:4000`. Layout: `config-shared-core-rs/references/rust-namespace-layout.md`. Tutorial: [`rust-vue-flutter.md`](../tutorial/stacks/rust-vue-flutter.md).

---

## 🔧 **Skills por Camada e Stack**

### **Domínio (Core)**

| Stack | Value Object | Entity | Domain Service | Repository Interface |
|-------|--------------|--------|----------------|----------------------|
| **C#** | `core-value-object-cs` | `core-entity-cs` | `core-domain-service-cs` | `core-repository-cs` |
| **TypeScript** | `core-value-object` | `core-entity` | `core-domain-service` | `core-repository` |
| **Kotlin** | `core-value-object-kt` | `core-entity-kt` | `core-domain-service-kt` | `core-repository-kt` |
| **Java** | `core-value-object-java` | `core-entity-java` | `core-domain-service-java` | `core-repository-java` |
| **Rust** | `core-value-object-rs` | `core-entity-rs` | `core-domain-service-rs` | `core-repository-rs` |

### **Aplicação (Application)**

| Stack | DTO | Use Case | Query (CQRS) |
|-------|-----|----------|--------------|
| **C#** | `core-dto-cs` | `core-use-case-cs` | `core-query-cqrs-cs` |
| **TypeScript** | `core-dto` | `core-use-case` | `core-query-cqrs` |
| **Kotlin** | `core-dto-kt` | `core-use-case-kt` | `core-query-cqrs-kt` |
| **Java** | `core-dto-java` | `core-use-case-java` | `core-query-cqrs-java` |
| **Rust** | `core-dto-rs` | `core-use-case-rs` | `core-query-cqrs-rs` |

### **Infraestrutura (Infrastructure)**

| Stack | Persistence | Migrations | Docker | CI/CD |
|-------|-------------|------------|--------|-------|
| **C#** | `backend-data-cs` | `config-efcore-cs` | `config-docker-cs` | `config-cicd-cs` |
| **TypeScript** | `backend-prisma-data` | `config-prisma` | `config-docker` | `config-cicd` |
| **Kotlin** | `backend-data-kt` | `config-jpa-kt` | `config-docker-kt` | `config-cicd-kt` |
| **Java** | `backend-data-java` | `config-jpa-java` | `config-docker-java` | `config-cicd-java` |
| **Rust** | `backend-data-rs` | `config-sqlx-rs` | `config-docker-rs` | `config-cicd-rs` |

### **Apresentação (Presentation)**

| Stack | Backend Controller | Frontend Entity | Frontend UseCase | Frontend Repository |
|-------|-------------------|-----------------|------------------|---------------------|
| **C#** | `backend-controller-cs` | `frontend-entity-angular` ou `frontend-entity-vue` | `frontend-usecase-angular` ou `frontend-usecase-vue` | `frontend-repository-angular` ou `frontend-repository-vue` |
| **TypeScript** | `backend-controller` | `frontend-entity-angular` ou `frontend-entity-vue` | `frontend-usecase-angular` ou `frontend-usecase-vue` | `frontend-repository-angular` ou `frontend-repository-vue` |
| **Kotlin** | `backend-controller-kt` | `frontend-entity-angular` ou `frontend-entity-vue` | `frontend-usecase-angular` ou `frontend-usecase-vue` | `frontend-repository-angular` ou `frontend-repository-vue` |
| **Java** | `backend-controller-java` | `frontend-entity-angular` ou `frontend-entity-vue` | `frontend-usecase-angular` ou `frontend-usecase-vue` | `frontend-repository-angular` ou `frontend-repository-vue` |
| **Rust** | `backend-controller-rs` | `frontend-entity-angular` ou `frontend-entity-vue` | `frontend-usecase-angular` ou `frontend-usecase-vue` | `frontend-repository-angular` ou `frontend-repository-vue` |

### **Mobile**

| Stack | Mobile Entity | Mobile UseCase | Mobile Repository | Mobile Screen |
|-------|---------------|----------------|-------------------|---------------|
| **Android** | `mobile-entity-android` | `mobile-usecase-android` | `mobile-repository-android` | `mobile-screen-android` |
| **Flutter** | `mobile-entity-flutter` | `mobile-usecase-flutter` | `mobile-repository-flutter` | `mobile-screen-flutter` |

### **Testes**

| Stack | Unit Tests | E2E Tests | Frontend Tests | Mobile Tests |
|-------|------------|-----------|----------------|--------------|
| **C#** | `test-unit-cs` | `test-e2e-cs` | `test-unit-web` (TypeScript) | `test-unit-mobile` (Kotlin) |
| **TypeScript** | `test-unit` | `test-e2e` | `test-unit-web` | `test-unit-mobile` (Kotlin) |
| **Kotlin** | `test-unit-kt` | `test-e2e-kt` | `test-unit-web` (TypeScript) | `test-unit-mobile` |
| **Java** | `test-unit-java` | `test-e2e-java` | `test-unit-web` (TypeScript) | `test-unit-mobile` |
| **Rust** | `test-unit-rs` | `test-e2e-rs` | `test-unit-web` (TypeScript) | `test-unit-mobile` |

---

## 🚀 **Workflows por Combinação**

### **Combinação 1: C# + Angular + Android**
```markdown
# Workflow: C# + Angular + Android

## Fase 1: Bootstrap
1. `config-project-cs` - Projeto ASP.NET Core
2. `config-project-angular` - Frontend Angular
3. `config-project-android` - Mobile Android

## Fase 2: Shared Core
4. `config-shared-core-cs` - Kernel compartilhado C#
5. `config-shared-web-angular` - Shell Angular

## Fase 3: Implementação por BC
6. `core-value-object-cs` → `core-entity-cs` → `core-use-case-cs`
7. `backend-data-cs` → `backend-controller-cs`
8. `frontend-entity-angular` → `frontend-usecase-angular` → `frontend-page-angular`
9. `mobile-entity-android` → `mobile-usecase-android` → `mobile-screen-android`

## Fase 4: Deploy
10. `config-docker-cs` - Docker para C#
11. `config-cicd-cs` - CI/CD para C#
```

### **Combinação 2: TypeScript + Next.js + Flutter**
```markdown
# Workflow: TypeScript + Next.js + Flutter

## Fase 1: Bootstrap
1. `config-project` - Monorepo TurboRepo (NestJS + Next.js)
2. `config-project-flutter` - Mobile Flutter

## Fase 2: Shared Core
3. `config-shared-core` - Kernel compartilhado TypeScript
4. `config-shared-web` - Shell Next.js

## Fase 3: Implementação por BC
5. `core-value-object` → `core-entity` → `core-use-case`
6. `backend-prisma-data` → `backend-controller`
7. `frontend-form-schema` → (Next.js usa React Hook Form)
8. `mobile-entity-flutter` → `mobile-usecase-flutter` → `mobile-screen-flutter`

## Fase 4: Deploy
9. `config-docker` - Docker para TypeScript
10. `config-cicd` - CI/CD para TypeScript
```

### **Combinação 4: Rust + Vue + Flutter**
```markdown
# Workflow: Rust (Axum) + Vue + Flutter

## Fase 1: Bootstrap
1. `config-project-rs` - Workspace Cargo (shared-kernel + api)
2. `config-sqlx-rs` - Migrations Postgres
3. `config-project-vue` - Frontend Vue
4. `config-project-flutter` - Mobile Flutter

## Fase 2: Shared Core
5. `config-shared-core-rs` - Kernel Rust
6. `config-shared-web-vue` - Shell Vue

## Fase 3: Implementação por BC
7. `config-new-module-rs` → `core-value-object-rs` → `core-entity-rs` → `core-domain-service-rs`
8. `core-repository-rs` → `core-use-case-rs` → `backend-data-rs` → `backend-controller-rs`
9. `frontend-entity-vue` → `frontend-usecase-vue` → `frontend-page-vue`
10. `mobile-entity-flutter` → `mobile-usecase-flutter` → `mobile-screen-flutter`

## Fase 4: Deploy
11. `config-docker-rs` - Docker multi-stage
12. `config-cicd-rs` - CI (clippy, test, coverage ≥95%)
```

> Detalhes: [`docs/tutorial/stacks/rust-vue-flutter.md`](../tutorial/stacks/rust-vue-flutter.md) · tasks OpenSpec: [`openspec-rust-task-examples.md`](../templates/openspec-rust-task-examples.md)

### **Combinação 4B: Java + Vue + Flutter**
```markdown
# Workflow: Java (Spring Boot) + Vue + Flutter

## Fase 1: Bootstrap
1. `config-project-java` - Gradle multi-module (packages/ + backend-java)
2. `config-jpa-java` - Flyway + JPA
3. `config-project-vue` - Frontend Vue
4. `config-project-flutter` - Mobile Flutter

## Fase 2: Shared Core
5. `config-shared-core-java` - Kernel Java (packages/shared)
6. `config-shared-web-vue` - Shell Vue

## Fase 3: Implementação por BC
7. `config-new-module-java` → `core-value-object-java` → `core-entity-java` → `core-domain-service-java`
8. `core-repository-java` → `core-use-case-java` → `backend-data-java` → `backend-controller-java`
9. `frontend-entity-vue` → `frontend-usecase-vue` → `frontend-page-vue`
10. `mobile-entity-flutter` → `mobile-usecase-flutter` → `mobile-screen-flutter`

## Fase 4: Deploy
11. `config-docker-java` - Docker multi-stage
12. `config-cicd-java` - CI (JaCoCo ≥95% domain+application)
```

> Detalhes: [`docs/tutorial/stacks/java-vue-flutter.md`](../tutorial/stacks/java-vue-flutter.md) · tasks OpenSpec: [`openspec-java-task-examples.md`](../templates/openspec-java-task-examples.md)

---

### **Combinação 3: Kotlin + Vue + Ambos Mobile**
```markdown
# Workflow: Kotlin + Vue + Android + Flutter

## Fase 1: Bootstrap
1. `config-project-kt` - Backend Spring Boot
2. `config-project-vue` - Frontend Vue
3. `config-project-android` - Mobile Android
4. `config-project-flutter` - Mobile Flutter

## Fase 2: Shared Core
5. `config-shared-core-kt` - Kernel compartilhado Kotlin
6. `config-shared-web-vue` - Shell Vue

## Fase 3: Implementação por BC
7. `core-value-object-kt` → `core-entity-kt` → `core-use-case-kt`
8. `backend-data-kt` → `backend-controller-kt`
9. `frontend-entity-vue` → `frontend-usecase-vue` → `frontend-page-vue`
10. `mobile-entity-android` → `mobile-usecase-android` → `mobile-screen-android`
11. `mobile-entity-flutter` → `mobile-usecase-flutter` → `mobile-screen-flutter`

## Fase 4: Deploy
12. `config-docker-kt` - Docker para Kotlin
13. `config-cicd-kt` - CI/CD para Kotlin
```

---

## 📋 **Templates por Stack**

### **Templates C#**
| Template | Localização | Descrição |
|----------|-------------|-----------|
| **Task Examples C#** | `templates/openspec-csharp-task-examples.md` | Exemplos de tasks para stack C# |
| **Entity Template C#** | `templates/csharp-entity-template.cs` | Template para entidades C# |
| **DTO Template C#** | `templates/csharp-dto-template.cs` | Template para DTOs C# |

### **Templates TypeScript**
| Template | Localização | Descrição |
|----------|-------------|-----------|
| **Task Examples TS** | `templates/openspec-typescript-task-examples.md` | Exemplos de tasks para TypeScript |
| **Entity Template TS** | `templates/typescript-entity-template.ts` | Template para entidades TypeScript |
| **DTO Template TS** | `templates/typescript-dto-template.ts` | Template para DTOs TypeScript |

### **Templates Kotlin**
| Template | Localização | Descrição |
|----------|-------------|-----------|
| **Task Examples KT** | `templates/openspec-kotlin-task-examples.md` | Exemplos de tasks para Kotlin |
| **Entity Template KT** | `templates/kotlin-entity-template.kt` | Template para entidades Kotlin |
| **DTO Template KT** | `templates/kotlin-dto-template.kt` | Template para DTOs Kotlin |

### **Templates Frontend**
| Framework | Template | Localização |
|-----------|----------|-------------|
| **Angular** | Component Template | `templates/angular-component-template.ts` |
| **Vue** | Component Template | `templates/vue-component-template.vue` |
| **Next.js** | Page Template | `templates/nextjs-page-template.tsx` |

### **Templates Mobile**
| Framework | Template | Localização |
|-----------|----------|-------------|
| **Android** | Screen Template | `templates/android-screen-template.kt` |
| **Flutter** | Screen Template | `templates/flutter-screen-template.dart` |

---

## 🔄 **Mapeamento Artefato → Skill (Todas as Stacks)**

### **Domínio C#**
| Artefato | Skill | Prompt Exemplo |
|----------|-------|----------------|
| Value Object | `core-value-object-cs` | "Criar EmailVO com validação RFC 5322" |
| Entity | `core-entity-cs` | "Criar aggregate root User" |
| Domain Service | `core-domain-service-cs` | "Criar PasswordService com hash bcrypt" |

### **Domínio TypeScript**
| Artefato | Skill | Prompt Exemplo |
|----------|-------|----------------|
| Value Object | `core-value-object` | "Criar Email value object" |
| Entity | `core-entity` | "Criar User entity com validações" |
| Domain Service | `core-domain-service` | "Criar PasswordService" |

### **Domínio Kotlin**
| Artefato | Skill | Prompt Exemplo |
|----------|-------|----------------|
| Value Object | `core-value-object-kt` | "Criar EmailVO Kotlin" |
| Entity | `core-entity-kt` | "Criar User entity Kotlin" |
| Domain Service | `core-domain-service-kt` | "Criar PasswordService Kotlin" |

### **Frontend Angular**
| Artefato | Skill | Prompt Exemplo |
|----------|-------|----------------|
| Entity | `frontend-entity-angular` | "Criar User entity Angular" |
| UseCase | `frontend-usecase-angular` | "Criar AuthService Angular" |
| Page | `frontend-page-angular` | "Criar LoginComponent Angular" |

### **Frontend Vue**
| Artefato | Skill | Prompt Exemplo |
|----------|-------|----------------|
| Entity | `frontend-entity-vue` | "Criar User entity Vue" |
| UseCase | `frontend-usecase-vue` | "Criar AuthService Vue" |
| Page | `frontend-page-vue` | "Criar LoginPage Vue" |

### **Mobile Android**
| Artefato | Skill | Prompt Exemplo |
|----------|-------|----------------|
| Entity | `mobile-entity-android` | "Criar User data class Android" |
| UseCase | `mobile-usecase-android` | "Criar AuthUseCase Android" |
| Screen | `mobile-screen-android` | "Criar LoginScreen Android" |

### **Mobile Flutter**
| Artefato | Skill | Prompt Exemplo |
|----------|-------|----------------|
| Entity | `mobile-entity-flutter` | "Criar User class Flutter" |
| UseCase | `mobile-usecase-flutter` | "Criar AuthUseCase Flutter" |
| Screen | `mobile-screen-flutter` | "Criar LoginScreen Flutter" |

---

## 🚨 **Considerações de Compatibilidade**

### **Compatibilidade Backend-Frontend**
| Backend | Frontend Compatível | Protocolo | Observações |
|---------|---------------------|-----------|-------------|
| **C#** | Angular, Vue | REST/GraphQL | Melhor integração com Angular |
| **TypeScript** | Next.js, Angular, Vue | REST/GraphQL | Universal (todas) |
| **Kotlin** | Angular, Vue | REST/GraphQL | Melhor com Angular |

### **Compatibilidade Backend-Mobile**
| Backend | Mobile Compatível | Protocolo | Observações |
|---------|-------------------|-----------|-------------|
| **C#** | Android, Flutter | REST | Suporte nativo Android melhor |
| **TypeScript** | Android, Flutter | REST/GraphQL | Universal |
| **Kotlin** | Android, Flutter | REST | Nativo Android excelente |

### **Considerações de Performance**
| Combinação | Backend Perf | Frontend Perf | Mobile Perf | Recomendação |
|------------|--------------|---------------|-------------|--------------|
| **C# + Angular + Android** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Enterprise |
| **TypeScript + Next.js + Flutter** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Startup/SaaS |
| **Kotlin + Vue + Ambos** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Corporativo |

---

## 📈 **Recomendações por Caso de Uso**

### **Enterprise Corporativo**
- **Stack**: C# + Angular + Android
- **Justificativa**: Performance, segurança, suporte Microsoft
- **Skills**: `config-project-cs`, `config-project-angular`, `config-project-android`

### **Startup/SaaS**
- **Stack**: TypeScript + Next.js + Flutter
- **Justificativa**: Velocidade, custo, multiplataforma
- **Skills**: `config-project`, `config-shared-web`, `config-project-flutter`

### **App Mobile-First**
- **Stack**: Kotlin + Vue + Ambos Mobile
- **Justificativa**: Performance mobile, UI moderna
- **Skills**: `config-project-kt`, `config-project-vue`, `config-project-android`, `config-project-flutter`

### **Legacy Modernization**
- **Stack**: C# + Vue + Flutter
- **Justificativa**: Migração gradual, UI moderna
- **Skills**: `config-project-cs`, `config-project-vue`, `config-project-flutter`

---

## 🔧 **Configuração de Ambiente**

### **Requisitos por Stack**
| Stack | Runtime | SDK | Extras |
|-------|---------|-----|--------|
| **C#** | .NET 8+ | .NET SDK | Visual Studio / Rider |
| **TypeScript** | Node.js 18+ | npm/yarn/pnpm | VS Code |
| **Kotlin** | JVM 17+ | JDK 17+ | IntelliJ IDEA |
| **Angular** | Node.js 18+ | Angular CLI | - |
| **Vue** | Node.js 18+ | Vue CLI / Vite | - |
| **Android** | Android SDK | Kotlin 1.9+ | Android Studio |
| **Flutter** | Flutter 3+ | Dart 3+ | VS Code / Android Studio |

### **Script de Setup**
```bash
#!/bin/bash
# setup-fullstack-environment.sh

# Verificar requisitos
check_requirements() {
    echo "Verificando requisitos para todas as stacks..."
    
    # C#
    if command -v dotnet &> /dev/null; then
        echo "✅ .NET SDK instalado"
    else
        echo "❌ .NET SDK não encontrado"
    fi
    
    # TypeScript
    if command -v node &> /dev/null; then
        echo "✅ Node.js instalado"
    else
        echo "❌ Node.js não encontrado"
    fi
    
    # Kotlin
    if command -v java &> /dev/null; then
        echo "✅ Java instalado"
    else
        echo "❌ Java não encontrado"
    fi
    
    # Docker
    if command -v docker &> /dev/null; then
        echo "✅ Docker instalado"
    else
        echo "❌ Docker não encontrado"
    fi
}

# Instalar ferramentas por stack
install_tools() {
    echo "Instalando ferramentas por stack..."
    
    # C# tools
    echo "Instalando ferramentas C#..."
    dotnet tool install -g dotnet-ef
    
    # TypeScript tools
    echo "Instalando ferramentas TypeScript..."
    npm install -g typescript ts-node
    
    # Angular tools
    echo "Instalando ferramentas Angular..."
    npm install -g @angular/cli
    
    # Vue tools
    echo "Instalando ferramentas Vue..."
    npm install -g @vue/cli
    
    # Flutter tools
    echo "Instalando ferramentas Flutter..."
    # (Instruções específicas para Flutter)
}
```

---

## 🎉 **Conclusão**

### **Status de Suporte**
✅ **C# + Angular + Android** - Suporte completo  
✅ **C# + Vue + Android/Flutter** - Suporte completo  
✅ **TypeScript + Next.js + Android/Flutter** - Suporte completo  
✅ **Kotlin + Angular/Vue + Android/Flutter** - Suporte completo  
✅ **Rust (Axum) + Vue/Angular + Flutter** - Suporte completo  
⚠️ **Combinações com Next.js + C#/Kotlin** - Suporte parcial (necessário adapter)

### **Próximos Passos**
1. **Criar adapters** para combinações parciais
2. **Expandir templates** para todas as stacks
3. **Documentar exemplos** específicos por combinação
4. **Implementar testes** de integração entre stacks

### **Recomendação Final**
O sistema OpenSpec com Skills está **pronto para todas as combinações principais** de stacks. Para combinações específicas do seu projeto, basta seguir a matriz acima e usar os skills correspondentes.

**Última atualização**: 2026-05-23  
**Próxima revisão**: 2026-06-23