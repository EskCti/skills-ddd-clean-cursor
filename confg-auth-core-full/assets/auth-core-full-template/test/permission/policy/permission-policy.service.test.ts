import { PermissionPolicy } from "../../../src/permission/model/permission-policy.service";
import { PermissionDTO } from "../../../src";

const makePermission = (id: string): PermissionDTO => ({
    id,
    name: `permission-${id}`,
    alias: `perm.${id}`,
    criticality: "LOW" as any,
    description: "descrição",
});

describe("PermissionPolicy", () => {
    it("should return true when user has all required permissions", () => {
        const policy = new PermissionPolicy(["perm-1", "perm-2", "perm-3"]);

        const result = policy.check([
            makePermission("perm-1"),
            makePermission("perm-2"),
        ]);

        expect(result).toBe(true);
    });

    it("should return false when user is missing one required permission", () => {
        const policy = new PermissionPolicy(["perm-1"]);

        const result = policy.check([
            makePermission("perm-1"),
            makePermission("perm-2"),
        ]);

        expect(result).toBe(false);
    });

    it("should return true when required permissions list is empty", () => {
        const policy = new PermissionPolicy(["perm-1"]);

        const result = policy.check([]);

        expect(result).toBe(true);
    });

    it("should return false when user has no permissions", () => {
        const policy = new PermissionPolicy([]);

        const result = policy.check([makePermission("perm-1")]);

        expect(result).toBe(false);
    });

    it("should return true when both user and required permissions are empty", () => {
        const policy = new PermissionPolicy([]);

        const result = policy.check([]);

        expect(result).toBe(true);
    });
});
