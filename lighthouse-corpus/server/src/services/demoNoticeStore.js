'use strict';

function createDemoNoticePool() {
  const notifications = [
    { id: 1, user_id: 'demo-user-1', tenant_id: 'lightcube', type: 'task_assigned', title: '资料归档任务：叁棱镜项目复盘', status: 'unread', due_at: '2026-10-22', dedup_key: 'k1', deep_link: '/pending' },
    { id: 2, user_id: 'demo-user-1', tenant_id: 'lightcube', type: 'intel_alert', title: '情报提醒：行业报告新版本', status: 'unread', due_at: null, dedup_key: 'k2', deep_link: '/monitor' },
    { id: 3, user_id: 'demo-user-1', tenant_id: 'lightcube', type: 'contribution_review', title: '贡献复核：供应商管理流程建议', status: 'pending', due_at: '2026-10-25', dedup_key: 'k3', deep_link: '/contribution' },
    { id: 4, user_id: 'demo-user-1', tenant_id: 'lightcube', type: 'task_assigned', title: '资料归档任务：旧版分享目录', status: 'processed', due_at: null, dedup_key: 'k4', deep_link: '/pending' },
    { id: 5, user_id: 'demo-user-1', tenant_id: 'lightcube', type: 'task_assigned', title: '资料归档任务：过期旧条目', status: 'expired', due_at: '2026-10-15', dedup_key: 'k5', deep_link: '/pending' },
    { id: 6, user_id: 'demo-user-2', tenant_id: 'yuguang', type: 'intel_alert', title: '情报提醒：另一条新闻推送', status: 'unread', due_at: null, dedup_key: 'k6', deep_link: '/monitor' }
  ].map(function (notice) {
    return Object.assign({ body: null, source_ref: {}, feishu_sent: false, retry_count: 0, feishu_fail_reason: null }, notice);
  });
  const events = [];

  async function query(sql, params) {
    if (/SELECT id, processed FROM notification_events/.test(sql)) {
      return { rows: events.filter(function (event) { return event.event_id === params[0]; }).map(function (event) { return { id: event.event_id, processed: event.processed }; }) };
    }
    if (/INSERT INTO notifications/.test(sql)) {
      const [user_id, tenant_id, type, title, body, deep_link, status, due_at, dedup_key, source_ref] = params;
      if (dedup_key && notifications.some(function (notice) { return notice.dedup_key === dedup_key; })) return { rows: [] };
      const id = notifications.reduce(function (max, notice) { return Math.max(max, Number(notice.id) || 0); }, 0) + 1;
      notifications.push({ id, user_id, tenant_id, type, title, body, deep_link, status, due_at, dedup_key, source_ref, feishu_sent: false, retry_count: 0, feishu_fail_reason: null });
      return { rows: [{ id }] };
    }
    if (/INSERT INTO notification_events/.test(sql)) {
      events.push({ event_type: params[0], event_id: params[1], payload: params[2], processed: params[3] });
      return { rows: [] };
    }
    if (/SELECT id, status FROM notifications WHERE dedup_key/.test(sql)) {
      return { rows: notifications.filter(function (notice) { return notice.dedup_key === params[0]; }).map(function (notice) { return { id: notice.id, status: notice.status }; }) };
    }
    if (/UPDATE notifications SET status/.test(sql)) {
      const notice = notifications.find(function (item) { return item.id === params[1]; });
      if (notice) notice.status = params[0];
      return { rows: [] };
    }
    throw new Error('unsupported demo notice query');
  }

  return {
    query: query,
    listNotifications: function () { return notifications.map(function (notice) { return Object.assign({}, notice); }); }
  };
}

module.exports = { createDemoNoticePool: createDemoNoticePool };
