export type MemberUnitStatus = "active" | "inactive";

export type MemberUnitRecord = {
  id: string;
  tenantId: string;
  name: string;
  creditCode: string;
  category: string;
  tier: string | null;
  feeAmount: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  isActive: boolean;
};

export type MemberUnitQuery = {
  tenantId: string;
  search?: string;
  status?: MemberUnitStatus;
  limit: number;
  offset: number;
};

export type MemberUnitListResult = {
  items: MemberUnitRecord[];
  total: number;
};

export type MemberUnitReader = {
  list: (query: MemberUnitQuery) => Promise<MemberUnitListResult>;
};

export const DEFAULT_MEMBER_UNIT_LIMIT = 25;
export const MAX_MEMBER_UNIT_LIMIT = 100;
export const MAX_MEMBER_UNIT_SEARCH_LENGTH = 100;

export function normalizeMemberUnitQuery(
  query: Omit<MemberUnitQuery, "limit" | "offset"> & { limit?: number; offset?: number },
): MemberUnitQuery {
  const tenantId = query.tenantId.trim();
  if (!tenantId) throw new Error("Tenant ID is required");
  if (query.status && query.status !== "active" && query.status !== "inactive") {
    throw new Error("Invalid member unit status");
  }

  const search = query.search?.trim() || undefined;
  if (search && search.length > MAX_MEMBER_UNIT_SEARCH_LENGTH) {
    throw new Error("Member unit search is too long");
  }

  const limit = query.limit ?? DEFAULT_MEMBER_UNIT_LIMIT;
  const offset = query.offset ?? 0;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_MEMBER_UNIT_LIMIT) {
    throw new Error("Invalid member unit limit");
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("Invalid member unit offset");
  }

  return { tenantId, search, status: query.status, limit, offset };
}

export async function listMemberUnits(
  reader: MemberUnitReader,
  query: Omit<MemberUnitQuery, "limit" | "offset"> & { limit?: number; offset?: number },
): Promise<MemberUnitListResult & Pick<MemberUnitQuery, "limit" | "offset">> {
  const normalized = normalizeMemberUnitQuery(query);
  const result = await reader.list(normalized);

  return {
    items: result.items,
    total: Math.max(0, Number(result.total) || 0),
    limit: normalized.limit,
    offset: normalized.offset,
  };
}
