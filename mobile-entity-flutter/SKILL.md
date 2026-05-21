---
name: mobile-entity-flutter
stack: agnostic
description: Criar entidades de domínio Flutter (Dart puro, sem dependências Flutter/Riverpod) com classe Result<T> selada (Success/Failure). Usar quando o pedido envolver entidade de domínio Flutter, Dart entity, classe de domínio Flutter, failures ou o padrão Result em Dart.
---

# Mobile Entity (Flutter)

## Overview

Criar entidades de domínio em Dart puro — sem dependências de Flutter, Riverpod ou Dio. Aplicar o padrão `sealed class Result<T>` para retornos sem exceções.

## Guidelines

- Entidades são **Dart puro** — sem `import 'package:flutter/...'`.
- Usar `sealed class Result<T>` com `Success<T>` e `Failure<T>`.
- Construtor privado + factory `create()` retornando `Result<Entity>`.
- Validações no `create()` retornam `Failure` em vez de `throw`.
- Igualdade por valor (implementar `==` e `hashCode` por id ou todos os campos).
- Failures específicos do BC como sealed class separada.

## Workflow

1. Definir os campos da entidade e suas validações.
2. Criar `sealed class <Bc>Failure` com variantes (NotFound, DuplicateEmail, InvalidData, etc.).
3. Criar entidade com construtor privado e factory `create()` → `Result<Entity, <Bc>Failure>`.
4. Implementar `==` e `hashCode`.
5. Criar em `features/<bc>/domain/entities/<nome>.dart`.

## References

- Consultar references/flutter-entity-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
