# Boas Práticas de Versionamento com OpenSpec

**Propósito**: Documentar estratégias e práticas recomendadas para versionamento de código usando OpenSpec e Skills.

---

## 🏗️ **Estratégias de Versionamento**

### **1. Versionamento por Bounded Context**
Cada BC tem seu próprio ciclo de versionamento independente.

```
BC-001: Auth
  ├── v1.0.0: Autenticação básica (email/senha)
  ├── v1.1.0: Refresh tokens
  └── v2.0.0: OAuth2 + Social login

BC-002: Products  
  ├── v1.0.0: CRUD básico
  ├── v1.1.0: Categorias + filtros
  └── v2.0.0: Inventário multi-armazém
```

### **2. Versionamento por Épico (OpenSpec)**
Cada épico gera uma versão incremental.

```
EP-001: Auth v1.0.0
  ├── Task 1: PasswordVO
  ├── Task 2: UserEntity
  └── Task 3: AuthController

EP-002: Auth v1.1.0  
  ├── Task 1: RefreshTokenVO
  ├── Task 2: TokenService
  └── Task 3: Refresh endpoint
```

### **3. Versionamento Semântico com OpenSpec**
Combine semantic versioning com épicos OpenSpec.

```
# SemVer: MAJOR.MINOR.PATCH
# OpenSpec: EP-XXX

v1.0.0 (EP-001) → Auth básica
v1.1.0 (EP-002) → Refresh tokens (backward compatible)
v2.0.0 (EP-005) → OAuth2 (breaking changes)
```

---

## 📦 **Estrutura de Versionamento**

### **Arquitetura de Diretórios**
```
openspec/
├── changes/
│   ├── archive/
│   │   ├── 2026-05-23-ep-001-auth/
│   │   │   ├── proposal.md
│   │   │   ├── tasks.md
│   │   │   └── changelog.md
│   │   └── 2026-05-25-ep-002-products/
│   │       ├── proposal.md
│   │       ├── tasks.md
│   │       └── changelog.md
│   └── active/
│       ├── ep-003-orders/
│       └── ep-004-crm/
└── releases/
    ├── v1.0.0/
    │   ├── manifest.json
    │   ├── changes.md
    │   └── rollback-plan.md
    └── v1.1.0/
        ├── manifest.json
        ├── changes.md
        └── rollback-plan.md
```

### **Manifest de Release**
```json
{
  "version": "v1.0.0",
  "release_date": "2026-05-23",
  "changes": [
    {
      "id": "EP-001",
      "title": "Auth básica",
      "description": "Autenticação com email/senha e JWT",
      "tasks_completed": 18,
      "bounded_contexts": ["Auth"],
      "breaking_changes": false
    },
    {
      "id": "EP-002", 
      "title": "Products CRUD",
      "description": "Gerenciamento básico de produtos",
      "tasks_completed": 16,
      "bounded_contexts": ["Products"],
      "breaking_changes": false
    }
  ],
  "dependencies": {
    "backend": "ASP.NET Core 8.0",
    "database": "PostgreSQL 16",
    "frontend": "Vue 3.4 + PrimeVue 4.0",
    "mobile": "Android 14 + Compose 1.6"
  },
  "rollback_target": "v0.9.0",
  "health_endpoints": [
    "/api/health",
    "/api/auth/health",
    "/api/products/health"
  ]
}
```

---

## 🔄 **Workflow de Versionamento com OpenSpec**

### **Fluxo Completo**
```
1. Análise de Requisitos (req-discovery)
   ↓
2. Modelagem DDD (req-ddd-modeling)  
   ↓
3. Planejamento Ágil (req-agile-planning)
   ↓
4. Proposta OpenSpec (openspec-propose)
   ↓
5. Validação de Dependências (openspec-validate-dependencies)
   ↓  
6. Implementação (openspec-apply-change)
   ↓
7. Testes e QA
   ↓
8. Code Review + Merge
   ↓
9. Arquivamento (openspec-archive-change)
   ↓
10. Tag de Release (git tag vX.Y.Z)
   ↓
11. Deploy para Staging
   ↓
12. Validação em Staging
   ↓
13. Deploy para Produção
   ↓
14. Monitoramento Pós-Deploy
```

