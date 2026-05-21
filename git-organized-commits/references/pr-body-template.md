# Template de PR — copiar bloco com 4 crases

Entregar ao usuário **exatamente** neste formato (4 crases externas permitem colar markdown com ``` internos):

````markdown
## Summary

<1–3 bullets: o que mudou e por quê, foco no valor para quem usa os skills>

Principais entregas:
- Pipeline `req-*` → backlog → bootstrap → BC → OpenSpec
- Orquestrador `config-project-fullstack` + matriz de stacks
- Skills por camada: config, test, frontend, mobile
- Shells Tailwind: `config-shared-web*` (sidebar, topbar, rodapé)
- Tutoriais `docs/tutorial/01–04` + `stacks/`

## Commits incluídos

| Hash | Mensagem |
|------|----------|
| `<hash>` | `<mensagem>` |
| ... | ... |

## Test plan

- [ ] `git log --oneline` revisado — commits atômicos por área
- [ ] Novos skills possuem `agents/openai.yaml` com `display_name`
- [ ] `req-agile-planning` — mapeamento task → agent coerente
- [ ] Tutorial 02 + uma stack (ex.: nestjs-vue-flutter) percorrível
- [ ] Scripts shell: `init-shared-web-angular.mjs --dry-run` (projeto consumidor)
- [ ] Template C#: `dotnet test` (se alterado)
- [ ] Sem secrets commitados
````

## Instruções ao agent

1. Preencher `<hash>` e `<mensagem>` com commits reais da branch
2. Ajustar bullets de Summary ao diff do PR
3. Adaptar Test plan ao escopo (remover itens irrelevantes)
4. Não omitir as 4 crases de abertura/fechamento
