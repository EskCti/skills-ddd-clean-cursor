# Controller Pattern (Pharmacore)

## Paths de referência

- Controllers:
  - `apps/backend/src/auth/auth.controller.ts`
  - `apps/backend/src/auth/role.controller.ts`
  - `apps/backend/src/product/product.controller.ts`
  - `apps/backend/src/branch/branch.controller.ts`
  - `apps/backend/src/category/category.controller.ts`
  - `apps/backend/src/brand/brand.controller.ts`
- Segurança:
  - `apps/backend/src/auth/jwt-auth.guard.ts`
  - `apps/backend/src/shared/guards/require-permission.guard.ts`
  - `apps/backend/src/shared/decorators/require-permission.decorator.ts`
  - `apps/backend/src/shared/decorators/current-user.decorator.ts`

## Papel do controller

- Converter HTTP request em input para use case.
- Controlar autenticação/autorização e status HTTP.
- Traduzir `Result` do core em resposta ou exceção Nest.

## Checklist de implementação

- [ ] `@Controller('rota-base')` definido.
- [ ] Decorators de método HTTP corretos (`@Get`, `@Post`, `@Patch`, `@Delete`).
- [ ] Guards/permissões aplicados quando endpoint protegido.
- [ ] Inputs extraídos por `@Body/@Param/@Query`.
- [ ] Normalização básica de tipos feita no controller (page/pageSize/bool string).
- [ ] Falhas mapeadas para exceções HTTP coerentes:
  - `BadRequestException` (400)
  - `UnauthorizedException` (401)
  - `NotFoundException` (404)
  - `InternalServerErrorException` (500)
- [ ] Resposta final segue contrato do endpoint (payload, vazio, 201/204 etc.).

## Padrões observados no código

- Controller instancia/chama use case e não executa regra de domínio.
- `@UseGuards(JwtAuthGuard, RequirePermissionGuard)` é comum em módulos protegidos.
- `@RequirePermission(PERMISSIONS....)` é aplicado por endpoint.
- Listagens paginadas recebem `page/pageSize` como query string e fazem parsing.
- Alguns endpoints de listagem retornam fallback vazio em falha (padrão existente em auth/roles).

## Armadilhas comuns

- Colocar regra de domínio no controller.
- Acoplar controller a detalhes de infraestrutura desnecessários.
- Não normalizar query params numéricos/booleanos.
- Expor erro cru sem envelope de `errors` quando padrão do módulo exige.
