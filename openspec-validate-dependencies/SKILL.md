---
name: openspec-validate-dependencies
stack: agnostic
description: Valida automaticamente dependências entre tasks OpenSpec e verifica conformidade com Clean Architecture. Usar antes de openspec-apply-change para garantir ordem correta de implementação.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: OpenSpec Skills Team
  version: '1.0.0'
  generatedBy: '1.2.0'
---

Valida automaticamente dependências entre tasks OpenSpec e verifica conformidade com Clean Architecture.

**Propósito**: Garantir que as tasks em `tasks.md` seguem a ordem correta de implementação (inside-out) e que todas as dependências necessárias estão presentes antes de executar `openspec-apply-change`.

**Quando usar**:
- Antes de executar `openspec-apply-change` em uma change
- Durante `openspec-propose` para validar tasks geradas
- Como verificação independente de qualidade de tasks

---

## **Input**

Opcionalmente especifique um nome de change. Se omitido, o skill tentará inferir do contexto da conversa.

---

## **Steps**

### 1. **Selecionar a change**

Se um nome for fornecido, use-o. Caso contrário:
- Inferir do contexto da conversa se o usuário mencionou uma change
- Auto-selecionar se apenas uma change ativa existir
- Se ambíguo, executar `openspec list --json` para obter changes disponíveis

Sempre anunciar: "Validando dependências da change: <nome>"

### 2. **Ler arquivo tasks.md**

```bash
openspec status --change "<nome>" --json
```

Verificar se `tasks.md` existe e está acessível. Se não existir:
- Reportar erro: "tasks.md não encontrado para a change <nome>"
- Sugerir executar `openspec-propose` primeiro

### 3. **Analisar estrutura de tasks**

Extrair todas as tasks do `tasks.md`:
- ID da task (prefixo)
- Agent
- Dependências (se especificadas)
- Status (se aplicável)

### 4. **Validar regras Clean Architecture**

#### **Regra 1: Ordem inside-out obrigatória**
Verificar que tasks seguem a ordem:
```
domain:vo → domain:entity → domain:service → app:dto → app:usecase → app:query → infra:persistence → interface:controller
```

#### **Regra 2: Frontend Vue - ordem completa**
Para tasks Vue, verificar:
```
interface:entity → interface:usecase → interface:repository → interface:page → interface:form-web
```

#### **Regra 3: Mobile Android - ordem completa**
Para tasks Android, verificar:
```
interface:mobile-entity → interface:mobile-usecase → interface:mobile-repository → interface:mobile
```

#### **Regra 4: Testes no final**
Verificar que tasks de teste estão no final:
```
test:unit → test:e2e → test:unit-web → test:unit-mobile
```

### 5. **Validar dependências explícitas**

Para cada task com campo `dependencies`:
- Verificar se todas as dependências listadas existem como tasks
- Verificar se dependências estão antes da task dependente
- Reportar dependências faltantes ou fora de ordem

### 6. **Validar mapeamento Agent → Skill**

