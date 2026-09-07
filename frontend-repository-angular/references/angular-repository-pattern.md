# Angular Repository Pattern (HttpClient + DTO + Result)

## DTO (data) — customer.dto.ts

```typescript
export interface CustomerApiDto {
  id: string
  name: string
  email: string
  cpf: string
  is_active: boolean
}
```

## HttpRepository (data) — customer-http.repository.ts

```typescript
import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import { Result, ok, err } from '../../../shared/result/result'
import { CustomerEntity } from '../domain/customer.entity'
import { ICustomerRepository } from '../domain/customer.repository.token'
import { CustomerApiDto } from './customer.dto'

@Injectable()
export class CustomerHttpRepository implements ICustomerRepository {
  private readonly http = inject(HttpClient)
  private readonly base = '/api/customers'

  async findAll(): Promise<Result<CustomerEntity[]>> {
    try {
      const dtos = await firstValueFrom(this.http.get<CustomerApiDto[]>(this.base))
      const entities: CustomerEntity[] = []
      for (const dto of dtos) {
        const result = CustomerEntity.create({ id: dto.id, name: dto.name, email: dto.email, cpf: dto.cpf })
        if (result.ok) entities.push(result.data)
      }
      return ok(entities)
    } catch (e) {
      return err(this.handleError(e))
    }
  }

  async findById(id: string): Promise<Result<CustomerEntity>> {
    try {
      const dto = await firstValueFrom(this.http.get<CustomerApiDto>(`${this.base}/${id}`))
      const result = CustomerEntity.create({ id: dto.id, name: dto.name, email: dto.email, cpf: dto.cpf })
      return result.ok ? ok(result.data) : err(result.error)
    } catch (e) {
      const error = e as HttpErrorResponse
      if (error.status === 404) return err('Cliente não encontrado')
      return err(this.handleError(e))
    }
  }

  async findByEmail(email: string): Promise<Result<CustomerEntity | null>> {
    try {
      const dto = await firstValueFrom(
        this.http.get<CustomerApiDto | null>(this.base, { params: { email } })
      )
      if (!dto) return ok(null)
      const result = CustomerEntity.create({ id: dto.id, name: dto.name, email: dto.email, cpf: dto.cpf })
      return result.ok ? ok(result.data) : ok(null)
    } catch (e) {
      const error = e as HttpErrorResponse
      if (error.status === 404) return ok(null)
      return err(this.handleError(e))
    }
  }

  async create(customer: CustomerEntity): Promise<Result<CustomerEntity>> {
    try {
      const dto = await firstValueFrom(
        this.http.post<CustomerApiDto>(this.base, {
          name: customer.name, email: customer.email, cpf: customer.cpf,
        })
      )
      const result = CustomerEntity.create({ id: dto.id, name: dto.name, email: dto.email, cpf: dto.cpf })
      return result.ok ? ok(result.data) : err(result.error)
    } catch (e) {
      const error = e as HttpErrorResponse
      if (error.status === 409) return err('Email já cadastrado')
      return err(this.handleError(e))
    }
  }

  async update(customer: CustomerEntity): Promise<Result<CustomerEntity>> {
    try {
      const dto = await firstValueFrom(
        this.http.put<CustomerApiDto>(`${this.base}/${customer.id}`, {
          name: customer.name, email: customer.email, cpf: customer.cpf,
        })
      )
      const result = CustomerEntity.create({ id: dto.id, name: dto.name, email: dto.email, cpf: dto.cpf })
      return result.ok ? ok(result.data) : err(result.error)
    } catch (e) {
      return err(this.handleError(e))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await firstValueFrom(this.http.delete(`${this.base}/${id}`))
      return ok(undefined)
    } catch (e) {
      return err(this.handleError(e))
    }
  }

  private handleError(e: unknown): string[] {
    if (e instanceof HttpErrorResponse) {
      const errors = e.error?.errors
      if (Array.isArray(errors) && errors.length > 0) {
        return errors as string[]
      }
      return [e.error?.message ?? `Erro HTTP ${e.status}`]
    }
    return ['Erro de conexão']
  }
}
```

## Registrar no app.config.ts

```typescript
import { CustomerHttpRepository } from './features/customers/data/customer-http.repository'
import { CUSTOMER_REPOSITORY } from './features/customers/domain/customer.repository.token'

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerHttpRepository },
  ],
}
```

## Checklist

- [ ] DTO interface `CustomerApiDto` separado da entidade de domínio
- [ ] `CustomerHttpRepository implements ICustomerRepository`
- [ ] `firstValueFrom()` para converter Observable → Promise
- [ ] `try/catch` em todos os métodos → `err(string[])`
- [ ] Mapeamento DTO → entidade via `CustomerEntity.create()`
- [ ] `handleError` devolve `string[]` parseando `{ errors: [...] }` do backend (nunca `message` única)
- [ ] `findByEmail` usa query param `?email=` no GET (nunca GET-all + filtro em memória)
- [ ] `{ provide: CUSTOMER_REPOSITORY, useClass: CustomerHttpRepository }` no app.config.ts
