---
name: mobile-screen-flutter
stack: agnostic
description: Criar ou revisar telas Flutter (Pages/Screens) com Riverpod para estado, ConsumerWidget e padrão de feature do projeto. Usar quando o pedido envolver tela Flutter, Page, Screen, listagem, detalhe, ou componente de UI Flutter no padrão Riverpod.
---

# Mobile Screen (Flutter)

## Overview

Criar telas Flutter como `ConsumerWidget` com Riverpod para estado, seguindo o padrão de feature com `AsyncNotifierProvider`, notifier e page separados.

## Guidelines

- `ConsumerWidget` ou `ConsumerStatefulWidget` para todas as telas.
- Estado via `AsyncNotifierProvider` (async) ou `NotifierProvider` (sync).
- Listagens com `ListView.builder` dentro de `RefreshIndicator`.
- Loading/error/data tratados explicitamente com `asyncValue.when(...)`.
- Navegação com `go_router`: `context.go()`, `context.push()`, `context.pop()`.

## Workflow

1. Criar notifier + provider em `features/<bc>/presentation/bloc/<bc>_provider.dart`.
2. Criar page em `features/<bc>/presentation/pages/<nome>_page.dart`.
3. Registrar rota no `app_router.dart`.
4. Consumir provider com `ref.watch(provider)`.

## References

- Consultar references/flutter-screen-pattern.md para templates.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
