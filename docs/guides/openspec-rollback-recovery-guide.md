# Guia de Rollback e Recuperação de Falhas no Ciclo OpenSpec

**Versão**: 1.0.0  
**Última atualização**: 2026-05-23  
**Aplicável para**: Stack C# + Vue + Android  
**Complexidade**: ⭐⭐⭐ (Média)

---

## 🎯 **Visão Geral**

Este guia descreve estratégias e procedimentos para rollback e recuperação de falhas durante o ciclo de desenvolvimento com OpenSpec e Skills. O foco é garantir a continuidade do desenvolvimento mesmo quando tasks individuais ou bounded contexts inteiros encontram problemas.

### **Princípios Fundamentais**
1. **Fail Fast, Recover Faster**: Identifique falhas rapidamente e tenha procedimentos de recuperação pré-definidos
2. **Isolation by Design**: Tasks devem ser isoladas para minimizar impacto de falhas
3. **Version Everything**: Todas as mudanças devem ser versionadas e rastreáveis
4. **Automated Recovery**: Sempre que possível, automatize os procedimentos de recuperação

---

## 🔄 **Tipos de Falhas e Estratégias de Recuperação**

### **1. Falhas em Tasks Individuais**

#### **Sintomas**
- Task falha durante execução do skill
- Erros de compilação/validação não detectados previamente
- Dependências quebradas após mudanças em outras tasks

