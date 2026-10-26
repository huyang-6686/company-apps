"use client";

import React from "react";
import { useState } from "react";

export function LocalAddMemberButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    window.localStorage.setItem("zhenan-demo-last-member", JSON.stringify({ name: name.trim(), savedAt: new Date().toISOString() }));
    setSaved(true);
  }

  return <>
    <button className="primary-button" type="button" onClick={() => { setOpen(true); setSaved(false); }}>新增会员单位</button>
    {open && <div className="modal-backdrop" role="presentation"><section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="local-add-member-title"><div className="panel-heading"><h2 id="local-add-member-title">新增会员单位（本地测试）</h2><button className="icon-button" type="button" aria-label="关闭" onClick={() => setOpen(false)}>×</button></div><p className="demo-data-banner" role="note"><span aria-hidden="true">!</span> 线下测试数据 / 不写入正式数据库</p>{saved ? <div className="empty-state"><h3>已保存本地测试记录</h3><p>刷新前可继续检查页面交互。</p><button className="secondary-button" type="button" onClick={() => setOpen(false)}>完成</button></div> : <form className="local-add-form" onSubmit={submit}><label>单位名称<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：演示会员单位" /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setOpen(false)}>取消</button><button className="primary-button" type="submit">保存测试记录</button></div></form>}</section></div>}
  </>;
}
