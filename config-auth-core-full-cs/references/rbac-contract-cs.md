# RBAC Contract (C#)

## Alvo

- `src/Project.Core/Domain/Entities/Role.cs`
- `src/Project.Core/Domain/Entities/Permission.cs`

## Modelos

- **Role**:
  - `Id: Guid`
  - `Name: string`
  - `Permissions: ICollection<Permission>`
- **Permission**:
  - `Key: string` (ex: `products:create`)
  - `Description: string`

## Autorização em C#

- Use `Claims` para persistir roles e permissões no Token.
- Implementar `Policy-based authorization` no ASP.NET Core.
- Decorator: `[HasPermission("products:create")]`.
