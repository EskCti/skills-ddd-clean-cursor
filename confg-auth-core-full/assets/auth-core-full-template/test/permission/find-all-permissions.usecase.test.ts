import { FindAllPermissions } from "../../src/permission/usecase/find-all.usecase";
import { FindAllPermissionQuery } from "../../src/permission/provider";
import { PermissionDTO } from "../../src";
import { Result } from "__SHARED_PACKAGE_NAME__";

const mockQuery: jest.Mocked<FindAllPermissionQuery> = {
    execute: jest.fn(),
};

const permissions: PermissionDTO[] = [
    {
        id: "perm-1",
        name: "Create User",
        alias: "user.create",
        criticality: "LOW" as any,
        description: "descrição",
    },
    {
        id: "perm-2",
        name: "Delete User",
        alias: "user.delete",
        criticality: "HIGH" as any,
        description: "descrição",
    },
];

describe("FindAllPermissions", () => {
    let useCase: FindAllPermissions;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new FindAllPermissions(mockQuery);
    });

    it("should return all permissions on success", async () => {
        mockQuery.execute.mockResolvedValue(Result.ok(permissions));

        const result = await useCase.execute();

        expect(result.isOk).toBe(true);
        expect(result.instance).toHaveLength(2);
        expect(result.instance[0].alias).toBe("user.create");
    });

    it("should propagate query failure", async () => {
        mockQuery.execute.mockResolvedValue(Result.fail("QUERY_FAILED"));

        const result = await useCase.execute();

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("QUERY_FAILED");
    });
});
