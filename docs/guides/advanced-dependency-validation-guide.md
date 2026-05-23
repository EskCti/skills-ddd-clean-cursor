# Guia de Validação Avançada de Dependências

**Propósito**: Documentar o uso do sistema avançado de validação de dependências para o ciclo OpenSpec com Skills.

---

## 🎯 **Visão Geral do Sistema**

### **Componentes do Sistema**
```
┌─────────────────────────────────────────────────────────┐
│      Sistema de Validação Avançada de Dependências      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Validação Básica                      │   │
│  │  • Ordem Clean Architecture                    │   │
│  │  • Agents válidos                              │   │
│  │  • Dependências explícitas                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Validação Avançada                    │   │
│  │  • Cache de contexto                           │   │
│  │  • Performance metrics                         │   │
│  │  • Integração CI/CD                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Correção Automática                   │   │
│  │  • Fix de Agents sem stack                     │   │
│  │  • Melhoria de prompts curtos                  │   │
│  │  • Adição de tasks faltantes                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Benefícios**
- **Redução de erros**: Validação automática antes da execução
- **Otimização de performance**: Identificação de oportunidades de cache
- **Padronização**: Garantia de conformidade com Clean Architecture
- **Automação**: Correção de problemas comuns sem intervenção manual

---

## 🚀 **Quick Start**

### **1. Instalação**
```bash
# Dar permissão de execução aos scripts
chmod +x .agents/skills/scripts/*.sh

# Adicionar ao PATH (opcional)
export PATH="$PATH:$(pwd)/.agents/skills/scripts"
```

### **2. Validação Básica**
```bash
# Validar uma change específica
./scripts/validate-advanced-dependencies.sh -c EP-001

# Modo verboso para detalhes
./scripts/validate-advanced-dependencies.sh -c EP-001 -v

# Gerar relatório detalhado
./scripts/validate-advanced-dependencies.sh -c EP-001 -o relatorio-ep-001.md
```

### **3. Correção Automática**
```bash
# Simular correções (dry-run)
./scripts/fix-dependencies.sh -c EP-001 -d

# Aplicar correções
./scripts/fix-dependencies.sh -c EP-001

# Aplicar correções sem backup
./scripts/fix-dependencies.sh -c EP-001 --no-backup
```

### **4. Workflow Completo**
```bash
#!/bin/bash
# workflow-completo.sh

CHANGE_ID="EP-001"

echo "🚀 Iniciando workflow para change $CHANGE_ID"

# 1. Validar dependências
echo "🔍 Validando dependências..."
./scripts/validate-advanced-dependencies.sh -c "$CHANGE_ID" -o "validation-$CHANGE_ID.md"

# 2. Corrigir automaticamente
echo "🔧 Aplicando correções..."
./scripts/fix-dependencies.sh -c "$CHANGE_ID"

# 3. Validar novamente
echo "✅ Verificando correções..."
./scripts/validate-advanced-dependencies.sh -c "$CHANGE_ID" -o "post-fix-$CHANGE_ID.md"

# 4. Executar change
echo "⚡ Executando change..."
openspec-apply-change "$CHANGE_ID"

echo "🎉 Workflow concluído para $CHANGE_ID"
```

---

## 📋 **Tipos de Validação**

### **1. Validação de Ordem (Clean Architecture)**
Verifica se as tasks seguem a ordem inside-out:

```
✅ Ordem Correta:
domain:vo → domain:entity → app:dto → app:usecase → interface:controller

❌ Ordem Incorreta:
interface:controller → app:usecase → domain:entity
```

**Regras Aplicadas**:
- `domain:vo` deve vir antes de `domain:entity`
- `domain:entity` deve vir antes de `app:usecase`
- `app:usecase` deve vir antes de `interface:controller`
- Tasks de teste (`test:unit`, `test:e2e`) devem vir no final

### **2. Validação de Agents**
Verifica se os agents estão corretamente especificados:

```
✅ Agent Válido:
**Agent:** `Core Entity (C#)`

❌ Agent Inválido:
**Agent:** `Core Entity`  # Falta stack
```

**Regras Aplicadas**:
- Agents devem incluir stack entre parênteses: `(C#)`, `(Vue)`, `(Android)`
- Agents devem corresponder a skills existentes
- Stack deve ser apropriada para o prefixo da task

### **3. Validação de Dependências Explícitas**
Verifica dependências declaradas:

```
✅ Dependência Válida:
**Dependencies:** [`domain:entity:user`]

❌ Dependência Inválida:
**Dependencies:** [`domain:entity:inexistente`]  # Task não existe
```

**Regras Aplicadas**:
- Todas as tasks referenciadas devem existir
- Dependências não podem formar ciclos
- Dependências devem estar em ordem lógica

### **4. Validação de Prompts**
Verifica qualidade dos prompts:

```
✅ Prompt Válido:
**Prompt:** "Crie User entity com EmailVO e PasswordVO; validações de domínio."

❌ Prompt Inválido:
**Prompt:** "Crie user"  # Muito curto e genérico
```

**Regras Aplicadas**:
- Prompts devem ter pelo menos 10 caracteres
- Prompts devem ser específicos e direcionados
- Prompts não devem conter placeholders (`TODO`, `FIXME`)

### **5. Validação de Cache de Contexto**
Identifica oportunidades de otimização:

```bash
# Análise de cache
./scripts/validate-advanced-dependencies.sh -c EP-001 --no-cache

# Output:
# ℹ️  Opportunidade de cache: 3 Value Objects podem ser cacheados
# ℹ️  Opportunidade de cache: 2 Entities podem ser cacheados
```

**Oportunidades Identificadas**:
- Value Objects repetidos entre tasks
- Entities reutilizadas em múltiplos use cases
- DTOs com estruturas similares

---

## 🔧 **Correções Automáticas**

### **1. Correção de Agents sem Stack**
**Problema**:
```markdown
- [ ] `domain:entity` User (~2h)
  **Agent:** `Core Entity`
```

**Correção Automática**:
```markdown
- [ ] `domain:entity` User (~2h)
  **Agent:** `Core Entity (C#)`
```

**Lógica**:
- Inferir stack baseado no prefixo da task
- Aplicar correção automaticamente
- Manter formatação original

### **2. Melhoria de Prompts Curtos**
**Problema**:
```markdown
**Prompt:** "Crie user"
```

**Correção Automática**:
```markdown
**Prompt:** "Crie uma entidade de domínio User com regras de negócio, métodos de domínio e validações usando Result<T>."
```

**Lógica**:
- Detectar prompts com menos de 10 caracteres
- Gerar prompt sugerido baseado no tipo de task
- Manter contexto original quando possível

### **3. Adição de Tasks Faltantes**
**Problema**:
```markdown
- [ ] `interface:page` LoginView (~2h)
# Falta `interface:entity` antes
```

**Correção Automática**:
```markdown
- [ ] `interface:entity` AuthUserEntity Vue (~1h)
  **Agent:** `Frontend Entity (Vue)`
  **Prompt:** "Crie a entidade AuthUserEntity para frontend Vue com validações usando Result<T>."

- [ ] `interface:page` LoginView (~2h)
  **Agent:** `Frontend Page (Vue)`
  **Prompt:** "Implemente a página LoginView com componentes Vue, estado reativo e integração com use cases."
```

**Lógica**:
- Detectar tasks que requerem dependências não presentes
- Inserir tasks necessárias na ordem correta
- Gerar prompts apropriados para as novas tasks

---

## 📊 **Relatórios e Métricas**

### **1. Estrutura do Relatório**
```markdown
# Relatório de Validação - Change: EP-001

## 📊 Resumo da Validação
| Métrica | Valor | Status |
|---------|-------|--------|
| Total de Tasks | 15 | ✅ |
| Erros de Ordem | 2 | ❌ |
| Agents Inválidos | 1 | ❌ |
| Dependências Inválidas | 0 | ✅ |
| Prompts Inválidos | 3 | ❌ |
| **Total de Erros** | **6** | **❌ INVÁLIDO** |

## 🔍 Detalhes da Validação
### 1. Estrutura Básica
- ✅ Arquivo tasks.md encontrado
- ✅ Arquivo proposal.md encontrado

### 2. Ordem Clean Architecture
- ❌ 2 tasks fora de ordem

## 🚨 Problemas Identificados
1. Task `interface:controller` antes de `app:usecase`
2. Agent `Core Entity` sem stack `(C#)`
3. Prompt muito curto: "Crie user"

## 🔧 Recomendações
1. Reordenar tasks seguindo ordem inside-out
2. Corrigir Agents especificando stack
3. Melhorar prompts para serem mais específicos
```

### **2. Métricas de Performance**
```bash
# Coletar métricas de performance
./scripts/collect-performance-metrics.sh -c EP-001

# Output:
# 📊 Métricas de Performance - Change: EP-001
# • Tempo estimado total: 24h
# • Tasks com cache potencial: 5
# • Redução estimada com cache: 30%
# • Skills mais utilizados: Core Entity (C#), Frontend Page (Vue)
```

### **3. Dashboard de Validação**
```bash
# Gerar dashboard interativo
./scripts/generate-validation-dashboard.sh -c EP-001 -o dashboard-ep-001.html

# Abrir dashboard no navegador
open dashboard-ep-001.html
```

---

## 🔄 **Integração com CI/CD**

### **1. Pipeline GitHub Actions**
```yaml
# .github/workflows/validate-openspec.yml
name: Validate OpenSpec Changes

on:
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'openspec/changes/active/**'

jobs:
  validate-dependencies:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: '8.0.x'
        
    - name: Validate dependencies
      run: |
        # Encontrar changes modificadas
        CHANGES=$(git diff --name-only HEAD^ HEAD | grep 'openspec/changes/active' | cut -d'/' -f4 | sort -u)
        
        for CHANGE in $CHANGES; do
          echo "🔍 Validando change: $CHANGE"
          ./scripts/validate-advanced-dependencies.sh -c "$CHANGE" -o "validation-$CHANGE.md"
          
          # Falhar se houver erros
          if [ $? -ne 0 ]; then
            echo "❌ Change $CHANGE falhou na validação"
            exit 1
          fi
        done
```

### **2. Validação Pré-Merge**
```bash
#!/bin/bash
# pre-merge-validation.sh

# Validar todas as changes ativas
for CHANGE_DIR in openspec/changes/active/*; do
  CHANGE_ID=$(basename "$CHANGE_DIR")
  
  echo "🔍 Validando change: $CHANGE_ID"
  
  # Executar validação
  ./scripts/validate-advanced-dependencies.sh -c "$CHANGE_ID" -o "pre-merge-$CHANGE_ID.md"
  
  if [ $? -ne 0 ]; then
    echo "❌ Change $CHANGE_ID não está pronta para merge"
    echo "   Corrija os problemas antes de continuar"
    exit 1
  fi
done

echo "✅ Todas as changes estão validadas e prontas para merge"
```

### **3. Validação Pós-Merge**
```bash
#!/bin/bash
# post-merge-validation.sh

# Validar changes recém-mergeadas
MERGED_CHANGES=$(git log --oneline -n 5 --grep="Merge" | grep -o "EP-[0-9]*" | sort -u)

for CHANGE_ID in $MERGED_CHANGES; do
  echo "🔍 Verificando change mergeada: $CHANGE_ID"
  
  # Verificar se change foi arquivada corretamente
  if [ -d "openspec/changes/active/$CHANGE_ID" ]; then
    echo "⚠️  Change $CHANGE_ID ainda está ativa após merge"
    
    # Sugerir arquivamento
    echo "   Execute: openspec-archive-change $CHANGE_ID"
  fi
done
```

---

## 🛠️ **Configuração Avançada**

### **1. Configuração Personalizada**
```bash
# .agents/skills/config/validation-config.yaml
validation:
  rules:
    order:
      enabled: true
      strict: true  # Falha se qualquer task estiver fora de ordem
      
    agents:
      enabled: true
      require_stack: true
      
    dependencies:
      enabled: true
      check_cycles: true
      
    prompts:
      enabled: true
      min_length: 10
      
    cache:
      enabled: true
      min_repetitions: 2  # Mínimo de repetições para sugerir cache
      
  reporting:
    format: markdown  # markdown, html, json
    include_details: true
    generate_dashboard: true
    
  auto_fix:
    enabled: true
    backup: true
    confirm: false  # Aplicar correções sem confirmação
```

### **2. Extensão de Regras**
```bash
# Adicionar regras personalizadas
cat > .agents/skills/config/custom-rules.yaml << EOF
custom_rules:
  - name: "no_todo_in_prompts"
    description: "Prompts não devem conter TODO ou FIXME"
    pattern: "TODO|FIXME"
    severity: "warning"
    
  - name: "estimated_time_format"
    description: "Estimativas de tempo devem usar formato (~Xh)"
    pattern: "^~[0-9]+h$"
    severity: "error"
EOF
```

### **3. Integração com Skills Existentes**
```bash
# Adicionar validação ao skill existente
cat > .agents/skills/openspec-validate-dependencies/scripts/custom-validation.sh << EOF
#!/bin/bash

# Validação personalizada para skill específico
echo "🔍 Executando validação personalizada..."

# Verificar se tasks seguem padrões específicos
# ...

echo "✅ Validação personalizada concluída"
EOF
```

---

## 🧪 **Testes e Qualidade**

### **1. Testes Unitários**
```bash
# Executar testes de validação
./scripts/test-validation.sh

# Output:
# 🧪 Executando testes de validação...
# ✅ Teste 1: Validação de ordem - PASS
# ✅ Teste 2: Validação de Agents - PASS
# ✅ Teste 3: Validação de dependências - PASS
# ✅ Teste 4: Correção automática - PASS
# 🎉 Todos os testes passaram!
```

### **2. Testes de Integração**
```bash
# Testar integração com OpenSpec
./scripts/test-openspec-integration.sh

# Output:
# 🔄 Testando integração com OpenSpec...
# ✅ Change criada com sucesso
# ✅ Tasks validadas corretamente
# ✅ Correções aplicadas automaticamente
# ✅ Change arquivada com sucesso
# 🎉 Integração testada com sucesso!
```

### **3. Qualidade de Código**
```bash
# Verificar qualidade do código
./scripts/check-code-quality.sh

# Output:
# 📊 Análise de Qualidade de Código
# • Cobertura de testes: 95%
# • Complexidade ciclomática média: 2.3
# • Issues críticas: 0
# • Issues de segurança: 0
# ✅ Código atende aos padrões de qualidade
```

---

## 📚 **Recursos Relacionados**

1. **[Guia de Melhores Práticas](openspec-skills-best-practices.md)** - Padrões para integração OpenSpec + Skills
2. **[Template de Tasks](templates/openspec-csharp-task-examples.md)** - Exemplos específicos para stack C#
3. **[Workflow CI/CD](workflows/openspec-ci-cd-workflow.md)** - Pipeline completo de integração contínua
4. **[Guia de Troubleshooting](openspec-troubleshooting-guide.md)** - Soluções para problemas comuns
5. **[Dashboard de Progresso](dashboard/openspec-progress-dashboard.md)** - Monitoramento visual do progresso

---

## 🔗 **Suporte e Contribuição**

### **Canais de Suporte**
- **Issues GitHub**: [Link para repositório]
- **Slack**: [#openspec-validation](link)
- **Documentação**: [docs/validation](link)

### **Contribuição**
```bash
# 1. Fork do repositório
# 2. Criar branch de feature
git checkout -b feature/new-validation-rule

# 3. Desenvolver feature
# 4. Adicionar testes
# 5. Submeter pull request
```

### **Roadmap de Desenvolvimento**
- [ ] Suporte a validação de performance em tempo real
- [ ] Integração com ferramentas de análise estática
- [ ] Dashboard em tempo real com WebSockets
- [ ] Validação de segurança automatizada

---

**Última atualização**: 2026-05-23  
**Versão do Sistema**: 2.0.0  
**Status**: Ativo e em desenvolvimento contínuo