Para cada `Agent` listado:
- Verificar se corresponde a um skill existente
- Verificar se a stack está correta (ex: `(C#)` para tasks backend C#)
- Reportar Agents inválidos ou skills não encontrados

### 7. **Validar prompts**

Para cada `Prompt`:
- Verificar se é específico e direcionado
- Verificar se inclui todos os requisitos necessários
- Verificar se referencia specs corretamente

### 8. **Gerar relatório de validação**

#### **Seção A: Status Geral**
- Total de tasks analisadas
- Tasks com dependências válidas
- Tasks com dependências inválidas
- Conformidade Clean Architecture

#### **Seção B: Problemas Identificados**
Listar cada problema com:
- ID da task
- Tipo de problema
- Recomendação de correção

#### **Seção C: Checklist de Correção**
Checklist interativo para corrigir problemas:
- [ ] Reordenar tasks fora de sequência
- [ ] Adicionar tasks faltantes
- [ ] Corrigir Agents inválidos
- [ ] Melhorar prompts genéricos

### 9. **Oferecer correções automáticas**

Para problemas comuns, oferecer correção automática:

#### **Problema: Task `interface:page` sem `interface:entity` antes**
**Correção**: Inserir task `interface:entity` antes

#### **Problema: Task `app:usecase` sem `domain:entity` antes**
**Correção**: Inserir task `domain:entity` antes

#### **Problema: Agent inválido `Backend Controller` (sem stack)**
**Correção**: Corrigir para `Backend Controller (C#)` ou stack apropriada

### 10. **Validar contra template padronizado**

Comparar tasks com [template padronizado](../templates/openspec-task-template.yaml):
- Verificar estrutura de cada task
- Validar campos obrigatórios
- Verificar conformidade com templates por camada

---

## **Regras de Validação Detalhadas**

### **1. Prefixos Válidos por Camada**

#### **Domínio (C#)**
- `domain:vo` - Value Object
- `domain:entity` - Entity/Aggregate
- `domain:service` - Domain Service

#### **Aplicação (C#)**
- `app:dto` - Data Transfer Object
- `app:usecase` - Use Case
- `app:query` - Query CQRS

#### **Infraestrutura (C#)**
- `infra:persistence` - Repository implementation
- `interface:controller` - HTTP Controller

#### **Frontend Vue**
- `interface:entity` - Frontend Entity
- `interface:usecase` - Frontend Use Case
- `interface:repository` - Frontend Repository
- `interface:page` - Page/View
- `interface:form-web` - Form

#### **Mobile Android**
- `interface:mobile-entity` - Mobile Entity
- `interface:mobile-usecase` - Mobile Use Case
- `interface:mobile-repository` - Mobile Repository
- `interface:mobile` - Screen

#### **Testes**
- `test:unit` - Unit Tests
- `test:e2e` - E2E Tests
- `test:unit-web` - Frontend Tests
- `test:unit-mobile` - Mobile Tests

### **2. Ordem Obrigatória (Clean Architecture)**

```
1.  domain:vo
2.  domain:entity
3.  domain:service
4.  app:dto
5.  app:usecase
6.  app:query
7.  infra:persistence
8.  interface:controller
9.  interface:entity (Vue)
10. interface:usecase (Vue)
11. interface:repository (Vue)
12. interface:page (Vue)
13. interface:form-web (Vue)
14. interface:mobile-entity (Android)
15. interface:mobile-usecase (Android)
16. interface:mobile-repository (Android)
17. interface:mobile (Android)
18. test:unit
19. test:e2e
20. test:unit-web
21. test:unit-mobile
```

### **3. Mapeamento Agent → Skill**

#### **Backend C#**
- `Core Value Object (C#)` → `core-value-object-cs`
- `Core Entity (C#)` → `core-entity-cs`
- `Core Domain Service (C#)` → `core-domain-service-cs`
- `Core DTO (C#)` → `core-dto-cs`
- `Core Use Case (C#)` → `core-use-case-cs`
- `Core Query CQRS (C#)` → `core-query-cqrs-cs`
- `Backend Data (C#)` → `backend-data-cs`
- `Backend Controller (C#)` → `backend-controller-cs`

#### **Frontend Vue**
- `Frontend Entity (Vue)` → `frontend-entity-vue`
- `Frontend UseCase (Vue)` → `frontend-usecase-vue`
- `Frontend Repository (Vue)` → `frontend-repository-vue`
- `Frontend Page (Vue)` → `frontend-page-vue`
- `Frontend Form (Vue)` → `frontend-form-vue`

#### **Mobile Android**
- `Mobile Entity (Android)` → `mobile-entity-android`
- `Mobile UseCase (Android)` → `mobile-usecase-android`
- `Mobile Repository (Android)` → `mobile-repository-android`
- `Mobile Screen (Android)` → `mobile-screen-android`
- `Mobile Form (Android)` → `mobile-form-android`

#### **Testes**
- `Unit Tests (C#)` → `test-unit-cs`
- `E2E Tests (C#)` → `test-e2e-cs`
- `Unit Tests (TypeScript)` → `test-unit`
- `Unit Tests (Kotlin)` → `test-unit-kt`

---

## **Exemplos de Validação**

### **Exemplo 1: Tasks em ordem correta**
```markdown
- [ ] `domain:vo` PasswordVO (~1h)
  - **Agent:** `Core Value Object (C#)`
  
- [ ] `domain:entity` User (~2h)
  - **Agent:** `Core Entity (C#)`
  
- [ ] `app:usecase` LoginUseCase (~3h)
  - **Agent:** `Core Use Case (C#)`
```

**Resultado**: ✅ Válido - Segue ordem inside-out

### **Exemplo 2: Task `interface:page` sem `interface:entity`**
```markdown
- [ ] `interface:page` LoginView (~2h)
  - **Agent:** `Frontend Page (Vue)`
```

**Resultado**: ❌ Inválido - Falta `interface:entity` antes

**Recomendação**: Adicionar task `interface:entity` antes de `interface:page`

### **Exemplo 3: Agent sem stack especificada**
```markdown
- [ ] `interface:controller` AuthController (~2h)
  - **Agent:** `Backend Controller`
```

**Resultado**: ❌ Inválido - Agent deve incluir stack: `Backend Controller (C#)`

**Recomendação**: Corrigir para `Backend Controller (C#)`

---

## **Integração com OpenSpec Workflow**

### **Integração com `openspec-propose`**
Executar automaticamente após gerar `tasks.md`:
1. `openspec-propose "ep-001-auth"`
2. `openspec-validate-dependencies "ep-001-auth"`
3. Corrigir problemas identificados
4. Continuar com `openspec-apply-change`

### **Integração com `openspec-apply-change`**
Executar como pré-requisito:
1. `openspec-validate-dependencies "ep-001-auth"`
2. Se válido: `openspec-apply-change "ep-001-auth"`
3. Se inválido: Reportar problemas e sugerir correções

### **Validação em CI/CD**
Incluir no pipeline:
```yaml
steps:
  - name: Validate OpenSpec dependencies
    run: |
      openspec validate-dependencies --change "$CHANGE_NAME"
```

---

## **Output**

### **Se válido**
```
✅ Validação concluída com sucesso!

Change: ep-001-auth
Tasks analisadas: 12
Conformidade Clean Architecture: 100%
Dependências válidas: 12/12

Recomendação: Pronto para openspec-apply-change
```

### **Se inválido**
```
❌ Problemas identificados na change ep-001-auth

Problemas (3):
1. Task `interface:page` (linha 45) sem `interface:entity` antes
   → Recomendação: Adicionar task `interface:entity` antes

2. Agent `Backend Controller` (linha 32) sem stack especificada
   → Recomendação: Corrigir para `Backend Controller (C#)`

3. Task `app:usecase` (linha 28) sem `domain:entity` antes
   → Recomendação: Adicionar task `domain:entity` antes

Checklist de correção:
- [ ] Reordenar tasks conforme ordem Clean Architecture
- [ ] Corrigir Agents para incluir stack
- [ ] Adicionar tasks faltantes

Execute as correções e valide novamente antes de openspec-apply-change.
```

---

## **Referências**

- [Template Padronizado para Tasks OpenSpec](../templates/openspec-task-template.yaml)
- [Skills Standards](../../skills-standards.md)
- [Tutorial 04 - Ciclo Completo OpenSpec](../docs/tutorial/04-ciclo-completo-openspec.md)
- [Exemplos Stack C# + Vue + Android](../templates/openspec-stack-cs-vue-android-example.md)