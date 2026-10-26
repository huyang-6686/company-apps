import type {
  MemberUnitListResult,
  MemberUnitQuery,
  MemberUnitReader,
  MemberUnitRecord,
} from "./member-unit-contract";

export const DEMO_TENANT_ID = "demo-tenant";
export type DemoMemberUnitReader = MemberUnitReader & {
  getById: (tenantId: string, id: string) => MemberUnitRecord | null;
};

type DemoUnitSeed = {
  name: string;
  category: string;
  tier: string | null;
  feeAmount: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  isActive: boolean;
};

// All records below are fabricated for the local demo only. Names, credit
// codes and phone numbers are synthetic and must never be replaced with real
// member data in this file.
const DEMO_UNIT_SEEDS: DemoUnitSeed[] = [
  { name: "演示单位A01", category: "企业会员", tier: "理事单位", feeAmount: "5000.00", contactPerson: "张三", contactPhone: "DEMO-PHONE-01", isActive: true },
  { name: "演示单位A02", category: "企业会员", tier: "普通会员", feeAmount: "2000.00", contactPerson: "李四", contactPhone: "DEMO-PHONE-02", isActive: true },
  { name: "演示单位A03", category: "合作社", tier: "普通会员", feeAmount: "2000.00", contactPerson: null, contactPhone: null, isActive: true },
  { name: "演示单位A04", category: "个体工商户", tier: null, feeAmount: "1000.00", contactPerson: "王五", contactPhone: "DEMO-PHONE-04", isActive: false },
  { name: "演示单位A05", category: "企业会员", tier: "理事单位", feeAmount: "5000.00", contactPerson: "赵六", contactPhone: "DEMO-PHONE-05", isActive: true },
  { name: "演示单位A06", category: "合作社", tier: null, feeAmount: null, contactPerson: null, contactPhone: null, isActive: true },
  { name: "演示单位A07", category: "企业会员", tier: "普通会员", feeAmount: "2000.00", contactPerson: "钱七", contactPhone: "DEMO-PHONE-07", isActive: false },
  { name: "演示单位A08", category: "个体工商户", tier: null, feeAmount: "1000.00", contactPerson: "孙八", contactPhone: "DEMO-PHONE-08", isActive: true },
  { name: "演示单位A09", category: "企业会员", tier: "理事单位", feeAmount: "5000.00", contactPerson: "周九", contactPhone: "DEMO-PHONE-09", isActive: true },
  { name: "演示单位A10", category: "合作社", tier: "普通会员", feeAmount: "2000.00", contactPerson: "吴十", contactPhone: "DEMO-PHONE-10", isActive: false },
  { name: "演示单位B01", category: "企业会员", tier: "普通会员", feeAmount: "2000.00", contactPerson: "郑一", contactPhone: "DEMO-PHONE-11", isActive: true },
  { name: "演示单位B02", category: "个体工商户", tier: null, feeAmount: "1000.00", contactPerson: null, contactPhone: null, isActive: true },
  { name: "演示单位B03", category: "企业会员", tier: "理事单位", feeAmount: "5000.00", contactPerson: "王二", contactPhone: "DEMO-PHONE-13", isActive: true },
  { name: "演示单位B04", category: "合作社", tier: null, feeAmount: null, contactPerson: "刘三", contactPhone: "DEMO-PHONE-14", isActive: false },
  { name: "演示单位B05", category: "企业会员", tier: "普通会员", feeAmount: "2000.00", contactPerson: "陈四", contactPhone: "DEMO-PHONE-15", isActive: true },
  { name: "演示单位B06", category: "个体工商户", tier: null, feeAmount: "1000.00", contactPerson: "杨五", contactPhone: "DEMO-PHONE-16", isActive: true },
  { name: "演示单位B07", category: "企业会员", tier: "普通会员", feeAmount: "2000.00", contactPerson: null, contactPhone: null, isActive: true },
  { name: "演示单位B08", category: "合作社", tier: "普通会员", feeAmount: "2000.00", contactPerson: "朱六", contactPhone: "DEMO-PHONE-18", isActive: false },
  { name: "演示单位B09", category: "企业会员", tier: "理事单位", feeAmount: "5000.00", contactPerson: "胡七", contactPhone: "DEMO-PHONE-19", isActive: true },
  { name: "演示单位B10", category: "个体工商户", tier: null, feeAmount: null, contactPerson: "林八", contactPhone: "DEMO-PHONE-20", isActive: true },
  { name: "演示单位C01", category: "企业会员", tier: "普通会员", feeAmount: "2000.00", contactPerson: "何九", contactPhone: "DEMO-PHONE-21", isActive: true },
  { name: "演示单位C02", category: "合作社", tier: null, feeAmount: "1000.00", contactPerson: "高十", contactPhone: "DEMO-PHONE-22", isActive: true },
  { name: "演示单位C03", category: "企业会员", tier: "理事单位", feeAmount: "5000.00", contactPerson: null, contactPhone: null, isActive: false },
  { name: "演示单位C04", category: "个体工商户", tier: null, feeAmount: "1000.00", contactPerson: "罗一", contactPhone: "DEMO-PHONE-24", isActive: true },
  { name: "演示单位C05", category: "企业会员", tier: "普通会员", feeAmount: "2000.00", contactPerson: "宋二", contactPhone: "DEMO-PHONE-25", isActive: true },
  { name: "演示单位C06", category: "合作社", tier: "普通会员", feeAmount: "2000.00", contactPerson: "梁三", contactPhone: "DEMO-PHONE-26", isActive: true },
  { name: "演示单位C07", category: "企业会员", tier: null, feeAmount: null, contactPerson: "谢四", contactPhone: "DEMO-PHONE-27", isActive: true },
  { name: "演示单位C08", category: "个体工商户", tier: null, feeAmount: "1000.00", contactPerson: null, contactPhone: null, isActive: false },
  { name: "演示单位C09", category: "企业会员", tier: "理事单位", feeAmount: "5000.00", contactPerson: "唐五", contactPhone: "DEMO-PHONE-29", isActive: true },
  { name: "演示单位C10", category: "合作社", tier: "普通会员", feeAmount: "2000.00", contactPerson: "许六", contactPhone: "DEMO-PHONE-30", isActive: true },
  { name: "演示单位D01", category: "企业会员", tier: "普通会员", feeAmount: "2000.00", contactPerson: "韩七", contactPhone: "DEMO-PHONE-31", isActive: false },
  { name: "演示单位D02", category: "个体工商户", tier: null, feeAmount: "1000.00", contactPerson: "冯八", contactPhone: "DEMO-PHONE-32", isActive: true },
  { name: "演示单位D03", category: "企业会员", tier: "理事单位", feeAmount: "5000.00", contactPerson: "曹九", contactPhone: "DEMO-PHONE-33", isActive: true },
  { name: "演示单位D04", category: "合作社", tier: null, feeAmount: null, contactPerson: null, contactPhone: null, isActive: true },
  { name: "演示单位D05", category: "企业会员", tier: "普通会员", feeAmount: "2000.00", contactPerson: "彭十", contactPhone: "DEMO-PHONE-35", isActive: true },
  { name: "演示单位D06", category: "个体工商户", tier: null, feeAmount: "1000.00", contactPerson: "曾一", contactPhone: "DEMO-PHONE-36", isActive: true },
  { name: "演示单位D07", category: "企业会员", tier: "普通会员", feeAmount: "2000.00", contactPerson: "肖二", contactPhone: "DEMO-PHONE-37", isActive: true },
  { name: "演示单位D08", category: "合作社", tier: null, feeAmount: "1000.00", contactPerson: "田三", contactPhone: "DEMO-PHONE-38", isActive: false },
  { name: "演示单位D09", category: "企业会员", tier: "理事单位", feeAmount: "5000.00", contactPerson: null, contactPhone: null, isActive: true },
  { name: "演示单位D10", category: "个体工商户", tier: null, feeAmount: "1000.00", contactPerson: "董四", contactPhone: "DEMO-PHONE-40", isActive: true },
];

