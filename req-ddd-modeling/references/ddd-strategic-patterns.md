# DDD Strategic Patterns — Referência

## 1. Domínio

O domínio é o conjunto de conhecimentos, regras, conceitos e processos do negócio que o sistema precisa representar e sustentar. Quatro características:

- **Representa o negócio real** da empresa — não é o software
- **Define regras e limites** do negócio
- **Pode ser dividido** em subdomínios específicos
- **Orienta a estrutura** e organização da aplicação

Compreender profundamente o domínio é o primeiro passo para construir aplicações bem estruturadas, onde arquitetura e código refletem as reais necessidades da empresa.

## 2. Subdomínios

### Classificação

| Tipo | Descrição | Estratégia | Investimento |
|------|-----------|-----------|-------------|
| **Core** | Diferencial competitivo — regras únicas que geram valor | Build (implementar internamente) | Alto |
| **Supporting** | Suporta o core, necessário mas não é diferencial | Build ou Simplificar | Médio |
| **Generic** | Commodity — funcionalidade padrão encontrada em qualquer sistema | Buy ou usar biblioteca | Baixo |

### Identificação

Perguntas para classificar cada subdomínio:

- Se parar de funcionar, o negócio para? → **Core**
- Se for substituído por solução pronta, o negócio perde vantagem? → **Core**
- É necessário mas qualquer empresa do setor tem algo similar? → **Supporting**
- Existe SaaS/biblioteca pronta que resolve 90%? → **Generic**

### Exemplo — PharmaCore (Farmácia)

| Subdomínio | Tipo | Responsabilidade |
|-----------|------|-----------------|
| Produtos | Supporting | Cadastro, categorização e consulta dos produtos |
| Filiais | Supporting | Gestão de unidades físicas da rede |
| Estoque | Supporting | Controle de entradas, saídas e níveis de estoque |
| Vendas | Core | Pedidos, precificação, promoções, receitas controladas |
| Auth | Generic | Autenticação e autorização de usuários |
| Notificações | Generic | Envio de alertas (email, SMS, push) |

## 3. Bounded Contexts (Contextos Delimitados)

### Definição

Um Bounded Context é uma **fronteira de software** dentro da qual:
- O modelo de domínio é **consistente**
- A linguagem ubíqua tem **significado preciso**
- As regras de negócio são **coerentes**

### Subdomínio vs Bounded Context

| Aspecto | Subdomínio | Contexto Delimitado |
|---------|-----------|---------------------|
| Natureza | Parte do negócio | Fronteira de software |
| Foco | O problema a ser resolvido | A solução em código |
| Origem | Surge da análise do negócio | Surge do design do sistema |
| Linguagem | Linguagem do negócio | Linguagem consistente do modelo |
| Papel | Define **o que** precisa existir | Define **como** isso será implementado |

### Cardinalidade

```
1:1  Subdomínio → 1 Bounded Context
     ─────────────────────────────────
     Quando o negócio é coeso, as regras são claras e o modelo
     permanece consistente dentro de um único limite.

     Ex.: Subdomínio "Produtos" → BC "Catálogo"
         (cadastro, categorização e consulta em um único contexto)

1:N  Subdomínio → Vários Bounded Contexts
     ─────────────────────────────────────
     Quando diferentes partes do negócio exigem modelos,
     regras ou ritmos de evolução distintos.

     Ex.: Subdomínio "Vendas" → BC "Pedidos" + BC "Pagamentos" + BC "Entrega"
         (cada um com regras, modelos e times potencialmente diferentes)

N:1  Vários Subdomínios → 1 Bounded Context
     ─────────────────────────────────────
     Quando subdomínios menores compartilham baixa complexidade
     e não justificam modelos ou fronteiras de software separadas.

     Ex.: "Configurações" + "Cadastros auxiliares" → BC "Administração"
```

### Critérios para Decidir

| Sinal | Indica cardinalidade |
|-------|---------------------|
| Regras de negócio muito diferentes | 1:N (separar) |
| Times diferentes mantêm | 1:N (separar) |
| Ritmos de deploy diferentes | 1:N (separar) |
| Vocabulário compartilhado | 1:1 ou N:1 (manter junto) |
| Baixa complexidade e acoplamento | N:1 (agrupar) |
| Modelo é coeso e simples | 1:1 (manter) |

