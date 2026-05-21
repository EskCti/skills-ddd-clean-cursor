# Vue Repository Pattern (fetch + DTO + Result)

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
import { ok, err, type Result } from '@/shared/result'
import type { CustomerEntity } from '../domain/customer.entity'
import { CustomerEntity as CE } from '../domain/customer.entity'
import type { ICustomerRepository } from '../domain/customer.repository'
import type { CustomerApiDto } from './customer.dto'

const BASE = '/api/customers'

function dtoToEntity(dto: CustomerApiDto): Result<CustomerEntity> {
  return CE.create({ id: dto.id, name: dto.name, email: dto.email, cpf: dto.cpf })
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw { status: res.status, message: body.message ?? `HTTP ${res.status}` }
  }
  return res.json()
}

export class CustomerHttpRepository implements ICustomerRepository {
  async findAll(): Promise<Result<CustomerEntity[]>> {
    try {
      const dtos = await apiRequest<CustomerApiDto[]>(BASE)
      const entities = dtos.flatMap(dto => {
        const r = dtoToEntity(dto)
        return r.ok ? [r.data] : []
      })
      return ok(entities)
    } catch (e: any) {
      return err(e.message ?? 'Erro ao buscar clientes')
    }
  }

  async findById(id: string): Promise<Result<CustomerEntity>> {
    try {
      const dto = await apiRequest<CustomerApiDto>(`${BASE}/${id}`)
      const result = dtoToEntity(dto)
      return result.ok ? ok(result.data) : err(result.error)
    } catch (e: any) {
      if (e.status === 404) return err('Cliente não encontrado')
      return err(e.message ?? 'Erro ao buscar cliente')
    }
  }

  async findByEmail(email: string): Promise<Result<CustomerEntity | null>> {
    try {
      const dtos = await apiRequest<CustomerApiDto[]>(BASE)
      const found = dtos.find(d => d.email === email)
      if (!found) return ok(null)
      const r = dtoToEntity(found)
      return r.ok ? ok(r.data) : ok(null)
    } catch (e: any) {
      return err(e.message ?? 'Erro de rede')
    }
  }

  async create(customer: CustomerEntity): Promise<Result<CustomerEntity>> {
    try {
      const dto = await apiRequest<CustomerApiDto>(BASE, {
        method: 'POST',
        body: JSON.stringify({ name: customer.name, email: customer.email, cpf: customer.cpf }),
      })
      const result = dtoToEntity(dto)
      return result.ok ? ok(result.data) : err(result.error)
    } catch (e: any) {
      if (e.status === 409) return err('Email já cadastrado')
      return err(e.message ?? 'Erro ao criar cliente')
    }
  }

  async update(customer: CustomerEntity): Promise<Result<CustomerEntity>> {
    try {
      const dto = await apiRequest<CustomerApiDto>(`${BASE}/${customer.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: customer.name, email: customer.email, cpf: customer.cpf }),
      })
      const result = dtoToEntity(dto)
      return result.ok ? ok(result.data) : err(result.error)
    } catch (e: any) {
      return err(e.message ?? 'Erro ao atualizar')
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await apiRequest<void>(`${BASE}/${id}`, { method: 'DELETE' })
      return ok(undefined)
    } catch (e: any) {
      return err(e.message ?? 'Erro ao deletar')
    }
  }
}
```

## Pinia Store com UseCase (src/stores/customer.store.ts)

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CustomerEntity } from '../features/customers/domain/customer.entity'
import { CreateCustomerUseCase, GetCustomersUseCase } from '../features/customers/domain/customer.use-cases'
import { CustomerHttpRepository } from '../features/customers/data/customer-http.repository'

// Instanciar repositório e use cases fora do store (singleton)
const repository = new CustomerHttpRepository()
const getCustomers = new GetCustomersUseCase(repository)
const createCustomer = new CreateCustomerUseCase(repository)

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<CustomerEntity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    const result = await getCustomers.execute()
    if (result.ok) {
      customers.value = result.data
    } else {
      error.value = result.error
    }
    loading.value = false
  }

  async function create(params: { name: string; email: string; cpf: string }) {
    const result = await createCustomer.execute(params)
    if (result.ok) {
      customers.value.push(result.data)
    }
    return result // retorna Result para o componente tratar
  }

  return { customers, loading, error, fetchAll, create }
})
```

## Checklist

- [ ] DTO interface `CustomerApiDto` separado da entidade
- [ ] `CustomerHttpRepository implements ICustomerRepository`
- [ ] `try/catch` em todos os métodos → `err(message)`
- [ ] Mapeamento DTO → entidade via `CustomerEntity.create()`
- [ ] Pinia store instancia `UseCase(repository)` — não chama repositório diretamente
- [ ] `store.create()` retorna `Result` para o componente exibir erros de negócio
