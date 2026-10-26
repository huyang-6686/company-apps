import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoLoginForm } from "../../../components/auth/demo-login-form";
import { isDemoModeEnabled } from "../../../modules/membership/demo-mode";

export const dynamic = "force-dynamic";

export default function DemoLoginPage() {
  if (!isDemoModeEnabled()) notFound();
  return <main className="demo-login-page"><div className="demo-login-shell"><Link className="brand" href="/workspace"><span className="brand-mark">Z</span><span><strong>镇安县生态产业协会</strong><small>管理中台</small></span></Link><h1>本地测试登录</h1><p className="muted-copy">用于明日局域网联测；账号只在 DEMO_MODE 下有效。</p><DemoLoginForm /><Link className="secondary-button" href="/workspace">跳过登录，直接查看页面</Link></div></main>;
}