#### **Estratégia de Recuperação**
```bash
# 1. Identificar a task problemática
./scripts/validate-advanced-dependencies.sh --identify-failed-task

# 2. Reverter mudanças específicas da task
git checkout --path/to/failed-task/files

# 3. Marcar task como falha no OpenSpec
# No arquivo .openspec.md:
- [!] `domain:entity:User` Falha na criação da entidade User (~2h)
  **Erro**: "Validation failed for email format"
  **Ação**: Revisar regras de validação do EmailVO

# 4. Criar task de correção
- [ ] `domain:vo:Email` Corrigir validação de formato de email (~1h)
  **Agent**: `Core Value Object (C#)`
  **Prompt**: "Corrigir validação de EmailVO para aceitar formatos internacionais"
  **Dependências**: Nenhuma
```

### **2. Falhas em Cadeias de Dependências**

#### **Sintomas**
- Múltiplas tasks falham simultaneamente
- Erros em cascata após mudança em task base
- Inconsistências entre camadas (ex: DTO não compatível com Entity)

#### **Estratégia de Recuperação**
```bash
# 1. Validar toda a cadeia de dependências
./scripts/validate-advanced-dependencies.sh --full-chain --strict

# 2. Identificar o ponto de falha inicial
# Saída do script mostrará:
# ❌ BREAKING: `domain:vo:Email` (layer 1) depende de `app:dto:UserRequest` (layer 4)
#    → Violação de ordem Clean Architecture

# 3. Reverter para último estado estável
git reset --hard $(git log --oneline --grep="OPENSPEC:BC-001" | head -1 | cut -d' ' -f1)

# 4. Reaplicar tasks em ordem correta
# Usar script de correção automática:
./scripts/fix-dependencies.sh --reorder-tasks BC-001-auth.openspec.md
```

### **3. Falhas em Bounded Contexts Completos**

#### **Sintomas**
- BC inteiro com problemas de integração
- Incompatibilidade com outros BCs
- Performance degradada após deploy

#### **Estratégia de Recuperação**
```yaml
# Estratégia: Feature Flags + Rollback Gradual
rollback_strategy:
  phase_1:
    action: "enable_feature_flag"
    target: "BC-001-auth"
    value: false
    duration: "5min"
    
  phase_2:
    action: "revert_database_changes"
    script: "./scripts/rollback/db-rollback-bc001.sql"
    
  phase_3:
    action: "revert_code_changes"
    commit: "last_stable_bc001"
    
  phase_4:
    action: "notify_team"
    channels: ["slack#alerts", "email"]
```

---

## 🛠️ **Scripts de Rollback Automatizados**

### **1. Script de Rollback por Task**
```bash
#!/bin/bash
# scripts/rollback/task-rollback.sh

TASK_ID="$1"
OPENSPEC_FILE="$2"

echo "Iniciando rollback da task: $TASK_ID"
echo "Arquivo OpenSpec: $OPENSPEC_FILE"

# 1. Extrair arquivos modificados pela task
FILES_MODIFIED=$(grep -A5 "^- \[.\] \`$TASK_ID\`" "$OPENSPEC_FILE" | grep "Entregáveis:" -A10 | grep "- \[ \] " | sed 's/- \[ \] //g')

# 2. Reverter cada arquivo
for file in $FILES_MODIFIED; do
    if [ -f "$file" ]; then
        echo "Revertendo: $file"
        git checkout -- "$file"
    fi
done

# 3. Atualizar status da task no OpenSpec
sed -i "s/^- \[.\] \`$TASK_ID\`/^- [!] \`$TASK_ID\` (ROLLED BACK)/" "$OPENSPEC_FILE"

echo "Rollback concluído para task: $TASK_ID"
```

### **2. Script de Rollback por BC**
```bash
#!/bin/bash
# scripts/rollback/bc-rollback.sh

BC_ID="$1"
ROLLBACK_TO_COMMIT="$2"

echo "Iniciando rollback do BC: $BC_ID"
echo "Commit alvo: $ROLLBACK_TO_COMMIT"

# 1. Identificar todos os commits do BC
BC_COMMITS=$(git log --oneline --grep="OPENSPEC:$BC_ID" | awk '{print $1}')

# 2. Criar branch de rollback
git checkout -b "rollback/$BC_ID-$(date +%Y%m%d)"

# 3. Reverter commits em ordem reversa
for commit in $(echo "$BC_COMMITS" | tac); do
    echo "Revertendo commit: $commit"
    git revert --no-edit "$commit"
done

# 4. Criar tag do ponto de rollback
git tag "rollback/$BC_ID/$(date +%Y%m%d-%H%M%S)"

echo "Rollback do BC $BC_ID concluído"
echo "Branch criado: rollback/$BC_ID-$(date +%Y%m%d)"
```

### **3. Script de Validação Pós-Rollback**
```bash
#!/bin/bash
# scripts/rollback/validate-rollback.sh

BC_ID="$1"

echo "Validando rollback do BC: $BC_ID"

# 1. Validar compilação
echo "Validando compilação C#..."
dotnet build --configuration Release

# 2. Validar testes
echo "Executando testes unitários..."
dotnet test --configuration Release --no-build

# 3. Validar dependências
echo "Validando dependências OpenSpec..."
./scripts/validate-advanced-dependencies.sh --bc "$BC_ID"

# 4. Validar integração com outros BCs
echo "Validando integração com outros BCs..."
./scripts/integration-test.sh --bc "$BC_ID"

echo "Validação de rollback concluída para BC: $BC_ID"
```

---

## 📋 **Checklist de Rollback**

### **Pré-Rollback**
- [ ] **Identificar escopo**: Task individual, cadeia de dependências ou BC completo
- [ ] **Notificar equipe**: Alerta via Slack/email sobre rollback planejado
- [ ] **Backup de dados**: Backup do banco de dados atual
- [ ] **Snapshot do código**: Tag Git do estado atual
- [ ] **Documentar motivo**: Registrar razão do rollback no sistema de tracking

### **Durante Rollback**
- [ ] **Executar script apropriado**: Usar script específico para o tipo de falha
- [ ] **Monitorar logs**: Verificar logs de execução em tempo real
- [ ] **Validar cada passo**: Confirmar que cada etapa foi bem-sucedida
- [ ] **Atualizar status**: Marcar tasks/BCs como "em rollback" no OpenSpec

### **Pós-Rollback**
- [ ] **Validar sistema**: Executar testes de validação pós-rollback
- [ ] **Atualizar documentação**: Registrar rollback no histórico do BC
- [ ] **Analisar causa raiz**: Investigar e documentar causa da falha
- [ ] **Plano de correção**: Criar tasks OpenSpec para corrigir problemas identificados
- [ ] **Notificar conclusão**: Informar equipe sobre conclusão do rollback

---

## 🚨 **Cenários de Falha Comuns e Soluções**

### **Cenário 1: Entity com Validação Quebrada**
```csharp
// ANTES (com problema):
public class User : Entity
{
    public EmailVO Email { get; private set; }
    
    public static Result<User> Create(string email, string password)
    {
        // Validação falhando para emails internacionais
        var emailResult = EmailVO.Create(email);
        if (emailResult.IsFailure)
            return Result.Failure<User>(emailResult.Error);
            
        // ... resto do código
    }
}

// SOLUÇÃO:
// 1. Rollback da task `domain:entity:User`
./scripts/rollback/task-rollback.sh "domain:entity:User" BC-001-auth.openspec.md

// 2. Criar task de correção do EmailVO
- [ ] `domain:vo:Email` Suporte a emails internacionais (~1.5h)
  **Agent**: `Core Value Object (C#)`
  **Prompt**: "Atualizar EmailVO para validar formatos internacionais seguindo RFC 5322"
  **Specs**: ["email-validation-rfc5322"]

// 3. Reaplicar task da Entity User
- [ ] `domain:entity:User` Recriar entidade User com EmailVO corrigido (~2h)
  **Agent**: `Core Entity (C#)`
  **Prompt**: "Recriar aggregate root User usando EmailVO com suporte internacional"
  **Dependências**: `domain:vo:Email`
```

### **Cenário 2: Incompatibilidade entre DTO e Entity**
```csharp
// PROBLEMA: DTO espera propriedade que não existe na Entity
public class UserResponse
{
    public string FullName { get; set; }  // Não existe na User entity
    public string Email { get; set; }
}

// SOLUÇÃO COM ROLLBACK E CORREÇÃO:
# 1. Validar incompatibilidade
./scripts/validate-advanced-dependencies.sh --check-compatibility

# 2. Rollback da task do DTO
./scripts/rollback/task-rollback.sh "app:dto:UserResponse" BC-001-auth.openspec.md

# 3. Adicionar propriedade à Entity (se necessário)
- [ ] `domain:entity:User` Adicionar propriedade FullName (~1h)
  **Agent**: `Core Entity (C#)`
  **Prompt**: "Adicionar propriedade FullName à entidade User com validação"

# 4. Recriar DTO compatível
- [ ] `app:dto:UserResponse` Recriar DTO com propriedades corretas (~1h)
  **Agent**: `Core DTO (C#)`
  **Prompt**: "Criar UserResponse DTO com Email e FullName mapeados da User entity"
  **Dependências**: `domain:entity:User`
```

### **Cenário 3: Performance Degradada após Deploy**
```bash
# SINAIS:
# - Latência aumentada em 300%
# - CPU usage em 95%
# - Memory leaks detectados

# ESTRATÉGIA DE ROLLBACK:
# 1. Ativar feature flag para desabilitar BC problemático
curl -X POST http://api/config/feature-flags \
  -H "Content-Type: application/json" \
  -d '{"bc_id": "BC-002", "enabled": false}'

# 2. Rollback do código
./scripts/rollback/bc-rollback.sh "BC-002" "last_stable_bc002"

# 3. Rollback do banco de dados
psql -U postgres -d retailops -f ./scripts/rollback/db-rollback-bc002.sql

# 4. Revalidar sistema
./scripts/rollback/validate-rollback.sh "BC-002"
```

---

## 🔧 **Integração com CI/CD**

### **Pipeline de Rollback Automatizado**
```yaml
# .github/workflows/rollback-pipeline.yml
name: OpenSpec Rollback Pipeline

on:
  workflow_dispatch:
    inputs:
      bc_id:
        description: 'Bounded Context ID'
        required: true
      rollback_type:
        description: 'Type of rollback'
        required: true
        default: 'full'
        options:
          - 'task'
          - 'bc'
          - 'full'

jobs:
  validate-rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate rollback request
        run: |
          ./scripts/rollback/validate-request.sh "${{ github.event.inputs.bc_id }}"
          
      - name: Create rollback plan
        run: |
          ./scripts/rollback/create-plan.sh \
            --bc "${{ github.event.inputs.bc_id }}" \
            --type "${{ github.event.inputs.rollback_type }}"
            
  execute-rollback:
    needs: validate-rollback
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Execute rollback
        run: |
          if [ "${{ github.event.inputs.rollback_type }}" = "task" ]; then
            ./scripts/rollback/task-rollback.sh "$TASK_ID" "$OPENSPEC_FILE"
          elif [ "${{ github.event.inputs.rollback_type }}" = "bc" ]; then
            ./scripts/rollback/bc-rollback.sh "${{ github.event.inputs.bc_id }}"
          else
            ./scripts/rollback/full-rollback.sh
          fi
          
      - name: Validate post-rollback
        run: |
          ./scripts/rollback/validate-rollback.sh "${{ github.event.inputs.bc_id }}"
          
      - name: Notify team
        run: |
          ./scripts/notify/rollback-complete.sh "${{ github.event.inputs.bc_id }}"
```

### **Monitoramento e Alertas**
```yaml
# config/monitoring/rollback-alerts.yml
alerts:
  - name: "high-failure-rate"
    condition: "tasks_failed / tasks_total > 0.15"
    severity: "critical"
    actions:
      - "slack_alert"
      - "create_rollback_plan"
      
  - name: "dependency-cycle-detected"
    condition: "dependency_cycles > 0"
    severity: "high"
    actions:
      - "block_merge"
      - "notify_lead_dev"
      
  - name: "performance-degradation"
    condition: "avg_response_time > baseline * 2"
    severity: "medium"
    actions:
      - "enable_feature_flag_rollback"
      - "schedule_performance_review"
```

---

## 📊 **Métricas de Rollback**

### **KPIs para Monitorar**
| Métrica | Definição | Meta | Ação se Fora da Meta |
|---------|-----------|------|---------------------|
| **Rollback Rate** | Tasks rollback / Tasks total | ≤5% | Revisar processo de validação |
| **Mean Time to Recovery (MTTR)** | Tempo médio para recuperação | ≤30min | Automatizar mais procedimentos |
| **Rollback Success Rate** | Rollbacks bem-sucedidos / Total | ≥95% | Melhorar scripts de rollback |
| **Impacted Users** | Usuários afetados por falhas | 0 | Melhorar testes de integração |

### **Dashboard de Rollback**
```json
{
  "rollback_metrics": {
    "last_24h": {
      "total_rollbacks": 2,
      "successful_rollbacks": 2,
      "failed_rollbacks": 0,
      "avg_recovery_time_min": 18,
      "most_common_cause": "dependency_validation"
    },
    "by_bc": {
      "BC-001": {"rollbacks": 1, "success_rate": 100},
      "BC-002": {"rollbacks": 1, "success_rate": 100}
    },
    "trends": {
      "weekly_rollback_rate": 4.2,
      "monthly_improvement": -12
    }
  }
}
```

---

## 🚀 **Melhores Práticas**

### **1. Versionamento Estratégico**
```bash
# Sempre versionar antes de mudanças significativas
git tag "pre-bc001-auth-phase2-$(date +%Y%m%d)"

# Usar commits semânticos para OpenSpec
git commit -m "OPENSPEC:BC-001 - Implement domain entities [3/20]"
```

### **2. Isolamento por Feature Flag**
```csharp
// Configurar feature flags por BC
services.AddFeatureManagement()
    .AddFeatureFilter<BoundedContextFilter>();

// No código:
if (await featureManager.IsEnabledAsync("BC-001-auth"))
{
    // Código do BC-001
}
```

### **3. Backup Automatizado**
```bash
# Script de backup pré-deploy
#!/bin/bash
# scripts/backup/pre-deploy-backup.sh

BACKUP_DIR="/backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup do banco
pg_dump -U postgres retailops > "$BACKUP_DIR/db-backup.sql"

# Backup do código
git bundle create "$BACKUP_DIR/code-backup.bundle" --all

# Backup das configurações
cp -r config/ "$BACKUP_DIR/config/"
```

### **4. Documentação de Rollback**
```markdown
# ROLLBACK: BC-001 Auth - 2026-05-23

## **Resumo**
- **Data/Hora**: 2026-05-23 14:30
- **BC**: BC-001 Auth
- **Tipo**: Task individual (`domain:entity:User`)
- **Causa**: Validação de EmailVO não suporta formatos internacionais

## **Ações Tomadas**
1. Rollback da task `domain:entity:User`
2. Criação de task de correção `domain:vo:Email`
3. Reaplicação da task da Entity

## **Lições Aprendidas**
- Adicionar testes para formatos internacionais no EmailVO
- Validar regex de email contra RFC 5322
```

---

## 🔍 **Ferramentas Recomendadas**

### **Para Stack C#**
1. **Entity Framework Core Migrations**: Rollback de schema de banco
2. **Git**: Versionamento e rollback de código
3. **FeatureToggle**: Feature flags para rollback gradual
4. **Serilog**: Logging estruturado para análise pós-falha
5. **HealthChecks**: Monitoramento de saúde do sistema

### **Para Integração OpenSpec**
1. **scripts/validate-advanced-dependencies.sh**: Validação pré-rollback
2. **scripts/fix-dependencies.sh**: Correção automática de problemas comuns
3. **scripts/rollback/**: Scripts específicos por tipo de rollback
4. **dashboard/openspec-advanced-metrics-dashboard.md**: Monitoramento de métricas

---

## 📞 **Suporte e Escalação**

### **Nível 1: Automação**
- Scripts de rollback automatizados
- Validação automática de dependências
- Notificações automáticas via Slack

### **Nível 2: Equipe de Desenvolvimento**
- Revisão de causa raiz
- Correção de tasks específicas
- Atualização de documentação

### **Nível 3: Arquitetos/Tech Leads**
- Análise de padrões de falha
- Revisão de arquitetura
- Planejamento de melhorias de processo

### **Contatos de Emergência**
| Função | Nome | Slack | Telefone |
|--------|------|-------|----------|
| Tech Lead | João Silva | @joao.silva | +55 11 99999-9999 |
| DevOps | Maria Santos | @maria.santos | +55 11 98888-8888 |
| Product Owner | Pedro Oliveira | @pedro.oliveira | +55 11 97777-7777 |

---

**Nota**: Este guia deve ser revisado e atualizado regularmente com base em lições aprendidas de rollbacks realizados. Mantenha um registro de todos os rollbacks para análise de tendências e melhoria contínua do processo.