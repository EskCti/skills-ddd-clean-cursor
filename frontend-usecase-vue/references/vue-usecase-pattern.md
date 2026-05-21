# Vue UseCase Pattern (classe TypeScript + Promise<Result<T>>)

## Repository interface (domain) — customer.repository.ts

```typescript
import type { CustomerEntity } from './customer.entity'
import type { Result } from '@/shared/result'

export interface ICustomerRepository {
  findAll(): Promise<Result<CustomerEntity[]>>
  findById(id: string): Promise<Result<CustomerEntity>>
  findByEmail(email: string): Promise<Result<CustomerEntity | null>>
  create(customer: CustomerEntity): Promise<Result<CustomerEntity>>
  update(customer: CustomerEntity): Promise<Result<CustomerEntity>>
  delete(id: string): Promise<Result<void>>
}
```

## Use Cases (domain) — customer.use-cases.ts

```typescript
import { ok, err, type Result } from '@/shared/result'
import { CustomerEntity } from './customer.entity'
import type { ICustomerRepository } from './customer.repository'

export class CreateCustomerUseCase {
  constructor(private readonly repository: ICustomerRepository) {}

  async execute(params: { name: string; email: string; cpf: string }): Promise<Result<CustomerEntity>> {
    // 1. Validar domínio
    const entityResult = CustomerEntity.create({
      id: crypto.randomUUID(),
      ...params,
    })
    if (!entityResult.ok) return entityResult

    // 2. Email único
    const existsResult = await this.repository.findByEmail(params.email)
    if (existsResult.ok && existsResult.data !== null) {
      return err('Email já cadastrado')
    }

    // 3. Persistir
    return this.repository.create(entityResult.data)
  }
}

export class GetCustomersUseCase {
  constructor(private readonly repository: ICustomerRepository) {}

  async execute(): Promise<Result<CustomerEntity[]>> {
    return this.repository.findAll()
  }
}

export class GetCustomerByIdUseCase {
  constructor(private readonly repository: ICustomerRepository) {}

  async execute(id: string): Promise<Result<CustomerEntity>> {
    return this.repository.findById(id)
  }
}
```

## Checklist

- [ ] Use cases são classes TypeScript simples (sem decorators Vue/Pinia)
- [ ] `ICustomerRepository` interface definida no domínio
- [ ] Todos os métodos retornam `Promise<Result<T>>`
- [ ] Validações de domínio delegadas à entidade
- [ ] Regras de negócio no use case (email único, etc.)
