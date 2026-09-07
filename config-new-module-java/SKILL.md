---
name: config-new-module-java
stack: java
description: Criar módulo (Bounded Context) Java em packages/<bc>/ + apps/backend-java/modules/<bc>/ com camadas domain/application/infrastructure/interfaces. Usar quando o pedido envolver novo BC no backend Spring Boot Java.
---

# Config New Module (Java)

## Overview

Scaffold determinístico de um Bounded Context seguindo `java-namespace-layout.md`:

```
packages/customers/
  domain/entity/Customer.java
  domain/repository/CustomerRepository.java
  application/dto/CreateCustomerInput.java
  application/usecase/CreateCustomerUseCase.java

apps/backend-java/.../modules/customers/
  infrastructure/persistence/CustomerJpaEntity.java
  infrastructure/persistence/CustomerRepositoryAdapter.java
  interfaces/web/CustomerController.java
```

## Workflow

1. Confirmar workspace bootstrap (`config-project-java`).
2. Executar script com nome do BC (plural, kebab-case).
3. Opcional: `--entity=Customer` se o singular não for inferível.
4. Registrar dependência BC no `apps/backend-java/build.gradle`.
5. `./gradlew build`.

## Commands

```bash
node config-new-module-java/scripts/create-module-java.mjs customers --entity=Customer --group=com.example
```

## Stubs de implementação

O template gera use case e adapter como **stubs** (`UnsupportedOperationException("implement via ...")`), completados pelos skills de implementação da camada:

- `application/usecase/Create__Entity__UseCase.java` → `core-use-case-java`
- `infrastructure/persistence/__Entity__RepositoryAdapter.java` → `backend-data-java`

O controller já segue o contrato §5.1: devolve DTO (`Create__Entity__Output`), `201 Created` e `400 { "errors": [...] }` via `getErrorMessages()` quando o `Result` falhar.

## Resources

- `agents/openai.yaml`
- `scripts/create-module-java.mjs`
- `assets/module-template-java/`
- `../config-shared-core-java/references/java-namespace-layout.md`

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
