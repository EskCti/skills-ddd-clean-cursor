# DDD Tactical Patterns — Referência

A modelagem de domínio representa o **núcleo da aplicação**, onde as regras de negócio são expressas por meio de entidades, objetos de valor, serviços e eventos. É nesta camada que o sistema deixa de ser apenas dados e passa a **incorporar comportamentos** e decisões reais do negócio.

## 1. Value Object (Objeto de Valor)

**O que é**: Encapsula um valor do domínio e suas regras, garantindo consistência por meio da imutabilidade.

### Características
- **Sem identidade** — definido exclusivamente por seus atributos
- **Imutável** — qualquer mudança gera nova instância
- **Auto-validante** — rejeita estados inválidos na criação
- **Igualdade por valor** — dois VOs com mesmos atributos são iguais

### Quando usar
- Campos com validação (Email, CPF, Name, Money, Phone, Address)
- Campos com normalização (trim, lowercase, formatação)
- Campos compostos (Money = valor + moeda, Address = rua + cidade + CEP)

### Exemplos comuns
| VO | Validação |
|----|-----------|
| Email | Formato válido, lowercase |
| Name | Mínimo 2 caracteres, trim |
| Money | Valor positivo, moeda válida |
| CPF/CNPJ | Dígitos verificadores |
| Phone | Formato com DDD |
| Password | Comprimento mínimo, complexidade |
| Quantity | Inteiro > 0 |
| Address | CEP, cidade e estado preenchidos |

## 2. Entity (Entidade)

**O que é**: Modela elementos do negócio com **identidade própria** e comportamento ao longo do tempo.

### Características
- **Com identidade** — tem ID único que persiste ao longo do ciclo de vida
- **Mutável de forma controlada** — muda de estado via métodos de negócio
- **Igualdade por identidade** — dois entities com mesmo ID são "o mesmo"
- **Encapsula regras** — valida invariantes internas

### Quando usar
- Objetos com ciclo de vida (criar, atualizar, deletar)
- Objetos que aparecem em CRUD
- Objetos referenciados por ID

## 3. Aggregate (Agregado)

**O que é**: Cluster de entities e VOs com uma **raiz** (Aggregate Root) que garante invariantes do grupo inteiro.

### Regras
- Acesso externo **somente pela raiz** (nunca por entities internas)
- **Transações por aggregate** — uma transação = uma raiz + filhas
- **Referências entre aggregates por ID**, não por objeto
- O repository persiste **o aggregate inteiro**, não partes

### Exemplo
```
Order [Aggregate Root]
 ├── OrderItem (entity interna)
 ├── OrderItem (entity interna)
 └── ShippingAddress (value object)
```

## 4. Domain Service (Serviço de Domínio)

**O que é**: Encapsula regras de negócio que **não pertencem naturalmente a uma única entidade**.

### Características
- **Stateless** — sem estado interno, puro cálculo
- **Localizado no Domain** — não depende de infraestrutura
- **Opera sobre múltiplas entities/VOs**
- **Nomes expressivos**: `*Policy`, `*Calculator`, `*Validator`

### Quando usar
- Cálculos que envolvem múltiplas entities (PricingPolicy)
- Validações que cruzam boundaries internas (StockValidator)
- Regras de negócio que não cabem em nenhuma entity específica

### Quando NÃO usar
- Lógica que pertence a uma entity → coloque na entity
- Orquestração de fluxo → isso é Use Case (Application layer)
- Acesso a banco/API → isso é Infrastructure

## 5. Domain Event (Evento de Domínio)

**O que é**: Representa **fatos importantes** que ocorreram no domínio e podem gerar reações no sistema.

### Características
- **Imutável** — representa algo que já aconteceu
- **Nomeado no passado** — `OrderPlaced`, `PaymentConfirmed`, `UserRegistered`
- **Contém dados do fato** — quem, quando, o quê
- **Pode ser publicado** para outros Bounded Contexts consumirem

### Quando usar
- Quando uma ação em um BC deve **disparar reação** em outro BC
- Quando há necessidade de **auditoria** (histórico de eventos)
- Quando o fluxo entre módulos deve ser **desacoplado**

### Exemplos comuns

| Evento | BC de origem | Possíveis reações |
|--------|-------------|-------------------|
| `OrderPlaced` | Pedidos | Estoque reserva itens, Notificação envia email |
| `PaymentConfirmed` | Pagamentos | Pedido muda status, Entrega é criada |
| `UserRegistered` | Auth | Email de boas-vindas, Perfil default criado |
| `StockDepleted` | Estoque | Compra automática, Alerta ao gerente |
| `ProductPriceChanged` | Catálogo | Carrinho recalcula, Promoção atualiza |

### Estrutura de um Domain Event

```
┌──────────────────────────────────────┐
│ Event: OrderPlaced                    │
│ Timestamp: 2026-04-30T15:00:00Z      │
│ AggregateId: order-123               │
│ Data:                                 │
│   customerId: customer-456           │
│   items: [{productId, qty, price}]   │
│   total: 150.00                      │
│   currency: BRL                      │
└──────────────────────────────────────┘
```

## 6. Repository (Repositório)

**O que é**: Contrato de persistência para Aggregates, tratando a coleção como se estivesse em memória.

### Regras
- **Interface no Domain**, implementação na Infrastructure
- **Um repository por Aggregate Root** — não por entity interna
- Métodos: `save`, `findById`, `delete`, `findAll` (com filtros)
- Retorna **entities de domínio**, nunca DTOs de banco

## 7. Factory

**O que é**: Encapsula a criação complexa de Aggregates quando o constructor simples não é suficiente.

### Quando usar
- Criação envolve muitas regras de validação
- Criação depende de dados de múltiplas fontes
- Pattern `Create()` estático na entity já é uma factory

## Checklist de Modelagem Tática (por BC)

- [ ] Value Objects identificados (campos com validação/normalização)
- [ ] Entities identificadas (objetos com ID e ciclo de vida)
- [ ] Aggregate Roots definidos (quem controla invariantes do grupo)
- [ ] Domain Services identificados (regras entre múltiplas entities)
- [ ] Domain Events identificados (fatos que geram reações cross-context)
- [ ] Repository ports definidos (um por Aggregate Root)
- [ ] Linguagem ubíqua documentada (glossário de termos do BC)
- [ ] Nenhuma entity depende de infraestrutura (banco, API, framework)
