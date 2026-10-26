import React from "react";
import Link from "next/link";

export default function DemoNotFound() {
  return (
    <main className="demo-page">
      <header className="topbar standalone-topbar"><h1>演示页面</h1></header>
      <div className="content-wrap">
        <p className="demo-data-banner" role="note"><span aria-hidden="true">!</span> 演示数据 / 非真实会员</p>
        <section className="empty-state"><h2>未找到该演示单位</h2><Link className="secondary-button" href="/demo/membership/units">返回会员台账演示</Link></section>
      </div>
    </main>
  );
}
