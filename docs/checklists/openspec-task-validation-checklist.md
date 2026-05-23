# Checklist de Validação para Tasks OpenSpec

**Propósito**: Garantir qualidade, consistência e conformidade com Clean Architecture em todas as tasks OpenSpec.

---

## 📋 **Checklist Geral (Aplicável a Todas as Tasks)**

### **✅ Estrutura da Task**
- [ ] **ID único**: Prefixo + descrição concisa (ex: `domain:vo:password`)
- [ ] **Agent correto**: Nome do agent conforme `agents/openai.yaml`
- [ ] **Prompt claro**: Instruções específicas e completas
- [ ] **Estimate realista**: Tempo estimado (~Xh) baseado em complexidade
- [ ] **Specs listados**: Referências a especificações relevantes
- [ ] **Dependencies**: Tasks predecessoras obrigatórias

### **✅ Conformidade com Clean Architecture**
- [ ] **Ordem inside-out**: domain → application → infrastructure → presentation
- [ ] **Dependências unidirecionais**: Camadas externas dependem de internas
- [ ] **Isolamento de domínio**: Regras de negócio puras no domínio
- [ ] **Ports & Adapters**: Interfaces claras entre camadas

### **✅ Qualidade do Código**
- [ ] **Type safety**: Tipagem forte (TypeScript/C#/Kotlin)
- [ ] **Error handling**: Uso de `Result<T, E>` para erros de domínio
- [ ] **Validation**: Validações de entrada em DTOs
- [ ] **Testing**: Testes unitários com cobertura ≥95% (domínio/aplicação)

---

## 🏗️ **Checklist por Camada**

### **🔹 Domínio (Domain Layer)**

#### **Value Objects (VO)**
- [ ] **Imutabilidade**: Propriedades `readonly`/`val`
- [ ] **Validações**: Regras de domínio no método `create()`
- [ ] **Equality**: Implementação de `Equals()` e `GetHashCode()`
- [ ] **Normalização**: Dados normalizados no construtor
- [ ] **Result<T>**: Retorno `Result<T>` em vez de exceções

#### **Entities & Aggregates**
- [ ] **Aggregate Root**: Identificação clara do aggregate root
- [ ] **Invariants**: Invariantes de domínio preservados
- [ ] **Domain Events**: Eventos de domínio quando aplicável
- [ ] **Business Rules**: Regras de negócio encapsuladas
- [ ] **Identity**: ID único e imutável

#### **Domain Services**
- [ ] **Stateless**: Sem estado interno
- [ ] **Pure Logic**: Apenas regras de domínio
- [ ] **Dependencies**: Apenas interfaces de domínio
- [ ] **Result<T>**: Retorno `Result<T>` para falhas de domínio

### **🔹 Aplicação (Application Layer)**

#### **Use Cases**
- [ ] **Single Responsibility**: Um use case por operação
- [ ] **Orchestration**: Coordenação de entidades e repositórios
- [ ] **Transaction Management**: Uso de `TransactionManager`
- [ ] **Error Mapping**: Conversão de falhas de domínio para `Result<T>`
- [ ] **Dependency Injection**: Injeção via construtor

#### **DTOs (Data Transfer Objects)**
- [ ] **Input Validation**: Validações de entrada (ex: `[Required]`, `[EmailAddress]`)
- [ ] **Output Contracts**: Estrutura clara de resposta
- [ ] **No Domain Logic**: Apenas dados, sem regras de negócio
- [ ] **Serialization**: Atributos para serialização JSON

#### **Queries (CQRS)**
- [ ] **Read Optimization**: Projeções otimizadas para leitura
- [ ] **No Side Effects**: Apenas consulta, sem modificações
- [ ] **Pagination**: Suporte a paginação e filtros
- [ ] **Performance**: Consultas eficientes com índices

### **🔹 Infraestrutura (Infrastructure Layer)**

#### **Repositories**
- [ ] **Interface in Domain**: Interface definida no domínio
- [ ] **Implementation in Infra**: Implementação na infraestrutura
- [ ] **Mapping**: Métodos `toDomain()` e `fromDomain()`
- [ ] **Error Handling**: Conversão de exceções de ORM para `Result<T>`

#### **Persistence (EF Core/JPA/Prisma)**
- [ ] **Entity Configuration**: Configurações Fluent API/`@Entity`
- [ ] **Relationships**: Relacionamentos mapeados corretamente
- [ ] **Indexes**: Índices para consultas frequentes
- [ ] **Migrations**: Migrações SQL geradas corretamente

#### **External Services**
- [ ] **Adapters**: Implementação de ports do domínio
- [ ] **Error Handling**: Tratamento de falhas externas
- [ ] **Retry Logic**: Lógica de retry quando aplicável
- [ ] **Circuit Breaker**: Padrão circuit breaker para serviços instáveis

### **🔹 Apresentação (Presentation Layer)**

#### **Controllers (Backend)**
- [ ] **HTTP Methods**: Verbos HTTP corretos (GET, POST, PUT, DELETE)
- [ ] **Status Codes**: Códigos HTTP apropriados (200, 201, 400, 404, 500)
- [ ] **Validation**: Validação de modelo automática
- [ ] **Authorization**: Atributos `[Authorize]` quando necessário
- [ ] **Error Responses**: Respostas de erro padronizadas

#### **Pages & Components (Frontend)**
- [ ] **Component Structure**: Componentes reutilizáveis e bem estruturados
- [ ] **State Management**: Gerenciamento de estado apropriado (Vuex/Pinia)
- [ ] **Error Handling**: Tratamento de erros de API
- [ ] **Loading States**: Estados de carregamento adequados
- [ ] **Responsive Design**: Design responsivo para diferentes dispositivos

#### **Mobile Screens**
- [ ] **Platform Specific**: Design específico para iOS/Android
- [ ] **Navigation**: Navegação apropriada para mobile
- [ ] **Offline Support**: Suporte offline quando aplicável
- [ ] **Performance**: Otimização para dispositivos móveis

---

## 🎯 **Checklist por Tipo de Task**

### **`domain:vo` - Value Object**
- [ ] **Imutabilidade**: Todas as propriedades são `readonly`
- [ ] **Factory Method**: Método estático `Create()` retorna `Result<T>`
- [ ] **Validation Logic**: Regras de domínio no método `Create()`
- [ ] **Value Equality**: `Equals()` e `GetHashCode()` implementados
- [ ] **No Dependencies**: Sem dependências externas
- [ ] **Serialization**: Suporte a serialização JSON

**Exemplo válido**:
```csharp
public class EmailVO : ValueObject
{
    public string Value { get; }
    
    private EmailVO(string value) => Value = value;
    
    public static Result<EmailVO> Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Fail<EmailVO>("Email não pode ser vazio");
            
        if (!email.Contains("@"))
            return Result.Fail<EmailVO>("Email inválido");
            
        return Result.Ok(new EmailVO(email.ToLowerInvariant()));
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}
```

### **`domain:entity` - Entity/Aggregate**
- [ ] **Aggregate Root**: Classe marcada como aggregate root
- [ ] **Invariants**: Métodos protegem invariantes de domínio
- [ ] **Domain Events**: Eventos emitidos para mudanças importantes
- [ ] **Business Methods**: Métodos que encapsulam regras de negócio
- [ ] **Identity**: Propriedade `Id` imutável

**Exemplo válido**:
```csharp
public class User : AggregateRoot
{
    public UserId Id { get; }
    public EmailVO Email { get; }
    public PasswordVO Password { get; }
    
    private User(UserId id, EmailVO email, PasswordVO password)
    {
        Id = id;
        Email = email;
        Password = password;
    }
    
    public static Result<User> Create(string email, string password)
    {
        var emailResult = EmailVO.Create(email);
        var passwordResult = PasswordVO.Create(password);
        
        var combined = Result.Combine(emailResult, passwordResult);
        if (combined.IsFailure)
            return Result.Fail<User>(combined.Error);
            
        var user = new User(UserId.New(), emailResult.Value, passwordResult.Value);
        
        user.AddDomainEvent(new UserCreated(user.Id));
        
        return Result.Ok(user);
    }
}
```

### **`app:usecase` - Use Case**
- [ ] **Single Operation**: Um use case por operação de negócio
- [ ] **Dependency Injection**: Dependências injetadas via construtor
- [ ] **Transaction Scope**: Uso de `TransactionManager`
- [ ] **Error Mapping**: Conversão de falhas para `Result<T>`
- [ ] **No Presentation Logic**: Apenas lógica de aplicação

**Exemplo válido**:
```csharp
public class LoginUseCase : IUseCase<LoginRequest, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly ITransactionManager _transactionManager;
    
    public LoginUseCase(
        IUserRepository userRepository,
        IJwtTokenGenerator tokenGenerator,
        ITransactionManager transactionManager)
    {
        _userRepository = userRepository;
        _tokenGenerator = tokenGenerator;
        _transactionManager = transactionManager;
    }
    
    public async Task<Result<AuthResponse>> Execute(LoginRequest request)
    {
        return await _transactionManager.RunInTransaction(async () =>
        {
            var userResult = await _userRepository.FindByEmail(request.Email);
            if (userResult.IsFailure)
                return Result.Fail<AuthResponse>(userResult.Error);
                
            var user = userResult.Value;
            
            var isValid = user.Password.Verify(request.Password);
            if (!isValid)
                return Result.Fail<AuthResponse>("Credenciais inválidas");
                
            var token = _tokenGenerator.Generate(user.Id, user.Email.Value);
            
            return Result.Ok(new AuthResponse
            {
                Token = token,
                User = user.ToDto()
            });
        });
    }
}
```

### **`interface:controller` - Controller**
- [ ] **HTTP Attributes**: `[HttpPost]`, `[HttpGet]`, etc.
- [ ] **Route Definition**: `[Route("api/[controller]")]`
- [ ] **Model Validation**: `[FromBody]` com validação automática
- [ ] **Response Types**: `ActionResult<T>` ou `IResult`
- [ ] **Error Handling**: Tratamento de exceções global

**Exemplo válido**:
```csharp
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly LoginUseCase _loginUseCase;
    
    public AuthController(LoginUseCase loginUseCase)
    {
        _loginUseCase = loginUseCase;
    }
    
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _loginUseCase.Execute(request);
        
        if (result.IsFailure)
            return BadRequest(new { error = result.Error });
            
        return Ok(result.Value);
    }
}
```

---

## 🔄 **Checklist de Workflow**

### **✅ Antes de `openspec-propose`**
- [ ] **Requirements Analysis**: `req-discovery` concluído
- [ ] **Domain Modeling**: `req-ddd-modeling` concluído
- [ ] **Migration Strategy**: `req-migration-strategy` definido
- [ ] **Delivery Profile**: `delivery-profile.md` criado
- [ ] **Backlog Planning**: `req-agile-planning` gerou `backlog.md`

### **✅ Durante `openspec-propose`**
- [ ] **Change ID**: Formato `ep-XXX-nome-descritivo`
- [ ] **Proposal Document**: `proposal.md` com escopo claro
- [ ] **Tasks Breakdown**: `tasks.md` com todas as tasks necessárias
- [ ] **Dependencies**: Tasks predecessoras identificadas
- [ ] **Estimates**: Tempos realistas por task

### **✅ Antes de `openspec-apply-change`**
- [ ] **Dependency Validation**: `openspec-validate-dependencies` executado
- [ ] **Order Verification**: Ordem inside-out correta
- [ ] **Agent Mapping**: Cada task tem agent correto
- [ ] **Prompt Completeness**: Prompts específicos e completos

### **✅ Durante `openspec-apply-change`**
- [ ] **Sequential Execution**: Tasks executadas na ordem correta
- [ ] **Context Sharing**: Cache de contexto utilizado quando aplicável
- [ ] **Error Handling**: Falhas tratadas apropriadamente
- [ ] **Progress Tracking**: Status atualizado em tempo real

### **✅ Após `openspec-apply-change`**
- [ ] **Code Review**: Código revisado para qualidade
- [ ] **Test Coverage**: Cobertura ≥95% verificada
- [ ] **Integration Tests**: Testes E2E executados
- [ ] **Documentation**: Documentação atualizada

### **✅ Durante `openspec-archive-change`**
- [ ] **Completion Verification**: Todas as tasks marcadas como completas
- [ ] **Artifacts Review**: Artefatos revisados e organizados
- [ ] **Lessons Learned**: Lições aprendidas documentadas
- [ ] **Dashboard Update**: Dashboard de progresso atualizado

---

## 🧪 **Checklist de Testes**

### **✅ Testes Unitários (Domínio/Aplicação)**
- [ ] **Coverage ≥95%**: Cobertura de código suficiente
- [ ] **Happy Path**: Testes para fluxo normal
- [ ] **Error Cases**: Testes para falhas esperadas
- [ ] **Edge Cases**: Testes para casos limite
- [ ] **Mocking**: Dependências externas mockadas

### **✅ Testes de Integração**
- [ ] **Database Integration**: Testes com banco real (em memória)
- [ ] **External Services**: Testes com serviços externos mockados
- [ ] **API Contracts**: Testes de contratos de API

### **✅ Testes E2E**
- [ ] **Critical Paths**: Testes para fluxos críticos de negócio
- [ ] **User Journeys**: Testes para jornadas completas do usuário
- [ ] **Performance**: Testes de performance para endpoints críticos

---

## 📊 **Checklist de Métricas**

### **✅ Code Quality Metrics**
- [ ] **Cyclomatic Complexity**: ≤10 por método
- [ ] **Cognitive Complexity**: ≤15 por método
- [ ] **Maintainability Index**: ≥70
- [ ] **Lines of Code**: ≤100 por método, ≤1000 por classe

### **✅ Test Metrics**
- [ ] **Mutation Score**: ≥90% (Stryker)
- [ ] **Test Execution Time**: ≤5 minutos para suite completa
- [ ] **Flaky Tests**: 0 flaky tests

### **✅ Performance Metrics**
- [ ] **Response Time**: ≤200ms para 95% das requisições
- [ ] **Throughput**: ≥100 req/s para endpoints críticos
- [ ] **Memory Usage**: ≤100MB para processo principal

---

## 🚨 **Checklist de Segurança**

### **✅ Authentication & Authorization**
- [ ] **JWT Validation**: Tokens validados corretamente
- [ ] **Role-Based Access**: Controle de acesso baseado em papéis
- [ ] **Tenant Isolation**: Dados isolados por tenant

### **✅ Input Validation**
- [ ] **SQL Injection**: Prevenção de SQL injection
- [ ] **XSS Protection**: Prevenção de cross-site scripting
- [ ] **CSRF Protection**: Proteção contra CSRF quando aplicável

### **✅ Data Protection**
- [ ] **Sensitive Data**: Dados sensíveis criptografados
- [ ] **Password Hashing**: Senhas armazenadas com hash bcrypt/argon2
- [ ] **API Keys**: Chaves de API armazenadas com segurança

---

## 🔧 **Checklist de Ferramentas**

### **✅ Development Tools**
- [ ] **IDE Configuration**: Configurações consistentes entre desenvolvedores
- [ ] **Linting**: ESLint/StyleCop configurado
- [ ] **Formatting**: Prettier/dotnet-format configurado

### **✅ CI/CD Tools**
- [ ] **Build Pipeline**: Pipeline de build configurado
- [ ] **Test Automation**: Testes automatizados no CI
- [ ] **Deployment**: Deploy automatizado configurado

### **✅ Monitoring Tools**
- [ ] **Logging**: Sistema de logging configurado
- [ ] **Metrics**: Coleta de métricas configurada
- [ ] **Alerting**: Sistema de alertas configurado

---

## 📋 **Checklist de Documentação**

### **✅ Technical Documentation**
- [ ] **API Documentation**: Swagger/OpenAPI configurado
- [ ] **Architecture Diagrams**: Diagramas de arquitetura atualizados
- [ ] **Database Schema**: Schema do banco documentado

### **✅ User Documentation**
- [ ] **User Guides**: Guias de usuário para funcionalidades principais
- [ ] **API Reference**: Referência de API completa
- [ ] **Troubleshooting**: Guia de troubleshooting

### **✅ Development Documentation**
- [ ] **Setup Guide**: Guia de setup para novos desenvolvedores
- [ ] **Coding Standards**: Padrões de código documentados
- [ ] **Deployment Guide**: Guia de deploy para diferentes ambientes

---

## 🎯 **Checklist de Entrega**

### **✅ Definition of Done (DoD)**
- [ ] **Code Complete**: Todo o código implementado
- [ ] **Tests Passing**: Todos os testes passando
- [ ] **Code Reviewed**: Code review concluído
- [ ] **Documentation Updated**: Documentação atualizada

### **✅ Release Checklist**
- [ ] **Version Bumped**: Versão incrementada
- [ ] **Changelog Updated**: Changelog atualizado
- [ ] **Release Notes**: Notas de release criadas
- [ ] **Deployment Verified**: Deploy verificado em ambiente de staging

### **✅ Post-Release Checklist**
- [ ] **Monitoring**: Monitoramento ativo após release
- [ ] **Feedback Collection**: Coleta de feedback iniciada
- [ ] **Retrospective**: Retrospectiva agendada

---

## 📈 **Checklist de Melhoria Contínua**

### **✅ Retrospective Actions**
- [ ] **Lessons Learned**: Lições aprendidas documentadas
- [ ] **Process Improvements**: Melhorias de processo identificadas
- [ ] **Tooling Improvements**: Melhorias de ferramentas identificadas

### **✅ Metrics Review**
- [ ] **Performance Review**: Métricas de performance revisadas
- [ ] **Quality Review**: Métricas de qualidade revisadas
- [ ] **Productivity Review**: Métricas de produtividade revisadas

### **✅ Planning for Next Iteration**
- [ ] **Backlog Grooming**: Backlog priorizado para próxima iteração
- [ ] **Capacity Planning**: Capacidade da equipe planejada
- [ ] **Risk Assessment**: Riscos identificados e mitigados

---

## 🔗 **Referências**

### **Documentação Relacionada**
- [OpenSpec Task Template](../../templates/openspec-task-template.yaml)
- [OpenSpec Tutorial](../../tutorial/04-ciclo-completo-openspec.md)
- [Dashboard de Progresso](../../dashboard/openspec-progress-dashboard.md)

### **Ferramentas Recomendadas**
- **Testing**: xUnit/NUnit, Moq/NSubstitute, Coverlet
- **Code Quality**: SonarQube, NDepend
- **CI/CD**: GitHub Actions, Azure DevOps
- **Monitoring**: Application Insights, Seq, Grafana

---

## 📝 **Como Usar Este Checklist**

### **Para Desenvolvedores**
1. **Antes de implementar**: Revise o checklist da camada correspondente
2. **Durante implementação**: Marque itens conforme concluídos
3. **Após implementação**: Verifique todos os itens antes de marcar task como completa

### **Para Reviewers**
1. **Code Review**: Use o checklist para garantir qualidade
2. **Approval**: Aprove apenas se todos os itens relevantes estiverem marcados

### **Para Product Owners**
1. **Acceptance**: Use o checklist para validar entregas
2. **Prioritization**: Considere itens do checklist durante planejamento

---

**Última atualização**: 2026-05-23  
**Versão**: 1.0.0  
**Status**: ✅ Ativo