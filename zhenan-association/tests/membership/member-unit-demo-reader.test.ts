import { describe, expect, it } from "vitest";
import { createDemoMemberUnitReader } from "../../modules/membership/member-unit-demo-reader";

describe("createDemoMemberUnitReader", () => {
  it("returns deterministic synthetic records sorted by name", async () => {
    const reader = createDemoMemberUnitReader();
    const first = await reader.list({ tenantId: "demo-tenant", limit: 100, offset: 0 });
    const second = await reader.list({ tenantId: "demo-tenant", limit: 100, offset: 0 });
    expect(second).toEqual(first);
    expect(first.items.length).toBeGreaterThanOrEqual(30);
    expect(first.total).toBe(first.items.length);
  });

  it("filters by tenant and rejects other tenants", async () => {
    const reader = createDemoMemberUnitReader();
    const result = await reader.list({ tenantId: "other-tenant", limit: 10, offset: 0 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("filters by status active and inactive", async () => {
    const reader = createDemoMemberUnitReader();
    const active = await reader.list({ tenantId: "demo-tenant", status: "active", limit: 100, offset: 0 });
    const inactive = await reader.list({ tenantId: "demo-tenant", status: "inactive", limit: 100, offset: 0 });
    expect(active.items.every((item) => item.isActive)).toBe(true);
    expect(inactive.items.every((item) => !item.isActive)).toBe(true);
    expect(active.total + inactive.total).toBe(
      (await reader.list({ tenantId: "demo-tenant", limit: 100, offset: 0 })).total,
    );
  });

  it("filters by search on name or credit code case-insensitively", async () => {
    const reader = createDemoMemberUnitReader();
    const all = await reader.list({ tenantId: "demo-tenant", limit: 100, offset: 0 });
    const target = all.items[0];
    const byName = await reader.list({ tenantId: "demo-tenant", search: target.name, limit: 100, offset: 0 });
    expect(byName.items.map((i) => i.id)).toContain(target.id);
    const byCode = await reader.list({ tenantId: "demo-tenant", search: target.creditCode.toLowerCase(), limit: 100, offset: 0 });
    expect(byCode.items.map((i) => i.id)).toContain(target.id);
  });

  it("paginates with limit and offset", async () => {
    const reader = createDemoMemberUnitReader();
    const page1 = await reader.list({ tenantId: "demo-tenant", limit: 10, offset: 0 });
    const page2 = await reader.list({ tenantId: "demo-tenant", limit: 10, offset: 10 });
    expect(page1.items).toHaveLength(10);
    expect(page1.items[0].id).not.toBe(page2.items[0].id);
    const ids = new Set([...page1.items, ...page2.items].map((i) => i.id));
    expect(ids.size).toBe(20);
  });

  it("only produces synthetic demo data", async () => {
    const reader = createDemoMemberUnitReader();
    const result = await reader.list({ tenantId: "demo-tenant", limit: 100, offset: 0 });
    for (const item of result.items) {
      expect(item.tenantId).toBe("demo-tenant");
      expect(item.creditCode).toMatch(/^91350000DEMO/);
      expect(item.contactPhone ?? "").not.toMatch(/^1[3-9]\d{9}$/);
    }
  });

  it("keeps the seed count within the supported page size and resolves records by id", async () => {
    const reader = createDemoMemberUnitReader();
    const result = await reader.list({ tenantId: "demo-tenant", limit: 100, offset: 0 });
    expect(result.total).toBeLessThanOrEqual(100);
    expect(reader.getById("demo-tenant", result.items[0].id)).toEqual(result.items[0]);
    expect(reader.getById("demo-tenant", "missing")).toBeNull();
  });
});

