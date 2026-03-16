import { Permission, CriticalityLevel } from "../../src";

describe("Permission Entity", () => {
    it("should create a permission successfully", () => {
        const permission = Permission.create({
            name: "Create User Permission",
            description: "Permission to create a user",
            alias: "user.create",
            criticality: CriticalityLevel.LOW,
        });

        expect(permission).toBeInstanceOf(Permission);
        expect(permission.name).toBe("Create User Permission");
        expect(permission.alias).toBe("user.create");
        expect(permission.description).toBe("Permission to create a user");
    });

    it("should throw an error if the alias is invalid", () => {
        expect(() => {
            Permission.create({
                name: "Create User Permission",
                description: "Permission to create a user",
                alias: "create-user", // inválido
                criticality: CriticalityLevel.LOW,
            });
        }).toThrow();
    });
});
