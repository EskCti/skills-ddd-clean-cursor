# Guia de Troubleshooting para Ciclo OpenSpec

**Propósito**: Documentar problemas comuns e soluções para o ciclo OpenSpec com Skills.

---

## 🚨 **Problemas Comuns e Soluções**

### **1. Skills Não Encontrados ou Não Funcionais**

#### **Sintomas**
- Erro: `Skill not found: core-entity-cs`
- Mensagem: `Agent not available`
- Skills listam mas não executam

#### **Soluções**
```bash
# 1. Verificar se skills estão instalados
ls -la .agents/skills/

# 2. Verificar permissões
chmod +x .agents/skills/*/SKILL.md

# 3. Reinstalar skills específicos
./scripts/install-skill.sh core-entity-cs

# 4. Verificar configuração do agent
cat .agents/openai.yaml | grep -A5 "core-entity-cs"
```

#### **Prevenção**
- Manter `skills-standards.md` atualizado
- Testar skills antes de usar em produção
- Usar versionamento de skills

---

### **2. Validação de Dependências Falha**

#### **Sintomas**
- Erro: `Invalid dependency order`
- Mensagem: `Task X depends on Y but Y not completed`
- Ciclo de dependência detectado

#### **Soluções**
```bash
# 1. Verificar ordem inside-out
./scripts/validate-dependencies.sh --change EP-001

# 2. Corrigir ordem incorreta
# Antes (errado):
# - [ ] `interface:controller` AuthController
# - [ ] `domain:entity` UserEntity

# Depois (correto):
# - [ ] `domain:entity` UserEntity  
# - [ ] `interface:controller` AuthController

# 3. Usar skill de validação
npx @namespace/openspec-validate-dependencies --change EP-001 --fix
```

#### **Prevenção**
- Usar template padronizado de tasks
- Validar dependências antes de `openspec-apply-change`
- Seguir ordem Clean Architecture estritamente

---

### **3. Tasks Não Completam ou Ficam Presas**

#### **Sintomas**
- Task marcada como `[ ]` mesmo após execução
- Progresso travado em determinada task
- Skills executam mas não marcam como completos

#### **Soluções**
```bash
# 1. Verificar logs de execução
tail -f .agents/logs/openspec-apply-change.log

# 2. Forçar conclusão de task
./scripts/complete-task.sh --change EP-001 --task "domain:entity:user"

# 3. Reiniciar execução
openspec-archive-change EP-001  # Primeiro arquiva
openspec-propose EP-001         # Recria proposta
openspec-apply-change EP-001    # Reexecuta
```

#### **Prevenção**
- Implementar timeouts em skills
- Adicionar logging detalhado
- Testar skills em ambiente isolado primeiro

---

### **4. Inconsistência entre Código e Documentação OpenSpec**

#### **Sintomas**
- Código implementado difere de tasks.md
- Documentação desatualizada
- Tasks completadas mas código não existe

#### **Soluções**
```bash
# 1. Verificar consistência
./scripts/check-consistency.sh --change EP-001

# 2. Sincronizar manualmente
# Atualizar tasks.md para refletir código
sed -i 's/\[ \]/\[x\]/g' openspec/changes/EP-001/tasks.md

# 3. Usar ferramenta de reconciliação
npx @namespace/openspec-reconcile --change EP-001
```

#### **Prevenção**
- Automatizar verificação de consistência
- Integrar com CI/CD para validação
- Revisar tasks antes de arquivar

---

### **5. Performance Degradada com Muitas Tasks**

#### **Sintomas**
- Execução lenta com >50 tasks
- Timeouts frequentes
- Alto consumo de memória/CPU

#### **Soluções**
```bash
# 1. Dividir épico em sub-épicos
# Antes: EP-001 com 80 tasks
# Depois: EP-001A (40 tasks), EP-001B (40 tasks)

# 2. Usar cache de contexto
export ENABLE_CONTEXT_CACHE=true

# 3. Paralelizar tasks independentes
./scripts/parallel-execute.sh --change EP-001 --max-parallel 5
```

