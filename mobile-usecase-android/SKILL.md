---
name: mobile-usecase-android
stack: kotlin
description: Criar casos de uso Android em Kotlin puro com interface UseCase<Params, R> e retorno suspend fun / kotlin.Result<T>. Usar quando o pedido envolver use case Android, caso de uso Kotlin mobile, lógica de negócio sem Android deps, ou orquestração entre repository e entidade em Android.
---

# Mobile UseCase (Android)

## Overview

Criar casos de uso em Kotlin puro seguindo `interface UseCase<in Params, out R>` com `suspend operator fun invoke(params: Params): Result<R>`. O use case orquestra: valida → chama repository → retorna Result.

## Guidelines

- `interface UseCase<in Params, out R>` com `suspend operator fun invoke()`.
- Sem dependências Android — apenas Kotlin e Coroutines.
- Recebe `IRepository` via construtor (Hilt injetará na implementação do ViewModel).
- Retorna `Result<R>` — captura exceptions do repository.
- Parâmetros encapsulados em `data class <Nome>Params`.

## Workflow

1. Criar `interface UseCase<in Params, out R>` em `core/usecase/UseCase.kt`.
2. Criar `class <Nome>UseCase @Inject constructor(private val repo: IRepository)`.
3. Implementar `invoke()` com lógica de negócio.
4. Criar em `features/<bc>/application/usecase/<Nome>UseCase.kt`.

## References

- Consultar references/android-usecase-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
