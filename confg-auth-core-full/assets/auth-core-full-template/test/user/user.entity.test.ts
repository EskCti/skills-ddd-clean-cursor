import { Role, User, Permission, CriticalityLevel } from "../../src";

test("deve encontrar permissão", () => {
    const permission: Permission = Permission.create({
        name: "Full Access Permission",
        description: "Grants full access to all resources",
        alias: "system.full",
        criticality: CriticalityLevel.LOW,
    });

    const adminRole: Role = Role.create({
        name: "Admin",
        description: "Administrator role with full permissions",
        permissionIds: [permission.id],
    });

    const user: User = User.create({
        name: "João Silva",
        email: "joao@example.com",
        roleIds: [adminRole.id],
    });

    const hasRole = user.roleIds.includes(adminRole.id);
    expect(hasRole).toBe(true);
});
