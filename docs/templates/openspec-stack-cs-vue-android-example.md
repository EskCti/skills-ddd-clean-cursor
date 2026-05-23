# Exemplo Prático: Stack C# + Vue + Android com OpenSpec

Este documento fornece exemplos concretos de tasks OpenSpec para a stack **ASP.NET Core + Vue 3 + Android (Kotlin Compose)** usada no projeto RetailOps.

## 📋 Estrutura de Tasks por Camada

### 1. **CAMADA DE DOMÍNIO (C#)**

#### Value Object - PasswordVO
```markdown
- [ ] `domain:vo` PasswordVO com hash bcrypt (~1h)
  - **Agent:** `Core Value Object (C#)`
  - **Prompt:** "Crie PasswordVO com Create() retornando Result<T> e hash bcrypt. Validações: mínimo 8 caracteres, máximo 100."
  - **Specs:** ["password-policy"]
  - **Dependencies:** []
```

#### Entidade - User
```markdown
- [ ] `domain:entity` User entity com Email, PasswordVO (~2h)
  - **Agent:** `Core Entity (C#)`
  - **Prompt:** "Aggregate root User com Email (VO) e PasswordVO. Regras: email único por tenant, status ativo/inativo."
  - **Specs:** ["user-management", "multi-tenancy"]
  - **Dependencies:** ["domain:vo"]
```

#### Serviço de Domínio - UserRegistrationService
```markdown
- [ ] `domain:service` UserRegistrationService (~2h)
  - **Agent:** `Core Domain Service (C#)`
  - **Prompt:** "UserRegistrationService valida regras de negócio para criação de usuário: email único, tenant ativo, trial não expirado."
  - **Specs:** ["user-registration"]
  - **Dependencies:** ["domain:entity"]
```

### 2. **CAMADA DE APLICAÇÃO (C#)**

#### Caso de Uso - RegisterUserUseCase
```markdown
- [ ] `app:usecase` RegisterUserUseCase (~3h)
  - **Agent:** `Core Use Case (C#)`
  - **Prompt:** "RegisterUserUseCase: orquestra UserRegistrationService + IUserRepository. Input: RegisterUserCommand. Output: UserRegisteredEvent."
  - **Specs:** ["user-registration", "cqrs-commands"]
  - **Dependencies:** ["domain:service", "domain:repository"]
```

#### DTO - RegisterUserDto
```markdown
- [ ] `app:dto` RegisterUserDto (~1h)
  - **Agent:** `Core DTO (C#)`
  - **Prompt:** "RegisterUserDto com campos: Email, Password, TenantId (opcional). Validações: DataAnnotations."
  - **Specs:** ["user-registration"]
  - **Dependencies:** []
```

#### Query - GetUserByIdQuery
```markdown
- [ ] `app:query` GetUserByIdQuery (~2h)
  - **Agent:** `Core Query CQRS (C#)`
  - **Prompt:** "GetUserByIdQuery + UserDetailsDto; projeção com TenantName; cache Redis opcional."
  - **Specs:** ["user-query", "cqrs-queries"]
  - **Dependencies:** ["domain:entity"]
```

### 3. **CAMADA DE INFRAESTRUTURA (C#)**

#### Repositório - UserEfRepository
```markdown
- [ ] `infra:persistence` UserEfRepository (~2h)
  - **Agent:** `Backend Data (C#)`
  - **Prompt:** "Implemente IUserRepository com EF Core. Mapeamentos Fluent API: User -> Users table, TenantId index."
  - **Specs:** ["user-persistence"]
  - **Dependencies:** ["domain:repository"]
```

#### Controller - AuthController
```markdown
- [ ] `interface:controller` AuthController (~2h)
  - **Agent:** `Backend Controller (C#)`
  - **Prompt:** "POST /api/auth/register: valida RegisterUserDto, executa RegisterUserUseCase, retorna 201 + JWT. Authorize: public."
  - **Specs:** ["auth-api", "jwt-authentication"]
  - **Dependencies:** ["app:usecase", "app:dto"]
```

### 4. **CAMADA DE APRESENTAÇÃO - VUE 3**

#### Entidade Frontend - AuthUser
```markdown
- [ ] `interface:entity` AuthUser entity Vue (~1h)
  - **Agent:** `Frontend Entity (Vue)`
  - **Prompt:** "Entidade AuthUser TypeScript pura com Result<T>. Campos: id, email, tenantId. Validações: email regex."
  - **Specs:** ["auth-web-ui"]
  - **Dependencies:** []
```

#### Caso de Uso Frontend - LoginUseCase
```markdown
- [ ] `interface:usecase` LoginUseCase Vue (~2h)
  - **Agent:** `Frontend UseCase (Vue)`
  - **Prompt:** "LoginUseCase injetando IAuthRepository. Retorna Promise<Result<AuthUser>>. Trata erros HTTP 401/403."
  - **Specs:** ["auth-web-ui"]
  - **Dependencies:** ["interface:entity"]
```

#### Repositório Frontend - AuthHttpRepository
```markdown
- [ ] `interface:repository` AuthHttpRepository Vue (~2h)
  - **Agent:** `Frontend Repository (Vue)`
  - **Prompt:** "IAuthRepository → /api/auth/login e /api/auth/register. Map DTO→AuthUser. Interceptor Bearer token."
  - **Specs:** ["auth-web-ui"]
  - **Dependencies:** ["interface:entity"]
```

#### Página - LoginView
```markdown
- [ ] `interface:page` LoginView Vue (~2h)
  - **Agent:** `Frontend Page (Vue)`
  - **Prompt:** "Página /login PrimeVue: InputText email/senha, Button submit. Injetar LoginUseCase. Redirecionar /dashboard após sucesso."
  - **Specs:** ["auth-web-ui"]
  - **Dependencies:** ["interface:usecase", "interface:repository"]
```

#### Formulário - RegisterForm
```markdown
- [ ] `interface:form-web` RegisterForm Vue (~2h)
  - **Agent:** `Frontend Form (Vue)`
  - **Prompt:** "Formulário /register vee-validate + PrimeVue. Campos: email, password, confirmPassword. Validações: match passwords, email único async."
  - **Specs:** ["auth-web-ui"]
  - **Dependencies:** ["interface:page"]
```

### 5. **CAMADA DE APRESENTAÇÃO - ANDROID (KOTLIN COMPOSE)**

#### Entidade Mobile - AuthUser
```markdown
- [ ] `interface:mobile-entity` AuthUser entity Android (~1h)
  - **Agent:** `Mobile Entity (Android)`
  - **Prompt:** "data class AuthUser Kotlin puro + sealed Result. Campos: id, email, tenantId. Espelha /api/auth/me."
  - **Specs:** ["auth-mobile"]
  - **Dependencies:** []
```

#### Caso de Uso Mobile - LoginUseCase
```markdown
- [ ] `interface:mobile-usecase` LoginUseCase Android (~2h)
  - **Agent:** `Mobile UseCase (Android)`
  - **Prompt:** "LoginUseCase suspend consumindo /api/auth/login. Input: LoginRequest. Output: Result<AuthUser>. Trata IOException."
  - **Specs:** ["auth-mobile"]
  - **Dependencies:** ["interface:mobile-entity"]
```

#### Repositório Mobile - AuthRepositoryImpl
```markdown
- [ ] `interface:mobile-repository` AuthRepositoryImpl Android (~2h)
  - **Agent:** `Mobile Repository (Android)`
  - **Prompt:** "IAuthRepository + Retrofit. Bearer interceptor. Map AuthResponseDto→AuthUser. Cache Room opcional."
  - **Specs:** ["auth-mobile"]
  - **Dependencies:** ["interface:mobile-entity"]
```

#### Tela - LoginScreen
```markdown
- [ ] `interface:mobile` LoginScreen Android (~3h)
  - **Agent:** `Mobile Screen (Android)`
  - **Prompt:** "LoginScreen Compose + ViewModel StateFlow. UI: OutlinedTextField email/senha, Button. Navegação para Home após login."
  - **Specs:** ["auth-mobile"]
  - **Dependencies:** ["interface:mobile-usecase", "interface:mobile-repository"]
```

### 6. **CAMADA DE TESTES**

#### Testes Unitários - Domínio
```markdown
- [ ] `test:unit` Testes domínio User e PasswordVO (~2h)
  - **Agent:** `Unit Tests (C#)`
  - **Prompt:** "xUnit + Moq: User.Create validações, PasswordVO hash. Coverlet ≥95% RetailOps.Identity.Core.Domain."
  - **Specs:** ["unit-testing"]
  - **Dependencies:** ["domain:entity", "domain:vo"]
```

#### Testes E2E - API Auth
```markdown
- [ ] `test:e2e` Testes API /auth/login e /auth/register (~3h)
  - **Agent:** `E2E Tests (C#)`
  - **Prompt:** "WebApplicationFactory: login válido/inválido, registro email duplicado, trial expirado. Status codes: 200, 400, 401, 403."
  - **Specs:** ["e2e-testing"]
  - **Dependencies:** ["interface:controller"]
```

#### Testes Unitários - Vue
```markdown
- [ ] `test:unit-web` Testes AuthUser entity Vue (~2h)
  - **Agent:** `Unit Tests (TypeScript)`
  - **Prompt:** "Vitest: AuthUser validações, Result success/failure. Coverage ≥95% apps/web-vue/src/modules/auth/domain."
  - **Specs:** ["vue-testing"]
  - **Dependencies:** ["interface:entity"]
```

#### Testes Unitários - Android
```markdown
- [ ] `test:unit-mobile` Testes AuthUser entity Android (~2h)
  - **Agent:** `Unit Tests (Kotlin)`
  - **Prompt:** "JUnit 5 + MockK: AuthUser data class, Result sealed class. Coverage ≥95% apps/mobile-android/domain."
  - **Specs:** ["android-testing"]
  - **Dependencies:** ["interface:mobile-entity"]
```

## 🎯 **Exemplo Completo: EP-001 Auth**

### Backlog do EP-001 (trecho)
```markdown
## EP-001: Auth e Usuários

**User Story 010**: Como usuário, quero fazer login com email e senha para acessar o sistema.
**Telas e fluxos (web)**: /login → validação → /dashboard
**Telas e fluxos (mobile)**: LoginScreen → validação → HomeScreen

**User Story 011**: Como administrador, quero gerenciar permissões de usuários.
**Telas e fluxos (web)**: /admin/users → lista → editar permissões
```

### Tasks OpenSpec Geradas
```markdown
## 1. Domínio — Auth (US-010)

- [ ] `domain:vo` PasswordVO com hash bcrypt (~1h)
  - **Agent:** `Core Value Object (C#)`
  - **Prompt:** "Crie PasswordVO com Create() retornando Result<T> e hash bcrypt. Validações: mínimo 8 caracteres, máximo 100."
  - **Specs:** ["password-policy"]

- [ ] `domain:entity` User entity com Email, PasswordVO (~2h)
  - **Agent:** `Core Entity (C#)`
  - **Prompt:** "Aggregate root User com Email (VO) e PasswordVO. Regras: email único por tenant, status ativo/inativo."
  - **Specs:** ["user-management", "multi-tenancy"]
  - **Dependencies:** ["domain:vo"]

## 2. Aplicação — Auth (US-010)

- [ ] `app:usecase` LoginUseCase (~3h)
  - **Agent:** `Core Use Case (C#)`
  - **Prompt:** "LoginUseCase: valida credenciais, verifica tenant ativo, emite JWT. Input: LoginCommand. Output: AuthResult."
  - **Specs:** ["user-authentication"]
  - **Dependencies:** ["domain:entity"]

## 3. Infraestrutura — Auth (US-010)

- [ ] `infra:persistence` UserEfRepository (~2h)
  - **Agent:** `Backend Data (C#)`
  - **Prompt:** "Implemente IUserRepository com EF Core. Mapeamentos: User -> Users, índice TenantId."
  - **Specs:** ["user-persistence"]
  - **Dependencies:** ["domain:repository"]

- [ ] `interface:controller` AuthController (~2h)
  - **Agent:** `Backend Controller (C#)`
  - **Prompt:** "POST /api/auth/login: valida LoginDto, executa LoginUseCase, retorna 200 + JWT ou 401."
  - **Specs:** ["auth-api"]
  - **Dependencies:** ["app:usecase"]

## 4. Frontend Vue — Auth (US-010)

- [ ] `interface:entity` AuthUser entity Vue (~1h)
  - **Agent:** `Frontend Entity (Vue)`
  - **Prompt:** "Entidade AuthUser TypeScript pura com Result<T>. Campos: id, email, tenantId."
  - **Specs:** ["auth-web-ui"]

- [ ] `interface:usecase` LoginUseCase Vue (~2h)
  - **Agent:** `Frontend UseCase (Vue)`
  - **Prompt:** "LoginUseCase injetando IAuthRepository. Retorna Promise<Result<AuthUser>>."
  - **Specs:** ["auth-web-ui"]
  - **Dependencies:** ["interface:entity"]

- [ ] `interface:repository` AuthHttpRepository Vue (~2h)
  - **Agent:** `Frontend Repository (Vue)`
  - **Prompt:** "IAuthRepository → /api/auth/login. Map AuthResponseDto→AuthUser."
  - **Specs:** ["auth-web-ui"]
  - **Dependencies:** ["interface:entity"]

- [ ] `interface:page` LoginView Vue (~2h)
  - **Agent:** `Frontend Page (Vue)`
  - **Prompt:** "Página /login PrimeVue: InputText email/senha, Button. Injetar LoginUseCase."
  - **Specs:** ["auth-web-ui"]
  - **Dependencies:** ["interface:usecase", "interface:repository"]

## 5. Mobile Android — Auth (US-010)

- [ ] `interface:mobile-entity` AuthUser entity Android (~1h)
  - **Agent:** `Mobile Entity (Android)`
  - **Prompt:** "data class AuthUser Kotlin puro + sealed Result. Espelha /api/auth/me."
  - **Specs:** ["auth-mobile"]

- [ ] `interface:mobile-usecase` LoginUseCase Android (~2h)
  - **Agent:** `Mobile UseCase (Android)`
  - **Prompt:** "LoginUseCase suspend consumindo /api/auth/login. Trata IOException."
  - **Specs:** ["auth-mobile"]
  - **Dependencies:** ["interface:mobile-entity"]

- [ ] `interface:mobile` LoginScreen Android (~3h)
  - **Agent:** `Mobile Screen (Android)`
  - **Prompt:** "LoginScreen Compose + ViewModel StateFlow. UI: OutlinedTextField, Button."
  - **Specs:** ["auth-mobile"]
  - **Dependencies:** ["interface:mobile-usecase"]

## 6. Testes

- [ ] `test:unit` Testes domínio User (~2h)
  - **Agent:** `Unit Tests (C#)`
  - **Prompt:** "xUnit + Moq: User.Create validações. Coverlet ≥95% RetailOps.Identity.Core.Domain."
  - **Specs:** ["unit-testing"]

- [ ] `test:e2e` Testes API /auth/login (~3h)
  - **Agent:** `E2E Tests (C#)`
  - **Prompt:** "WebApplicationFactory: login válido/inválido. Status codes: 200, 401."
  - **Specs:** ["e2e-testing"]
```

## 🔧 **Integração com Template Padronizado**

Este exemplo segue o [template padronizado](../templates/openspec-task-template.yaml) com:

1. **Prefixos padronizados**: `domain:vo`, `interface:controller`, etc.
2. **Agents específicos por stack**: `Core Value Object (C#)`, `Frontend Entity (Vue)`, etc.
3. **Prompts detalhados**: Incluem todos os requisitos e especificações
4. **Dependências explícitas**: Garantem ordem correta de implementação
5. **Specs consistentes**: Referenciam identificadores de especificação

## 📚 **Referências**

- [Template Padronizado para Tasks OpenSpec](../templates/openspec-task-template.yaml)
- [Tutorial 04 - Ciclo Completo OpenSpec](../04-ciclo-completo-openspec.md)
- [Stack C# + Vue + Android](../stacks/dotnet-cs-vue-android.md)
- [Skills Standards](../../skills-standards.md)