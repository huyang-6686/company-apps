import { describe, it, expect } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import { permissionResource, permissionBinding } from "../../db/schema/permission";

describe("permission schema", () => {
  it("has required permission_resource columns", () => {
    expect(permissionResource.id).toBeDefined();
    expect(permissionResource.tenantId).toBeDefined();
    expect(permissionResource.code).toBeDefined();
  });

  it("has required permission_binding columns", () => {
    expect(permissionBinding.id).toBeDefined();
    expect(permissionBinding.tenantId).toBeDefined();
    expect(permissionBinding.personId).toBeDefined();
    expect(permissionBinding.resourceId).toBeDefined();
    expect(permissionBinding.action).toBeDefined();
    expect(permissionBinding.dataScope).toBeDefined();

    const foreignKeys = getTableConfig(permissionBinding).foreignKeys;
    expect(foreignKeys).toHaveLength(3);
  });
});
