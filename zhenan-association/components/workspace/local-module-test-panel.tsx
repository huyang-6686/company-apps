"use client";

import { useMemo, useState } from "react";

type LocalModuleTestPanelProps = {
  label: string;
  resource: string;
  views: readonly string[];
};

const statuses = ["全部状态", "待处理", "进行中", "已完成"] as const;

export function LocalModuleTestPanel({ label, resource, views }: LocalModuleTestPanelProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("全部状态");
  const [page, setPage] = useState(1);
  const [activeView, setActiveView] = useState(views[0] ?? "列表视图");

  const rows = useMemo(() => {
    const seed = ["示例记录 A", "示例记录 B", "示例记录 C"].map((name, index) => ({
      name: `${label}-${name}`,
      owner: `演示对象 ${index + 1}`,
      status: statuses[(index % (statuses.length - 1)) + 1],
    }));
    return seed.filter((row) => {
      const matchesQuery = !query || `${row.name} ${row.owner}`.includes(query.trim());
      const matchesStatus = status === "全部状态" || row.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [label, query, status]);

  return (
    <section className="table-panel local-test-panel" aria-label={`${label}本地测试数据`}>
      <div className="local-test-banner" role="note">
        <strong>线下测试数据</strong>
        <span>仅用于局域网功能验收，不是真实业务数据，不写入正式数据库。</span>
      </div>
      <div className="local-test-toolbar">
        <label>
          <span className="sr-only">搜索{label}</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={`搜索${label}`} />
        </label>
        <label>
          <span className="sr-only">状态</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value as (typeof statuses)[number]); setPage(1); }}>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <button className="secondary-button" type="button" onClick={() => { setQuery(""); setStatus("全部状态"); setPage(1); }}>重置</button>
      </div>
      <div className="module-tabs local-test-tabs" aria-label="本地测试视图">
        {views.map((view) => <button className={`module-tab ${view === activeView ? "selected" : ""}`} key={view} type="button" onClick={() => setActiveView(view)}>{view}</button>)}
      </div>
      <p className="local-test-scope">{resource} · 当前视图：{activeView} · 只读演示</p>
      <div className="local-test-table-wrap">
        <table className="local-test-table">
          <thead><tr><th>名称</th><th>关联对象</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {rows.map((row) => <tr key={row.name}><td>{row.name}</td><td>{row.owner}</td><td><span className="local-test-status">{row.status}</span></td><td><button className="text-button" type="button" onClick={() => window.alert("线下测试：只读详情")}>查看</button></td></tr>)}
            {!rows.length && <tr><td colSpan={4} className="local-test-empty">没有符合条件的演示记录</td></tr>}
          </tbody>
        </table>
      </div>
      <nav className="pagination" aria-label={`${label}本地测试分页`}>
        <span>第 {page} 页 · 共 {rows.length} 条演示记录</span>
        <button className="secondary-button" type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>上一页</button>
        <button className="secondary-button" type="button" disabled>下一页</button>
      </nav>
    </section>
  );
}
