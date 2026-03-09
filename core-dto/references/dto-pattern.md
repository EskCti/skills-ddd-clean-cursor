# DTO Pattern (Pharmacore)

## Tipos de DTO

- Input DTO:
    - entrada de comando/use case/filtros.
    - exemplos: `FindAllUsersInDTO`, `ProductFiltersDTO`.
- Output DTO:
    - saída de use case/controlador.
    - exemplos: `FindAllUsersOutDTO`, `ProductListDTO`.
- Query DTO (CQRS):
    - projeção de leitura para API/front.
    - exemplos: `UserDTO`, `RoleDTO`, `ProductDetailsDTO`.

## Regra de modelagem de Query DTO

- Não estender classe de entidade.
- Opções válidas:
    - Derivar de `*Props` com adaptação (`Omit`, `Pick`, campos enriquecidos) quando necessário.
    - Criar DTO próprio e independente quando a projeção exigir.

Exemplos reais:

- `packages/auth/core/src/user/dto/user.dto.ts`
    - `UserDTO extends Omit<UserProps, "roleIds">` + `roles` e `permissions`.
- `packages/auth/core/src/role/dto/role.dto.ts`
    - `RoleDTO extends Omit<RoleProps, "permissionIds">` + `permissions`.
- `packages/product/core/src/product/dto/product-details.dto.ts`
    - `ProductDetailsDTO extends Omit<ProductProps, "subcategoryId" | "brandId">` + `category/subcategory/brand`.

## Convenções úteis observadas

- Entrada/saída com sufixos claros:
    - `FindAllXxxInDTO`
    - `FindAllXxxOutDTO`
    - `FindAllXxxMetaDTO`
- Itens de lista separados:
    - `ProductListItem`, `BranchListItem`.
- Filtros dedicados:
    - `ProductFiltersDTO`, `BrandFiltersDTO`.

## Fronteiras

- DTO não carrega regra de domínio.
- DTO não deve depender de Prisma/ORM.
- DTO de leitura pode ser enriquecido para front (ex.: `formattedPrice`), desde que a transformação esteja em query/use case.

## Checklist

- [ ] Tipo de DTO identificado (input/output/query).
- [ ] Nomes seguem convenção de intenção.
- [ ] Tipagem adequada ao consumidor final.
- [ ] Sem acoplamento à entidade concreta ou ORM.
- [ ] Em CQRS, query retorna DTO de leitura e não entidade quando projeção é o contrato.

## Armadilhas comuns

- Usar entidade como payload de API sem necessidade.
- Misturar campos de comando com campos de leitura no mesmo DTO.
- Acoplar DTO a estrutura de banco.
- Não separar metadados de paginação dos dados.
