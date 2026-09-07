# VO Pattern (Genérico)

## Paths

- VOs: `packages/shared/src/vo/*.vo.ts`
- Base VO: `packages/shared/src/base/vo.ts`
- Result: `packages/shared/src/base/result.ts`
- Tests: `packages/shared/test/vo/*.vo.test.ts`

## Core Principles

- Imutabilidade: valor definido no construtor e sem setters.
- Invariantes: validar no `tryCreate`; acumular violações e retornar `Result.fail([...])` (lista) quando houver mais de uma regra.
- Normalizacao: aplicar `trim`, `toLowerCase`, formatações ou defaults quando fizer sentido.
- Erros: usar constantes estaticas com codigo legivel (ex.: `INVALID_EMAIL`).
- API consistente: `create` -> chama `tryCreate`, `throwsIfFailed`, retorna `instance`.

## Skeleton

```ts
import { Result, ValueObject, ValueObjectConfig } from '../base';

export class ExampleVo extends ValueObject<string, ValueObjectConfig> {
  private static readonly INVALID_EMPTY = 'INVALID_EMPTY';
  private static readonly INVALID_LENGTH = 'INVALID_LENGTH';
  private constructor(value: string, config?: ValueObjectConfig) {
    super(value, config);
  }

  public static create(value: string, config?: ValueObjectConfig): ExampleVo {
    const result = ExampleVo.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: string, config?: ValueObjectConfig): Result<ExampleVo> {
    const errors: string[] = [];
    const normalized = value.trim();

    if (!normalized) {
      errors.push(ExampleVo.INVALID_EMPTY);
    } else if (normalized.length < 3) {
      errors.push(ExampleVo.INVALID_LENGTH);
    }

    if (errors.length > 0) {
      return Result.fail(errors);
    }
    return Result.ok(new ExampleVo(normalized, config));
  }
}
```

- Nunca lançar exceção em `tryCreate`: acumular violações em `errors: string[]` e devolver `Result.fail(errors)` no final (a lista completa chega intacta ao chamador). `create` é o único ponto que propaga falha via `throwsIfFailed`.

## Multi-regra: strong-password

Exemplo acumulando várias regras de uma vez (não para na primeira falha):

```ts
import { Result, ValueObject, ValueObjectConfig } from '../base';

export class StrongPasswordVo extends ValueObject<string, ValueObjectConfig> {
  private static readonly INVALID_LENGTH = 'INVALID_LENGTH';
  private static readonly INVALID_LOWERCASE = 'INVALID_LOWERCASE';
  private static readonly INVALID_UPPERCASE = 'INVALID_UPPERCASE';
  private static readonly INVALID_NUMBER = 'INVALID_NUMBER';
  private static readonly INVALID_SYMBOL = 'INVALID_SYMBOL';

  private constructor(value: string, config?: ValueObjectConfig) {
    super(value, config);
  }

  public static create(value: string, config?: ValueObjectConfig): StrongPasswordVo {
    const result = StrongPasswordVo.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: string, config?: ValueObjectConfig): Result<StrongPasswordVo> {
    const errors: string[] = [];

    if (value.length < 8) errors.push(StrongPasswordVo.INVALID_LENGTH);
    if (!/[a-z]/.test(value)) errors.push(StrongPasswordVo.INVALID_LOWERCASE);
    if (!/[A-Z]/.test(value)) errors.push(StrongPasswordVo.INVALID_UPPERCASE);
    if (!/[0-9]/.test(value)) errors.push(StrongPasswordVo.INVALID_NUMBER);
    if (!/[^a-zA-Z0-9]/.test(value)) errors.push(StrongPasswordVo.INVALID_SYMBOL);

    if (errors.length > 0) {
      return Result.fail(errors);
    }
    return Result.ok(new StrongPasswordVo(value, config));
  }
}
```

Com 5 regras independentes, uma senha como `abc` acumula `[INVALID_LENGTH, INVALID_UPPERCASE, INVALID_NUMBER, INVALID_SYMBOL]` de uma só vez, permitindo que o controller exiba todos os problemas de uma vez.

## Reference VOs

- `email.vo.ts` para normalizacao, regex e getters `local`/`domain`.
- `id.vo.ts` para geracao default (uuid) e metodo `required`.
- `permission-id.vo.ts` para heranca que apenas especializa a mensagem de erro.
- `strong-password.vo.ts` para validacoes multiplas.
- `url.vo.ts` e `number.vo.ts` para casos de tipos diferentes.

## Test Pattern

- Validar sucesso e falha (`isOk`, `isFailure`, `errors`).
- Verificar normalizacao do valor armazenado.
- Testar `create` lancando erro quando invalido.
- Cobrir getters derivados quando existirem.
