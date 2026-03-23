# Repository Pattern (Genérico)

## Paths

- Bases compartilhadas:
  - `packages/shared/src/db/crud-repository.ts`
  - `packages/shared/src/db/create-repository.ts`
  - `packages/shared/src/db/find-by-id-repository.ts`
- Contratos de core:
  - `packages/auth/core/src/user/provider/user.repository.ts`
  - `packages/product/core/src/product/provider/product.repository.ts`
  - `packages/branch/core/src/branch/provider/branch.repository.ts`
- Implementações de infraestrutura:
  - `apps/backend/src/auth/user.prisma.ts`
  - `apps/backend/src/product/product.prisma.ts`
  - `apps/backend/src/branch/branch.prisma.ts`
- Mocks/in-memory para testes:
  - `packages/stock/core/test/data/mock-stock-repo.ts`
  - `packages/product/core/test/data/in-memory-category.repo.ts`

## Papel do Repository

- Encapsular persistência de entidades de domínio.
- Expor operações orientadas ao agregado (CRUD + métodos específicos quando necessário).
- Não conter regra de caso de uso.

## Repository vs Query (CQRS)

- Repository:
  - usado em comando/escrita.
  - pode buscar entidade para preservar invariantes antes de update/delete.
- Query:
  - usada para leitura/projeção DTO.
  - pode coexistir na mesma classe adapter, mas como contrato separado.

## Estrutura esperada

1. Definir interface de repositório no `core`.
2. Estender `CrudRepository<T>` quando fizer sentido.
3. Adicionar métodos específicos de domínio apenas quando necessários.
4. Implementar adapter (Prisma/in-memory) retornando `Result`.
5. Incluir mapeadores:

- `toDomain(payload)` para criar entidade.
- `fromDomain(entity)` para persistência.

## Checklist de implementação

- [ ] Contrato está em `core` e tipa `Promise<Result<...>>`.
- [ ] Implementação não vaza tipo de ORM para o core.
- [ ] Erro de not found mapeado para erro de domínio.
- [ ] Operações compostas usam transação quando necessário.
- [ ] Métodos customizados têm nome orientado ao domínio (`findByEmail`, `updateRoles`, etc.).
- [ ] Mocks de teste seguem contrato real.

## Estratégia de testes

- Testar sucesso/falha dos métodos principais.
- Testar not found.
- Testar métodos específicos de domínio.
- Em mocks/in-memory, garantir comportamento consistente com contrato.

## Armadilhas comuns

- Retornar DTO em método de repository (quebra fronteira com query).
- Acoplar use case ao ORM em vez da interface.
- Não normalizar dados ao mapear domínio.
- Esquecer transação em operações que alteram múltiplas tabelas.
