# TurboRepo Web+Backend Bootstrap Contract

## Goal

Padronizar o bootstrap de um monorepo TurboRepo para:

- `<frontendAppPath>` (Next.js)
- `<backendAppPath>` (NestJS sem git interno)

Com defaults obtidos de `skills.config.json`:

- `frontendAppPath` (padrão: `apps/web`)
- `backendAppPath` (padrão: `apps/backend`)
- `frontendPort` (padrão: `3000`)
- `backendPort` (padrão: `4000`)
- `frontendApiUrlEnvVar` (padrão: `NEXT_PUBLIC_API_URL`)
- `backendPortEnvVar` (padrão: `PORT`)

## Steps Applied

1. Remover `<frontendAppPath>` e `<backendAppPath>`.
2. Criar `<frontendAppPath>` com `npx create-next-app@latest <frontendName> --yes --use-npm`.
3. Criar `<backendAppPath>` com `nest new <backendName> --skip-git --package-manager npm` (ou fallback via `npx @nestjs/cli@latest`).
4. Instalar:
   - root: `ts-node` (dev dependency)
   - backend: `dotenv`
5. Atualizar `package.json` root:
   - `scripts.test = "turbo run test"`
   - `devDependencies.ts-node` presente
6. Atualizar `turbo.json`:
   - `tasks.test.cache = false`
   - `tasks.build.outputs` contendo `dist/**`
7. Criar env files:
   - `<frontendAppPath>/.env` e `.env.example` com:
     - `<frontendApiUrlEnvVar>=http://localhost:<backendPort>`
     - `PORT=<frontendPort>`
   - `<backendAppPath>/.env` e `.env.example` com:
     - `<backendPortEnvVar>=<backendPort>`
     - `DATABASE_URL`
     - `JWT_SECRET`
8. Reescrever `<backendAppPath>/src/main.ts` com:
   - `app.enableCors()`
   - leitura de `process.env.<backendPortEnvVar>` (default `<backendPort>`)
   - `import "dotenv/config"`

## Notes

- O script é destrutivo para os caminhos configurados em `<frontendAppPath>` e `<backendAppPath>`.
- O projeto deve já estar inicializado como TurboRepo antes da execução.
