import Link from "next/link";
import { WorkspaceSidebar } from "../../components/workspace/workspace-sidebar";
import { isDemoModeEnabled } from "../../modules/membership/demo-mode";

export const dynamic = "force-dynamic";

const summaryCards = [
  { label: "会员单位", value: "0", note: "待导入台账", tone: "green" },
  { label: "本年度应收", value: "¥0.00", note: "会费标准待配置", tone: "blue" },
  { label: "待处理事项", value: "0", note: "当前无待办", tone: "amber" },
  { label: "归档提醒", value: "0", note: "档案任务正常", tone: "slate" },
] as const;

const activityRows = [
  { title: "工作台已就绪", detail: "线上测试版本已发布到部分成员", time: "刚刚", status: "已完成" },
  { title: "业务模块初始化", detail: "会员、会费与外部资料收集已进入 W1", time: "今天", status: "进行中" },
  { title: "外部接入准备", detail: "与光回调及通知通道等待联调参数", time: "待确认", status: "待配置" },
];

export default function WorkspacePage() {
  return (
    <div className="app-shell">
      <WorkspaceSidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">工作台 <span>/</span> 总览</p>
            <h1>运营总览</h1>
          </div>
          <div className="topbar-actions">
            <span className="version-badge">测试版 1.0.0</span>
            <button className="icon-button" type="button" aria-label="通知" title="通知">◌</button>
            <div className="user-chip" aria-label="当前用户轻立方胡杨">
              <span className="avatar">胡</span>
              <span>轻立方-胡杨</span>
            </div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row" aria-labelledby="welcome-title">
            <div>
              <p className="eyebrow">镇安县生态产业协会管理中台</p>
              <h2 id="welcome-title">今天，先把关键事项推进起来。</h2>
              <p className="muted-copy">会员、会费、财务资料和档案工作集中在这里处理。</p>
            </div>
            <Link className="primary-button" href={isDemoModeEnabled() ? "/demo/login" : "/membership/units"}>{isDemoModeEnabled() ? "进入本地测试" : "进入会员台账"} <span aria-hidden="true">→</span></Link>
          </section>

          <section className="summary-grid" aria-label="运营摘要">
            {summaryCards.map((card) => (
              <article className={`summary-card ${card.tone}`} key={card.label}>
                <div className="card-label">{card.label}</div>
                <div className="card-value">{card.value}</div>
                <div className="card-note">{card.note}</div>
              </article>
            ))}
          </section>

          <div className="dashboard-grid">
            <section className="panel quick-panel" aria-labelledby="quick-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">常用入口</p>
                  <h2 id="quick-title">继续处理</h2>
                </div>
                <span className="panel-meta">W1</span>
              </div>
              <div className="quick-grid">
                {[
                  ["会员台账", "/membership/units", "维护单位信息"],
                  ["入会管理", "/membership/applications", "核验外部资料"],
                  ["会费收缴", "/membership/fees/collection", "查看年度应收"],
                  ["归档任务", "/archives/tasks", "跟进超期提醒"],
                ].map(([label, route, detail]) => (
                  <Link className="quick-link" href={route} key={route}>
                    <span className="quick-link-icon" aria-hidden="true">↗</span>
                    <span>
                      <strong>{label}</strong>
                      <small>{detail}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="panel activity-panel" aria-labelledby="activity-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">系统动态</p>
                  <h2 id="activity-title">最近活动</h2>
                </div>
                <button className="text-button" type="button">查看全部</button>
              </div>
              <div className="activity-list">
                {activityRows.map((row) => (
                  <div className="activity-row" key={row.title}>
                    <span className={`activity-status ${row.status === "进行中" ? "in-progress" : ""}`} />
                    <div className="activity-copy">
                      <strong>{row.title}</strong>
                      <span>{row.detail}</span>
                    </div>
                    <div className="activity-time">
                      <span>{row.time}</span>
                      <small>{row.status}</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="notice-strip" aria-label="接入状态">
            <div className="notice-mark">i</div>
            <div>
              <strong>测试环境已连通</strong>
              <span>当前页面使用测试版入口；与光回调、飞书机器人和真实通知发送将在联调参数确认后启用。</span>
            </div>
            <Link href="/admin/integrations">查看集成配置 <span aria-hidden="true">→</span></Link>
          </section>
        </div>
      </main>
    </div>
  );
}
