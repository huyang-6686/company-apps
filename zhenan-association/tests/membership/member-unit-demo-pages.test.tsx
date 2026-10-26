import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

process.env.DEMO_MODE = "true";

vi.mock("next/navigation", () => ({
  notFound: () => {
    const error = new Error("Not Found") as Error & { digest: string };
    error.digest = "NEXT_HTTP_ERROR_FALLBACK;404";
    throw error;
  },
}));

import DemoMemberUnitsPage from "../../app/demo/membership/units/page";
import DemoMemberUnitDetailPage from "../../app/demo/membership/units/[id]/page";
import DemoNotFound from "../../app/demo/not-found";
import { metadata } from "../../app/demo/membership/units/page";
import { notFound } from "next/navigation";
import { DEMO_TENANT_ID, createDemoMemberUnitReader } from "../../modules/membership/member-unit-demo-reader";
import { MemberUnitTable } from "../../components/membership/member-unit-ledger";

describe("member ledger demo pages", () => {
  it("renders the list banner, non-permission scope note and no write actions", () => {
    const html = renderToStaticMarkup(DemoMemberUnitsPage());
    expect(html).toContain("演示数据 / 非真实会员");
    expect(html).toContain("本页仅展示固定合成数据");
    expect(html).not.toMatch(/<(?:button|a)[^>]*>[^<]*(新增|编辑|删除)/);
    expect(metadata).toMatchObject({ robots: { index: false, follow: false } });
  });

  it("renders detail banner, demo phone label and read-only content", async () => {
    const reader = createDemoMemberUnitReader();
    const records = await reader.list({ tenantId: DEMO_TENANT_ID, limit: 1, offset: 0 });
    const html = renderToStaticMarkup(await DemoMemberUnitDetailPage({ params: Promise.resolve({ id: records.items[0].id }) }));
    expect(html).toContain("演示数据 / 非真实会员");
    expect(html).toContain("联系电话（演示）");
    expect(html).not.toMatch(/<(?:button|a)[^>]*>[^<]*(新增|编辑|删除)/);
  });

  it("signals HTTP 404 for an unknown detail id and keeps banner in the demo not-found page", async () => {
    await expect(DemoMemberUnitDetailPage({ params: Promise.resolve({ id: "missing" }) }))
      .rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
    const missingPage = renderToStaticMarkup(<DemoNotFound />);
    expect(missingPage).toContain("演示数据 / 非真实会员");
    expect(missingPage).toContain('href="/demo/membership/units"');
    expect(notFound).toBeDefined();
  });

  it("hides the demo page when demo mode is disabled", () => {
    const previous = process.env.DEMO_MODE;
    process.env.DEMO_MODE = "false";
    try {
      expect(() => DemoMemberUnitsPage()).toThrowError("Not Found");
    } finally {
      process.env.DEMO_MODE = previous;
    }
  });

  it("renders list-name links to the demo detail route", async () => {
    const reader = createDemoMemberUnitReader();
    const result = await reader.list({ tenantId: DEMO_TENANT_ID, limit: 1, offset: 0 });
    const html = renderToStaticMarkup(<MemberUnitTable items={result.items} detailBase="/demo/membership/units" />);
    expect(html).toContain(`href="/demo/membership/units/${result.items[0].id}"`);
    expect(html).toContain("查看详情");
  });

  it("keeps the formal ledger table free of detail links by default", async () => {
    const reader = createDemoMemberUnitReader();
    const result = await reader.list({ tenantId: DEMO_TENANT_ID, limit: 1, offset: 0 });
    const html = renderToStaticMarkup(<MemberUnitTable items={result.items} />);
    expect(html).not.toContain("href=");
  });
});
