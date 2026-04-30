# skills-ddd-clean

Coleção de skills para agentes de IA com foco em **Domain-Driven Design (DDD)** e **Clean Architecture**, pensada para padronizar a arquitetura e a forma de implementação em múltiplos projetos.

Este repositório foi desenhado para ser reutilizado como **Git submodule** em outros repositórios, permitindo compartilhar a mesma base de skills entre times e produtos.

## Propósito

O objetivo é oferecer um conjunto de instruções reutilizáveis para agentes que cubra, de ponta a ponta:

- bootstrap do projeto e setup de monorepo com **TurboRepo**;
- modelagem de domínio com **Entidades**, **Value Objects** e **Domain Services**;
- camada de aplicação com **Use Cases**, **DTOs** e **Controllers**;
- persistência e integração com **Prisma**;
- leitura com **CQRS (Query side)**;
- padronização de nomenclatura e estrutura de código.

## Pilares Arquiteturais

As skills deste repositório seguem estes pilares:

- **Domain-Driven Design (DDD)**
- **Clean Architecture**
- **Separation of Concerns** entre domínio, aplicação, interface e infraestrutura
- **Padronização de contratos e nomenclatura** para previsibilidade do código
- **Reuso de decisões arquiteturais** em múltiplos repositórios

## Estrutura de Skills

Principais skills disponíveis neste repositório:

- `config-project`: inicialização de monorepo com TurboRepo (web + backend)
- `config-new-module`, `config-shared-core` e `config-shared-web`: scaffolding de módulos/pacotes e shell web compartilhado
- `config-prisma`: setup inicial e padronização de Prisma no backend (script `.js`)
- `config-auth-core-basic`: auth core básico TypeScript (user, password, application)
- `config-auth-core-full`: auth core completo TypeScript (basic + role, permission, oauth)
- `config-auth-backend-basic`: auth backend NestJS (JWT, Passport, Prisma adapters)
- `config-auth-web-basic`: auth web Next.js (sign-in, sign-up, dashboard, users, profile)
- `core-entity`: modelagem de entidades de domínio
- `core-value-object`: criação de objetos de valor
- `core-domain-service`: regras de domínio transversais
- `core-use-case`: orquestração de regras de aplicação
- `core-dto`: contratos de entrada/saída e projeções
- `core-repository`: contratos e implementações de persistência
- `backend-prisma-data`: schema/migrações/adapters Prisma
- `core-query-cqrs`: consultas de leitura no padrão CQRS
- `backend-controller`: camada HTTP/NestJS
- `frontend-form-schema`: formulários React Hook Form + validação

### Skills Kotlin (sufixo `-kt`)

- `config-project-kt`: bootstrap projeto Kotlin multi-módulo com Gradle + Spring Boot
- `config-shared-core-kt`: kernel compartilhado de domínio (Entity, VO, Result, UseCase)
- `config-jpa-kt`: setup JPA/Spring Data, Flyway, Docker Compose
- `config-new-module-kt`: criação de módulo Kotlin (package Gradle + módulo Spring Boot)
- `config-auth-core-basic-kt`: auth core básico Kotlin (user, password, application + testes)
- `config-auth-core-full-kt`: auth core completo Kotlin (basic + role, permission, oauth)
- `config-auth-backend-basic-kt`: auth backend Spring Boot (JWT, Security, JPA adapters, Flyway)
- `core-entity-kt`: entidades de domínio em Kotlin (data class, companion object, Result)
- `core-value-object-kt`: Value Objects em Kotlin (value class, data class)
- `core-domain-service-kt`: serviços de domínio puros em Kotlin
- `core-use-case-kt`: casos de uso em Kotlin (UseCase interface, suspend, Result)
- `core-dto-kt`: Data Transfer Objects em Kotlin (data class)
- `core-repository-kt`: contratos e implementações de repositório em Kotlin
- `core-query-cqrs-kt`: queries CQRS de leitura em Kotlin
- `backend-controller-kt`: controllers Spring Boot em Kotlin (@RestController)
- `backend-data-kt`: persistência JPA, Spring Data, migrations em Kotlin

### Skills C# (sufixo `-cs`)

- `config-project-cs`: bootstrap projeto .NET com solução (.sln) multi-projeto Clean Architecture
- `config-shared-core-cs`: kernel compartilhado (Entity, ValueObject, Result, IUseCase, IRepository)
- `config-efcore-cs`: setup Entity Framework Core, DbContext, Fluent API, migrations
- `config-db-seed-cs`: seeding de dados com EF Core (DataSeeder, seeds por módulo)
- `config-new-module-cs`: criação de módulo .NET (Core + Infrastructure + Backend controller)
- `config-auth-core-basic-cs`: auth core básico C# (User, Password, Login/Register use cases)
- `config-auth-core-full-cs`: auth core completo C# (basic + Role, Permission, RBAC)
- `config-auth-backend-basic-cs`: auth backend ASP.NET Core (JWT, BCrypt, Register/Login/Me)
- `core-entity-cs`: entidades de domínio em C# (Entity base, Result, Equals/GetHashCode)
- `core-value-object-cs`: Value Objects em C# (record, ValueObject base)
- `core-domain-service-cs`: serviços de domínio puros em C#
- `core-use-case-cs`: casos de uso em C# (IUseCase, async, Result)
- `core-dto-cs`: Data Transfer Objects em C# (record)
- `core-repository-cs`: contratos de repositório em C# (IRepository, Result)
- `core-query-cqrs-cs`: queries CQRS de leitura em C#
- `backend-controller-cs`: controllers ASP.NET Core ([ApiController], ActionResult)
- `backend-data-cs`: persistência EF Core, adapters, configurations

