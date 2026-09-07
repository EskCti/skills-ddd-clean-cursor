---
name: frontend-form-schema
stack: typescript
description: 'Criar, revisar ou orientar forms frontend e schemas de validação no padrão Genérico Web. Usar quando o pedido envolver componentes de formulário React Hook Form, arquivos `data/schemas/*`, validação com `v` (`@namespace/shared-web`), tipagem com `v.infer`, campos opcionais/refinamentos/arrays e integração de erro com componentes de form compartilhados.'
---

# Frontend Form Schema

## Overview

Aplicar o padrão de formulários do projeto com React Hook Form + validator `v`, mantendo schema tipado, validação consistente e renderização padronizada de erros.

## Guidelines

- Preferir `v` (`@namespace/shared-web`) como padrão de schema/resolver.
- Definir schema com `v.defineObject`, arrays com `v.defineArray` e validação cruzada com `.refine`.
- Tipar payload de formulário com `v.infer<typeof schema>`.
- Integrar com RHF via `resolver: v.resolver(schema)`.
- Usar componentes compartilhados de form (`FormErrorMessage`, `Label`, `Input`, `Button`).
- Em update forms, tornar campos opcionais quando apropriado (`{ vo: X, optional: true }`).

## Workflow

1. Definir tipo de form (create/update/profile/filter).
2. Criar ou ajustar schema em `data/schemas/*`.
3. Exportar tipo `FormData` com `v.infer`.
4. Conectar schema ao `useForm` com `v.resolver`.
5. Revisar `defaultValues`, parse de campos e mensagens de erro.
6. Atualizar `index.ts` de schemas quando necessário.

## References

Consultar `references/form-schema-pattern.md` para exemplos concretos, checklist e armadilhas.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
