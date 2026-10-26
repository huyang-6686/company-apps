import React from "react";
import Link from "next/link";
import { WorkspaceSidebar } from "../../../components/workspace/workspace-sidebar";
import { MemberUnitLedger } from "../../../components/membership/member-unit-ledger";
import { LocalAddMemberButton } from "../../../components/membership/local-add-member-button";
import { isDemoModeEnabled } from "../../../modules/membership/demo-mode";

export const dynamic = "force-dynamic";

export default function MemberUnitsPage() {
  return (
    <div className="app-shell">
      <WorkspaceSidebar />
      <main className="main-content">
        <header className="topbar standalone-topbar">
          <div>
            <p className="breadcrumb"><Link href="/workspace">工作台</Link> <span>/</span> 会员与组织 <span>/</span> 会员台账</p>
            <h1>会员台账</h1>
          </div>
          <Link className="secondary-button" href="/workspace">返回总览</Link>
        </header>

        <div className="content-wrap">
          {isDemoModeEnabled() && <p className="demo-data-banner" role="note"><span aria-hidden="true">!</span> 线下测试数据 / 非真实会员</p>}
          <section className="page-intro">
            <div>
              <p className="eyebrow">会员基础 / 单位会员</p>
              <h2>单位会员</h2>
              <p className="muted-copy">统一查看单位信息、会员类型和当前状态。</p>
            </div>
            {isDemoModeEnabled() ? <LocalAddMemberButton /> : <button className="primary-button" type="button" disabled>新增会员单位</button>}
          </section>

          <MemberUnitLedger apiBase={isDemoModeEnabled() ? "/api/demo/membership/units" : "/api/membership/units"} detailBase={isDemoModeEnabled() ? "/demo/membership/units" : undefined} emptyMessage={isDemoModeEnabled() ? "没有匹配的演示单位，请调整查询条件。" : undefined} scopeNote={isDemoModeEnabled() ? "本页仅展示固定合成数据" : undefined} />
        </div>
      </main>
    </div>
  );
}
