# Auth Backend Contract (C#)

## Endpoints

- `POST /api/auth/register`: Registro de usuário.
- `POST /api/auth/login`: Login e retorno de JWT.
- `GET /api/auth/me`: Dados do usuário logado.

## Segurança

- JWT Bearer Token.
- Roles: `Admin`, `User`.
