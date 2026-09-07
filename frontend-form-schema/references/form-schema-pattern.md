# Frontend Form + Schema Pattern (Genérico)

## Paths de referência

- Validator e componentes compartilhados:
  - `apps/web/src/shared/components/form/validator/*`
  - `apps/web/src/shared/components/ui/form-error-message.tsx`
- Schemas (exemplos):
  - `apps/web/src/modules/auth/data/schemas/auth/login.schema.ts`
  - `apps/web/src/modules/auth/data/schemas/user/create-user.schema.ts`
  - `apps/web/src/modules/product/data/schemas/product/create-product.schema.ts`
  - `apps/web/src/modules/product/data/schemas/product/update-product.schema.ts`
- Forms (exemplos):
  - `apps/web/src/modules/auth/pages/sign-in.page.tsx`
  - `apps/web/src/modules/auth/components/user-form-fields.component.tsx`
  - `apps/web/src/modules/auth/pages/profile.page.tsx` (change-password/profile form)

## Padrão principal

- Stack padrão:
  - `react-hook-form` + `v` (`@namespace/shared-web`)
- Schema:
  - `v.defineObject({...})`
  - `v.defineArray(...)`
  - `.refine(...)` para validação cruzada
- Tipagem:
  - `type XxxFormData = v.infer<typeof xxxSchema>`
- Resolver:
  - `resolver: v.resolver(xxxSchema)`

## Create vs Update

- Create schema:
  - campos geralmente obrigatórios.
- Update schema:
  - campos opcionais quando o endpoint aceita parcial:
    - `{ vo: Name, optional: true }`

## Campos complexos

- Array de VO:
  - `v.defineArray(URL, { optional: true })`
- Array de objetos:
  - `v.defineArray({ name: SubCategoryName, id: { vo: Id, optional: true } })`
- Config de VO:
  - `{ vo: Description, config: { minLength: 10 } }`

## Composição de UI

- Usar componentes compartilhados:
  - `FormErrorMessage` — mensagens de erro de campo e de API (`{ errors: string[] }`)
  - `Label`, `Input`, `Textarea`, `Button` (`apps/web/src/shared/components/ui/*`)
- O validador compartilhado (`v`) fica em `apps/web/src/shared/components/form/validator`.
- Evitar renderizar erro manualmente quando `FormErrorMessage` resolve o caso.

## Exceções e legado

- Existe uso pontual de Zod no projeto, mas o padrão a seguir é `v`.
- Em manutenção, preferir migrar para `v` quando alterar forms legados.

## Checklist

- [ ] Schema criado/atualizado no módulo correto.
- [ ] `FormData` inferido com `v.infer`.
- [ ] `resolver: v.resolver(schema)` aplicado.
- [ ] `defaultValues` coerentes com schema e modo (create/update).
- [ ] Mensagens de erro exibidas via `FormMessage`.
- [ ] Erros da API (`{ errors: string[] }`) mapeados e exibidos como **lista** (não só o primeiro item).
- [ ] Barrel `index.ts` atualizado quando novo schema é adicionado.

## Armadilhas comuns

- Misturar Zod e `v` sem necessidade no mesmo fluxo.
- Esquecer `optional: true` em update forms.
- Não converter tipo de input antes de enviar (ex.: `string` -> `number`).
- Não usar `.refine` para regras entre campos (ex.: confirmação de senha).
