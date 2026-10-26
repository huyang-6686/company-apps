import { describe, it, expect } from "vitest";

describe("schema fixtures", () => {
  it("imports all tables", async () => {
    const schema = await import("../../db/schema");
    expect(schema.tenant).toBeDefined();
    expect(schema.person).toBeDefined();
    expect(schema.memberUnit).toBeDefined();
    expect(schema.permissionResource).toBeDefined();
    expect(schema.permissionBinding).toBeDefined();
    expect(schema.auditEvent).toBeDefined();
    expect(schema.notificationLog).toBeDefined();
  });

  it("tenant has unique code constraint", async () => {
    const schema = await import("../../db/schema");
    expect(schema.tenant.code.isUnique).toBe(true);
  });

  it("person has tenant foreign key", async () => {
    const schema = await import("../../db/schema");
    expect(schema.person.tenantId).toBeDefined();
  });
});
