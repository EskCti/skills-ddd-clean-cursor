# Discovery Checklist

## Análise via Browser (URL)

### Navegação
- [ ] Tela inicial carregada e capturada
- [ ] Menu principal mapeado (itens, subitens, ícones)
- [ ] Sidebar/navegação secundária identificada
- [ ] Breadcrumbs ou indicadores de localização

### Autenticação
- [ ] Tela de login identificada (campos, OAuth, SSO?)
- [ ] Tela de cadastro (campos obrigatórios, validações)
- [ ] Recuperação de senha
- [ ] Perfis de acesso (admin, user, etc.)

### Telas
- [ ] Dashboards (KPIs, gráficos, widgets)
- [ ] Listagens (colunas, filtros, paginação, ordenação, busca)
- [ ] Formulários (campos, tipos, validações, máscaras)
- [ ] Detalhes/visualização (layout, ações disponíveis)
- [ ] Modais/diálogos (confirmação, edição rápida)
- [ ] Configurações/preferências

### Fluxos
- [ ] Fluxo principal identificado (happy path)
- [ ] Fluxos alternativos
- [ ] Tratamento de erros visível (mensagens, redirects)

### UX/UI
- [ ] Responsividade (desktop, tablet, mobile)
- [ ] Tema (dark/light mode)
- [ ] Idioma (i18n)
- [ ] Acessibilidade básica

---

## Análise de Código (Path Local)

### Estrutura
- [ ] Padrão arquitetural identificado (monolito, monorepo, microservices)
- [ ] Árvore de diretórios mapeada (top 3 níveis)
- [ ] Arquivo de dependências lido (package.json, build.gradle, go.mod, etc.)

### Stack
- [ ] Linguagem(s) principal(is)
- [ ] Framework(s) (frontend/backend)
- [ ] ORM/acesso a dados
- [ ] Banco de dados
- [ ] Ferramentas de build/CI

### Domínio
- [ ] Entidades/modelos mapeados (campos, tipos, relações)
- [ ] Value Objects identificados
- [ ] Regras de negócio localizadas (services, validators, domain logic)

### API
- [ ] Rotas/endpoints listados (verbo, path, parâmetros)
- [ ] Autenticação/autorização identificada (JWT, session, OAuth)
- [ ] Rate limiting, CORS, middleware

### Integrações
- [ ] APIs externas (URLs, SDKs)
- [ ] Filas/mensageria (RabbitMQ, SQS, Kafka)
- [ ] Storage (S3, local)
- [ ] Email/SMS
- [ ] Pagamento

### Qualidade
- [ ] Testes existentes (unitários, integração, e2e)
- [ ] Cobertura estimada
- [ ] Documentação inline ou README
- [ ] Configuração de linting/formatting

---

## Análise DDD / Clean Architecture

### Bounded Contexts
- [ ] Menus/seções da UI mapeados como possíveis bounded contexts
- [ ] Grupos de tabelas/entidades agrupados por domínio
- [ ] Prefixos de rota API identificados como limites de contexto
- [ ] Módulos/packages do código classificados por contexto
- [ ] Linguagem ubíqua documentada por contexto (termos de domínio)
- [ ] Relações entre contexts mapeadas (upstream/downstream, shared kernel)

### Entities
- [ ] Objetos com ID único e ciclo de vida (CRUD) identificados
- [ ] Aggregate roots identificados (entity raiz que controla filhas)
- [ ] Regras de negócio internas de cada entity documentadas

### Value Objects
- [ ] Campos com validação encapsulada identificados como candidatos a VO
- [ ] Tipos comuns extraídos: Email, Name, Money, Address, Phone, CPF/CNPJ, etc.
- [ ] Regras de normalização documentadas (trim, lowercase, formato)

### Domain Services
- [ ] Regras que envolvem múltiplas entities/VOs identificadas
- [ ] Políticas de domínio (pricing, shipping, scoring) documentadas
- [ ] Cálculos complexos que não pertencem a uma entity

### Camadas da Clean Architecture
- [ ] Domain layer: entities, VOs, domain services, repository ports
- [ ] Application layer: use cases, DTOs, queries CQRS
- [ ] Infrastructure layer: adapters de persistência, integrações
- [ ] Interface layer: controllers/routes, forms/pages

### Context Map (diagrama)
- [ ] Diagrama ASCII gerado com todos os bounded contexts
- [ ] Relações tipadas (upstream/downstream, conformist, shared kernel)

---

## Cruzamento (quando ambos disponíveis)

- [ ] Cada tela tem endpoint(s) correspondente(s)
- [ ] Cada endpoint tem tela(s) correspondente(s) ou é API interna
- [ ] Campos de formulário correspondem aos campos da entidade
- [ ] Validações do frontend correspondem às do backend
- [ ] Funcionalidades no código sem representação na UI listadas
- [ ] Cada entity tem repository + use case + controller correspondente
- [ ] VOs de validação no frontend correspondem aos do domínio
