import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../db";
import { memberUnit } from "../../db/schema/member-unit";
import type { MemberUnitReader } from "./member-unit-contract";

export {
  DEFAULT_MEMBER_UNIT_LIMIT,
  MAX_MEMBER_UNIT_LIMIT,
  MAX_MEMBER_UNIT_SEARCH_LENGTH,
  listMemberUnits,
  normalizeMemberUnitQuery,
  type MemberUnitListResult,
  type MemberUnitQuery,
  type MemberUnitReader,
  type MemberUnitRecord,
  type MemberUnitStatus,
} from "./member-unit-contract";

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function createDrizzleMemberUnitReader(database: typeof db = db): MemberUnitReader {
  return {
    async list(query) {
      const conditions = [eq(memberUnit.tenantId, query.tenantId)];
      if (query.status === "active") conditions.push(eq(memberUnit.isActive, true));
      if (query.status === "inactive") conditions.push(eq(memberUnit.isActive, false));

      if (query.search) {
        const pattern = `%${escapeLikePattern(query.search)}%`;
        conditions.push(or(ilike(memberUnit.name, pattern), ilike(memberUnit.creditCode, pattern))!);
      }

      const where = and(...conditions);
      const [items, countRows] = await Promise.all([
        database
          .select({
            id: memberUnit.id,
            tenantId: memberUnit.tenantId,
            name: memberUnit.name,
            creditCode: memberUnit.creditCode,
            category: memberUnit.category,
            tier: memberUnit.tier,
            feeAmount: memberUnit.feeAmount,
            contactPerson: memberUnit.contactPerson,
            contactPhone: memberUnit.contactPhone,
            isActive: memberUnit.isActive,
          })
          .from(memberUnit)
          .where(where)
          .orderBy(asc(memberUnit.name), asc(memberUnit.id))
          .limit(query.limit)
          .offset(query.offset),
        database
          .select({ count: sql<number>`count(*)::int` })
          .from(memberUnit)
          .where(where),
      ]);

      return { items, total: countRows[0]?.count ?? 0 };
    },
  };
}