#### **Prevenção**
- Limitar épicos a ≤30 tasks
- Usar cache de contexto para VOs reutilizados
- Implementar execução paralela para tasks independentes

---

## 🔧 **Diagnóstico de Problemas**

### **Checklist de Diagnóstico**
```bash
#!/bin/bash
# scripts/diagnose-openspec.sh

echo "🔍 Diagnóstico do Ciclo OpenSpec"
echo ""

# 1. Verificar estrutura OpenSpec
echo "1. Estrutura OpenSpec:"
if [ -d "openspec/changes" ]; then
  echo "   ✅ Diretório changes existe"
  ACTIVE_CHANGES=$(ls openspec/changes/active/ 2>/dev/null | wc -l)
  echo "   📊 Changes ativos: $ACTIVE_CHANGES"
else
  echo "   ❌ Diretório changes não encontrado"
fi

# 2. Verificar skills disponíveis
echo ""
echo "2. Skills disponíveis:"
SKILLS_COUNT=$(ls .agents/skills/ 2>/dev/null | wc -l)
echo "   📊 Total skills: $SKILLS_COUNT"

# 3. Verificar tasks pendentes
echo ""
echo "3. Tasks pendentes:"
for change in openspec/changes/active/*/; do
  if [ -d "$change" ]; then
    PENDING=$(grep -c "^- \[ \]" "$change/tasks.md" 2>/dev/null || echo "0")
    echo "   📋 $(basename $change): $PENDING tasks pendentes"
  fi
done

# 4. Verificar logs de erro
echo ""
echo "4. Logs de erro recentes:"
find .agents/logs/ -name "*.log" -type f -exec tail -5 {} \; 2>/dev/null | grep -i error | head -10
```

### **Comandos Úteis para Diagnóstico**
```bash
# Verificar status de todas changes ativas
./scripts/status-all-changes.sh

# Verificar dependências de uma change específica
npx @namespace/openspec-validate-dependencies --change EP-001 --verbose

# Verificar logs de execução de skill específico
tail -f .agents/logs/core-entity-cs.log

# Testar skill isoladamente
./scripts/test-skill.sh core-entity-cs --test-data auth-user.json
```

---

## 🛠️ **Soluções para Problemas Específicos**

### **Problema: Skills Executam mas Não Geram Código**

#### **Causas Comuns**
1. Permissões de escrita insuficientes
2. Diretório de destino não existe
3. Configuração incorreta de paths

#### **Solução Passo a Passo**
```bash
# 1. Verificar permissões
ls -la apps/backend/src/modules/auth/

# 2. Criar diretórios se não existirem
mkdir -p apps/backend/src/modules/auth/core/{entity,vo,service}

# 3. Verificar configuração do skill
grep -r "output_path" .agents/skills/core-entity-cs/

# 4. Testar com permissões elevadas (dev only)
sudo ./scripts/run-skill.sh core-entity-cs --debug
```

### **Problema: Tasks.md Corrompido ou Mal Formatado**

#### **Sintomas**
- Erro de parsing ao executar `openspec-apply-change`
- Tasks não reconhecidas
- Formatação inconsistente

#### **Solução**
```bash
# 1. Validar formatação
./scripts/validate-tasks-format.sh openspec/changes/EP-001/tasks.md

# 2. Corrigir formatação automática
npx prettier --write openspec/changes/EP-001/tasks.md

# 3. Restaurar de backup
cp openspec/changes/EP-001/tasks.md.backup openspec/changes/EP-001/tasks.md

# 4. Recriar do backlog
./scripts/generate-tasks-from-backlog.sh --epic EP-001
```

### **Problema: Integração CI/CD Falha com OpenSpec**

#### **Sintomas**
- Pipeline falha na validação OpenSpec
- Deploy não atualiza dashboard
- Inconsistência entre ambientes

#### **Solução**
```bash
# 1. Verificar configuração CI/CD
cat .github/workflows/ci.yml | grep -A10 "openspec"

# 2. Testar localmente
./scripts/run-ci-checks.sh --local

# 3. Verificar secrets e variáveis de ambiente
echo "Checking environment variables..."
env | grep -E "OPENSPEC|SKILLS"

# 4. Atualizar dashboard manualmente
./scripts/update-openspec-dashboard.sh --change EP-001 --status completed
```

