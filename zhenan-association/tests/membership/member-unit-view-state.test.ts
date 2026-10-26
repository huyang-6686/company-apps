import { describe, expect, it } from "vitest";
import {
  buildMemberUnitQuery,
  readMemberUnitResponse,
} from "../../modules/membership/member-unit-view-state";

describe("member unit view state", () => {
  it("builds a stable query for search, status, and pagination", () => {
    expect(buildMemberUnitQuery({ search: "  生态 ", status: "active", offset: 25, limit: 25 })).toBe(
      "search=%E7%94%9F%E6%80%81&status=active&limit=25&offset=25",
    );
  });

  it("turns an unauthenticated API response into an explicit access state", async () => {
    const state = await readMemberUnitResponse(
      new Response(JSON.stringify({ error: "authentication required" }), { status: 401 }),
    );

    expect(state).toEqual({
      kind: "unauthorized",
      message: "当前账号尚未完成身份权限接入，暂不能加载会员台账。",
    });
  });

  it("accepts a valid paginated result", async () => {
    const state = await readMemberUnitResponse(
      new Response(JSON.stringify({ items: [], total: 0, limit: 25, offset: 0 }), { status: 200 }),
    );

    expect(state).toEqual({ kind: "ready", items: [], total: 0, limit: 25, offset: 0 });
  });

  it("maps upstream failures and malformed responses to a retryable error", async () => {
    await expect(readMemberUnitResponse(new Response("upstream failed", { status: 503 }))).resolves.toEqual({
      kind: "error",
      message: "会员台账暂时无法加载，请稍后重试。",
    });
    await expect(readMemberUnitResponse(new Response("not json", { status: 200 }))).resolves.toEqual({
      kind: "error",
      message: "会员台账返回数据格式异常。",
    });
  });

  it.each([
    null,
    { items: [null], total: 1, limit: 25, offset: 0 },
    { items: [{ id: "broken" }], total: 1, limit: 25, offset: 0 },
    { items: [], total: -1, limit: 25, offset: 0 },
    { items: [], total: 0, limit: 0, offset: 0 },
    { items: [], total: 0, limit: 25, offset: 0.5 },
  ])("rejects invalid records or pagination without exposing a broken table: %j", async (payload) => {
    await expect(readMemberUnitResponse(Response.json(payload))).resolves.toEqual({
      kind: "error",
      message: "会员台账返回数据格式异常。",
    });
  });

  it("preserves populated rows and nullable fields from a valid result", async () => {
    const item = {
      id: "unit-1", tenantId: "tenant-1", name: "测试会员单位", creditCode: "TEST-001",
      category: "单位会员", tier: null, feeAmount: null, contactPerson: null,
      contactPhone: null, isActive: true,
    };
    await expect(readMemberUnitResponse(Response.json({items: [item], total: 26, limit: 25, offset: 25}))).resolves.toMatchObject({
      kind: "ready", items: [item], total: 26, limit: 25, offset: 25,
    });
  });
});
