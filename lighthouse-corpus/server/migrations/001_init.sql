-- 灯塔知识库初始 schema（2026-10-18 设计基线）
-- 仅阶段 0 本地准备；真实库执行待 PostgreSQL 托管能力取证后进行。

CREATE EXTENSION IF NOT EXISTS pg_trgm; -- 阶段 0 先验证中文 FTS，失败时降级路径

-- 知识节点（沿用旧应用分类树，冻结基线批量导入）
CREATE TABLE nodes (
  id            BIGSERIAL PRIMARY KEY,
  legacy_id     BIGINT UNIQUE,            -- 旧应用节点 ID，基线导入时对账用
  parent_id     BIGINT REFERENCES nodes(id),
  title         TEXT NOT NULL,
  summary       TEXT,
  body          TEXT,
  source_type   TEXT NOT NULL,            -- feishu / local / baidu_pan 等
  sensitivity   TEXT NOT NULL CHECK (sensitivity IN ('public','internal','restricted','private')),
  status        TEXT NOT NULL DEFAULT 'received'
                CHECK (status IN ('received','fetched','analyzed','asked','decided','archived','applied','failed','expired')),
  extra         JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_nodes_parent ON nodes(parent_id);
CREATE INDEX idx_nodes_sensitivity ON nodes(sensitivity);
CREATE INDEX idx_nodes_title_trgm ON nodes USING gin (title gin_trgm_ops);

-- 审计日志：追加写入，应用账号不授予 UPDATE/DELETE（防篡改由数据库权限保证）
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    TEXT NOT NULL,
  action      TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id   BIGINT,
  detail      JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_actor ON audit_log(actor_id, created_at);

-- 角色权限缓存（来源：与光工作中台下发；本表只读缓存，不自建角色定义）
CREATE TABLE role_cache (
  user_id      TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL,
  permissions  JSONB NOT NULL,            -- ["public","internal",...]
  synced_at    TIMESTAMPTZ NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL       -- 过期即拒绝，不做本地续期
);