---

## 📊 **Monitoramento e Alertas**

### **Métricas para Monitorar**
```yaml
# .agents/monitoring/metrics.yaml
openspec_metrics:
  - name: "tasks_completion_rate"
    description: "Taxa de conclusão de tasks"
    threshold: "≥95%"
    
  - name: "skill_execution_time"  
    description: "Tempo médio de execução de skills"
    threshold: "≤5min"
    
  - name: "dependency_validation_errors"
    description: "Erros de validação de dependências"
    threshold: "≤1 por semana"
    
  - name: "context_cache_hit_rate"
    description: "Taxa de acerto do cache de contexto"
    threshold: "≥80%"
```

### **Alertas Configuráveis**
```yaml
# .agents/monitoring/alerts.yaml
alerts:
  - name: "high_task_failure_rate"
    condition: "tasks_completion_rate < 80% for 1h"
    severity: "critical"
    actions:
      - "notify_slack"
      - "page_on_call"
      
  - name: "skill_timeout"
    condition: "skill_execution_time > 10min"
    severity: "warning"
    actions:
      - "notify_slack"
      
  - name: "dependency_cycle_detected"
    condition: "dependency_validation_errors > 5 in 1h"
    severity: "critical"
    actions:
      - "notify_slack"
      - "pause_openspec_workflow"
```

---

## 🔄 **Recuperação de Falhas**

### **Procedimento de Recuperação**
```bash
#!/bin/bash
# scripts/recover-openspec-failure.sh

CHANGE_ID=$1

echo "🔄 Iniciando recuperação para $CHANGE_ID"
echo ""

# 1. Parar execução atual
echo "1. Parando execução atual..."
pkill -f "openspec-apply-change $CHANGE_ID"

# 2. Fazer backup do estado atual
echo "2. Criando backup..."
BACKUP_DIR=".agents/backups/$(date +%Y%m%d_%H%M%S)_$CHANGE_ID"
mkdir -p "$BACKUP_DIR"
cp -r "openspec/changes/$CHANGE_ID" "$BACKUP_DIR/"

# 3. Verificar integridade
echo "3. Verificando integridade..."
./scripts/validate-change-integrity.sh --change "$CHANGE_ID"

# 4. Recriar tasks se necessário
echo "4. Recriando tasks se necessário..."
if [ $? -ne 0 ]; then
  echo "   ❌ Integridade comprometida, recriando tasks..."
  ./scripts/regenerate-tasks.sh --change "$CHANGE_ID"
fi

# 5. Reiniciar execução
echo "5. Reiniciando execução..."
openspec-apply-change "$CHANGE_ID" --resume

echo ""
echo "✅ Recuperação concluída para $CHANGE_ID"
```

### **Rollback de Changes Problemáticas**
```bash
#!/bin/bash
# scripts/rollback-change.sh

CHANGE_ID=$1

echo "⏪ Iniciando rollback para $CHANGE_ID"
echo ""

# 1. Verificar se change está ativa
if [ ! -d "openspec/changes/active/$CHANGE_ID" ]; then
  echo "❌ Change $CHANGE_ID não encontrada em active/"
  exit 1
fi

# 2. Mover para quarentena
echo "1. Movendo para quarentena..."
mkdir -p "openspec/changes/quarantine/"
mv "openspec/changes/active/$CHANGE_ID" "openspec/changes/quarantine/"

# 3. Reverter código gerado
echo "2. Revertendo código gerado..."
./scripts/revert-generated-code.sh --change "$CHANGE_ID"

# 4. Atualizar dashboard
echo "3. Atualizando dashboard..."
./scripts/update-openspec-dashboard.sh --change "$CHANGE_ID" --status "rolled_back"

# 5. Notificar stakeholders
echo "4. Notificando stakeholders..."
./scripts/notify-rollback.sh --change "$CHANGE_ID"

echo ""
echo "✅ Rollback concluído para $CHANGE_ID"
```

