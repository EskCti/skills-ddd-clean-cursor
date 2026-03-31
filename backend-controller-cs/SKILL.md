---
name: backend-controller-cs
stack: csharp
description: 'Criar, revisar ou orientar a implementação de Controllers de backend em C#. Usar quando o pedido envolver "controller", "endpoint", arquivos `*Controller.cs`, mapeamento HTTP (GET, POST, etc.), integração com Use Cases, e conversão de `Result` para `ActionResult`.'
---

# Backend Controller (C#)

## Overview

Implementar a camada de interface (Interface Adapter) em C# usando ASP.NET Core Controllers. Foco em receber requisições, delegar para a camada de Application (Use Case/Query) e mapear o resultado para a resposta HTTP correta.

## Guidelines

- Herdar de `ControllerBase` e usar o atributo `[ApiController]`.
- Injetar dependências (Use Cases/Queries) via construtor.
- Usar DTOs para entrada (`Request`) e saída (`Response`).
- Mapear o `Result` do Use Case para o status HTTP correspondente (200 OK, 201 Created, 400 BadRequest, 404 NotFound).
- Manter o controller "magro" (thin controller); a lógica de negócio deve estar no Use Case ou no Domínio.

## Workflow

1. Definir a rota (`[Route]`) e o verbo HTTP (`[HttpGet]`, `[HttpPost]`, etc.).
2. Injetar o Use Case/Query necessário no construtor.
3. Implementar a action mapeando o DTO de input para a chamada do Use Case.
4. Chamar o Use Case e tratar o `Result`.
5. Retornar `Ok()`, `BadRequest()`, `NotFound()`, etc., com o DTO de output se aplicável.
6. Adicionar anotações Swagger (`[ProducesResponseType]`) para documentação.

## References

- Consultar `../skills-standards.md` para convenção global de nomenclatura (seção C#).
- Seguir padrões de C# idiomáticos.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
