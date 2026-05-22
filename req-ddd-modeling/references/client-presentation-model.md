# Modelo de apresentação por BC (web / mobile)

Complemento ao modelo **tático de domínio** (backend). Não duplica aggregates do servidor — descreve **como o usuário interage** e o que o cliente precisa implementar (`frontend-*` / `mobile-*`).

**Fontes**: `delivery-inventory.md` (discovery) · rotas/telas do legado · decisões do `delivery-profile.md`.

---

## Princípios

| Regra | Motivo |
|-------|--------|
| Domínio canônico fica no **backend** | Uma fonte de verdade para regras de negócio |
| Cliente modela **leitura + comandos de UI** | Entidades frontend/mobile finas, use cases que orquestram repository HTTP |
| Não copiar EF/JPA no Vue/Android | Mapear **DTOs da API** → entidade de apresentação |
| Se Web/Mobile = **Não** no BC | Omitir seções abaixo neste BC |

---

## Template — colar em `ddd-tactical-model.md` por BC

### Quando **Web admin = Sim**

```markdown
#### Apresentação — Web admin

| Tela / rota | Persona | Ação principal | Endpoints API | Formulário? |
|-------------|---------|----------------|---------------|-------------|
| `/login` | operador | autenticar | POST /api/auth/login | Sim |
| `/users/permissions` | admin | editar permissões | GET/PUT /api/users/{id}/permissions | Sim |

**Navegação e shell**
- Menu: item "Usuários" visível se permissão `usuarios.gerenciar`
- Guard: rotas privadas exigem token; redirect `/login`

**Estado e erros**
- Token em store (Pinia/Vuex/signal store); refresh opcional
- Exibir mensagens de `Result`/HTTP 4xx no formulário

**Entidades de apresentação (cliente)**
| Entidade UI | Campos principais | Origem |
|-------------|-------------------|--------|
| AuthSession | token, userId, permissions[] | login response |
| UserPermissionEditor | userId, grants[] | GET permissions |

**Use cases de apresentação**
| Use case UI | Repository | Observação |
|-------------|------------|------------|
| LoginUseCase | IAuthRepository | não chamar fetch na Page |
| SavePermissionsUseCase | IUserPermissionsRepository | validação mínima no cliente |
```

### Quando **Mobile = Sim**

```markdown
#### Apresentação — Mobile

| Tela | Persona | Ação principal | Endpoints API | Formulário? |
|------|---------|----------------|---------------|-------------|
| `ProfileScreen` | vendedor | ver/editar perfil | GET/PUT /api/me | Parcial |

**Navegação**
- Bottom nav ou drawer: aba "Perfil"
- Deep link: n/a nesta release

**Estado**
- ViewModel/Notifier: `ProfileUiState` (loading, data, error)

**Entidades de apresentação (cliente)**
| Entidade UI | Campos | Origem |
|-------------|--------|--------|
| UserProfile | name, email, phone | GET /api/me |

**Use cases de apresentação**
| Use case UI | Repository |
|-------------|------------|
| LoadProfileUseCase | IProfileRepository |
| UpdateProfileUseCase | IProfileRepository |
```

---

## Ligação com o backlog (`req-agile-planning`)

Cada **User Story** com Web ou Mobile no `delivery-profile` deve ter no `backlog.md`:

1. Subseção **Telas e fluxos (web)** — copiar/resumir da tabela de rotas acima
2. Subseção **Telas e fluxos (mobile)** — idem
3. Tasks `interface:entity` → … alinhadas às entidades/use cases de apresentação listados

Critérios de aceitação podem citar rotas e comportamentos de guard/menu.
