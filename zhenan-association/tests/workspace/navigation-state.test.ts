import { describe, expect, it } from "vitest";
import {
  createDefaultExpandedGroups,
  toggleNavigationGroup,
} from "../../modules/workspace/navigation-state";

describe("workspace navigation group state", () => {
  it("starts with every first-level group collapsed", () => {
    expect([...createDefaultExpandedGroups()]).toEqual([]);
  });

  it("toggles one group without changing the others", () => {
    const expanded = createDefaultExpandedGroups();
    const afterOpen = toggleNavigationGroup(expanded, "会员与组织");

    expect([...afterOpen]).toEqual(["会员与组织"]);
    expect([...toggleNavigationGroup(afterOpen, "会员与组织")]).toEqual([]);
  });
});