### **Branch Strategy com OpenSpec**
```
main (production)
  ↑
release/v1.1.0 (staging)
  ↑  
develop (integration)
  ↑
feature/EP-003-orders (active development)
  ↑
openspec/changes/ep-003-orders/tasks.md
```

---

## 🏷️ **Convenções de Nomenclatura**

### **Tags Git**
```
# Formato: v{MAJOR}.{MINOR}.{PATCH}-{EPIC_ID}
v1.0.0-EP-001    # Release completo do EP-001
v1.1.0-EP-002    # Release completo do EP-002
v2.0.0-EP-005    # Major release com breaking changes

# Hotfixes
v1.0.1-hotfix-auth    # Patch para auth
v1.1.1-hotfix-products # Patch para products
```

### **Branches**
```
# Feature branches por épico
feature/EP-001-auth
feature/EP-002-products
feature/EP-003-orders

# Release branches  
release/v1.0.0
release/v1.1.0

# Hotfix branches
hotfix/v1.0.1-auth-token
hotfix/v1.1.1-products-price
```

### **Commits**
```
# Formato: {type}({scope}): {description} [{EPIC_ID}]

feat(auth): add refresh token endpoint [EP-001]
fix(products): correct price calculation [EP-002]
refactor(orders): extract domain service [EP-003]
test(auth): add unit tests for PasswordVO [EP-001]
docs: update API documentation [EP-002]
```

---

## 📊 **Versionamento Semântico com OpenSpec**

### **Regras para MAJOR (vX.0.0)**
- **Breaking changes** em APIs públicas
- **Mudanças arquiteturais** significativas
- **Remoção** de funcionalidades
- **Mudanças** em contratos de domínio

**Exemplo**: `v2.0.0` após `EP-005` que introduz OAuth2 e muda contratos de auth.

### **Regras para MINOR (v1.X.0)**
- **Novas funcionalidades** backward compatible
- **Melhorias** em funcionalidades existentes
- **Novos endpoints** API
- **Novas telas** frontend/mobile

**Exemplo**: `v1.1.0` após `EP-002` que adiciona refresh tokens.

### **Regras para PATCH (v1.0.X)**
- **Bug fixes** sem mudar comportamento público
- **Correções** de segurança
- **Melhorias** de performance não-visíveis
- **Atualizações** de dependências

**Exemplo**: `v1.0.1` após hotfix para token expiration.

---

## 🧩 **Integração com Skills**

### **Skills de Versionamento**
```yaml
# .agents/skills/openspec-release-manager/SKILL.md
versioning_strategies:
  - semantic: "MAJOR.MINOR.PATCH"
  - calendar: "YYYY.MM.DD"
  - epic_based: "EP-XXX"
  
release_artifacts:
  - changelog.md
  - manifest.json
  - rollback_plan.md
  - health_checks.yaml
```

### **Workflow Automatizado**
```yaml
# .github/workflows/release.yml
name: Release Management

on:
  workflow_dispatch:
    inputs:
      version_type:
        description: 'Type of version bump'
        required: true
        default: 'minor'
        type: choice
        options:
          - major
          - minor  
          - patch

jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Generate changelog from OpenSpec
        run: |
          ./scripts/generate-changelog.sh \
            --since $(git describe --tags --abbrev=0) \
            --to HEAD \
            --format markdown
            
      - name: Create release tag
        run: |
          git tag v${{ github.event.inputs.version_type }}
          git push origin v${{ github.event.inputs.version_type }}
```

---

## 📝 **Documentação de Releases**

### **Changelog.md**
```markdown
# Changelog

## [v1.1.0] - 2026-05-25

### Added
- **Auth**: Refresh token endpoint (`POST /api/auth/refresh`) [EP-001]
- **Products**: Category filtering (`GET /api/products?category=`) [EP-002]
- **Frontend**: Product listing pagination [EP-002]

### Changed  
- **Auth**: JWT token expiration extended to 24h [EP-001]
- **Products**: Price validation rules updated [EP-002]

### Fixed
- **Auth**: Token validation race condition [EP-001]
- **Products**: Stock calculation for variants [EP-002]

### Security
- Updated bcrypt to v5.0.1 for password hashing [EP-001]
```

