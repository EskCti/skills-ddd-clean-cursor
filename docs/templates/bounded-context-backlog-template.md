# Template: Backlog do Bounded Context

**BC-XXX**: Nome do Bounded Context  
**Responsável**: [Nome do Product Owner/Responsável]  
**Última Atualização**: YYYY-MM-DD

---

## 📋 **Visão Geral do Backlog**

### **Objetivos do BC**
- [Objetivo 1]
- [Objetivo 2]
- [Objetivo 3]

### **Metas do Trimestre**
| Meta | Prioridade | Prazo | Status |
|------|------------|-------|--------|
| [Meta 1] | Alta | Mês 1 | [ ] |
| [Meta 2] | Média | Mês 2 | [ ] |
| [Meta 3] | Baixa | Mês 3 | [ ] |

### **Métricas de Sucesso**
| Métrica | Baseline | Meta | Atual |
|---------|----------|------|-------|
| [Métrica 1] | [Valor] | [Meta] | [Atual] |
| [Métrica 2] | [Valor] | [Meta] | [Atual] |

---

## 🗂️ **Épicos**

### **EP-001: [Nome do Épico 1]**
**Status**: Planejado | Em Andamento | Concluído  
**Prazo**: Mês 1  
**Descrição**: [Descrição breve do épico]

**User Stories**:
- [ ] **US-001**: [Título da US]
  - **Como**: [Persona]
  - **Quero**: [Ação]
  - **Para**: [Benefício]
  - **Critérios de Aceitação**:
    - [ ] [Critério 1]
    - [ ] [Critério 2]

- [ ] **US-002**: [Título da US]
  - **Como**: [Persona]
  - **Quero**: [Ação]
  - **Para**: [Benefício]
  - **Critérios de Aceitação**:
    - [ ] [Critério 1]
    - [ ] [Critério 2]

### **EP-002: [Nome do Épico 2]**
**Status**: Planejado | Em Andamento | Concluído  
**Prazo**: Mês 2  
**Descrição**: [Descrição breve do épico]

**User Stories**:
- [ ] **US-003**: [Título da US]
  - **Como**: [Persona]
  - **Quero**: [Ação]
  - **Para**: [Benefício]
  - **Critérios de Aceitação**:
    - [ ] [Critério 1]
    - [ ] [Critério 2]

---

## 📝 **Template de User Story**

