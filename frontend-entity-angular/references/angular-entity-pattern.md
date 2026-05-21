# Angular Entity Pattern (TypeScript puro + Result<T, E>)

## Result<T, E> base (src/app/shared/result/result.ts)

```typescript
export type Ok<T> = { readonly ok: true; readonly data: T }
export type Err<E> = { readonly ok: false; readonly error: E }
export type Result<T, E = string> = Ok<T> | Err<E>

export const ok = <T>(data: T): Ok<T> => ({ ok: true, data })
export const err = <E>(error: E): Err<E> => ({ ok: false, error })

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false
}
```

## Entidade (src/app/features/customers/domain/customer.entity.ts)

```typescript
import { Result, ok, err } from '../../../shared/result/result'

export interface CustomerData {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly cpf: string
  readonly isActive: boolean
}

export class CustomerEntity implements CustomerData {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly cpf: string
  readonly isActive: boolean

  private constructor(data: CustomerData) {
    this.id = data.id
    this.name = data.name
    this.email = data.email
    this.cpf = data.cpf
    this.isActive = data.isActive
  }

  static create(params: {
    id: string
    name: string
    email: string
    cpf: string
  }): Result<CustomerEntity> {
    const name = params.name.trim()
    if (name.length < 2) return err('Nome deve ter pelo menos 2 caracteres')

    const email = params.email.trim().toLowerCase()
    if (!email.includes('@') || !email.includes('.')) return err('Email inválido')

    const cpf = params.cpf.replace(/\D/g, '')
    if (cpf.length !== 11) return err('CPF deve ter 11 dígitos')

    return ok(new CustomerEntity({ id: params.id, name, email, cpf, isActive: true }))
  }

  deactivate(): CustomerEntity {
    return new CustomerEntity({ ...this, isActive: false })
  }
}
```

## Checklist

- [ ] `Result<T, E>` + `ok()` + `err()` criados em `shared/result/result.ts`
- [ ] Entidade com construtor privado e `static create()` retornando `Result<Entity>`
- [ ] Validações retornam `err('mensagem')` — nunca `throw`
- [ ] Sem dependências Angular (sem `inject`, sem `Injectable`)
- [ ] Interface `<Nome>Data` separada do `<Nome>Entity` para dados puros
