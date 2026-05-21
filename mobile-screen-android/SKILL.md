---
name: mobile-screen-android
stack: kotlin
description: Criar ou revisar telas Android com Jetpack Compose, ViewModel e StateFlow no padrão do projeto. Usar quando o pedido envolver Screen Compose, Composable, tela Android, listagem LazyColumn, detalhe, ViewModel com StateFlow ou feature Android Jetpack Compose.
---

# Mobile Screen (Android)

## Overview

Criar telas Android com Jetpack Compose, ViewModel com StateFlow e Hilt.

## Guidelines

- Toda UI com `@Composable`. Sem XML.
- ViewModel com `@HiltViewModel` e `StateFlow<UiState>`.
- `UiState` como sealed class: `Loading`, `Success(data)`, `Error(message)`.
- Listagens: `LazyColumn` com `items()`.
- Coletar state: `val state by viewModel.uiState.collectAsStateWithLifecycle()`.
- Composable recebe ViewModel como parâmetro (testabilidade).

## Workflow

1. Criar sealed class `<Feature>UiState` com Loading, Success, Error.
2. Criar ViewModel com `@HiltViewModel` e `MutableStateFlow<UiState>`.
3. Criar Screen composable que coleta o state e renderiza cada caso.
4. Registrar no `AppNavGraph` com `hiltViewModel()`.

## References

- Consultar references/android-screen-pattern.md para templates.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
