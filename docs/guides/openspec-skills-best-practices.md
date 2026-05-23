# Melhores Práticas para Integração OpenSpec + Skills

**Propósito**: Documentar padrões, convenções e melhores práticas para otimizar o ciclo de desenvolvimento com OpenSpec e Skills no projeto RetailOps (C# + Vue + Android).

---

## 🎯 **Princípios Fundamentais**

### **1. Inside-Out Development**
Sempre seguir a ordem Clean Architecture do domínio para a infraestrutura:
```
1. Value Objects (VO) → 2. Entidades → 3. Repositórios → 4. Use Cases → 5. Controllers
```

**Exemplo Correto (C#):**
```markdown
- [ ] `domain:vo` EmailVO com validação de formato (~1h)
  - **Agent:** `Core Value Object (C#)`
  - **Prompt:** "Crie EmailVO com Create() retornando Result<T> e validação regex."

- [ ] `domain:entity` User com EmailVO e PasswordVO (~2h)
  - **Agent:** `Core Entity (C#)`
  - **Prompt:** "Aggregate root User com EmailVO e PasswordVO; validações de domínio."

- [ ] `domain:repository` IUserRepository com operações CRUD (~1.5h)
  - **Agent:** `Core Repository (C#)`
  - **Prompt:** "Interface IUserRepository com CreateAsync, GetByIdAsync, etc."

- [ ] `application:usecase` CreateUserUseCase (~2h)
  - **Agent:** `Core Use Case (C#)`
  - **Prompt:** "Use case CreateUserUseCase que valida regras de negócio e chama IUserRepository."

- [ ] `infrastructure:data` UserRepository (EF Core) (~2h)
  - **Agent:** `Backend Data (C#)`
  - **Prompt:** "Implementação UserRepository com EF Core DbContext e mapeamentos."

- [ ] `interface:controller` UsersController (~1.5h)
  - **Agent:** `Backend Controller (C#)`
  - **Prompt:** "Controller UsersController com endpoints HTTP e injeção de CreateUserUseCase."
```

### **2. Cache de Contexto entre Skills**
Reutilizar objetos de domínio entre skills para otimizar performance:

```csharp
// Exemplo: Cache de EmailVO entre skills
public class ContextCacheManager
{
    private readonly Dictionary<string, object> _cache = new();
    
    public T GetOrCreate<T>(string key, Func<T> factory)
    {
        if (_cache.TryGetValue(key, out var cached))
        {
            return (T)cached;
        }
        
        var value = factory();
        _cache[key] = value;
        return value;
    }
}

// Uso no skill de criação de usuário
public class CreateUserSkill
{
    public async Task<Result<User>> Execute(CreateUserParams parameters)
    {
        var context = ContextFactory.GetManager(parameters.ChangeId);
        
        // Reutiliza EmailVO se já calculado
        var emailVo = context.GetOrCreate(
            "domain:vo:email",
            () => EmailVO.Create(parameters.Email).Value
        );
        
        // Reutiliza PasswordVO se já calculado  
        var passwordVo = context.GetOrCreate(
            "domain:vo:password", 
            () => PasswordVO.Create(parameters.Password).Value
        );
        
        // Cria usuário com VOs cacheados
        var userResult = User.Create(emailVo, passwordVo);
        return userResult;
    }
}
```

### **3. Padronização de Nomenclatura**
Use convenções consistentes em todo o ciclo:

| Artefato | Padrão | Exemplo |
|----------|--------|---------|
| **Épicos** | `EP-XXX` | `EP-001`, `EP-002` |
| **User Stories** | `US-XXX` | `US-001`, `US-002` |
| **Tasks** | `camada:tipo:entidade` | `domain:entity:user`, `application:usecase:create-user` |
| **Branches** | `feature/EP-XXX` | `feature/EP-001-auth` |
| **Commits** | `conventional commits` | `feat(auth): add user registration` |

---

## 🔧 **Workflow Otimizado**

### **Fase 1: Análise e Planejamento (1-2 dias)**
```
1. req-discovery → requirements.md + delivery-inventory.md
2. req-ddd-modeling → ddd-strategic-model.md + ddd-tactical-model.md
3. req-agile-planning → backlog.md com tasks específicas
```

**Checklist de Qualidade:**
- [ ] Todos os bounded contexts do MVP mapeados
- [ ] Superfícies de entrega (API/Web/Mobile) definidas por BC
- [ ] Telas e fluxos documentados para web/mobile
- [ ] Tasks seguem ordem inside-out
- [ ] Dependências entre tasks validadas

### **Fase 2: Implementação com OpenSpec**
```
1. openspec-propose EP-XXX → Cria estrutura do change
2. openspec-validate-dependencies → Valida ordem das tasks
3. openspec-apply-change EP-XXX → Executa tasks automaticamente
4. openspec-archive-change EP-XXX → Finaliza e documenta
```

**Script de Execução Otimizado:**
```bash
#!/bin/bash
# scripts/execute-openspec-change.sh

CHANGE_ID=$1

echo "🚀 Iniciando execução do change $CHANGE_ID"

# 1. Validar dependências
echo "🔍 Validando dependências..."
npx @namespace/openspec-validate-dependencies --change $CHANGE_ID

if [ $? -ne 0 ]; then
    echo "❌ Dependências inválidas. Corrija antes de continuar."
    exit 1
fi

# 2. Executar change
echo "⚡ Executando tasks..."
openspec-apply-change $CHANGE_ID

# 3. Verificar progresso
echo "📊 Verificando progresso..."
./scripts/check-progress.sh --change $CHANGE_ID

# 4. Atualizar dashboard
echo "📈 Atualizando dashboard..."
./scripts/update-dashboard.sh --change $CHANGE_ID

echo "✅ Change $CHANGE_ID executado com sucesso!"
```

### **Fase 3: Validação e Deploy**
```
1. Executar testes unitários e de integração
2. Validar cobertura de código (≥95%)
3. Executar pipeline CI/CD
4. Deploy para ambiente de staging
5. Validação manual (se necessário)
6. Deploy para produção
```

---

## 🛠️ **Otimizações Técnicas**

### **1. Reutilização de Código entre Skills**
```csharp
// BaseSkill.cs - Classe base para todos os skills
public abstract class BaseSkill<TParams, TResult>
{
    protected readonly ContextCacheManager ContextCache;
    
    public BaseSkill(ContextCacheManager contextCache)
    {
        ContextCache = contextCache;
    }
    
    public abstract Task<Result<TResult>> Execute(TParams parameters);
    
    protected T GetCachedOrCreate<T>(string key, Func<T> factory)
    {
        return ContextCache.GetOrCreate($"skill:{GetType().Name}:{key}", factory);
    }
}

// Exemplo de skill específico
public class CreateUserSkill : BaseSkill<CreateUserParams, User>
{
    public override async Task<Result<User>> Execute(CreateUserParams parameters)
    {
        // Reutiliza EmailVO de outros skills
        var emailVo = GetCachedOrCreate(
            "email-vo",
            () => EmailVO.Create(parameters.Email).Value
        );
        
        // Lógica específica do skill
        var user = User.Create(emailVo, parameters.Password);
        return Result.Success(user);
    }
}
```

### **2. Validação Automática de Dependências**
```csharp
// DependencyValidator.cs
public class DependencyValidator
{
    public Result Validate(List<OpenSpecTask> tasks)
    {
        var errors = new List<string>();
        
        foreach (var task in tasks)
        {
            // Verifica se dependências existem
            foreach (var dependency in task.Dependencies)
            {
                if (!tasks.Any(t => t.Id == dependency))
                {
                    errors.Add($"Task {task.Id} depende de {dependency} que não existe");
                }
            }
            
            // Verifica ordem inside-out
            if (task.Layer == "interface" && 
                tasks.Any(t => t.Dependencies.Contains(task.Id) && t.Layer == "domain"))
            {
                errors.Add($"Task {task.Id} (interface) não pode depender de task de domínio");
            }
        }
        
        return errors.Any() 
            ? Result.Fail(string.Join("\n", errors))
            : Result.Success();
    }
}
```

### **3. Monitoramento de Performance**
```csharp
// PerformanceMonitor.cs
public class PerformanceMonitor
{
    private readonly Dictionary<string, SkillMetrics> _metrics = new();
    
    public void RecordExecution(string skillName, TimeSpan duration, bool success)
    {
        if (!_metrics.ContainsKey(skillName))
        {
            _metrics[skillName] = new SkillMetrics();
        }
        
        _metrics[skillName].RecordExecution(duration, success);
    }
    
    public SkillReport GenerateReport()
    {
        return new SkillReport
        {
            TotalSkills = _metrics.Count,
            AverageExecutionTime = _metrics.Values.Average(m => m.AverageDuration),
            SuccessRate = _metrics.Values.Average(m => m.SuccessRate),
            TopSlowestSkills = _metrics
                .OrderByDescending(kv => kv.Value.AverageDuration)
                .Take(5)
                .Select(kv => new { Skill = kv.Key, Time = kv.Value.AverageDuration })
                .ToList()
        };
    }
}

// Uso nos skills
public class InstrumentedSkill : BaseSkill<CreateUserParams, User>
{
    private readonly PerformanceMonitor _monitor;
    
    public override async Task<Result<User>> Execute(CreateUserParams parameters)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            var result = await base.Execute(parameters);
            stopwatch.Stop();
            
            _monitor.RecordExecution(
                GetType().Name,
                stopwatch.Elapsed,
                result.IsSuccess
            );
            
            return result;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _monitor.RecordExecution(GetType().Name, stopwatch.Elapsed, false);
            throw;
        }
    }
}
```

---

## 📊 **Métricas e KPIs**

### **Métricas do Ciclo OpenSpec**
| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Tempo médio por task** | ≤2 horas | `(total_execution_time) / (tasks_completed)` |
| **Taxa de sucesso** | ≥95% | `(tasks_successful) / (total_tasks)` |
| **Reutilização de cache** | ≥70% | `(cache_hits) / (total_cache_requests)` |
| **Cobertura de testes** | ≥95% | `dotnet test --collect:"XPlat Code Coverage"` |
| **Tempo de deploy** | ≤15 minutos | `(deploy_end_time) - (deploy_start_time)` |

### **Dashboard de Monitoramento**
```bash
# scripts/generate-metrics-dashboard.sh
#!/bin/bash

echo "📊 Dashboard de Métricas OpenSpec"
echo "=================================="
echo ""

# 1. Métricas gerais
echo "📈 Métricas Gerais:"
echo "-------------------"
./scripts/get-metric.sh --metric "average-task-time"
./scripts/get-metric.sh --metric "success-rate"
./scripts/get-metric.sh --metric "cache-hit-rate"

# 2. Skills mais utilizados
echo ""
echo "🔧 Skills Mais Utilizados:"
echo "--------------------------"
./scripts/get-top-skills.sh --limit 10

# 3. Changes em andamento
echo ""
echo "🚧 Changes em Andamento:"
echo "------------------------"
./scripts/get-active-changes.sh

# 4. Próximos passos recomendados
echo ""
echo "🎯 Recomendações:"
echo "-----------------"
./scripts/get-recommendations.sh
```

---

## 🚀 **Checklist de Implementação Rápida**

### **Para Novos Bounded Contexts**
- [ ] Criar diretório `openspec/changes/active/EP-XXX`
- [ ] Definir tasks seguindo ordem inside-out
- [ ] Validar dependências com `openspec-validate-dependencies`
- [ ] Executar com `openspec-apply-change EP-XXX`
- [ ] Atualizar dashboard de progresso

### **Para Otimização de Skills Existentes**
- [ ] Implementar cache de contexto
- [ ] Adicionar logging de performance
- [ ] Validar reutilização de código
- [ ] Atualizar documentação do skill
- [ ] Testar em ambiente isolado

### **Para Monitoramento Contínuo**
- [ ] Configurar coleta de métricas
- [ ] Criar alertas para KPIs críticos
- [ ] Estabelecer baselines de performance
- [ ] Revisar métricas semanalmente
- [ ] Ajustar otimizações com base em dados

---

## 🔗 **Recursos Relacionados**

1. **[Workflow CI/CD](workflows/openspec-ci-cd-workflow.md)** - Pipeline completo de integração contínua
2. **[Template de Tasks](templates/openspec-csharp-task-examples.md)** - Exemplos específicos para stack C#
3. **[Guia de Troubleshooting](openspec-troubleshooting-guide.md)** - Soluções para problemas comuns
4. **[Checklist de Validação](checklists/openspec-phase-validation-checklist.md)** - Validação por fase do ciclo
5. **[Dashboard de Progresso](dashboard/openspec-progress-dashboard.md)** - Monitoramento visual do progresso

---

## 📝 **Manutenção e Evolução**

### **Revisões Periódicas**
- **Semanal**: Revisar métricas de performance
- **Mensal**: Avaliar eficácia das otimizações
- **Trimestral**: Revisar arquitetura e padrões

### **Processo de Melhoria Contínua**
```
1. Coletar métricas e feedback
2. Identificar oportunidades de otimização
3. Propor melhorias (RFC - Request for Comments)
4. Implementar e testar em ambiente isolado
5. Medir impacto e ajustar
6. Documentar e compartilhar aprendizados
```

### **Versionamento de Skills**
```yaml
# .agents/skills/core-entity-cs/agents/openai.yaml
display_name: "Core Entity (C#)"
version: "2.1.0"
dependencies:
  - core-value-object-cs: "^1.3.0"
  - shared-core-cs: "^1.0.0"
changelog:
  - version: "2.1.0"
    changes:
      - "Added context cache support"
      - "Improved error handling"
      - "Optimized performance by 30%"
```

---

**Última atualização**: 2026-05-23  
**Responsável**: Equipe de Arquitetura RetailOps  
**Status**: Ativo e em evolução contínua