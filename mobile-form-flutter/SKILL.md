---
name: mobile-form-flutter
stack: agnostic
description: Criar ou revisar formulários Flutter com TextFormField, validação inline e submissão via Riverpod. Usar quando o pedido envolver formulário Flutter, TextFormField, Form widget, GlobalKey<FormState>, validação de campos, cadastro ou edição em Flutter.
---

# Mobile Form (Flutter)

## Overview

Criar formulários Flutter com `Form` + `TextFormField`, validação inline via `validator` e submissão via Riverpod notifier.

## Guidelines

- `ConsumerStatefulWidget` para formulários com ciclo de vida (carregar dados de edição).
- `GlobalKey<FormState>` para controle do Form.
- `TextEditingController` por campo + `dispose()` obrigatório.
- `validator` inline retornando `String?` (null = válido).
- Submit: `_formKey.currentState!.validate()` antes de chamar notifier.
- Feedback: `ScaffoldMessenger.showSnackBar` ou `context.pop()`.

## Workflow

1. Criar `ConsumerStatefulWidget` com `GlobalKey<FormState>`.
2. Definir `TextEditingController` por campo.
3. No `initState()` / `didChangeDependencies()`, carregar dados se for edição.
4. Template com `TextFormField` + validators inline.
5. `_submit()` valida + chama notifier + navega/mostra SnackBar.

## References

- Consultar references/flutter-form-pattern.md para template completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