---

## 🧪 **Testes de Troubleshooting**

### **Script de Teste Automatizado**
```bash
#!/bin/bash
# scripts/test-openspec-troubleshooting.sh

echo "🧪 Teste de Troubleshooting OpenSpec"
echo ""

# Testar skills básicos
echo "1. Testando skills básicos..."
SKILLS_TO_TEST=("core-value-object-cs" "core-entity-cs" "backend-controller-cs")
for skill in "${SKILLS_TO_TEST[@]}"; do
  echo "   🔍 Testando $skill..."
  ./scripts/test-skill.sh "$skill" --quick-test
  if [ $? -eq 0 ]; then
    echo "   ✅ $skill funcionando"
  else
    echo "   ❌ $skill com problemas"
  fi
done

# Testar validação de dependências
echo ""
echo "2. Testando validação de dependências..."
./scripts/validate-dependencies.sh --test-mode

# Testar cache de contexto
echo ""
echo "3. Testando cache de contexto..."
./scripts/test-context-cache.sh --verbose

# Testar integração CI/CD
echo ""
echo "4. Testando integração CI/CD..."
./scripts/test-ci-cd-integration.sh --local

echo ""
echo "✅ Testes de troubleshooting concluídos"
```

### **Checklist de Validação Pós-Correção**
```markdown
## ✅ Checklist Pós-Correção

### Skills
- [ ] Todos skills necessários estão instalados
- [ ] Permissões de execução configuradas
- [ ] Logs de erro estão sendo gerados
- [ ] Timeouts configurados adequadamente

### Tasks
- [ ] Formatação de tasks.md correta
- [ ] Dependências em ordem inside-out
- [ ] Estimates realistas
- [ ] Agents especificados corretamente

### Integração
- [ ] CI/CD valida OpenSpec corretamente
- [ ] Dashboard atualiza automaticamente
- [ ] Logs centralizados e acessíveis
- [ ] Alertas configurados e funcionando

### Performance
- [ ] Cache de contexto funcionando
- [ ] Tempos de execução dentro dos limites
- [ ] Consumo de recursos aceitável
- [ ] Escalabilidade testada
```

---

## 📚 **Recursos de Suporte**

### **Documentação Relacionada**
- [OpenSpec Task Template](../templates/openspec-task-template.yaml)
- [Validation Checklist](../checklists/openspec-phase-validation-checklist.md)
- [CI/CD Workflow](../workflows/openspec-ci-cd-workflow.md)
- [Versioning Best Practices](../guides/openspec-versioning-best-practices.md)

### **Ferramentas de Diagnóstico**
```bash
# Verificar saúde do sistema OpenSpec
./scripts/openspec-health-check.sh

# Analisar logs em busca de padrões de erro
./scripts/analyze-error-patterns.sh

# Testar performance de skills
./scripts/benchmark-skills.sh

# Verificar consistência de dados
./scripts/check-data-consistency.sh
```

### **Canais de Suporte**
- **Documentação**: [docs/openspec/](../)
- **Issues**: [.github/ISSUE_TEMPLATE/](../../.github/ISSUE_TEMPLATE/)
- **Slack**: `#openspec-support`
- **Email**: `openspec-support@retailops.com`

---

## 🎯 **Conclusão**

Este guia de troubleshooting fornece soluções para os problemas mais comuns encontrados no ciclo OpenSpec. Lembre-se:

1. **Diagnóstico Sistemático**: Use checklists e scripts de diagnóstico
2. **Prevenção Proativa**: Monitore métricas e configure alertas
3. **Recuperação Estruturada**: Siga procedimentos de rollback e recuperação
4. **Documentação Contínua**: Atualize este guia com novos problemas e soluções

Para problemas não cobertos neste guia, consulte a documentação oficial ou entre em contato com a equipe de suporte.

**Próximos passos**:
1. Implementar monitoramento contínuo
2. Automatizar diagnósticos com scripts
3. Estabelecer procedimentos de escalação
4. Manter base de conhecimento atualizada