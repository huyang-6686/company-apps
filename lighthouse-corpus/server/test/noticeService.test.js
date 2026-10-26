'use strict';
const test = require('node:test');
const assert = require('node:assert');
const svc = require('../src/services/noticeService');

function makeMockPool() {
  const db = { notifications: [], events: [] };
  return {
    db,
    async query(sql, params) {
      if (/INSERT INTO notifications/.test(sql)) {
        const [user_id, tenant_id, type, title, body, deep_link, status, due_at, dedup_key, source_ref] = params;
        const id = db.notifications.length + 1;
        db.notifications.push({ id, user_id, tenant_id, type, title, body, deep_link, status, due_at, dedup_key, source_ref, feishu_sent: false, retry_count: 0, feishu_fail_reason: null });
        return { rows: [{ id }] };
      }
      if (/INSERT INTO notification_events/.test(sql)) {
        db.events.push({ event_type: params[0], event_id: params[1], payload: params[2], processed: params[3] });
        return { rows: [] };
      }
      if (/SELECT id, processed FROM notification_events/.test(sql)) {
        return { rows: db.events.filter(e => e.event_id === params[0]).map(e => ({ id: e.event_id, processed: e.processed })) };
      }
      if (/SELECT id, status FROM notifications WHERE dedup_key/.test(sql)) {
        return { rows: db.notifications.filter(n => n.dedup_key === params[0]).map(n => ({ id: n.id, status: n.status })) };
      }
      if (/UPDATE notifications SET status/.test(sql)) {
        const target = db.notifications.find(n => n.id === params[1]);
        if (target) target.status = params[0];
        return { rows: [] };
      }
      if (/SELECT \* FROM notifications WHERE id/.test(sql)) {
        return { rows: db.notifications.filter(n => n.id === params[0]) };
      }
      if (/UPDATE notifications SET feishu_sent = TRUE/.test(sql)) {
        const target = db.notifications.find(n => n.id === params[0]);
        if (target) target.feishu_sent = true;
        return { rows: [] };
      }
      if (/UPDATE notifications SET feishu_fail_reason/.test(sql)) {
        const target = db.notifications.find(n => n.id === params[1]);
        if (target) { target.feishu_fail_reason = params[0]; target.retry_count++; }
        return { rows: [] };
      }
      if (/SELECT id, user_id, tenant_id, type, title, deep_link, retry_count/.test(sql)) {
        return { rows: db.notifications.filter(n => !n.feishu_sent && n.retry_count < params[0] && n.status !== 'processed') };
      }
      return { rows: [] };
    },
  };
}

const baseCreated = {
  event_type: 'notification.created',
  event_id: 'ev-1',
  payload: { user_id: 'u1', tenant_id: 't1', type: 'task_assigned', title: 'T', deep_link: 'https://x/y', dedup_key: 'k1' },
};

test('receiveEvent created: accept and insert', async () => {
  const pool = makeMockPool();
  const r = await svc.receiveEvent(pool, baseCreated);
  assert.equal(r.accepted, true);
  assert.equal(pool.db.notifications.length, 1);
});

test('receiveEvent created: duplicate event_id is idempotent', async () => {
  const pool = makeMockPool();
  await svc.receiveEvent(pool, baseCreated);
  const r2 = await svc.receiveEvent(pool, baseCreated);
  assert.equal(r2.accepted, false);
  assert.equal(r2.reason, 'duplicate_event');
  assert.equal(pool.db.notifications.length, 1);
});

test('receiveEvent created: unsupported notice type rejected', async () => {
  const pool = makeMockPool();
  const ev = { ...baseCreated, event_id: 'ev-2', payload: { ...baseCreated.payload, type: 'oa_approval' } };
  const r = await svc.receiveEvent(pool, ev);
  assert.equal(r.accepted, false);
  assert.equal(r.reason, 'unsupported_notice_type');
});

test('receiveEvent updated: legal transition applied, illegal rejected', async () => {
  const pool = makeMockPool();
  await svc.receiveEvent(pool, baseCreated);
  const up1 = { event_type: 'notification.updated', event_id: 'ev-3', payload: { dedup_key: 'k1', status: 'pending' } };
  const r1 = await svc.receiveEvent(pool, up1);
  assert.equal(r1.accepted, true);
  const up2 = { event_type: 'notification.updated', event_id: 'ev-4', payload: { dedup_key: 'k1', status: 'unread' } };
  const r2 = await svc.receiveEvent(pool, up2);
  assert.equal(r2.accepted, false);
  assert.equal(r2.reason, 'illegal_transition');
});

test('receiveEvent expired: missing key rejected, valid key marks expired', async () => {
  const pool = makeMockPool();
  await svc.receiveEvent(pool, baseCreated);
  const noKey = { event_type: 'notification.expired', event_id: 'ev-5', payload: {} };
  assert.equal((await svc.receiveEvent(pool, noKey)).reason, 'missing_dedup_key_for_update');
  const withKey = { event_type: 'notification.expired', event_id: 'ev-6', payload: { dedup_key: 'k1' } };
  const r = await svc.receiveEvent(pool, withKey);
  assert.equal(r.accepted, true);
  assert.equal(r.to, 'expired');
});

test('sendViaFeishu: success marks feishu_sent', async () => {
  const pool = makeMockPool();
  await svc.receiveEvent(pool, baseCreated);
  const r = await svc.sendViaFeishu(pool, async () => ({ ok: true }), 1);
  assert.equal(r.ok, true);
  assert.equal(pool.db.notifications[0].feishu_sent, true);
});

test('sendViaFeishu: failure records reason and retry count', async () => {
  const pool = makeMockPool();
  await svc.receiveEvent(pool, baseCreated);
  const r = await svc.sendViaFeishu(pool, async () => ({ ok: false, failReason: 'net_timeout' }), 1);
  assert.equal(r.ok, false);
  assert.equal(r.failReason, 'net_timeout');
  assert.equal(pool.db.notifications[0].retry_count, 1);
  assert.equal(pool.db.notifications[0].feishu_fail_reason, 'net_timeout');
});

test('listFailedNotifications: only unsent unprocessed below cap', async () => {
  const pool = makeMockPool();
  await svc.receiveEvent(pool, baseCreated);
  await svc.sendViaFeishu(pool, async () => ({ ok: false, failReason: 'x' }), 1);
  const rows = await svc.listFailedNotifications(pool, 3);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, 1);
});
