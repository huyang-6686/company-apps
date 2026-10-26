import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemberUnitLedger } from "../../../../components/membership/member-unit-ledger";
import { isDemoModeEnabled } from "../../../../modules/membership/demo-mode";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DemoMemberUnitsPage() {
  if (!isDemoModeEnabled()) notFound();
  return (
    <main className="demo-page">
      <header className="topbar standalone-topbar">
        <div>
          <p className="breadcrumb"><Link href="/workspace">工作台</Link> <span>/</span> 演示 / 会员台账</p>
          <h1>会员台账演示</h1>
        </div>
        <Link className="secondary-button" href="/workspace">返回工作台</Link>
      </header>
      <div className="content-wrap">
        <p className="demo-data-banner" role="note">演示数据 / 非真实会员</p>
        <section className="page-intro">
          <div>
            <p className="eyebrow">只读演示</p>
            <h2>单位会员</h2>
            <p className="muted-copy">可查询、筛选状态、翻页并查看详情；本页面不修改任何数据。</p>
          </div>
        </section>
        <MemberUnitLedger
          apiBase="/api/demo/membership/units"
          detailBase="/demo/membership/units"
          emptyMessage="没有匹配的演示单位，请调整查询条件。"
          scopeNote="本页仅展示固定合成数据"
        />
      </div>
    </main>
  );
}
