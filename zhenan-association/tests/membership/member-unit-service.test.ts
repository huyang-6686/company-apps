import { describe, expect, it } from "vitest";
import { listMemberUnits, type MemberUnitReader } from "../../modules/membership/member-unit-service";

const rows = [
  {
    id: "unit-1",
    tenantId: "tenant-a",
    name: "镇安生态农业有限公司",
    creditCode: "91610100AAA1111111",
    category: "单位会员",
    tier: "单位会员",
    feeAmount: "500.00",
    contactPerson: "张三",
    contactPhone: "13800000000",
    isActive: true,
  },
  {
    id: "unit-2",
    tenantId: "tenant-a",
    name: "秦岭绿色食品协会",
    creditCode: "91610100BBB2222222",
    category: "理事单位",
    tier: "理事单位",
    feeAmount: "1000.00",
    contactPerson: "李四",
    contactPhone: "13900000000",
    isActive: false,
  },
  {
    id: "unit-3",
    tenantId: "tenant-b",
    name: "其他租户单位",
    creditCode: "91610100CCC3333333",
    category: "单位会员",
    tier: "单位会员",
    feeAmount: "500.00",
    contactPerson: "王五",
    contactPhone: "13700000000",
    isActive: true,
  },
];

const reader: MemberUnitReader = {
  async list(query) {
    const filtered = rows.filter((row) => row.tenantId === query.tenantId)
      .filter((row) => !query.search || row.name.includes(query.search) || row.creditCode.includes(query.search))
      .filter((row) => !query.status || (query.status === "active" ? row.isActive : !row.isActive));
    return {
      items: filtered.slice(query.offset, query.offset + query.limit),
      total: filtered.length,
    };
  },
};

describe("member unit query service", () => {
  it("keeps results inside the requested tenant and reports the total", async () => {
    const result = await listMemberUnits(reader, { tenantId: "tenant-a" });

    expect(result.total).toBe(2);
    expect(result.items.map((item) => item.id)).toEqual(["unit-1", "unit-2"]);
  });

  it("filters by name or credit code and active status", async () => {
    const result = await listMemberUnits(reader, {
      tenantId: "tenant-a",
      search: "BBB2222222",
      status: "inactive",
    });

    expect(result.total).toBe(1);
    expect(result.items[0]).toMatchObject({ id: "unit-2", isActive: false });
  });

  it("normalizes whitespace and rejects an invalid status", async () => {
    await expect(
      listMemberUnits(reader, { tenantId: " tenant-a ", search: "  生态  ", status: "paused" as never }),
    ).rejects.toThrow("Invalid member unit status");
  });
});
