---
name: frontend-form-vue
stack: typescript
description: Criar ou revisar formulários Vue 3 com vee-validate + PrimeVue inputs no padrão do projeto. Usar quando o pedido envolver formulário Vue, vee-validate, InputText PrimeVue, Dropdown, DatePicker, validação de campos ou formulário de cadastro/edição em Vue 3.
---

# Frontend Form (Vue)

## Overview

Criar formulários Vue 3 com vee-validate (schema-based), PrimeVue inputs e feedback de erro inline.

## Guidelines

- Usar `useForm` do vee-validate com schema Zod ou yup.
- Inputs PrimeVue: `InputText`, `Password`, `Dropdown`, `DatePicker`, `Textarea`.
- Erro inline via `ErrorMessage` do vee-validate.
- Submit: `handleSubmit` que chama store/service e navega.

## Workflow

1. Definir schema de validação (Zod).
2. Criar componente com `useForm({ validationSchema })`.
3. Template com inputs PrimeVue + ErrorMessage.
4. onSubmit chama store action ou service.

## References

- Consultar references/vue-form-pattern.md para template completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
