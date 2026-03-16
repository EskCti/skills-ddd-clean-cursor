import { Role, Permission, CriticalityLevel } from "../../src";

describe("Role Entity", () => {
    it("should create a role successfully", () => {
        const permissions = [
            Permission.create({
                name: "create-user",
                description: "Permission to create a user",
                alias: "user.create",
                criticality: CriticalityLevel.LOW,
            }),
            Permission.create({
                name: "update-user",
                description: "Permission to update a user",
                alias: "user.update",
                criticality: CriticalityLevel.LOW,
            }),
        ];

        const role = Role.create({
            name: "Admin",
            description: "Administrator role",
            permissionIds: permissions.map((p) => p.id),
        });

        expect(role).toBeInstanceOf(Role);
        expect(role.name).toBe("Admin"); // 🔥 corrigido
        expect(role.description).toBe("Administrator role");
        expect(role.permissionIds).toHaveLength(2);
    });

    it("should throw an error if the name is invalid", () => {
        expect(() => {
            Role.create({
                name: "",
                description: "Administrator role",
                permissionIds: [],
            });
        }).toThrow();
    });

    it("should check for a permission", () => {
        const createUserPermission = Permission.create({
            name: "create-user",
            description: "Permission to create a user",
            alias: "user.create",
            criticality: CriticalityLevel.LOW,
        });

        const updateUserPermission = Permission.create({
            name: "update-user",
            description: "Permission to update a user",
            alias: "user.update",
            criticality: CriticalityLevel.LOW,
        });

        const role = Role.create({
            name: "Admin",
            description: "Administrator role",
            permissionIds: [createUserPermission.id, updateUserPermission.id],
        });

        expect(role.permissionIds).toHaveLength(2);
        expect(role.permissionIds).toContain(createUserPermission.id);
        expect(role.permissionIds).toContain(updateUserPermission.id);
    });

    it("should create a role with no permissions", () => {
        const role = Role.create({
            name: "Guest",
            description: "Guest role",
            permissionIds: [],
        });

        expect(role).toBeInstanceOf(Role);
        expect(role.name).toBe("Guest"); // 🔥 corrigido
        expect(role.permissionIds).toHaveLength(0);
    });
});