### **Rollback Plan.md**
```markdown
# Rollback Plan v1.1.0 → v1.0.0

## Pre-Rollback Checklist
- [ ] Notify all users of maintenance window
- [ ] Backup current database state
- [ ] Document current system metrics
- [ ] Verify rollback target (v1.0.0) is stable

## Rollback Steps
1. **Database**:
   ```sql
   -- Revert EP-002 migrations
   DROP TABLE IF EXISTS product_categories;
   ALTER TABLE products DROP COLUMN category_id;
   ```

2. **Backend**:
   ```bash
   git checkout v1.0.0
   dotnet restore
   dotnet build
   ```

3. **Frontend**:
   ```bash
   cd apps/web-vue
   npm install
   npm run build
   ```

4. **Mobile**:
   ```bash
   cd apps/mobile-android
   ./gradlew assembleRelease
   ```

## Post-Rollback Verification
- [ ] API endpoints respond correctly
- [ ] Authentication works with v1.0.0 tokens
- [ ] Product data displays without categories
- [ ] System metrics within normal ranges
```

---

## 🔧 **Ferramentas de Versionamento**

### **Git Commands Otimizados**
```bash
# Criar release com tag
git flow release start v1.1.0
git flow release finish v1.1.0

# Hotfix workflow  
git flow hotfix start v1.0.1-auth-token
git flow hotfix finish v1.0.1-auth-token

# Verificar changes entre releases
git log --oneline v1.0.0..v1.1.0 --grep="\[EP-"
```

### **Scripts de Automação**
```bash
#!/bin/bash
# scripts/generate-release-notes.sh

# Extrair tasks completadas de OpenSpec
EPIC_ID=$1
TASKS_FILE="openspec/changes/$EPIC_ID/tasks.md"

# Gerar notas de release
echo "## Release Notes for $EPIC_ID"
echo ""
echo "### Tasks Completed:"
grep "^- \[x\]" "$TASKS_FILE" | sed 's/^- \[x\] //'
echo ""
echo "### Dependencies Updated:"
grep -E "dependencies:|Dependencies:" "$TASKS_FILE" | head -5
```

### **Integração CI/CD**
```yaml
# .github/workflows/version-check.yml
name: Version Consistency Check

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  check-versions:
    runs-on: ubuntu-latest
    steps:
      - name: Check OpenSpec vs Git tags
        run: |
          LATEST_TAG=$(git describe --tags --abbrev=0)
          ACTIVE_EPICS=$(ls openspec/changes/active/ | wc -l)
          
          if [ "$ACTIVE_EPICS" -gt 0 ] && [ "$LATEST_TAG" != "" ]; then
            echo "✅ Version consistency check passed"
          else
            echo "❌ Version inconsistency detected"
            exit 1
          fi
```

---

## 🚨 **Versionamento em Cenários Complexos**

### **Multi-Tenant SaaS**
```yaml
versioning_strategy:
  per_tenant: false  # Todos tenants mesma versão
  rollout_phases:
    - canary: "10% tenants"
    - beta: "50% tenants"  
    - general: "100% tenants"
  
feature_flags:
  enabled: true
  per_feature_rollout: true
```

### **Microservices**
```
# Versionamento independente por serviço
AuthService: v2.1.0
ProductsService: v1.3.0  
OrdersService: v3.0.0

# API Gateway version
Gateway: v1.5.0 (compatível com todos serviços)
```

### **Mobile Apps**
```yaml
mobile_versioning:
  android:
    version_code: 45  # Interno (inteiro)
    version_name: "1.1.0"  # Exibido
  ios:
    build_number: "2026.05.25.1"
    marketing_version: "1.1.0"
  
app_store_considerations:
  review_time: "24-48h"
  forced_updates: false
  backward_compatibility: "2 versões anteriores"
```

---

## 📈 **Métricas de Versionamento**

