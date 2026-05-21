---
name: mobile-repository-flutter
stack: agnostic
description: Criar a interface de repositório (contrato de domínio) e sua implementação Flutter com Dio (datasource HTTP), seguindo o padrão Result<T>. Usar quando o pedido envolver repositório Flutter, contrato de domínio, datasource HTTP Dio, implementação de repositório ou adapter Flutter.
---

# Mobile Repository (Flutter)

## Overview

Criar `abstract class IRepository` (domínio) e `class RepositoryImpl` (data layer) que delega para um `RemoteDataSource` usando Dio. Todos os métodos retornam `Future<Result<T>>`.

## Guidelines

- `abstract class I<Bc>Repository` em `domain/repositories/` — Dart puro.
- `class <Bc>RepositoryImpl` em `data/repositories/` — implementa a interface.
- `abstract class I<Bc>RemoteDataSource` + `<Bc>RemoteDataSourceImpl` em `data/datasources/`.
- `<Bc>Model` em `data/models/` — DTO serializable (json_serializable/freezed).
- Toda exceção de rede capturada → `Failure`.

## Workflow

1. Criar interface `I<Bc>Repository` com métodos que retornam `Future<Result<T>>`.
2. Criar `I<Bc>RemoteDataSource` com métodos que retornam `Future<Model>` (pode throw).
3. Criar `<Bc>RemoteDataSourceImpl` com Dio (pode throw DioException).
4. Criar `<Bc>RepositoryImpl` que chama datasource e captura exceções → `Failure`.
5. Criar provider Riverpod para o repositório.

## References

- Consultar references/flutter-repository-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
