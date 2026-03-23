# DTO Pattern (Kotlin)

## Tipos de DTO

- Input DTO: entrada de comando/use case/filtros.
  - exemplos: `FindAllUsersInDTO`, `ProductFiltersDTO`.
- Output DTO: saída de use case/controlador.
  - exemplos: `FindAllUsersOutDTO`, `ProductListDTO`.
- Query DTO (CQRS): projeção de leitura para API/front.
  - exemplos: `UserDTO`, `RoleDTO`, `ProductDetailsDTO`.

## Exemplo mínimo — Input DTO

```kotlin
data class CreateProductInDTO(
    val name: String,
    val price: Double,
    val categoryId: String
)
```

## Exemplo mínimo — Output DTO com paginação

```kotlin
data class PagedResult<T>(
    val items: List<T>,
    val total: Long,
    val page: Int,
    val pageSize: Int
)

data class ProductListItemDTO(
    val id: String,
    val name: String,
    val price: Double,
    val categoryName: String
)
```

## Exemplo mínimo — Query DTO

```kotlin
data class UserDTO(
    val id: String,
    val name: String,
    val email: String,
    val roles: List<RoleDTO>,
    val createdAt: String
)

data class RoleDTO(
    val id: String,
    val name: String,
    val permissions: List<String>
)
```

## Convenções

- Entrada/saída com sufixos claros: `*InDTO`, `*OutDTO`.
- Itens de lista separados: `*ListItemDTO`.
- Filtros dedicados: `*FiltersDTO`.
- Paginação genérica: `PagedResult<T>`.

## Fronteiras

- DTO não carrega regra de domínio.
- DTO não deve depender de JPA/Exposed/ORM.
- DTO de leitura pode ser enriquecido para front, desde que a transformação esteja na query/use case.

## Checklist

- [ ] Tipo de DTO identificado (input/output/query).
- [ ] `data class` com campos `val`.
- [ ] Nomes seguem convenção de intenção.
- [ ] Sem acoplamento à entidade concreta ou ORM.
- [ ] Em CQRS, query retorna DTO de leitura e não entidade.

## Armadilhas comuns

- Usar entidade de domínio como payload de API.
- Misturar campos de comando com campos de leitura no mesmo DTO.
- Acoplar DTO a estrutura de banco (nomes de coluna, @Column).
- Não separar metadados de paginação dos dados.

---
