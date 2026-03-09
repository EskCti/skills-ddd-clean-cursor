# Domain Service Pattern (Pharmacore)

## Escopo (fronteira)

- Considerar **serviço de domínio** apenas em caminhos `packages/*/core/*`.
- Exemplo válido:
  - `packages/auth/core/src/permission/model/permission-policy.service.ts`
  - `packages/stock/core/src/service/stock-calculator.service.ts`
- Exemplo inválido para esta skill:
  - `packages/*/web/**`
  - `apps/frontend/**`
  - `apps/backend/**` (infra/controllers/providers HTTP)

## Quando criar um Domain Service

- Regra de negócio não pertence claramente a uma única entidade.
- Regra combina múltiplos objetos de domínio e precisa ser reutilizável.
- Regra deve ser pura e previsível, sem dependência de I/O.

## Estrutura esperada

1. Nome orientado à regra (`*Policy`, `*Calculator`, etc.).
2. API enxuta:
  - classe com método de instância simples (ex.: `PermissionPolicy.check`)
  - ou método estático para cálculo (ex.: `StockCalculator.execute`)
3. Entradas explícitas e tipadas.
4. Saída objetiva (boolean, number, ou tipo de domínio).
5. Sem acesso a banco, rede, filesystem, env, framework.

## Exemplos do projeto

### PermissionPolicy

- Arquivo: `packages/auth/core/src/permission/model/permission-policy.service.ts`
- Papel:
  - receber permissões do usuário
  - validar se conjunto exigido está contido no conjunto do usuário
- Características:
  - sem side effect
  - operação booleana simples

### StockCalculator

- Arquivo: `packages/stock/core/src/service/stock-calculator.service.ts`
- Papel:
  - calcular saldo atual baseado em `snapshot` + lista de `movements`
- Características:
  - sem side effect
  - cálculo determinístico
  - facilmente mockável em teste de use case

## Checklist de implementação

- [ ] Arquivo em `*core/*`.
- [ ] Sem dependência de framework (Nest/React/etc.).
- [ ] Sem I/O (db/http/fs).
- [ ] Assinatura clara e coesa.
- [ ] Regra de domínio isolada e reutilizável.
- [ ] Cobertura de testes com casos normais e bordas.

## Estratégia de testes

- Testar entrada mínima.
- Testar variação de cenários de negócio.
- Testar casos limite e vazios.
- Garantir determinismo (mesma entrada, mesma saída).

## Armadilhas comuns

- Colocar lógica de aplicação no serviço de domínio.
- Acoplar serviço de domínio a repositório ou provider externo.
- Duplicar regra já existente em entidade/VO.
- Criar serviço quando método de entidade resolveria melhor.
