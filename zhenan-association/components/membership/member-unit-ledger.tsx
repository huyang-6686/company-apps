"use client";

import React from "react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { MemberUnitRecord, MemberUnitStatus } from "../../modules/membership/member-unit-service";
import {
  buildMemberUnitQuery,
  readMemberUnitResponse,
  type MemberUnitViewState,
} from "../../modules/membership/member-unit-view-state";

const PAGE_SIZE = 25;

export function MemberUnitLedger({
  apiBase = "/api/membership/units",
  detailBase,
  emptyMessage = "调整搜索条件或等待有权限的数据接入。",
  scopeNote = "数据范围：由当前身份权限决定",
}: {
  apiBase?: string;
  detailBase?: string;
  emptyMessage?: string;
  scopeNote?: string;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MemberUnitStatus | "">("");
  const [offset, setOffset] = useState(0);
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState<MemberUnitViewState>({ kind: "loading" });

  const load = useCallback(async (signal: AbortSignal) => {
    setState({ kind: "loading" });
    try {
      const query = buildMemberUnitQuery({
        search,
        status: status || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      const response = await fetch(`${apiBase}?${query}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
      });
      const nextState = await readMemberUnitResponse(response);
      if (!signal.aborted) setState(nextState);
    } catch {
      if (signal.aborted) return;
      setState({ kind: "error", message: "会员台账暂时无法加载，请稍后重试。" });
    }
  }, [apiBase, offset, search, status]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, requestVersion]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setOffset(0);
    setRequestVersion((version) => version + 1);
  }

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const hasPrevious = offset > 0;
  const hasNext = state.kind === "ready" && offset + state.items.length < state.total;

  return (
    <>
      <form className="toolbar-panel" aria-label="会员台账筛选" onSubmit={submitSearch}>
        <label className="search-field">
          <span className="sr-only">搜索会员单位</span>
          <input
            type="search"
            placeholder="搜索单位名称或统一社会信用代码"
            maxLength={100}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </label>
        <label className="status-select-label">
          <span className="sr-only">会员状态</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value as MemberUnitStatus | ""); setOffset(0); }}>
            <option value="">全部状态</option>
            <option value="active">正常</option>
            <option value="inactive">停用</option>
          </select>
        </label>
        <button className="filter-button" type="submit">查询</button>
        <span className="result-count" role="status">{state.kind === "ready" ? `共 ${state.total} 条` : state.kind === "loading" ? "正在查询" : "尚未加载"}</span>
      </form>

      <section className="table-panel" aria-labelledby="member-table-title" aria-busy={state.kind === "loading"}>
        <div className="table-head">
          <h2 id="member-table-title">会员单位</h2>
          <span className="panel-meta">{scopeNote}</span>
        </div>
        {state.kind === "loading" && <div className="empty-state"><h3>正在加载会员台账</h3><p>{detailBase ? "正在查询演示数据。" : "正在查询当前账号可访问的数据。"}</p></div>}
        {state.kind === "unauthorized" && <div className="empty-state"><div className="empty-icon" aria-hidden="true">!</div><h3>身份权限尚未接入</h3><p>{state.message}</p></div>}
        {state.kind === "error" && <div className="empty-state" role="alert"><div className="empty-icon" aria-hidden="true">!</div><h3>加载失败</h3><p>{state.message}</p><button className="secondary-button" type="button" onClick={() => setRequestVersion((version) => version + 1)}>重试</button></div>}
        {state.kind === "ready" && (state.items.length ? <MemberUnitTable items={state.items} detailBase={detailBase} /> : <div className="empty-state"><div className="empty-icon" aria-hidden="true">□</div><h3>暂无符合条件的会员单位</h3><p>{emptyMessage}</p></div>)}
      </section>

      {state.kind === "ready" && state.total > 0 && <nav className="pagination" aria-label="会员台账分页">
        <button className="secondary-button" type="button" disabled={!hasPrevious} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>上一页</button>
        <span>第 {pageNumber} 页</span>
        <button className="secondary-button" type="button" disabled={!hasNext} onClick={() => setOffset(offset + PAGE_SIZE)}>下一页</button>
      </nav>}
    </>
  );
}

export function MemberUnitTable({ items, detailBase }: { items: MemberUnitRecord[]; detailBase?: string }) {
  return (
    <div className="member-unit-table-wrap">
      <table className="member-unit-table">
        <thead>
          <tr><th scope="col">单位名称</th><th scope="col">会员类型</th><th scope="col">联系人</th><th scope="col">状态</th></tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{detailBase ? <><Link className="member-unit-detail-link" href={`${detailBase}/${item.id}`} title="查看详情"><strong>{item.name}</strong></Link><small>{item.creditCode}</small><small className="detail-link-hint">查看详情</small></> : <><strong>{item.name}</strong><small>{item.creditCode}</small></>}</td>
              <td>{item.tier ?? item.category}</td>
              <td>{item.contactPerson ?? "—"}<small>{item.contactPhone ?? ""}</small></td>
              <td><span className={`state-pill ${item.isActive ? "active" : "inactive"}`}>{item.isActive ? "正常" : "停用"}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
