import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemoMemberUnitById } from "../../../../../modules/membership/member-unit-demo-reader";
import { isDemoModeEnabled } from "../../../../../modules/membership/demo-mode";

export default async function DemoMemberUnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isDemoModeEnabled()) notFound();
  const { id } = await params;
  const unit = getDemoMemberUnitById("demo-tenant", id);
  if (!unit) notFound();

  const fields: Array<[string, string]> = [
    ["单位名称", unit.name], ["统一社会信用代码（模拟）", unit.creditCode], ["会员类型", unit.category],
    ["会员等级", unit.tier ?? "—"], ["会费标准（演示）", unit.feeAmount ? `¥${unit.feeAmount}` : "—"],
    ["联系人", unit.contactPerson ?? "—"], ["联系电话（演示）", unit.contactPhone ?? "—"], ["会员状态", unit.isActive ? "正常" : "停用"],
  ];

  return (
    <main className="demo-page">
      <header className="topbar standalone-topbar">
        <div><p className="breadcrumb"><Link href="/demo/membership/units">会员台账演示</Link> <span>/</span> 详情</p><h1>会员单位详情</h1></div>
        <Link className="secondary-button" href="/demo/membership/units">返回列表</Link>
      </header>
      <div className="content-wrap">
        <p className="demo-data-banner" role="note">演示数据 / 非真实会员</p>
        <section className="table-panel" aria-label="会员单位只读详情">
          <dl className="demo-detail-list">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <p className="muted-copy">只读演示：此页面不提供新增、编辑或删除操作。</p>
        </section>
      </div>
    </main>
  );
}
