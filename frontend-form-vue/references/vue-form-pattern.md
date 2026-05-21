# Vue Form Pattern (vee-validate + UseCase via store + PrimeVue 4)

## Instalação

```bash
npm install vee-validate @vee-validate/zod zod
```

## Formulário que usa store (que usa UseCase internamente)

```vue
<!-- views/customers/CustomerFormView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForm, ErrorMessage, Field } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useRouter, useRoute } from 'vue-router'
import { useCustomerStore } from '@/stores/customer.store'

const schema = toTypedSchema(z.object({
  name: z.string().min(2, 'Nome mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos').regex(/^\d+$/, 'Apenas números'),
}))

const { handleSubmit, setValues, isSubmitting } = useForm({ validationSchema: schema })
const store = useCustomerStore()
const toast = useToast()
const router = useRouter()
const route = useRoute()
const isEdit = ref(false)
const serverError = ref<string | null>(null)

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    await store.fetchAll()
    const customer = store.customers.find(c => c.id === id)
    if (customer) setValues({ name: customer.name, email: customer.email, cpf: customer.cpf })
  }
})

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null

  // store.create() chama o UseCase → que valida domínio + chama repository
  const result = await store.create(values)

  if (result.ok) {
    toast.add({ severity: 'success', summary: 'Salvo com sucesso!', life: 3000 })
    router.push('/customers')
  } else {
    // Erro de negócio (email duplicado, etc.) exibido no formulário
    serverError.value = result.error
    toast.add({ severity: 'error', summary: result.error, life: 3000 })
  }
})
</script>

<template>
  <div class="card p-6 max-w-lg mx-auto">
    <h2 class="text-xl font-bold mb-4">{{ isEdit ? 'Editar' : 'Novo' }} Cliente</h2>

    <form @submit="onSubmit" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label>Nome *</label>
        <Field name="name" v-slot="{ field, errors }">
          <InputText v-bind="field" :invalid="!!errors.length" fluid />
          <ErrorMessage name="name" class="text-red-500 text-sm" />
        </Field>
      </div>

      <div class="flex flex-col gap-1">
        <label>Email *</label>
        <Field name="email" v-slot="{ field, errors }">
          <InputText v-bind="field" type="email" :invalid="!!errors.length" fluid />
          <ErrorMessage name="email" class="text-red-500 text-sm" />
        </Field>
      </div>

      <div class="flex flex-col gap-1">
        <label>CPF *</label>
        <Field name="cpf" v-slot="{ field, errors }">
          <InputText v-bind="field" maxlength="11" :invalid="!!errors.length" fluid />
          <ErrorMessage name="cpf" class="text-red-500 text-sm" />
        </Field>
      </div>

      <!-- Erro do servidor (UseCase/Repository) exibido no formulário -->
      <small v-if="serverError" class="text-red-500">{{ serverError }}</small>

      <div class="flex gap-2 justify-end">
        <Button label="Cancelar" severity="secondary" @click="router.push('/customers')" />
        <Button label="Salvar" type="submit" :loading="isSubmitting" />
      </div>
    </form>
  </div>
</template>
```

## Checklist

- [ ] Formulário chama `store.create()` — não usecase ou repository diretamente
- [ ] `store.create()` retorna `Result<T>` que o formulário usa para exibir erros
- [ ] `serverError` ref para erros de negócio do UseCase (email duplicado, etc.)
- [ ] Validações de formato no schema Zod (cliente-side imediato)
- [ ] Validações de negócio no UseCase (server-side via API)
