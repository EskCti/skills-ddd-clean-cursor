# Angular Form Pattern (Reactive Forms + UseCase + PrimeNG)

## Formulário que chama UseCase (não Service HTTP)

```typescript
import { Component, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { InputTextModule } from 'primeng/inputtext'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'
import { MessageService } from 'primeng/api'
import { CustomerUseCases } from '../domain/customer.use-cases'

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="card p-6 max-w-lg mx-auto">
      <h2 class="text-xl font-bold mb-4">{{ isEdit() ? 'Editar' : 'Novo' }} Cliente</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label>Nome *</label>
          <input pInputText formControlName="name" />
          <small class="text-red-500" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
            Nome inválido
          </small>
        </div>
        <div class="flex flex-col gap-1">
          <label>Email *</label>
          <input pInputText formControlName="email" type="email" />
          <small class="text-red-500" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
            Email inválido
          </small>
        </div>
        <div class="flex flex-col gap-1">
          <label>CPF *</label>
          <input pInputText formControlName="cpf" maxlength="11" />
          <small class="text-red-500" *ngIf="form.get('cpf')?.invalid && form.get('cpf')?.touched">
            CPF inválido
          </small>
        </div>
        @if (serverError()) {
          <small class="text-red-500">{{ serverError() }}</small>
        }
        <div class="flex gap-2 justify-end">
          <p-button label="Cancelar" severity="secondary" (click)="cancel()" />
          <p-button label="Salvar" type="submit" [loading]="saving()" [disabled]="form.invalid" />
        </div>
      </form>
    </div>
  `
})
export class CustomerFormComponent {
  private readonly fb = inject(FormBuilder)
  private readonly useCases = inject(CustomerUseCases) // UseCase, não repository
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly toast = inject(MessageService)

  saving = signal(false)
  isEdit = signal(false)
  serverError = signal<string | null>(null)

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
  })

  async onSubmit() {
    if (this.form.invalid) return
    this.saving.set(true)
    this.serverError.set(null)
    const { name, email, cpf } = this.form.value

    // Chama o UseCase (que valida domínio + chama repository)
    const result = await this.useCases.createCustomer({
      name: name!, email: email!, cpf: cpf!,
    })

    if (result.ok) {
      this.toast.add({ severity: 'success', summary: 'Cliente criado com sucesso!' })
      this.router.navigate(['../'], { relativeTo: this.route })
    } else {
      // Erro de negócio (email duplicado, etc.) exibido no formulário
      this.serverError.set(result.error)
    }
    this.saving.set(false)
  }

  cancel() { this.router.navigate(['../'], { relativeTo: this.route }) }
}
```

## Checklist

- [ ] Formulário injeta `CustomerUseCases` (não `CustomerService`/`CustomerHttpRepository`)
- [ ] `result.ok` para sucesso, `result.error` para erros de negócio no servidor
- [ ] `serverError` signal para exibir erros do UseCase/servidor no formulário
- [ ] Validações de UI no Reactive Form (Validators) para feedback imediato
- [ ] Validações de domínio no UseCase (email único, regras de negócio)