function buildDemoRecords(): MemberUnitRecord[] {
  return DEMO_UNIT_SEEDS.map((seed, index) => ({
    id: `demo-unit-${String(index + 1).padStart(3, "0")}`,
    tenantId: DEMO_TENANT_ID,
    name: seed.name,
    // "91350000DEMO" prefix marks the code as synthetic; DEMO can never appear
    // in a real unified social credit code issued list used by this app.
    creditCode: `91350000DEMO${String(index + 1).padStart(8, "0")}`,
    category: seed.category,
    tier: seed.tier,
    feeAmount: seed.feeAmount,
    contactPerson: seed.contactPerson,
    contactPhone: seed.contactPhone,
    isActive: seed.isActive,
  })).sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN") || a.id.localeCompare(b.id));
}

const DEMO_RECORDS = buildDemoRecords();

export function createDemoMemberUnitReader(): DemoMemberUnitReader {
  return {
    getById: getDemoMemberUnitById,
    async list(query: MemberUnitQuery): Promise<MemberUnitListResult> {
      if (query.tenantId !== DEMO_TENANT_ID) {
        return { items: [], total: 0 };
      }

      const search = query.search?.trim().toLowerCase() || "";
      const filtered = DEMO_RECORDS.filter((record) => {
        if (query.status === "active" && !record.isActive) return false;
        if (query.status === "inactive" && record.isActive) return false;
        if (search
          && !record.name.toLowerCase().includes(search)
          && !record.creditCode.toLowerCase().includes(search)) {
          return false;
        }
        return true;
      });

      return {
        items: filtered.slice(query.offset, query.offset + query.limit),
        total: filtered.length,
      };
    },
  };
}

export function getDemoMemberUnitById(tenantId: string, id: string): MemberUnitRecord | null {
  if (tenantId !== DEMO_TENANT_ID) return null;
  return DEMO_RECORDS.find((record) => record.id === id) ?? null;
}

export function getDemoMemberUnitSeedCount() {
  return DEMO_RECORDS.length;
}