### Skills de Requisitos e Planejamento (agnóstico de linguagem)

Skills para análise de sistemas existentes, modelagem DDD e planejamento ágil:

- `req-discovery`: analisar sistema existente (**qualquer linguagem** — PHP, Go, Python, Java, etc.) via URL ou caminho local, documentando requisitos em DDD/Clean Architecture
- `req-ddd-modeling`: aplicar o **Roadmap DDD** (Estratégico → Tático → Operacional) sobre requisitos — subdomínios (Core/Supporting/Generic), bounded contexts com cardinalidade (1:1, 1:N, N:1), context map, linguagem ubíqua, padrões táticos (entities, VOs, domain events) e recomendação de topologia (monólito modular vs microserviços)
- `req-agile-planning`: organizar requisitos em épicos, stories e tasks DDD, com referência aos **skills TS/KT/CS deste repositório** para implementação

### Skills utilitárias (OpenSpec)

Também existem skills utilitárias para fluxo OpenSpec:

- `openspec-propose`
- `openspec-explore`
- `openspec-apply-change`
- `openspec-archive-change`

## Como usar como submódulo

Você pode instalar este repositório em `.agents` ou `.cloud`, conforme o runtime/agente utilizado no projeto.

### Opção A: pasta `.agents`

```bash
git submodule add <URL-DESTE-REPOSITORIO> .agents/skills
git submodule update --init --recursive
```

### Opção B: pasta `.cloud`

```bash
git submodule add <URL-DESTE-REPOSITORIO> .cloud/skills
git submodule update --init --recursive
```

## Atualizar skills no projeto consumidor

Para atualizar o ponteiro do submódulo para a versão mais recente:

```bash
# Exemplo com .agents
cd .agents/skills
git checkout main
git pull origin main
cd -

git add .agents/skills
git commit -m "chore(skills): atualiza submódulo skills-ddd-clean"
```

> Se o submódulo estiver em `.cloud`, ajuste o caminho nos comandos.

## Como contribuir com novas skills (a partir de outro projeto)

É possível evoluir as skills diretamente do repositório consumidor (onde o submódulo está instalado):

1. Entrar na pasta do submódulo.
2. Criar uma branch no repositório de skills.
3. Implementar/ajustar as skills.
4. Commitar e enviar para o remoto do repositório de skills.
5. Abrir PR e fazer merge.
6. Voltar ao projeto consumidor e atualizar o ponteiro do submódulo.

Exemplo:

```bash
cd .agents/skills
git checkout -b feat/nova-skill-ou-ajuste
# editar arquivos...
git add .
git commit -m "feat(skill): adiciona nova skill"
git push -u origin feat/nova-skill-ou-ajuste

# depois do merge no repo de skills
cd .agents/skills
git checkout main
git pull origin main
cd -
git add .agents/skills
git commit -m "chore(skills): aponta para nova versão"
```

## Configuração de namespace e padrões

O repositório possui configuração padrão em:

- `.env/skills.config.json`
- `.env/skills.config.example.json`

Use esses arquivos para alinhar namespace e convenções de scaffolding entre projetos.

Parâmetros principais disponíveis hoje:

- `namespace`: namespace dos packages (ex.: `@my-org`)
- `sharedModulePath`: caminho relativo completo do módulo shared (ex.: `packages/shared`, `packages/core/shared`)
- `frontendAppPath`: caminho relativo completo da app frontend (ex.: `apps/web`, `applications/front`)
- `backendAppPath`: caminho relativo completo da app backend (ex.: `apps/backend`, `services/api`)
- `frontendPort`: porta padrão da app frontend
- `backendPort`: porta padrão da app backend
- `frontendApiUrlEnvVar`: nome da env var de URL de API no frontend
- `backendPortEnvVar`: nome da env var de porta no backend
- `docsPath`: caminho relativo para documentação gerada (ex.: `docs`), usado por `req-discovery` e `req-agile-planning`

Convenção global de nomenclatura e padrões gerais:

- `skills-standards.md` (na raiz do repositório, ou `.agents/skills/skills-standards.md` quando usado como submódulo)

## Benefícios esperados

- consistência arquitetural entre projetos;
- menor tempo de setup e implementação;
- redução de divergências de naming e organização;
- evolução centralizada das práticas de DDD + Clean Architecture.
