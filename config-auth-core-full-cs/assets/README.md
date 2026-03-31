# Auth Core Full (RBAC) Template (C#)

Template files for advanced authentication domain with roles and permissions:

- `Domain/Entities/Role.cs` — Role entity with permission collection
- `Domain/Entities/Permission.cs` — Permission entity (resource:action pattern)
- `Application/UseCases/CreateRoleUseCase.cs` — Create role + IRoleRepository
- `Application/UseCases/AssignPermissionUseCase.cs` — Assign permission to role

**Depends on**: `config-auth-core-basic-cs` (User, Password) and `config-shared-core-cs` (Entity, Result, ValueObject).
