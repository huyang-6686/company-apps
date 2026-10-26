import { describe, it, expect } from "vitest";
import { tenant } from "../../db/schema/tenant";

describe("tenant table schema", () => {
  it("has required columns", () => {
    expect(tenant.id).toBeDefined();
    expect(tenant.code).toBeDefined();
    expect(tenant.name).toBeDefined();
    expect(tenant.isActive).toBeDefined();
    expect(tenant.createdAt).toBeDefined();
    expect(tenant.updatedAt).toBeDefined();
  });
});
