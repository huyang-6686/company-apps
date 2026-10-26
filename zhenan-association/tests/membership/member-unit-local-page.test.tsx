import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import MemberUnitsPage from "../../app/membership/units/page";

describe("local member unit page", () => {
  beforeEach(() => { process.env.DEMO_MODE = "true"; });

  it("enables the local add-member action and marks it as synthetic", () => {
    const html = renderToStaticMarkup(<MemberUnitsPage />);
    expect(html).toContain("新增会员单位");
    expect(html).not.toMatch(/新增会员单位[^<]*disabled/);
    expect(html).toContain("线下测试数据");
  });
});