### **Velocidade de Entrega**
| Métrica | Alvo | Descrição |
|---------|------|-----------|
| **Lead Time** | ≤7 dias | Tempo do commit ao deploy |
| **Deployment Frequency** | ≥2/semana | Releases por semana |
| **Release Size** | ≤20 tasks | Tasks por release |

### **Qualidade de Releases**
| Métrica | Alvo | Descrição |
|---------|------|-----------|
| **Change Failure Rate** | ≤5% | % de releases com rollback |
| **Mean Time to Recovery** | ≤1h | Tempo para corrigir falhas |
| **Test Coverage** | ≥95% | Cobertura de testes |

### **Eficiência de Processo**
| Métrica | Alvo | Descrição |
|---------|------|-----------|
| **OpenSpec Adoption** | ≥90% | % de features via OpenSpec |
| **Task Completion Rate** | ≥95% | % de tasks completadas |
| **Cycle Time** | ≤3 dias | Tempo de proposta a arquivamento |

---

## 🛡️ **Versionamento Seguro**

### **Práticas de Segurança**
1. **Signed Commits**: Todos commits assinados com GPG
2. **Protected Branches**: `main` e `develop` protegidos
3. **Code Owners**: Review obrigatório por donos de módulo
4. **Security Scans**: SAST/DAST em cada release candidate

### **Compliance**
```yaml
compliance_requirements:
  gdpr:
    data_retention: "30 dias logs, 7 anos transações"
    user_data_deletion: "API endpoint implementado"
  pci_dss:
    card_data: "Nunca armazenado"
    encryption: "TLS 1.3 em todas conexões"
  hipaa:
    phi_data: "Criptografado em repouso e trânsito"
    audit_logs: "Retidos por 6 anos"
```

---

## 🔄 **Migração de Versões**

### **Plano de Migração**
```markdown
# Migration Plan v1.0.0 → v2.0.0

## Breaking Changes
1. **Auth API**: `/api/auth/login` now requires `tenant_id`
2. **Products API**: Price field changed from `decimal` to `MoneyVO`
3. **Database**: New `tenant_id` column in all tables

## Migration Steps
### Phase 1: Preparation
- [ ] Update database schema with backward compatibility
- [ ] Deploy v1.1.0 with feature flags disabled
- [ ] Run data migration scripts in background

### Phase 2: Transition  
- [ ] Enable feature flags for early adopters
- [ ] Monitor system stability and performance
- [ ] Gather user feedback

### Phase 3: Cutover
- [ ] Disable old API endpoints
- [ ] Remove backward compatibility code
- [ ] Archive v1.0.0 support
```

### **Script de Migração**
```sql
-- scripts/migrate-v1-to-v2.sql
BEGIN TRANSACTION;

-- Add tenant_id with default value
ALTER TABLE users ADD COLUMN tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE products ADD COLUMN tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000';

-- Create index for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_products_tenant_id ON products(tenant_id);

COMMIT;
```

---

## 📚 **Recursos e Referências**

### **Documentação Relacionada**
- [OpenSpec Task Template](../templates/openspec-task-template.yaml)
- [CI/CD Workflow](../workflows/openspec-ci-cd-workflow.md)
- [Validation Checklist](../checklists/openspec-phase-validation-checklist.md)

### **Ferramentas Recomendadas**
- **Git Flow**: Estruturado branching model
- **Semantic Release**: Versionamento automático
- **Conventional Commits**: Padrão de mensagens
- **Keep a Changelog**: Formato de changelog

### **Padrões de Indústria**
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

## 🎯 **Conclusão**

O versionamento com OpenSpec oferece uma abordagem estruturada e rastreável para gerenciamento de releases. Combinando:

1. **Versionamento Semântico** com épicos OpenSpec
2. **Integração Automatizada** com CI/CD pipelines  
3. **Documentação Completa** de cada release
4. **Planejamento de Rollback** para cada versão

Esta abordagem garante releases consistentes, rastreáveis e reversíveis, essenciais para sistemas SaaS multi-tenant como o RetailOps.

**Próximos passos**:
1. Implementar workflow de versionamento no CI/CD
2. Configurar geração automática de changelog
3. Estabelecer políticas de compatibilidade
4. Monitorar métricas de qualidade de releases