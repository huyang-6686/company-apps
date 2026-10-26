import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceSidebar } from "../../components/workspace/workspace-sidebar";
import { LocalModuleTestPanel } from "../../components/workspace/local-module-test-panel";
import { getModulePageDefinition } from "../../modules/workspace/module-pages";

type ModulePageProps = { params: Promise<{ slug: string[] }> };

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  const route = `/${slug.join("/")}`;
  const page = getModulePageDefinition(route);
  if (!page) notFound();

  return (
    <div className="app-shell">
      <WorkspaceSidebar />
      <main className="main-content">
        <header className="topbar standalone-topbar">
          <div>
            <p className="breadcrumb"><Link href="/workspace">工作台</Link> <span>/</span> {page.label}</p>
            <h1>{page.label}</h1>
          </div>
          <div className="topbar-actions">
            <span className="version-badge">{page.wave}</span>
            <Link className="secondary-button" href="/workspace">返回总览</Link>
          </div>
        </header>

        <div className="content-wrap">
          <section className="page-intro">
            <div>
              <p className="eyebrow">{page.resource}</p>
              <h2>{page.label}</h2>
              <p className="muted-copy">{page.description}</p>
            </div>
            <span className="module-status"><span className="status-dot" /> {process.env.DEMO_MODE === "true" ? "线下测试" : page.status}</span>
          </section>

          <section className="module-tabs" aria-label="页面视图">
            {page.views.map((view, index) => (
              <button className={`module-tab ${index === 0 ? "selected" : ""}`} key={view} type="button">
                {view}
              </button>
            ))}
          </section>

          {process.env.DEMO_MODE === "true" ? <LocalModuleTestPanel label={page.label} resource={page.resource} views={page.views} /> : <section className="table-panel module-placeholder">
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">□</div>
              <h3>模块页面已就绪</h3>
              <p>当前完成页面、导航和权限资源占位，真实数据接入将在下一波次启用。</p>
              <Link className="secondary-button" href="/admin/integrations">查看集成状态</Link>
            </div>
          </section>}
        </div>
      </main>
    </div>
  );
}
