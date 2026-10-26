"use client";

import { useState } from "react";
import { DEMO_TEST_ACCOUNTS } from "../../modules/shared/auth/demo-accounts";

const SESSION_KEY = "zhenan-demo-account";

export function DemoLoginForm() {
  const [username, setUsername] = useState(DEMO_TEST_ACCOUNTS[0].username);
  const [password, setPassword] = useState(DEMO_TEST_ACCOUNTS[0].password);
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const account = DEMO_TEST_ACCOUNTS.find((item) => item.username === username && item.password === password);
    if (!account) { setError("账号或密码不正确"); return; }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ username: account.username, role: account.role, displayName: account.displayName, scopes: account.scopes }));
    window.location.href = "/workspace";
  }

  return <form className="demo-login-form" onSubmit={submit}>
    <p className="demo-data-banner" role="note"><span aria-hidden="true">!</span> 本地测试账号 / 非正式登录</p>
    <label>测试身份<select value={username} onChange={(event) => { const account = DEMO_TEST_ACCOUNTS.find((item) => item.username === event.target.value); setUsername(event.target.value); setPassword(account?.password ?? ""); }}>{DEMO_TEST_ACCOUNTS.map((account) => <option key={account.username} value={account.username}>{account.displayName}（{account.role}）</option>)}</select></label>
    <label>测试密码<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-button" type="submit">进入本地测试</button>
  </form>;
}
