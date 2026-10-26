export type Wave = "W1" | "W2" | "W3";

export type NavigationItem = {
  label: string;
  route: string;
  resource: string;
  wave: Wave;
};

export type NavigationGroup = {
  label: string;
  shortLabel: string;
  items: readonly NavigationItem[];
};

export const workspaceNavigation: readonly NavigationGroup[] = [
  {
    label: "会员与组织",
    shortLabel: "会",
    items: [
      { label: "会员台账", route: "/membership/units", resource: "membership.units", wave: "W1" },
      { label: "入会管理", route: "/membership/applications", resource: "membership.applications", wave: "W1" },
      { label: "会费标准", route: "/membership/fees/standards", resource: "membership.fee_standards", wave: "W1" },
      { label: "会费收缴", route: "/membership/fees/collection", resource: "membership.fee_collection", wave: "W1" },
      { label: "欠费管理", route: "/membership/fees/arrears", resource: "membership.fee_arrears", wave: "W1" },
      { label: "项目组织范围", route: "/membership/organization", resource: "membership.organization", wave: "W2" },
    ],
  },
  {
    label: "财务与资金",
    shortLabel: "财",
    items: [
      { label: "收支台账", route: "/finance/entries", resource: "finance.entries", wave: "W1" },
      { label: "支出申请", route: "/finance/expenses", resource: "finance.expenses", wave: "W1" },
      { label: "期间报表", route: "/finance/reports", resource: "finance.reports", wave: "W1" },
      { label: "用印记录", route: "/finance/seal-records", resource: "finance.seal_records", wave: "W1" },
    ],
  },
  {
    label: "项目与活动",
    shortLabel: "项",
    items: [
      { label: "项目台账", route: "/projects", resource: "projects.projects", wave: "W2" },
      { label: "项目执行", route: "/projects/execution", resource: "projects.execution", wave: "W2" },
      { label: "活动台账", route: "/activities", resource: "projects.activities", wave: "W2" },
      { label: "活动复盘", route: "/activities/reviews", resource: "projects.activity_reviews", wave: "W2" },
    ],
  },
  {
    label: "品牌与会员服务",
    shortLabel: "品",
    items: [
      { label: "授权企业", route: "/brand/authorizations", resource: "brand.authorizations", wave: "W2" },
      { label: "授权产品", route: "/brand/products", resource: "brand.products", wave: "W2" },
      { label: "服务事项", route: "/brand/member-services", resource: "brand.member_services", wave: "W2" },
      { label: "展示目录", route: "/brand/showcase", resource: "brand.showcase", wave: "W3" },
    ],
  },
  {
    label: "档案与合规",
    shortLabel: "档",
    items: [
      { label: "档案目录", route: "/archives/catalog", resource: "archive.catalog", wave: "W1" },
      { label: "著录管理", route: "/archives/description", resource: "archive.description", wave: "W1" },
      { label: "归档任务", route: "/archives/tasks", resource: "archive.tasks", wave: "W1" },
      { label: "文件关联", route: "/archives/files", resource: "archive.files", wave: "W1" },
      { label: "档案流转", route: "/archives/circulation", resource: "archive.circulation", wave: "W1" },
      { label: "回收站", route: "/archives/recycle-bin", resource: "archive.recycle_bin", wave: "W1" },
    ],
  },
  {
    label: "人事与行政",
    shortLabel: "人",
    items: [
      { label: "人员台账", route: "/hr/employees", resource: "hr.employees", wave: "W2" },
      { label: "考勤记录", route: "/hr/attendance", resource: "hr.attendance", wave: "W2" },
      { label: "请假审批", route: "/hr/leave", resource: "hr.leave", wave: "W2" },
      { label: "行政事项", route: "/hr/administration", resource: "hr.administration", wave: "W3" },
    ],
  },
  {
    label: "管理入口",
    shortLabel: "管",
    items: [
      { label: "补充账号", route: "/admin/accounts", resource: "admin.accounts", wave: "W1" },
      { label: "组织同步", route: "/admin/organization-sync", resource: "admin.organization_sync", wave: "W1" },
      { label: "权限审计", route: "/admin/permissions", resource: "admin.permissions", wave: "W1" },
      { label: "集成配置", route: "/admin/integrations", resource: "admin.integrations", wave: "W1" },
      { label: "审计记录", route: "/admin/audit", resource: "admin.audit", wave: "W1" },
      { label: "通知投递", route: "/admin/notifications", resource: "admin.notifications", wave: "W1" },
    ],
  },
] as const;

export function findNavigationItem(route: string): NavigationItem | undefined {
  return workspaceNavigation.flatMap((group) => group.items).find((item) => item.route === route);
}
