---
name: mobile-form-android
stack: kotlin
description: Criar ou revisar formulários Android com Jetpack Compose, estado com remember/mutableStateOf e submissão via ViewModel. Usar quando o pedido envolver formulário Compose, OutlinedTextField, validação de campo, cadastro ou edição em Android Jetpack Compose.
---

# Mobile Form (Android)

## Overview

Criar formulários Android com Jetpack Compose, `OutlinedTextField`, validação local e submissão via ViewModel.

## Guidelines

- Estado do form: `var field by remember { mutableStateOf("") }`.
- Validação: funções puras `fun validateName(v: String): String?` (null = válido).
- `isError = errorMsg != null` e `supportingText` no OutlinedTextField.
- Submit: valida todos os campos, depois chama `viewModel.create(...)`.
- Observa `submitState` (StateFlow) para loading/sucesso/erro.
- `LaunchedEffect(submitState) { if Success → navegar }`.

## Workflow

1. Definir campos com `var field by remember { mutableStateOf("") }`.
2. Definir erros com `var fieldError by remember { mutableStateOf<String?>(null) }`.
3. Criar função `fun validate(): Boolean` que valida todos os campos.
4. Submit: `if (validate()) viewModel.submit(...)`.
5. `LaunchedEffect` para navegação quando `submitState is Success`.

## References

- Consultar references/android-form-pattern.md para template completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