## 4. Context Map (Mapa de Contexto)

### Tipos de Relação

| Relação | Símbolo | Significado |
|---------|---------|-------------|
| **Upstream/Downstream** | `A ──▶ B` | A fornece, B consome |
| **Shared Kernel** | `A ◀──▶ B` | Compartilham parte do modelo |
| **Conformist** | `A ══▶ B` | B adota modelo de A sem adaptação |
| **Anti-Corruption Layer** | `A ──▶ [ACL] ──▶ B` | B traduz modelo de A |
| **Open Host Service** | `A [OHS] ──▶ B` | A expõe API estável |
| **Published Language** | `A ──[PL]──▶ B` | Formato compartilhado (JSON, eventos) |
| **Customer/Supplier** | `A ←──▶ B` | B influencia evolução de A |
| **Separate Ways** | `A    B` | Sem integração direta |

### Como Construir

1. Listar todos os Bounded Contexts identificados
2. Para cada par de BCs, perguntar: "Existe comunicação ou dependência de dados?"
3. Se sim, classificar a relação (quem fornece, quem consome, como traduz)
4. Gerar diagrama ASCII mostrando todos os BCs e relações

### Template de Diagrama

```
┌─────────────────────────────────────────────────────┐
│                    CONTEXT MAP                       │
│                                                       │
│  ┌──────────┐                    ┌──────────┐        │
│  │ BC Alpha │──[OHS/PL]────────▶│ BC Beta  │        │
│  │ (Core)   │                    │(Support) │        │
│  └──────────┘                    └──────────┘        │
│       │                                               │
│  [Upstream]                                           │
│       │                                               │
│  ┌────▼─────┐     ┌──────────┐                       │
│  │ BC Gamma │     │ BC Delta │                       │
│  │(Support) │     │(Generic) │  ← Separate Ways     │
│  └──────────┘     └──────────┘                       │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## 5. Linguagem Ubíqua

### Regras

- Cada Bounded Context tem **seu próprio glossário**
- O mesmo termo pode ter **significados diferentes** em BCs distintos
- Termos devem ser **acordados com domain experts**, não inventados
- O código deve **refletir** a linguagem ubíqua (nomes de classes, métodos, variáveis)

### Template

```markdown
## Linguagem Ubíqua — BC "<nome>"

| Termo | Significado neste contexto | Equivalente técnico |
|-------|---------------------------|---------------------|
| Pedido | Intenção de compra com itens e valores | Order (Entity) |
| Item | Produto + quantidade dentro de um pedido | OrderItem (Entity) |
| Fechamento | Confirmação do pedido para pagamento | PlaceOrder (Use Case) |
| Desconto | Redução aplicada ao total do pedido | DiscountPolicy (Domain Service) |
```

### Exemplo de Polissemia (mesmo termo, BCs diferentes)

| Termo | No BC "Catálogo" | No BC "Estoque" | No BC "Pedidos" |
|-------|-----------------|----------------|----------------|
| **Produto** | SKU + nome + preço + descrição | Lote + quantidade + validade | Item do pedido + preço unitário |

## 6. Infraestrutura — Monólito vs Microserviços

> Monólito e microsserviços dizem respeito à forma como a aplicação é implantada e operada na infraestrutura, **não à qualidade da modularização ou da modelagem do negócio**.

| | Monólito Modular | Microserviços |
|-|-----------------|---------------|
| Deploy | Um artefato, múltiplos módulos internos | Um artefato por serviço/BC |
| Comunicação | In-process (chamadas de método) | Network (HTTP, gRPC, eventos) |
| Banco de dados | Compartilhado (com schemas por módulo) ou separado | Um banco por serviço |
| Complexidade operacional | Baixa | Alta (service mesh, observability, etc.) |
| Quando usar | Fase inicial, equipes pequenas, domínio em exploração | Domínio maduro, equipes grandes, escala diferenciada |

**Recomendação**: Começar com monólito modular (1 módulo = 1 BC). Migrar para microserviços quando houver evidência concreta (escala, times, deploy independente).
