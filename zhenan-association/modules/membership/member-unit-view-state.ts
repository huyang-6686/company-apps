import type { MemberUnitRecord } from "./member-unit-service";

export type MemberUnitViewState =
  | { kind: "loading" }
  | { kind: "unauthorized"; message: string }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: MemberUnitRecord[]; total: number; limit: number; offset: number };

const unauthorizedMessage = "当前账号尚未完成身份权限接入，暂不能加载会员台账。";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isMemberUnitRecord(value: unknown): value is MemberUnitRecord {
  if (!isRecord(value)) return false;
  return ["id", "tenantId", "name", "creditCode", "category"].every((key) => typeof value[key] === "string")
    && ["tier", "feeAmount", "contactPerson", "contactPhone"].every((key) => value[key] === null || typeof value[key] === "string")
    && typeof value.isActive === "boolean";
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function buildMemberUnitQuery(input: {
  search?: string;
  status?: "active" | "inactive";
  limit?: number;
  offset?: number;
}): string {
  const params = new URLSearchParams();
  const search = input.search?.trim();
  if (search) params.set("search", search);
  if (input.status) params.set("status", input.status);
  params.set("limit", String(input.limit ?? 25));
  params.set("offset", String(input.offset ?? 0));
  return params.toString();
}

export async function readMemberUnitResponse(response: Response): Promise<Exclude<MemberUnitViewState, { kind: "loading" }>> {
  if (response.status === 401) return { kind: "unauthorized", message: unauthorizedMessage };
  if (!response.ok) return { kind: "error", message: "会员台账暂时无法加载，请稍后重试。" };

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { kind: "error", message: "会员台账返回数据格式异常。" };
  }
  if (!isRecord(payload)
    || !Array.isArray(payload.items) || !payload.items.every(isMemberUnitRecord)
    || !isNonNegativeInteger(payload.total)
    || !isNonNegativeInteger(payload.limit) || payload.limit < 1 || payload.limit > 100
    || !isNonNegativeInteger(payload.offset)
    || payload.items.length > payload.limit || payload.items.length > payload.total) {
    return { kind: "error", message: "会员台账返回数据格式异常。" };
  }
  return {
    kind: "ready",
    items: payload.items,
    total: payload.total,
    limit: payload.limit,
    offset: payload.offset,
  };
}
