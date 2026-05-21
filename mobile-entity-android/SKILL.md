---
name: mobile-entity-android
stack: kotlin
description: Criar entidades de domínio Android em Kotlin puro (sem Android/Hilt/Retrofit), com sealed class Failure e retorno Result<T>. Usar quando o pedido envolver entidade de domínio Android, data class de domínio Kotlin, Failure sealed class ou o padrão Result em Android.
---

# Mobile Entity (Android)

## Overview

Criar entidades de domínio em Kotlin puro — sem dependências Android, Hilt ou Retrofit. Usar `kotlin.Result<T>` para retornos ou definir `sealed class <Bc>Failure` para failures específicos do domínio.

## Guidelines

- Entidades são **Kotlin puro** — sem `import android.*`.
- Usar `data class` para entidades simples ou `class` com construtor privado para validações ricas.
- Factory function `fun create(...): Result<Entity>` que retorna `Result.success()` ou `Result.failure(exception)`.
- Failures específicos do BC como `sealed class <Bc>Failure : Exception()`.
- Igualdade automática via `data class`.

## Workflow

1. Criar `sealed class <Bc>Failure : Exception()` com variantes específicas.
2. Criar entidade com construtor privado e companion `fun create()`.
3. Validações no `create()` retornam `Result.failure(Failure)` — nunca throw.
4. Criar em `features/<bc>/domain/model/<Nome>.kt`.

## References

- Consultar references/android-entity-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
