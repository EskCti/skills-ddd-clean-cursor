# Vue Entity Pattern (TypeScript puro + Result<T, E>)

## Result<T, E> base (src/shared/result.ts)

```typescript
export type ValidationErrors = readonly string[]

export type Ok<T> = { readonly ok: true; readonly data: T }
export type Err = { readonly ok: false; readonly error: ValidationErrors }
export type Result<T> = Ok<T> | Err

export const ok = <T>(data: T): Ok<T> => ({ ok: true, data })
export const err = (error: string | readonly string[]): Err => ({
  ok: false,
  error: typeof error === 'string' ? [error] : [...error],
})

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true
}
```

## Entidade (src/features/customers/domain/customer.entity.ts)

```typescript
import { ok, err, type Result } from '@/shared/result'

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
    const errors: string[] = []
    const name = params.name.trim()
    if (name.length < 2) errors.push('Nome deve ter pelo menos 2 caracteres')

    const email = params.email.trim().toLowerCase()
    if (!email.includes('@') || !email.includes('.')) errors.push('Email inválido')

    const cpf = params.cpf.replace(/\D/g, '')
    if (cpf.length !== 11) errors.push('CPF deve ter 11 dígitos')

    if (errors.length > 0) return err(errors)

    return ok(new CustomerEntity({ id: params.id, name, email, cpf, isActive: true }))
  }

  deactivate(): CustomerEntity {
    return new CustomerEntity({ ...this, isActive: false })
  }
}
```

## Checklist

- [ ] `Result<T, E>` + `ok()` + `err()` em `src/shared/result.ts`
- [ ] Construtor privado + `static create()` retornando `Result<Entity>`
- [ ] Validações acumulam em `errors[]` e retornam `err(errors)` — nunca `throw`
- [ ] Sem imports Vue/Pinia na entidade
