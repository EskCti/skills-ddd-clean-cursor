# Prisma Pattern (Pharmacore)

## Paths principais

- Schema e modelos:
  - `apps/backend/prisma/schema.prisma`
  - `apps/backend/prisma/models/*.prisma`
- Migrações:
  - `apps/backend/prisma/migrations/*/migration.sql`
- Client gerado:
  - `apps/backend/prisma/generated/prisma/*`
- Service de conexão:
  - `apps/backend/src/db/prisma.service.ts`
- Adapters:
  - `apps/backend/src/**/*.prisma.ts`
- Seeds:
  - `apps/backend/prisma/seed/main.ts`
  - `apps/backend/prisma/seed/*-module.ts`

## Convenções observadas

- Schema modular por domínio (`auth.prisma`, `product.prisma`, `stock.prisma`, etc.).
- Uso de `@map`/`@@map` para compatibilizar naming de banco.
- `PrismaClient` com output local em `./generated/prisma`.
- Adapters Prisma implementam contratos de core (repository/query) e retornam `Result`.
- Mapeamento explícito de banco -> domínio/DTO dentro do adapter.

## Checklist de alterações

### 1. Modelagem

- [ ] Alterar modelo no arquivo correto de `models/*.prisma`.
- [ ] Definir/ajustar relações (`@relation`, `onDelete`) e índices.
- [ ] Verificar naming com `@map`/`@@map`.

### 2. Migração e client

- [ ] Gerar/aplicar migração SQL.
- [ ] Garantir client atualizado após mudança de schema.
- [ ] Verificar se delegates esperados existem no client.

### 3. Adapter Prisma

- [ ] Atualizar select/include conforme novo campo/relação.
- [ ] Ajustar `toDomain` / `fromDomain`.
- [ ] Ajustar DTO de query quando leitura for projetada.
- [ ] Tratar falhas com `Result.fail`.
- [ ] Usar transação em mudanças múltiplas (`$transaction`).

### 4. Seed

- [ ] Ajustar tipos do seed (`type XxxSeedItem`) quando necessário.
- [ ] Persistir campos novos em create/update.
- [ ] Validar integridade de dados (contagem, referências, unicidade).

## CQRS dentro de adapters Prisma

- Pode coexistir na mesma classe adapter:
  - métodos repository (entidade/comando)
  - propriedades query (`findXxxQuery = { execute: ... }`) para leitura/DTO
- Manter fronteiras claras no contrato do core.

## Armadilhas comuns

- Esquecer de atualizar adapter após mudar schema.
- Retornar DTO em método de repository de comando.
- Não atualizar seed quando campo obrigatório é adicionado.
- Não regenerar client após mudanças de modelo.
- Usar raw SQL sem tipagem/conversão adequada de tipos numéricos (`bigint`/`string`).
