---
name: core-repository-kt
stack: kotlin
description: 'Criar, revisar ou orientar contratos e implementações de repositório em Kotlin no padrão DDD/Clean Architecture. Usar quando o pedido envolver interfaces de repositório, operações de persistência de entidades (save/findById/findAll/delete), adaptação de infraestrutura (JPA, Exposed) para contratos de domínio, tratamento de erros com Result e mapeamentos toDomain/fromDomain em Kotlin.'
---

# Repository (Kotlin)

## Overview

Aplicar o padrão de repositório em Kotlin para escrita e leitura de entidades de domínio com contratos (interfaces) no domínio e implementação desacoplada em infraestrutura.

## Guidelines

- Definir interface no pacote de domínio.
- Implementar em adapter de infraestrutura (JPA, Exposed, etc.) retornando `Result`.
- Mapear domínio explicitamente: `toDomain` (db -> entity) e `fromDomain` (entity -> db).
- Tratar falhas com `Result.failure(...)`.
- Manter separação CQRS: Repository para comando/escrita, Query para leitura/projeção DTO.

## Workflow

1. Confirmar agregados/entidades cobertos pelo repositório.
2. Definir/ajustar interface no pacote de domínio.
3. Implementar adapter de infraestrutura respeitando o contrato.
4. Implementar mapeamento `toDomain`/`fromDomain`.
5. Garantir consistência transacional para operações compostas.
6. Criar/ajustar mocks in-memory para testes de use case.

## References

Consultar `references/repository-pattern-kt.md` para contratos, exemplos e checklist.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.

---
