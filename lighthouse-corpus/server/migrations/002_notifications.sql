-- 通知板块 schema（2026-10-20 创始人确认边界）
-- 灯塔只办理知识资料类任务；不代发不代办其他应用；自有飞书机器人深链。

CREATE TABLE notifications (
  id            BIGSERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL,              -- 与光统一员工 ID
  tenant_id     TEXT NOT NULL,              -- 租户来源：轻立方 / 与光
  type          TEXT NOT NULL,              -- task_assigned / intel_alert / contribution_review
  title         TEXT NOT NULL,
  body          TEXT,
  deep_link     TEXT NOT NULL,              -- 灯塔具体办理页面路径
  status        TEXT NOT NULL DEFAULT 'unread'
                CHECK (status IN ('unread','pending','processed','expired')),
  due_at        TIMESTAMPTZ,                -- 逾期判定基准
  feishu_sent   BOOLEAN NOT NULL DEFAULT FALSE,
  feishu_sent_at TIMESTAMPTZ,
  feishu_fail_reason TEXT,
  retry_count   INT NOT NULL DEFAULT 0,
  dedup_key     TEXT UNIQUE,                -- 幂等去重
  source_ref    JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user_status ON notifications(user_id, status);
CREATE INDEX idx_notif_dedup ON notifications(dedup_key);
CREATE INDEX idx_notif_due ON notifications(due_at) WHERE status = 'pending';

-- 通知事件接收表（与光推送的 notification.* 事件，用于幂等）
CREATE TABLE notification_events (
  id          BIGSERIAL PRIMARY KEY,
  event_type  TEXT NOT NULL CHECK (event_type IN ('notification.created','notification.updated','notification.expired')),
  event_id    TEXT NOT NULL UNIQUE,         -- 与光事件唯一 ID，幂等键
  payload     JSONB NOT NULL,
  processed   BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
