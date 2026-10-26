import { describe, expect, it } from "vitest";
import { workspaceNavigation } from "../../modules/workspace/navigation";

describe("workspace navigation baseline", () => {
  it("keeps the first-level business groups and management entry", () => {
    expect(workspaceNavigation.map((group) => group.label)).toEqual([
      "会员与组织",
      "财务与资金",
      "项目与活动",
      "品牌与会员服务",
      "档案与合规",
      "人事与行政",
      "管理入口",
    ]);
  });

  it("exposes the W1 member ledger route with its permission resource", () => {
    const memberLedger = workspaceNavigation
      .flatMap((group) => group.items)
      .find((item) => item.route === "/membership/units");

    expect(memberLedger).toMatchObject({
      label: "会员台账",
      resource: "membership.units",
      wave: "W1",
    });
  });

  it("does not introduce a fifth navigation level", () => {
    for (const group of workspaceNavigation) {
      expect(group.items.every((item) => !Object.hasOwn(item, "children"))).toBe(true);
    }
  });
});
