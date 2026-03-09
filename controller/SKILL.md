---
name: controller
description: "Criar, revisar ou orientar controllers HTTP do backend NestJS no padrão Pharmacore. Usar quando o pedido envolver arquivos `*.controller.ts`, definição de rotas e verbos HTTP, aplicação de guards/permissões, binding de `@Body/@Param/@Query`, orquestração de use cases e mapeamento de falhas para exceções HTTP (`BadRequestException`, `NotFoundException`, etc.)."
---

# Controller

## Overview

Aplicar o padrão de controller como camada de entrada HTTP: receber request, validar parâmetros básicos, chamar use case e traduzir `Result` para resposta/exceção HTTP.

## Guidelines

- Controller não implementa regra de domínio; delega para use case/query/repository conforme o fluxo existente.
- Definir rota e verbo com decorators (`@Get`, `@Post`, `@Patch`, `@Delete`).
- Usar `@UseGuards(JwtAuthGuard, RequirePermissionGuard)` e `@RequirePermission(...)` quando endpoint protegido.
- Extrair input com `@Body`, `@Param`, `@Query`; normalizar tipos quando necessário (ex.: `Number(...)`, boolean por string).
- Mapear falhas de `Result` para exceção HTTP adequada.
- Retornar payload esperado pelo contrato; para operações sem corpo, retornar `void` com `@HttpCode(204|201)` quando aplicável.

## Workflow

1. Definir rota base (`@Controller('...')`) e segurança global por controller (quando fizer sentido).
2. Criar método por endpoint com decorators HTTP e permissões.
3. Instanciar/chamar use case com dependências injetadas no controller.
4. Tratar `result.isFailure` e lançar exceção HTTP coerente.
5. Retornar `result.instance` ou `void` conforme contrato.
6. Revisar consistência de status code e formato de erro.

## References

Consultar `references/controller-pattern.md` para exemplos reais, checklist e armadilhas.
