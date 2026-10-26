import { describe, expect, it } from "vitest";
process.env.DEMO_MODE = "true";
import { GET } from "../../app/api/demo/membership/units/route";

function demoRequest(query: string) {
  return new Request(`http://localhost:3000/api/demo/membership/units?${query}`);
}

describe("demo member unit route", () => {
  it("serves synthetic records with the demo tenant", async () => {
    const response = await GET(demoRequest("limit=100&offset=0"));
    expect(response.status).toBe(200);
    const body = await response.json() as { items: Array<{ tenantId: string; creditCode: string }>; total: number };
    expect(body.total).toBeGreaterThanOrEqual(30);
    expect(body.items.every((item) => item.tenantId === "demo-tenant")).toBe(true);
    expect(body.items.every((item) => item.creditCode.startsWith("91350000DEMO"))).toBe(true);
  });

  it("supports search, status filter and pagination", async () => {
    const active = await GET(demoRequest("status=active&limit=100&offset=0"));
    const activeBody = await active.json() as { items: Array<{ isActive: boolean }> };
    expect(activeBody.items.every((item) => item.isActive)).toBe(true);

    const page1 = await GET(demoRequest("limit=10&offset=0"));
    const page2 = await GET(demoRequest("limit=10&offset=10"));
    const p1 = await page1.json() as { items: Array<{ id: string }> };
    const p2 = await page2.json() as { items: Array<{ id: string }> };
    expect(p1.items[0].id).not.toBe(p2.items[0].id);

    const searched = await GET(demoRequest("search=" + encodeURIComponent("演示单位A01") + "&limit=10&offset=0"));
    const searchedBody = await searched.json() as { total: number };
    expect(searchedBody.total).toBeGreaterThanOrEqual(1);
  });

  it("keeps the same validation semantics as the formal route", async () => {
    const badStatus = await GET(demoRequest("status=weird"));
    expect(badStatus.status).toBe(400);

    const clientTenant = await GET(demoRequest("tenantId=demo-tenant"));
    expect(clientTenant.status).toBe(400);

    const badLimit = await GET(demoRequest("limit=abc"));
    expect(badLimit.status).toBe(400);
  });

  it("returns 404 when demo mode is disabled", async () => {
    const previous = process.env.DEMO_MODE;
    process.env.DEMO_MODE = "false";
    try {
      const response = await GET(demoRequest("limit=10"));
      expect(response.status).toBe(404);
    } finally {
      process.env.DEMO_MODE = previous;
    }
  });
});


