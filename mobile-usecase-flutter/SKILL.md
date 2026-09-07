---
name: mobile-usecase-flutter
stack: agnostic
description: Criar casos de uso Flutter em Dart puro com interface UseCase<Params, Result> e retorno Future<Result<T, Failure>>. Usar quando o pedido envolver use case Flutter, caso de uso mobile, lógica de negócio Dart, ou orquestração entre repository e entidade em Flutter.
---

# Mobile UseCase (Flutter)

## Overview

Criar casos de uso em Dart puro seguindo `abstract class UseCase<Type, Params>` com retorno `Future<Result<Type>>`. O use case orquestra: recebe parâmetros → valida → chama repository → retorna Result.

## Guidelines

- `abstract class UseCase<Type, Params>` com método `call(Params params)`.
- Sem dependências Flutter — apenas Dart.
- Recebe `IRepository` via construtor (injeção de dependência).
- Retorna `Future<Result<Type>>` — nunca lança exceção.
- Parâmetros encapsulados em `class <Nome>Params` (ou `NoParams` se sem parâmetros).

## Workflow

1. Criar `abstract class UseCase<Type, Params>` em `lib/core/usecases/usecase.dart`.
2. Criar `class <Nome>UseCase implements UseCase<OutputType, <Nome>Params>`.
3. Receber repository no construtor.
4. Implementar `call()` com lógica de negócio e retorno `Result<Type>`.
5. Criar em `features/<bc>/application/usecases/<nome>_use_case.dart`.

## References

- Consultar references/flutter-usecase-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
