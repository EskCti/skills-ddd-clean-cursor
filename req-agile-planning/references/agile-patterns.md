# Agile Planning Patterns

## Hierarquia de Itens

```
Tema (opcional)
  └── Épico (EP-XXX)
        └── User Story (US-XXX)
              └── Task (TK-XXX)
                    └── Subtask (opcional)
```

## Formato de User Story

```
Como <persona/role>,
quero <ação ou funcionalidade>,
para que <valor de negócio ou benefício>.
```

### Boas Stories (INVEST)

| Critério | Descrição |
|----------|-----------|
| **I**ndependent | Pode ser desenvolvida sem depender de outra story |
| **N**egotiable | Os detalhes podem ser discutidos com o PO |
| **V**aluable | Entrega valor visível ao usuário ou negócio |
| **E**stimable | O time consegue estimar o esforço |
| **S**mall | Cabe em uma sprint (idealmente 1-5 dias) |
| **T**estable | Tem critérios claros de aceite |

## Critérios de Aceitação (Given/When/Then)

```
Dado que <pré-condição>,
quando <ação do usuário>,
então <resultado esperado>.
```

## Estimativa (Fibonacci)

| Pontos | Complexidade | Referência |
|--------|-------------|-----------|
| 1 | Trivial | Mudança de texto, config |
| 2 | Simples | CRUD básico, campo novo |
| 3 | Moderado | Funcionalidade com validação |
| 5 | Complexo | Fluxo multi-step, integração |
| 8 | Muito complexo | Feature nova com lógica de negócio |
| 13 | Épico | Deve ser quebrado em stories menores |

## Priorização MoSCoW

| Prioridade | Significado | Quando usar |
|-----------|-------------|------------|
| **Must** | Obrigatório para o MVP | Sem isso o produto não funciona |
| **Should** | Importante, mas não bloqueante | Melhora significativa de UX/valor |
| **Could** | Desejável se houver tempo | Nice-to-have, diferencial |
| **Won't** | Fora de escopo desta release | Documentar para futuro |

## Templates de Épico

### Épico Funcional (feature)
```
EP-XXX: <Nome>
Descrição: <o que este épico entrega>
Valor: <por que é importante>
Dependências: <outros épicos necessários>
Tamanho: P/M/G/GG
Stories: N
```

### Épico Técnico (enabler)
```
EP-XXX: [TECH] <Nome>
Descrição: <infraestrutura ou refatoração necessária>
Justificativa: <quais épicos funcionais desbloqueiam>
Tamanho: P/M/G/GG
Tasks: N
```

## Tipos de Task

| Tipo | Prefixo | Exemplos |
|------|---------|----------|
| `dev` | Implementação | Criar entidade, endpoint, tela |
| `test` | Teste | Teste unitário, e2e, integração |
| `infra` | Infraestrutura | CI/CD, deploy, Docker, env |
| `docs` | Documentação | API docs, README, ADR |
| `design` | Design | Wireframe, protótipo, UX review |

## Padrão de Rastreabilidade

Cada Story deve referenciar o(s) requisito(s) de origem:

```
### US-015: Filtrar produtos por categoria

> Ref: RF-023, RF-024

> Como comprador,
> quero filtrar produtos por categoria,
> para encontrar rapidamente o que procuro.
```

## Anti-Patterns a Evitar

- Stories sem critério de aceitação
- Tasks vagas ("implementar backend")
- Épicos com mais de 15 stories (quebrar)
- Stories com mais de 8 pontos (quebrar)
- Tasks estimadas em mais de 4 horas (quebrar)
- Stories que não entregam valor isoladamente
- Épicos sem owner ou prioridade
