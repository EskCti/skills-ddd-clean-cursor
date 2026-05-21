# Angular UseCase Pattern (@Injectable + Promise<Result<T>>)

## Abstract Repository Token (domain) — customer.repository.token.ts

```typescript
import { InjectionToken } from '@angular/core'

export interface ICustomerRepository {
  findAll(): Promise<Result<CustomerEntity[]>>
  findById(id: string): Promise<Result<CustomerEntity>>
  findByEmail(email: string): Promise<Result<CustomerEntity | null>>
  create(customer: CustomerEntity): Promise<Result<CustomerEntity>>
  update(customer: CustomerEntity): Promise<Result<CustomerEntity>>
  delete(id: string): Promise<Result<void>>
}

export const CUSTOMER_REPOSITORY = new InjectionToken<ICustomerRepository>('ICustomerRepository')
```

## UseCase Service — customer.use-cases.ts

```typescript
import { Injectable, inject } from '@angular/core'
import { Result, ok, err } from '../../../shared/result/result'
import { CustomerEntity } from './customer.entity'
import { CUSTOMER_REPOSITORY, ICustomerRepository } from './customer.repository.token'

@Injectable({ providedIn: 'root' })
export class CustomerUseCases {
  private readonly repository: ICustomerRepository = inject(CUSTOMER_REPOSITORY)

  async createCustomer(params: {
    name: string
    email: string
    cpf: string
  }): Promise<Result<CustomerEntity>> {
    // 1. Criar entidade (validação de domínio)
    const entityResult = CustomerEntity.create({
      id: crypto.randomUUID(),
      ...params,
    })
    if (!entityResult.ok) return entityResult

    // 2. Verificar email único
    const existsResult = await this.repository.findByEmail(params.email)
    if (existsResult.ok && existsResult.data !== null) {
      return err('Email já cadastrado')
    }

    // 3. Persistir
    return this.repository.create(entityResult.data)
  }

  async getCustomers(): Promise<Result<CustomerEntity[]>> {
    return this.repository.findAll()
  }

  async getCustomerById(id: string): Promise<Result<CustomerEntity>> {
    return this.repository.findById(id)
  }
}
```

## Checklist

- [ ] `InjectionToken<ICustomerRepository>` criado para abstrair o repositório
- [ ] UseCase é `@Injectable` service que injeta o token
- [ ] Todos os métodos retornam `Promise<Result<T>>`
- [ ] Validações de domínio delegadas à entidade (`CustomerEntity.create()`)
- [ ] Regras de negócio (email único) verificadas no use case
- [ ] Nenhum `throw` — apenas `return err('mensagem')`
