# Checklist de Validação por Fase do Ciclo OpenSpec

**Propósito**: Fornecer checklists abrangentes para validação de qualidade em cada fase do ciclo OpenSpec com Skills.

---

## 📋 **Checklist Geral - Antes de Iniciar Qualquer Fase**

### **✅ Contexto do Projeto**
- [ ] **Stack definida**: Tecnologias específicas (C# + Vue + Android, etc.)
- [ ] **Arquitetura clara**: Clean Architecture com camadas bem definidas
- [ ] **Bounded Contexts mapeados**: Subdomínios identificados e priorizados
- [ ] **MVP definido**: Funcionalidades mínimas viáveis para entrega

### **✅ Configuração do Ambiente**
- [ ] **OpenSpec configurado**: Estrutura `openspec/changes/` criada
- [ ] **Skills disponíveis**: Skills necessários instalados e funcionais
- [ ] **Templates prontos**: Templates de tasks e proposals disponíveis
- [ ] **Dashboard configurado**: Sistema de monitoramento implementado

---

## 🔍 **Fase 1: Análise e Descoberta**

### **✅ req-discovery (Descoberta de Requisitos)**
- [ ] **Inventário completo**: `delivery-inventory.md` criado
- [ ] **BCs identificados**: Bounded Contexts listados com descrições
- [ ] **Regras de negócio**: Regras críticas documentadas
- [ ] **Entidades mapeadas**: Entidades principais identificadas
- [ ] **Fluxos de trabalho**: Fluxos de usuário documentados
- [ ] **Integrações externas**: APIs e serviços externos listados

### **✅ req-ddd-modeling (Modelagem DDD)**
- [ ] **Modelo estratégico**: `ddd-strategic-model.md` completo
- [ ] **Modelo tático**: `ddd-tactical-model.md` com detalhes por BC
- [ ] **Apresentação definida**: Web/Mobile/API por BC especificados
- [ ] **Linguagem ubíqua**: Termos de domínio padronizados
- [ ] **Context map**: Relacionamentos entre BCs mapeados

### **✅ req-migration-strategy (Estratégia de Migração)**
- [ ] **Padrão definido**: Strangler Fig, Big Bang, ou incremental
- [ ] **Sequência de BCs**: Ordem de migração estabelecida
- [ ] **ACL desenhada**: Anti-Corruption Layer especificada
- [ ] **Plano de coexistência**: Legado + novo sistema documentado
- [ ] **Riscos identificados**: Riscos de migração listados

### **✅ delivery-profile (Perfil de Entrega)**
- [ ] **Stack por BC**: Tecnologias específicas por bounded context
- [ ] **Superfícies de entrega**: Web/Mobile/API por funcionalidade
- [ ] **Dependências técnicas**: Dependências entre BCs mapeadas
- [ ] **Estimativas iniciais**: Tempo e recursos estimados

---

## 🏗️ **Fase 2: Setup do Projeto**

### **✅ openspec-propose (Proposta de Setup)**
- [ ] **Proposal completa**: `proposal.md` com escopo claro
- [ ] **Design documentado**: Decisões arquiteturais explicadas
- [ ] **Tasks estruturadas**: `tasks.md` com ordem inside-out
- [ ] **Estimativas realistas**: Tempos por task com base em complexidade
- [ ] **Dependências validadas**: Ordem Clean Architecture verificada

### **✅ openspec-apply-change (Implementação do Setup)**
- [ ] **Monorepo criado**: Estrutura `apps/` e `packages/` configurada
- [ ] **Backend configurado**: ASP.NET Core com EF Core e Postgres
- [ ] **Frontend configurado**: Vue 3 com PrimeVue e Tailwind
- [ ] **Mobile configurado**: Android com Jetpack Compose
- [ ] **Shared kernel**: Value Objects e Entities base implementadas
- [ ] **Docker configurado**: Dockerfiles multi-stage + docker-compose
- [ ] **CI/CD configurado**: GitHub Actions com pipelines básicos

### **✅ openspec-archive-change (Arquivamento do Setup)**
- [ ] **Tasks completadas**: Todas as tasks marcadas como `[x]`
- [ ] **Artefatos revisados**: Código e configurações verificadas
- [ ] **Documentação atualizada**: README e guias de início rápido
- [ ] **Dashboard atualizado**: Status do setup registrado
- [ ] **Próximos passos**: EP-001 planejado e documentado

---

## 🚀 **Fase 3: Implementação por Épico/BC**

### **✅ Pré-Implementação (Antes de openspec-propose)**
- [ ] **Backlog revisado**: User stories com critérios de aceitação
- [ ] **Telas/fluxos**: Wireframes ou mockups para web/mobile
- [ ] **Contratos de API**: Endpoints e payloads definidos
- [ ] **Testes planejados**: Casos de teste identificados
- [ ] **Dependências técnicas**: Skills necessários listados

### **✅ openspec-propose (Proposta do Épico)**
- [ ] **ID único**: Prefixo `ep-XXX-` com descrição concisa
- [ ] **Scope claro**: Funcionalidades específicas do BC
- [ ] **Design detalhado**: Decisões de domínio documentadas
- [ ] **Tasks expandidas**: Todas as camadas (domain → app → infra → presentation)
- [ ] **Estimativas por task**: Tempos baseados em complexidade real
- [ ] **Dependências explícitas**: Relacionamentos entre tasks documentados

### **✅ Validação de Tasks (Antes de openspec-apply-change)**
#### **Domínio (C#)**
- [ ] **Value Objects**: Validações de domínio, imutabilidade
- [ ] **Entidades**: Invariantes preservados, métodos de domínio
- [ ] **Serviços de Domínio**: Regras de negócio puras, sem dependências externas
- [ ] **Eventos de Domínio**: Estrutura de dados, triggers definidos

#### **Aplicação (C#)**
- [ ] **DTOs**: Validações de entrada, mapeamento claro
- [ ] **Use Cases**: Orquestração, tratamento de erros via Result<T>
- [ ] **Queries CQRS**: Projeções otimizadas, paginação suportada
- [ ] **Commands**: Validação de negócio, transações definidas

#### **Infraestrutura (C#)**
- [ ] **Repository Interfaces**: No domínio, contratos claros
- [ ] **EF Core Configurations**: Fluent API, índices, relacionamentos
- [ ] **Repository Implementations**: Mapeamento DTO ↔ Entity
- [ ] **Serviços de Infra**: Gateways, clients, adapters

#### **Apresentação (C#)**
- [ ] **Controllers**: Endpoints RESTful, atributos [Authorize]
- [ ] **Model Validation**: Data annotations ou FluentValidation
- [ ] **HTTP Responses**: Códigos apropriados, formatos padronizados
- [ ] **Error Handling**: Middleware para exceções de domínio

#### **Frontend (Vue)**
- [ ] **Entities Vue**: TypeScript puro, Result<T> pattern
- [ ] **Use Cases Vue**: Injeção de dependência, tratamento de erros
- [ ] **Repository Vue**: HTTP client, mapeamento DTO ↔ Entity
- [ ] **Pages Vue**: Componentes, roteamento, estado
- [ ] **Forms Vue**: Validação, submissão, feedback

#### **Mobile (Android)**
- [ ] **Entities Android**: Kotlin data classes, sealed Result
- [ ] **Use Cases Android**: Coroutines, injeção de dependência
- [ ] **Repository Android**: Retrofit, mapeamento DTO ↔ Entity
- [ ] **Screens Android**: Jetpack Compose, ViewModel, StateFlow
- [ ] **Forms Android**: UI state, validação, submissão

#### **Testes**
- [ ] **Unit Tests**: Cobertura ≥95% para domain + application
- [ ] **Integration Tests**: Banco real, serviços externos mockados
- [ ] **E2E Tests**: Fluxos completos (API + Web/Mobile)
- [ ] **Performance Tests**: Carga, stress, benchmark

### **✅ openspec-apply-change (Implementação do Épico)**
- [ ] **Ordem inside-out**: Domain → Application → Infrastructure → Presentation
- [ ] **Cache de contexto**: Reutilização de VOs e configurações
- [ ] **Integração contínua**: CI passa após cada task significativa
- [ ] **Code review**: Pull requests revisados e aprovados
- [ ] **Documentação atualizada**: Comentários, READMEs, guias

### **✅ openspec-archive-change (Arquivamento do Épico)**
- [ ] **Tasks completadas**: Todas marcadas como `[x]`
- [ ] **Testes passando**: Unit, integration, E2E todos verdes
- [ ] **Code review final**: Último PR aprovado e mergeado
- [ ] **Dashboard atualizado**: Status do épico registrado
- [ ] **Próximo épico**: Planejamento iniciado

---

## 🧪 **Fase 4: Testes e Qualidade**

### **✅ Testes Unitários**
- [ ] **Cobertura ≥95%**: Domain e application layers
- [ ] **Testes de invariantes**: Regras de negócio validadas
- [ ] **Mocks apropriados**: Dependências externas isoladas
- [ ] **Edge cases**: Cenários de erro e limites testados
- [ ] **Performance básica**: Tempos de execução aceitáveis

### **✅ Testes de Integração**
- [ ] **Banco real**: EF Core com PostgreSQL funcionando
- [ ] **Transações**: Rollback em caso de erro
- [ ] **Concorrência**: Locking e race conditions testados
- [ ] **Migrations**: EF Core migrations aplicáveis

### **✅ Testes E2E**
- [ ] **API completa**: Endpoints funcionais com autenticação
- [ ] **Frontend fluxos**: Telas e navegação testadas
- [ ] **Mobile fluxos**: Screens e interações testadas
- [ ] **Cross-platform**: Consistência entre web/mobile

### **✅ Qualidade de Código**
- [ ] **Linting**: Regras consistentes aplicadas
- [ ] **Complexidade ciclomática**: Métricas dentro dos limites
- [ ] **Duplicação de código**: DRY principle seguido
- [ ] **Comentários**: Documentação adequada de lógica complexa
- [ ] **Nomenclatura**: Convenções consistentes seguidas

---

## 🚢 **Fase 5: Deploy e Monitoramento**

### **✅ Deploy para Staging**
- [ ] **Build bem-sucedido**: Docker images criadas
- [ ] **Health checks**: Endpoints `/health` respondendo
- [ ] **Configurações**: Environment variables configuradas
- [ ] **Banco de dados**: Migrations aplicadas
- [ ] **Logs**: Sistema de logging funcionando

### **✅ Deploy para Produção**
- [ ] **Rollback plan**: Plano de reversão documentado
- [ ] **Monitoring**: Métricas e alertas configurados
- [ ] **Backup**: Estratégia de backup implementada
- [ ] **Security**: SSL, firewall, autenticação verificados
- [ ] **Performance**: Load testing em produção

### **✅ Monitoramento Contínuo**
- [ ] **Métricas de negócio**: Conversões, usuários ativos
- [ ] **Métricas técnicas**: Latência, erro rate, throughput
- [ ] **Alertas proativos**: Notificações antes de problemas críticos
- [ ] **Dashboards**: Visibilidade em tempo real do sistema
- [ ] **Log aggregation**: Centralização e análise de logs

---

## 📊 **Fase 6: Retrospectiva e Melhoria**

### **✅ Análise de Métricas**
- [ ] **Velocidade de entrega**: Lead time, deployment frequency
- [ ] **Qualidade**: Change failure rate, mean time to recovery
- [ ] **Satisfação**: Feedback de usuários e desenvolvedores
- [ ] **Custo**: ROI, eficiência de recursos

### **✅ Identificação de Melhorias**
- [ ] **Processo**: Bottlenecks no ciclo OpenSpec
- [ ] **Ferramentas**: Skills que precisam de otimização
- [ ] **Comunicação**: Colaboração entre times
- [ ] **Documentação**: Gaps na documentação existente

### **✅ Plano de Ação**
- [ ] **Prioridades**: Melhorias classificadas por impacto
- [ ] **Responsáveis**: Owners para cada item de melhoria
- [ ] **Prazos**: Timeline realista para implementação
- [ ] **Métricas de sucesso**: Como medir a eficácia das melhorias

---

## 🔧 **Checklist Técnico por Stack**

### **✅ Stack C# + Vue + Android**
#### **Backend C#**
- [ ] **EF Core Config**: TenantId em todas as entidades
- [ ] **Repository Pattern**: Interfaces no domínio, implementações na infra
- [ ] **Result Pattern**: Erros tratados via Result<T>, não exceções
- [ ] **Dependency Injection**: Services registrados corretamente
- [ ] **JWT Authentication**: Middleware configurado com claims

#### **Frontend Vue**
- [ ] **PrimeVue Setup**: Theme configurado, componentes importados
- [ ] **State Management**: Pinia stores para dados compartilhados
- [ ] **Routing**: Vue Router com guards de autenticação
- [ ] **HTTP Client**: Axios com interceptors para tokens
- [ ] **Form Validation**: vee-validate com schemas TypeScript

#### **Mobile Android**
- [ ] **Jetpack Compose**: UI declarativa com StateFlow
- [ ] **Dependency Injection**: Hilt para injeção de dependência
- [ ] **Networking**: Retrofit com coroutines
- [ ] **Navigation**: Compose Navigation com ViewModels
- [ ] **Local Storage**: Room para cache offline

### **✅ Stack TypeScript + Vue + Flutter**
#### **Backend TypeScript**
- [ ] **NestJS Modules**: Estrutura modular com providers
- [ ] **Prisma Schema**: Models com relações e índices
- [ ] **DTO Validation**: class-validator com decorators
- [ ] **JWT Strategy**: Passport com estratégias configuradas

#### **Frontend Vue**
- [ ] **Composition API**: setup() com refs e computed
- [ ] **Type Safety**: TypeScript strict mode habilitado
- [ ] **Component Library**: PrimeVue ou equivalente
- [ ] **Build Optimization**: Vite com code splitting

#### **Mobile Flutter**
- [ ] **Riverpod State**: AsyncNotifier para estado assíncrono
- [ ] **Dio HTTP**: Client com interceptors
- [ ] **Navigation**: GoRouter com guards
- [ ] **Local Storage**: Hive ou equivalente

---

## 🚨 **Checklist de Segurança**

### **✅ Autenticação e Autorização**
- [ ] **JWT Tokens**: Expiração, refresh tokens implementados
- [ ] **Role-Based Access**: Permissões por tenant e usuário
- [ ] **Password Policy**: Hash bcrypt, força mínima
- [ ] **Rate Limiting**: Proteção contra brute force
- [ ] **Session Management**: Tokens inválidos após logout

### **✅ Proteção de Dados**
- [ ] **Encryption at Rest**: Dados sensíveis criptografados
- [ ] **Encryption in Transit**: SSL/TLS em todas as conexões
- [ ] **Data Masking**: Logs não contêm dados sensíveis
- [ ] **Access Logs**: Auditoria de acesso a dados

### **✅ Vulnerabilidades Comuns**
- [ ] **SQL Injection**: Parameterized queries ou ORM
- [ ] **XSS Protection**: Input sanitization, output encoding
- [ ] **CSRF Tokens**: Proteção em forms e APIs
- [ ] **CORS Config**: Domínios permitidos explicitamente
- [ ] **Security Headers**: HSTS, CSP, X-Frame-Options

---

## 📈 **Checklist de Performance**

### **✅ Backend Performance**
- [ ] **Database Indexes**: Índices em campos de busca frequente
- [ ] **Query Optimization**: N+1 queries evitadas
- [ ] **Caching Strategy**: Redis ou memória para dados estáticos
- [ ] **Connection Pooling**: Database connections gerenciadas
- [ ] **Async Operations**: I/O não-bloqueante implementado

### **✅ Frontend Performance**
- [ ] **Bundle Size**: Code splitting, tree shaking
- [ ] **Lazy Loading**: Components e rotas carregados sob demanda
- [ ] **Image Optimization**: WebP, lazy loading, CDN
- [ ] **Caching Strategy**: Service workers, CDN caching
- [ ] **Render Optimization**: Virtual scrolling, memoization

### **✅ Mobile Performance**
- [ ] **Native Performance**: Compose/SwiftUI otimizados
- [ ] **Network Efficiency**: Request batching, caching
- [ ] **Battery Usage**: Background tasks otimizados
- [ ] **Memory Management**: Leaks detectados e corrigidos

---

## 🎯 **Checklist de Entrega**

### **✅ Critérios de Aceitação**
- [ ] **Funcionalidades**: Todas as user stories implementadas
- [ ] **Qualidade**: Testes passando, cobertura adequada
- [ ] **Performance**: Métricas dentro dos limites especificados
- [ ] **Segurança**: Vulnerabilidades conhecidas resolvidas
- [ ] **Usabilidade**: UX/UI conforme mockups e padrões

### **✅ Documentação**
- [ ] **API Docs**: Swagger/OpenAPI atualizado
- [ ] **User Guide**: Documentação para usuários finais
- [ ] **Developer Guide**: Setup local, arquitetura, contribuição
- [ ] **Deployment Guide**: Staging, produção, rollback
- [ ] **Troubleshooting**: Problemas comuns e soluções

### **✅ Handover**
- [ ] **Knowledge Transfer**: Sessões com time de operações
- [ ] **Support Documentation**: Runbooks, playbooks
- [ ] **Monitoring Setup**: Dashboards, alertas configurados
- [ ] **Escalation Path**: Contatos para issues críticas

---

## 🔄 **Checklist de Manutenção**

### **✅ Monitoramento Contínuo**
- [ ] **Health Checks**: Endpoints monitorados 24/7
- [ ] **Performance Metrics**: Alertas para degradação
- [ ] **Error Tracking**: Logs centralizados e analisados
- [ ] **User Feedback**: Canal para reportar problemas

### **✅ Updates e Patches**
- [ ] **Dependency Updates**: Versões atualizadas regularmente
- [ ] **Security Patches**: Vulnerabilidades corrigidas prontamente
- [ ] **Breaking Changes**: Migração planejada e documentada
- [ ] **Backward Compatibility**: APIs mantêm compatibilidade

### **✅ Scaling**
- [ ] **Horizontal Scaling**: Load balancers configurados
- [ ] **Database Scaling**: Read replicas, sharding planejado
- [ ] **CDN Setup**: Static assets otimizados globalmente
- [ ] **Cost Optimization**: Recursos dimensionados adequadamente

---

## 📋 **Como Usar Este Checklist**

### **Para Cada Fase:**
1. **Revisar checklist completo** antes de iniciar a fase
2. **Marcar itens** conforme implementados
3. **Documentar exceções** com justificativa
4. **Validar com time** antes de considerar fase completa

### **Para Cada Épico:**
1. **Aplicar checklist geral** antes de `openspec-propose`
2. **Validar tasks** com checklist específico da stack
3. **Revisar segurança e performance** antes de `openspec-archive-change`

### **Para Auditorias:**
1. **Usar como baseline** para avaliação de qualidade
2. **Documentar gaps** com planos de correção
3. **Atualizar checklist** com lições aprendidas

---

## 📚 **Recursos Relacionados**

- [Template de Tasks OpenSpec](../templates/openspec-task-template.yaml)
- [Exemplos de Tasks C#](../templates/openspec-csharp-task-examples.md)
- [Dashboard de Progresso](../dashboard/openspec-progress-dashboard.md)
- [Workflow CI/CD](../workflows/openspec-ci-cd-workflow.md)
- [Cache de Contexto](../examples/context-cache-usage-example.md)