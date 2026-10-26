import { describe, expect, it } from "vitest";
import { GET } from "../../app/api/membership/units/route";
import { handleMemberUnitRequest } from "../../modules/membership/member-unit-route";
import type { MemberUnitReader } from "../../modules/membership/member-unit-service";
import { MEMBER_UNIT_READ_ACTION, createFailClosedRequestContextProvider } from "../../modules/shared/auth/request-context";

const reader: MemberUnitReader = {
  async list(query) {
    const items = query.status === "inactive" ? [] : [{
      id: "unit-1",
      tenantId: query.tenantId,
      name: "镇安生态农业有限公司",
      creditCode: "91610100AAA1111111",
      category: "单位会员",
      tier: "单位会员",
      feeAmount: "500.00",
      contactPerson: "张三",
      contactPhone: "13800000000",
      isActive: true,
    }];
    return { items, total: items.length };
  },
};

describe("member unit API adapter", () => {
  it("keeps the deployed endpoint closed until trusted identity is connected", async () => {
    const response = await GET(new Request("https://example.test/api/membership/units"));

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "authentication required" });
  });

  it("returns tenant-scoped units with the requested search and status", async () => {
    const response = await handleMemberUnitRequest(
      new Request("https://example.test/api/membership/units?q=生态&status=active"),
      { context: { tenantId: "tenant-a", actions: new Set([MEMBER_UNIT_READ_ACTION]) }, reader },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      total: 1,
      items: [{ id: "unit-1", name: "镇安生态农业有限公司" }],
    });
  });

  it("rejects an invalid status before querying", async () => {
    let calls = 0;
    const countingReader: MemberUnitReader = {
      async list() {
        calls += 1;
        return { items: [], total: 0 };
      },
    };

    const response = await handleMemberUnitRequest(
      new Request("https://example.test/api/membership/units?status=paused"),
      { context: { tenantId: "tenant-a", actions: new Set([MEMBER_UNIT_READ_ACTION]) }, reader: countingReader },
    );

    expect(response.status).toBe(400);
    expect(calls).toBe(0);
  });

  it("refuses requests when the trusted tenant configuration is missing", async () => {
    const response = await handleMemberUnitRequest(
      new Request("https://example.test/api/membership/units"),
      { context: null, reader },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "authentication required" });
  });

  it("rejects missing trusted context before querying", async () => {
    let calls = 0;
    const countingReader: MemberUnitReader = { async list() { calls += 1; return { items: [], total: 0 }; } };
    const response = await handleMemberUnitRequest(new Request("https://example.test/api/membership/units"), {
      context: null,
      reader: countingReader,
    });
    expect(response.status).toBe(401);
    expect(calls).toBe(0);
  });

  it("rejects a trusted tenant without the read action", async () => {
    let calls = 0;
    const countingReader: MemberUnitReader = { async list() { calls += 1; return { items: [], total: 0 }; } };
    const response = await handleMemberUnitRequest(new Request("https://example.test/api/membership/units"), {
      context: { tenantId: "tenant-a", actions: new Set() },
      reader: countingReader,
    });
    expect(response.status).toBe(403);
    expect(calls).toBe(0);
  });

  it("provides a fail-closed context provider", async () => {
    await expect(createFailClosedRequestContextProvider()(new Request("https://example.test"))).resolves.toBeNull();
  });
});