```markdown
## US-XXX: [Título Descritivo da User Story]

### **Contexto**
[Contexto do negócio e problema a ser resolvido]

### **Persona**
- **Nome**: [Nome da Persona]
- **Papel**: [Papel no sistema]
- **Objetivos**: [Objetivos da persona]

### **Requisitos Funcionais**
- [ ] [Requisito 1]
- [ ] [Requisito 2]
- [ ] [Requisito 3]

### **Requisitos Não-Funcionais**
- **Performance**: [Requisitos de performance]
- **Segurança**: [Requisitos de segurança]
- **Usabilidade**: [Requisitos de usabilidade]

### **Critérios de Aceitação**
1. [Critério 1]
2. [Critério 2]
3. [Critério 3]

### **Dependências**
- [ ] [Dependência 1]
- [ ] [Dependência 2]

### **Tasks Técnicas (Inside-Out)**
#### **Backend C#**
- [ ] `domain:vo` [Nome do VO] (~1h)
  - **Agent**: `Core Value Object (C#)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["spec1", "spec2"]

- [ ] `domain:entity` [Nome da Entidade] (~2h)
  - **Agent**: `Core Entity (C#)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["spec1", "spec2"]

- [ ] `domain:repository` I[Nome]Repository interface (~30min)
  - **Agent**: `Core Repository (C#)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["repository-pattern"]

- [ ] `application:dto` [Nome]Request, [Nome]Response (~1h)
  - **Agent**: `Core DTO (C#)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["dto-specs"]

- [ ] `application:usecase` [Nome]UseCase (~3h)
  - **Agent**: `Core Use Case (C#)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["usecase-specs"]

- [ ] `infrastructure:data` [Nome]Repository (EF Core) (~2h)
  - **Agent**: `Backend Data (C#)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["efcore-repository"]

- [ ] `interface:controller` [Nome]Controller (~2h)
  - **Agent**: `Backend Controller (C#)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["controller-specs"]

#### **Frontend Vue**
- [ ] `frontend:entity` [Nome] entity Vue (~1h)
  - **Agent**: `Frontend Entity (Vue)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["vue-entity"]

- [ ] `frontend:repository` [Nome]HttpRepository Vue (~2h)
  - **Agent**: `Frontend Repository (Vue)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["vue-repository"]

- [ ] `frontend:page` [Nome]View Vue (~2h)
  - **Agent**: `Frontend Page (Vue)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["vue-page"]

#### **Mobile Android**
- [ ] `mobile:entity` [Nome] entity Android (~1h)
  - **Agent**: `Mobile Entity (Android)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["android-entity"]

- [ ] `mobile:repository` [Nome]RepositoryImpl Android (~2h)
  - **Agent**: `Mobile Repository (Android)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["android-repository"]

- [ ] `mobile:screen` [Nome]Screen Android (~2h)
  - **Agent**: `Mobile Screen (Android)`
  - **Prompt**: "[Prompt específico]"
  - **Specs**: ["android-screen"]

### **Testes**
- [ ] `test:unit` Testes domain+app ≥95% (~2h)
  - **Agent**: `Unit Tests (C#)`
  - **Prompt**: "[Prompt específico]"

- [ ] `test:e2e` [Nome] API E2E (~2h)
  - **Agent**: `E2E Tests (C#)`
  - **Prompt**: "[Prompt específico]"

### **Estimativas**
| Componente | Pessimista | Mais Provável | Otimista |
|------------|------------|---------------|----------|
| Backend C# | [X] horas | [Y] horas | [Z] horas |
| Frontend Vue | [X] horas | [Y] horas | [Z] horas |
| Mobile Android | [X] horas | [Y] horas | [Z] horas |
| **Total** | **[Total P]** horas | **[Total MP]** horas | **[Total O]** horas |

### **Riscos**
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| [Risco 1] | Alta | Alto | [Mitigação] |
| [Risco 2] | Média | Médio | [Mitigação] |

### **Notas Técnicas**
- [Nota técnica 1]
- [Nota técnica 2]
```

---

## 📊 **Roadmap por Sprint**

### **Sprint 1 (Mês 1, Semana 1-2)**
**Objetivo**: [Objetivo da sprint]

**User Stories**:
- [ ] **US-001**: [Título]
  - **Estimativa**: [X] pontos
  - **Responsável**: [Nome]
  - **Status**: [ ] Planejada | [ ] Em Andamento | [ ] Concluída

**Tasks Técnicas**:
- [ ] `domain:vo` [Nome] (~1h)
- [ ] `domain:entity` [Nome] (~2h)
- [ ] `application:dto` [Nome] (~1h)

**Entregáveis**:
- [ ] [Entregável 1]
- [ ] [Entregável 2]

### **Sprint 2 (Mês 1, Semana 3-4)**
**Objetivo**: [Objetivo da sprint]

**User Stories**:
- [ ] **US-002**: [Título]
  - **Estimativa**: [X] pontos
  - **Responsável**: [Nome]
  - **Status**: [ ] Planejada | [ ] Em Andamento | [ ] Concluída

**Tasks Técnicas**:
- [ ] `application:usecase` [Nome] (~3h)
- [ ] `infrastructure:data` [Nome] (~2h)
- [ ] `interface:controller` [Nome] (~2h)

---

## 🔧 **Template de Task Técnica**

```markdown
### `[camada]:[tipo]:[entidade]` [Descrição Breve] (~[estimativa])

**Agent**: `[Nome do Agent]`
**Prompt**: "[Prompt específico e detalhado]"
**Specs**: ["[spec1]", "[spec2]"]

**Entregáveis**:
- [ ] [Arquivo/Componente 1]
- [ ] [Arquivo/Componente 2]

**Dependências**:
- [ ] `[camada-dependencia]:[tipo]:[entidade]`

**Critérios de Aceitação Técnicos**:
1. [Critério técnico 1]
2. [Critério técnico 2]

**Notas de Implementação**:
- [Nota 1]
- [Nota 2]
```

---

## 📈 **Métricas do Backlog**

### **Burndown Chart**
```
Sprint 1: ████████████████████ 100% (20/20 pontos)
Sprint 2: ████████████ 60% (12/20 pontos)
Sprint 3: ███ 15% (3/20 pontos)
```

### **Velocidade da Equipe**
| Sprint | Pontos Planejados | Pontos Concluídos | Velocidade |
|--------|-------------------|-------------------|------------|
| Sprint 1 | 20 | 20 | 20 |
| Sprint 2 | 20 | 12 | 16 (média) |
| Sprint 3 | 20 | 3 | 13 (média) |

### **Lead Time e Cycle Time**
| Métrica | Média | Meta |
|---------|-------|------|
| Lead Time | [X] dias | ≤7 dias |
| Cycle Time | [Y] dias | ≤3 dias |

---

## 🚀 **Priorização (RICE Score)**

| User Story | Reach | Impact | Confidence | Effort | **RICE Score** |
|-----------|-------|--------|------------|--------|----------------|
| US-001 | [X] usuários | 3 (massivo) | 80% | [Y] pontos | **[Score]** |
| US-002 | [X] usuários | 2 (alto) | 90% | [Y] pontos | **[Score]** |
| US-003 | [X] usuários | 1 (médio) | 70% | [Y] pontos | **[Score]** |

**Fórmula RICE**: `(Reach × Impact × Confidence) ÷ Effort`

---

## 🔗 **Integração com OpenSpec**

### **Changes Relacionados**
| Change ID | Descrição | Status | Link |
|-----------|-----------|--------|------|
| `EP-001` | [Descrição] | Ativo | [Link] |
| `EP-002` | [Descrição] | Concluído | [Link] |

### **Script de Geração Automática**
```bash
#!/bin/bash
# scripts/generate-bc-backlog.sh

BC_ID=$1
BC_NAME=$2

echo "📋 Gerando backlog para BC-$BC_ID: $BC_NAME"

# 1. Criar estrutura de diretórios
mkdir -p "docs/planning/bounded-contexts/BC-$BC_ID-$BC_NAME"
mkdir -p "docs/planning/bounded-contexts/BC-$BC_ID-$BC_NAME/epics"

# 2. Copiar templates
cp "docs/templates/bounded-context-backlog-template.md" \
   "docs/planning/bounded-contexts/BC-$BC_ID-$BC_NAME/backlog.md"

# 3. Personalizar template
sed -i "s/BC-XXX/BC-$BC_ID/g" \
   "docs/planning/bounded-contexts/BC-$BC_ID-$BC_NAME/backlog.md"
sed -i "s/Nome do Bounded Context/$BC_NAME/g" \
   "docs/planning/bounded-contexts/BC-$BC_ID-$BC_NAME/backlog.md"

echo "✅ Backlog gerado em: docs/planning/bounded-contexts/BC-$BC_ID-$BC_NAME/"
```

---

## 📝 **Checklist de Qualidade do Backlog**

### **Antes da Sprint Planning**
- [ ] Todas as USs têm critérios de aceitação claros
- [ ] Dependências entre USs estão mapeadas
- [ ] Tasks técnicas seguem ordem inside-out
- [ ] Estimativas estão baseadas em dados históricos
- [ ] Riscos identificados têm planos de mitigação

### **Durante a Sprint**
- [ ] Progresso atualizado diariamente
- [ ] Bloqueios reportados imediatamente
- [ ] Métricas de qualidade coletadas
- [ ] Feedback incorporado continuamente

### **Após a Sprint**
- [ ] Retrospectiva realizada e ações definidas
- [ ] Velocidade atualizada
- [ ] Backlog refinado para próxima sprint
- [ ] Lições aprendidas documentadas

---

## 🔄 **Processo de Refinamento**

### **Critérios de Prontidão (Definition of Ready)**
- [ ] US descreve valor de negócio claro
- [ ] Critérios de aceitação são testáveis
- [ ] Dependências identificadas e resolvidas
- [ ] Estimativa de esforço realizada
- [ ] Especificações técnicas disponíveis

### **Critérios de Conclusão (Definition of Done)**
- [ ] Código desenvolvido e revisado
- [ ] Testes unitários com cobertura ≥95%
- [ ] Testes de integração passando
- [ ] Documentação atualizada
- [ ] Deploy em ambiente de staging
- [ ] Aceitação do Product Owner

---

**Última Revisão**: YYYY-MM-DD por [Nome do Revisor]  
**Próxima Revisão**: YYYY-MM-DD  
**Status**: Ativo | Em Refinamento | Arquivado