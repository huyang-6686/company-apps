export type DemoAccountRole = "创始人" | "财务" | "项目负责人" | "项目成员";

export type DemoAccount = {
  username: string;
  password: string;
  displayName: string;
  role: DemoAccountRole;
  scopes: readonly string[];
};

export const DEMO_TEST_ACCOUNTS: readonly DemoAccount[] = [
  { username: "founder", password: "DemoFounder-2026", displayName: "创始人测试账号", role: "创始人", scopes: ["all"] },
  { username: "finance", password: "DemoFinance-2026", displayName: "财务测试账号", role: "财务", scopes: ["membership", "finance", "archive"] },
  { username: "project-lead", password: "DemoProjectLead-2026", displayName: "项目负责人测试账号", role: "项目负责人", scopes: ["membership", "project", "archive"] },
  { username: "project-member-1", password: "DemoProjectMember1-2026", displayName: "项目成员一测试账号", role: "项目成员", scopes: ["membership", "project", "archive"] },
  { username: "project-member-2", password: "DemoProjectMember2-2026", displayName: "项目成员二测试账号", role: "项目成员", scopes: ["membership", "project", "archive"] },
];

export function authenticateDemoAccount(username: string, password: string): DemoAccount | null {
  if (process.env.DEMO_MODE !== "true") return null;
  return DEMO_TEST_ACCOUNTS.find((account) => account.username === username && account.password === password) ?? null;
}
