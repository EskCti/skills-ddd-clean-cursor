# Angular Page Pattern (Angular 17+ + UseCase + PrimeNG)

## Componente de Listagem (injeta UseCase, não Service HTTP)

```typescript
import { Component, inject, signal, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { TagModule } from 'primeng/tag'
import { RouterModule } from '@angular/router'
import { CustomerUseCases } from '../domain/customer.use-cases'
import type { CustomerEntity } from '../domain/customer.entity'

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, RouterModule],
  template: `
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Clientes</h1>
        <p-button label="Novo Cliente" icon="pi pi-plus" routerLink="new" />
      </div>

      @if (error()) {
        <p-message severity="error" [text]="error()!" styleClass="mb-4" />
      }

      <p-table [value]="customers()" [loading]="loading()" [paginator]="true" [rows]="10" stripedRows>
        <ng-template pTemplate="header">
          <tr>
            <th>Nome</th><th>Email</th><th>CPF</th><th>Status</th><th>Ações</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-c>
          <tr>
            <td>{{ c.name }}</td>
            <td>{{ c.email }}</td>
            <td>{{ c.cpf }}</td>
            <td><p-tag [value]="c.isActive ? 'Ativo' : 'Inativo'" [severity]="c.isActive ? 'success' : 'danger'" /></td>
            <td><p-button icon="pi pi-pencil" [routerLink]="[c.id, 'edit']" severity="secondary" text /></td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class CustomerListComponent implements OnInit {
  // Injeta o UseCase (application layer), não o repository/service direto
  private readonly useCases = inject(CustomerUseCases)

  customers = signal<CustomerEntity[]>([])
  loading = signal(false)
  error = signal<string | null>(null)

  ngOnInit() { this.loadCustomers() }

  async loadCustomers() {
    this.loading.set(true)
    this.error.set(null)
    const result = await this.useCases.getCustomers()
    if (result.ok) {
      this.customers.set(result.data)
    } else {
      this.error.set(result.error)
    }
    this.loading.set(false)
  }
}
```

## Arquitetura de Camadas (Angular Clean Architecture)

```
Presentation (Component / Template)
      ↓ inject()
Application (UseCase @Injectable service)
      ↓ inject(CUSTOMER_REPOSITORY token)
Domain (ICustomerRepository interface / InjectionToken)
      ↓ provided as
Data (CustomerHttpRepository → HttpClient → API)
```

## Checklist

- [ ] Componente injeta UseCase (`inject(CustomerUseCases)`)
- [ ] UseCase, não `CustomerService` HTTP direto
- [ ] `Result.ok` branch para sucesso, `Result.error` para falha
- [ ] `error` signal para exibir erros na UI
- [ ] `loading` signal para estado de carregamento
