---
name: frontend-form-angular
stack: typescript
description: Criar ou revisar formulários Angular 17+ com Reactive Forms (FormBuilder, Validators), PrimeNG inputs e feedback de erro inline. Usar quando o pedido envolver formulário Angular, ReactiveFormsModule, FormGroup, FormBuilder, inputs PrimeNG (InputText, Dropdown, Calendar), validação de campos ou formulário de cadastro/edição em Angular.
---

# Frontend Form (Angular)

## Overview

Criar formulários Angular 17+ standalone com Reactive Forms, PrimeNG inputs e validação declarativa.

## Guidelines

- Usar `FormBuilder` com `inject()`.
- Definir `FormGroup` tipado com `FormControl<T>`.
- Validadores: `Validators.required`, `Validators.email`, custom validators.
- PrimeNG inputs: `p-inputtext`, `p-dropdown`, `p-calendar`, `p-password`.
- Mostrar erros com `*ngIf="field.invalid && field.touched"`.

## Workflow

1. Definir campos do formulário e validações.
2. Criar `FormGroup` com `FormBuilder.group({...})`.
3. Template com inputs PrimeNG e mensagens de erro inline.
4. Método `onSubmit()` que chama o serviço e navega.

## References

- Consultar references/angular-form-pattern.md para template completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
