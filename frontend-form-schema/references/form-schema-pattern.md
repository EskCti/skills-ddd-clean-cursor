# Frontend Form + Schema Pattern (Genérico)

## Paths de referência

- Validator e componentes compartilhados:
  - `packages/shared/web/src/components/form/validator/*`
  - `packages/shared/web/src/components/form/form.component.tsx`
- Schemas (exemplos):
  - `packages/auth/web/src/data/schemas/auth/login.ts`
  - `packages/auth/web/src/data/schemas/user/create-user.ts`
  - `packages/product/web/src/data/schemas/product/create-product.ts`
  - `packages/product/web/src/data/schemas/product/update-product.ts`
- Forms (exemplos):
  - `packages/auth/web/src/components/pages/create-user.page.tsx`
  - `packages/product/web/src/components/product/form/product-form.component.tsx`
  - `packages/auth/web/src/components/profile/change-password-form.component.tsx`

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
  - `Form`
  - `FormField`
  - `FormItem`
  - `FormControl`
  - `FormMessage`
  - `FormButtonSubmit`
- Evitar renderizar erro manualmente quando `FormMessage` resolve o caso.

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
