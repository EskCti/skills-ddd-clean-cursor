# Entity Pattern (Pharmacore)

## Paths

- Base entity: `packages/shared/src/base/entity.ts`
- Entidades (exemplos):
  - `packages/auth/core/src/user/model/user.entity.ts`
  - `packages/auth/core/src/permission/model/permission.entity.ts`
  - `packages/branch/core/src/branch/model/branch.entity.ts`
  - `packages/stock/core/src/movement/model/movement.entity.ts`
  - `packages/product/core/src/product/model/product.entity.ts`
- Testes de referência:
  - `packages/shared/test/base/entity.test.ts`
  - `packages/branch/core/test/branch/branch.entity.test.ts`
  - `packages/stock/core/test/movement/movement.entity.test.ts`
  - `packages/stock/core/test/stock/stock.entity.test.ts`

## Estrutura esperada

1. Definir `XxxProps extends EntityProps`.
2. Declarar classe `Xxx extends Entity<Xxx, XxxProps>`.
3. Construtor `private/protected` + `super(props)`.
4. Getters para campos relevantes.
5. `static create(props)` delegando para `tryCreate` + `throwIfFailed`.
6. `static tryCreate(props)` validando invariantes e retornando `Result`.
7. `Result.combine([...])` para consolidar erros de VOs.
8. Retornar instância com valores normalizados (`instance.value`).

## Checklist de implementação

- `id`:
  - Usar `Id.tryCreate(props.id)` quando opcional.
  - Usar `Id.required(...)` quando o campo é obrigatório (ex.: relação obrigatória).
- VOs:
  - Validar texto, nome, alias, sku, url, número, preço com VOs apropriados.
- Entidades aninhadas:
  - Validar com `Xxx.tryCreate` e persistir `instance.props`/`instance.value` no `props`.
- Listas:
  - Para arrays de IDs/VOs, mapear para `tryCreate`, combinar resultados e salvar valores normalizados.
- Erros:
  - Em falha, retornar `Result.fail(attributes.errors!)` ou `attributes.withFail`.
- Métodos de domínio:
  - Quando houver regra de estado, encapsular em método da entidade (ex.: `deactivate`, `moveSubcategory`, factories específicas).

## Padrões observados no código

- Identidade e timestamps são tratados pela classe base `Entity`.
- `equals` e `notEquals` são por `id`.
- `cloneWith` faz deep-merge e reaplica validação via `tryCreate`.
- Algumas entidades usam getters que materializam VO/Entity a partir de `props` (ex.: `Stock.location`, `Branch.address`).

## Exemplo mínimo

```ts
import { Entity, EntityProps, Id, Name, Result } from "@pharmacore/shared";

export interface ExampleProps extends EntityProps {
  name: string;
}

export class Example extends Entity<Example, ExampleProps> {
  private constructor(props: ExampleProps) {
    super(props);
  }

  get name(): string {
    return this.props.name;
  }

  static create(props: ExampleProps): Example {
    const result = Example.tryCreate(props);
    result.throwIfFailed();
    return result.instance;
  }

  static tryCreate(props: ExampleProps): Result<Example> {
    const id = Id.tryCreate(props.id);
    const name = Name.tryCreate(props.name);

    const attrs = Result.combine([id, name]);
    if (attrs.isFailure) return Result.fail(attrs.errors!);

    return Result.ok(
      new Example({
        ...props,
        id: id.instance.value,
        name: name.instance.value,
      }),
    );
  }
}
```

## Estratégia de testes

- Criação válida (`tryCreate.isOk`, `create` retorna instância).
- Criação inválida (`tryCreate.isFailure`, `create` lança erro).
- Igualdade por `id` (`equals`/`notEquals`).
- `cloneWith` com atualização válida e inválida.
- Cenários de normalização (quando houver VOs que normalizam entrada).

## Armadilhas comuns

- Esquecer normalização ao montar `new Entity` (usar valor cru em vez de `instance.value`).
- Não validar arrays (ex.: `roleIds`, URLs).
- Introduzir regra de domínio fora da entidade (espalhada em use case sem necessidade).
- Criar setter mutável ao invés de usar método de domínio + `cloneWith`.
