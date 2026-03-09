# Query CQRS Pattern (Pharmacore)

## Quando usar Query (CQRS)

- Leitura para retornar dados ao front/API.
- Projeções com paginação, filtros, agregações e joins.
- Formato de saída orientado ao consumidor (DTO), sem obrigar retorno da entidade completa.

## Quando usar Repository (comando)

- Fluxos de escrita: create/update/delete.
- Leitura para preservar invariantes antes de comando (ex.: `findById` retornando entidade).
- Regras de domínio de escrita com `Entity`/`tryCreate`/`cloneWith`.

## DTO em Query: regra de modelagem

- Não estender a classe da entidade.
- Opções válidas:
  - Derivar de `*Props` da entidade com adaptação:
    - exemplo: `interface RoleDTO extends Omit<RoleProps, "permissionIds"> { permissions: ... }`
  - Criar DTO totalmente independente quando a projeção exigir.
- Escolher a opção de menor acoplamento para o caso.

## Paths de referência

- Interfaces de query em core:
  - `packages/auth/core/src/user/provider/find-user-by-id.query.ts`
  - `packages/product/core/src/product/provider/find-many-products-with-filters.query.ts`
  - `packages/auth/core/src/audit/provider/find-auth-login-overview.query.ts`
- Use cases que consomem query:
  - `packages/auth/core/src/user/usecase/find-by-id.usecase.ts`
  - `packages/product/core/src/product/usecase/find-many-products.usecase.ts`
  - `packages/branch/core/src/branch/usecase/find-branch-by-id.usecase.ts`
- Implementações no adapter (Prisma):
  - `apps/backend/src/auth/user.prisma.ts`
  - `apps/backend/src/product/product.prisma.ts`
  - `apps/backend/src/auth/audit.prisma.ts`

## Contrato esperado

```ts
export interface FindXxxQuery {
  execute(input: InputDTO): Promise<Result<OutputDTO>>;
}
```

- `InputDTO` pode ser primitivo, objeto de filtro ou paginação.
- `OutputDTO` pode ser item único, coleção paginada, painel agregado etc.

## Checklist de implementação

- [ ] Caso é leitura (não comando).
- [ ] Interface `*Query` está no `core`.
- [ ] `execute` retorna `Promise<Result<DTO>>`.
- [ ] DTO está alinhado com necessidade do consumidor.
- [ ] Use case de leitura mapeia `isFailure` para erro de domínio quando necessário.
- [ ] Adapter de infraestrutura implementa a interface sem vazar detalhes do banco.

## Estratégia de testes

- Query/use case retorna dados esperados em cenário feliz.
- Cenário de vazio/not found.
- Cenário de falha da query (erro técnico ou dados inexistentes).
- Casos de paginação/filtros.
- Se houver formatação adicional no use case (ex.: preço formatado), testar projeção final.

## Armadilhas comuns

- Retornar entidade em query voltada a API quando DTO era o contrato certo.
- Colocar regra de escrita numa query.
- Acoplar DTO de leitura à estrutura de banco.
- Misturar responsabilidades (query fazendo comando).
