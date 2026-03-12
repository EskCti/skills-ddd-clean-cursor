# VO Pattern (Genérico)

## Paths

- VOs: `packages/shared/src/vo/*.vo.ts`
- Base VO: `packages/shared/src/base/vo.ts`
- Result: `packages/shared/src/base/result.ts`
- Tests: `packages/shared/test/vo/*.vo.test.ts`

## Core Principles

- Imutabilidade: valor definido no construtor e sem setters.
- Invariantes: validar no `tryCreate` e retornar `Result.fail` quando violado.
- Normalizacao: aplicar `trim`, `toLowerCase`, formatações ou defaults quando fizer sentido.
- Erros: usar constantes estaticas com codigo legivel (ex.: `INVALID_EMAIL`).
- API consistente: `create` -> chama `tryCreate`, `throwsIfFailed`, retorna `instance`.

## Skeleton

```ts
import { Result, ValueObject, ValueObjectConfig } from '../base';

export class ExampleVo extends ValueObject<string, ValueObjectConfig> {
  private static readonly INVALID_EXAMPLE = 'INVALID_EXAMPLE';
  private constructor(value: string, config?: ValueObjectConfig) {
    super(value, config);
  }

  public static create(value: string, config?: ValueObjectConfig): ExampleVo {
    const result = ExampleVo.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: string, config?: ValueObjectConfig): Result<ExampleVo> {
    try {
      const normalized = value.trim();
      if (!normalized) {
        throw new Error(ExampleVo.INVALID_EXAMPLE);
      }
      return Result.ok(new ExampleVo(normalized, config));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
```

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
