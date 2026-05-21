---
name: mobile-repository-android
stack: kotlin
description: Criar a interface de repositório (contrato de domínio) e sua implementação Android com Retrofit, seguindo o padrão Result<T>. Usar quando o pedido envolver repositório Android, interface IRepository, API service Retrofit, DTO Kotlin, implementação de repositório ou adapter Android.
---

# Mobile Repository (Android)

## Overview

Criar `interface I<Bc>Repository` (domínio puro) e `class <Bc>RepositoryImpl` (data layer) que delega para `<Bc>ApiService` (Retrofit). Todos os métodos retornam `suspend fun ... : Result<T>`.

## Guidelines

- `interface I<Bc>Repository` em `domain/repository/` — Kotlin puro, sem Android.
- `<Bc>ApiService` em `data/remote/` — Retrofit interface.
- `<Bc>Dto` em `data/remote/` — data class para serialização JSON.
- `<Bc>RepositoryImpl` em `data/repository/` — implementa interface, captura exceções.
- Toda exception de rede → `Result.failure(CustomerFailure.NetworkError(e))`.

## Workflow

1. Criar `interface I<Bc>Repository` com métodos `suspend`.
2. Criar `<Bc>Dto` (data class com @SerializedName).
3. Criar `<Bc>ApiService` (Retrofit interface).
4. Criar `<Bc>RepositoryImpl @Inject constructor(api: Service)`.
5. Registrar no `NetworkModule` (Hilt).

## References

- Consultar references/android-repository-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
