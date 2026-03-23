# Use Case Pattern (Genérico)

## Paths

- Contrato base: `packages/shared/src/base/use-case.ts`
- Use cases (exemplos):
  - `packages/product/core/src/product/usecase/create-product.usecase.ts`
  - `packages/product/core/src/product/usecase/update-product.usecase.ts`
  - `packages/auth/core/src/user/usecase/update-user.usecase.ts`
  - `packages/auth/core/src/user/usecase/login.usecase.ts`
  - `packages/stock/core/src/movement/usecase/create-movement-out.usecase.ts`
  - `packages/auth/core/src/root/get-auth-dashboard-overview.usecase.ts`
- Testes (exemplos):
  - `packages/branch/core/test/branch/create-branch.test.ts`
  - `packages/stock/core/test/movement/create-movement-in.test.ts`
  - `packages/stock/core/test/snapshot/get-stock-quantity.usecase.test.ts`
  - `packages/product/core/test/category/category.usecase.test.ts`

## Estrutura esperada

1. Definir `XxxIn` (e `XxxOut` quando necessário).
2. Declarar classe `XxxUseCase implements UseCase<XxxIn, XxxOut>`.
3. Injetar dependências via construtor (`Repository`, `Query`, `Checker`, `Provider`).
4. Implementar `execute(data)` retornando `Promise<Result<...>>`.
5. Aplicar validações de fluxo com retorno antecipado em falha.
6. Delegar invariantes de domínio para entidade/VO (`tryCreate`, `cloneWith`).
7. Retornar resultado de provider/repo ou `Result.ok(...)` com DTO/agregado final.

## Padrões observados no código

- Use case orquestra, não persiste diretamente.
- Erros conhecidos são mapeados para constantes de domínio (`...Errors.NOT_FOUND`, etc.).
- Dependência pode ser `Query` ou `Repository` conforme objetivo do caso:
  - Leitura/projeção: preferir `Query` retornando DTO.
  - Comando/escrita: preferir `Repository` e entidade de domínio.
- Combinação de providers é comum:
  - Exemplo: busca em query + agregação de dados (`GetAuthDashboardOverviewUseCase`).
  - Exemplo: valida existência e cria dependência se necessário (`CreateMovementIn`).
- Em update:
  - Carregar estado atual (`findById`).
  - Montar novo estado com fallback de campos atuais.
  - Revalidar com entidade (`tryCreate`/`cloneWith`) antes de persistir.

## Checklist de implementação

- Contrato:
  - `UseCase<IN, OUT>` implementado corretamente.
  - `execute` com assinatura assíncrona e retorno `Result`.
- Dependências:
  - Tipadas por interfaces (não acoplar em infraestrutura concreta).
  - Injetadas no construtor.
- Erros:
  - Tratar falha de cada dependência de forma explícita.
  - Propagar `withFail` quando já estiver no formato esperado.
- Domínio:
  - Criar/atualizar entidades com `tryCreate` ou `cloneWith`.
  - Evitar colocar regra de entidade dentro do use case.
- Persistência/leitura:
  - Usar `repo/query` apenas para acesso a dados.
  - Em leitura para API/front, priorizar `Query` com DTO de saída.
  - Em escrita, ler com `Repository` quando necessário para preservar invariantes e salvar entidade.

## Estratégia de testes

- Cenário feliz completo.
- Pré-condições inválidas (quantidade <= 0, input ausente, etc.).
- Falhas de dependência (repo/query retornando `isFailure`).
- Comportamento condicional (com snapshot/sem snapshot, item existente/inexistente).
- Efeito colateral esperado (criação em repositório mock, update chamado com entidade válida).

## Armadilhas comuns

- Misturar lógica de validação de entidade no use case sem reutilizar `tryCreate`.
- Não mapear falhas de dependências para erro de domínio quando necessário.
- Atualizar parcialmente sem preservar `props` existentes.
- Retornar exceção em vez de `Result.fail` dentro do fluxo normal.

## Exemplo mínimo

```ts
import { Result, UseCase } from '@namespace/shared';
import { Thing } from '../model/thing.entity';
import { ThingRepository } from '../provider/thing.repository';

export interface CreateThingIn {
  name: string;
}

export class CreateThingUseCase implements UseCase<CreateThingIn, void> {
  constructor(private readonly repo: ThingRepository) {}

  async execute(data: CreateThingIn): Promise<Result<void>> {
    const thingResult = Thing.tryCreate({ name: data.name });
    if (thingResult.isFailure) return thingResult.withFail;

    return this.repo.create(thingResult.instance);
  }
}
```
