import { describe, expect, it } from "vitest";
import { getModulePageDefinition } from "../../modules/workspace/module-pages";

describe("module page definitions", () => {
  it("resolves every W1 navigation route to a user-facing page", () => {
    const routes = [
      "/membership/applications",
      "/membership/fees/standards",
      "/membership/fees/collection",
      "/membership/fees/arrears",
      "/finance/entries",
      "/finance/expenses",
      "/finance/reports",
      "/finance/seal-records",
      "/archives/catalog",
      "/archives/description",
      "/archives/tasks",
      "/archives/files",
      "/archives/circulation",
      "/archives/recycle-bin",
      "/admin/accounts",
      "/admin/organization-sync",
      "/admin/permissions",
      "/admin/integrations",
      "/admin/audit",
      "/admin/notifications",
    ];

    for (const route of routes) {
      expect(getModulePageDefinition(route)).toBeDefined();
    }
  });

  it("keeps module pages explicit about their connection state", () => {
    expect(getModulePageDefinition("/admin/integrations")).toMatchObject({
      label: "集成配置",
      resource: "admin.integrations",
      status: "待接入",
    });
  });
});
