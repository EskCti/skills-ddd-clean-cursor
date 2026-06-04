# Vue Page Pattern (Vue 3 + PrimeVue 4 + UseCase via Pinia)

## View de Listagem (store usa UseCase internamente)

```vue
<!-- views/customers/CustomerListView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import { useCustomerStore } from '@/stores/customer.store'
import { useRouter } from 'vue-router'

const store = useCustomerStore()
const router = useRouter()

onMounted(() => store.fetchAll())

const getSeverity = (isActive: boolean) => isActive ? 'success' : 'danger'
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Clientes</h1>
      <Button label="Novo Cliente" icon="pi pi-plus" @click="router.push('/customers/new')" />
    </div>

    <!-- Erros do UseCase/Repository — lista completa -->
    <div v-if="store.errors.length" class="mb-4 flex flex-col gap-2">
      <Message v-for="(msg, i) in store.errors" :key="i" severity="error" :text="msg" />
    </div>

    <DataTable :value="store.customers" :loading="store.loading" paginator :rows="10" stripedRows>
      <Column field="name" header="Nome" sortable />
      <Column field="email" header="Email" />
      <Column field="cpf" header="CPF" />
      <Column header="Status">
        <template #body="{ data }">
          <Tag :value="data.isActive ? 'Ativo' : 'Inativo'" :severity="getSeverity(data.isActive)" />
        </template>
      </Column>
      <Column header="Ações">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text severity="secondary"
                  @click="router.push(`/customers/${data.id}/edit`)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
```

## Arquitetura de Camadas (Vue Clean Architecture)

```
Presentation (Vue Component / Template)
      ↓ usa
State (Pinia Store)
      ↓ instancia e chama
Application (UseCase classes TypeScript)
      ↓ recebe no construtor
Domain (ICustomerRepository interface)
      ↓ implementado por
Data (CustomerHttpRepository → fetch → API)
```

## Checklist

- [ ] View usa Pinia store (não importa use cases ou repository diretamente)
- [ ] Store expõe `customers`, `loading` e `errors: string[]`
- [ ] `store.errors` exibido com um `<Message>` **por item** (nunca só o primeiro)
- [ ] Store chama UseCase (não fetch direto)
