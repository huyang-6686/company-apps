'use strict';
const { canAccept, transition } = require('../domain/noticeRules');

async function receiveEvent(pool, event) {
  if (!event || !event.event_type || !event.event_id) return { accepted: false, reason: 'missing_event_fields' };
  const VALID_EVENTS = ['notification.created','notification.updated','notification.expired'];
  if (!VALID_EVENTS.includes(event.event_type)) return { accepted: false, reason: 'unsupported_event_type' };
  const dup = await pool.query('SELECT id, processed FROM notification_events WHERE event_id = $1', [event.event_id]);
  if (dup.rows.length > 0) return { accepted: false, reason: 'duplicate_event', eventId: dup.rows[0].id };
  if (event.event_type === 'notification.created') {
    const p = event.payload || {};
    if (!p.user_id || !p.tenant_id || !p.title || !p.deep_link) return { accepted: false, reason: 'missing_payload_fields' };
    if (!canAccept(p.type)) return { accepted: false, reason: 'unsupported_notice_type', type: p.type };
    const r = await pool.query(
      'INSERT INTO notifications (user_id, tenant_id, type, title, body, deep_link, status, due_at, dedup_key, source_ref) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id',
      [p.user_id, p.tenant_id, p.type, p.title, p.body || null, p.deep_link, 'unread', p.due_at || null, p.dedup_key || null, p.source_ref || {}]
    );
    await pool.query('INSERT INTO notification_events (event_type, event_id, payload, processed, processed_at) VALUES ($1,$2,$3,TRUE,now())', [event.event_type, event.event_id, event.payload || {}]);
    return { accepted: true, notificationId: r.rows[0].id };
  }
  const p = event.payload || {};
  const targetKey = p.dedup_key;
  if (!targetKey) return { accepted: false, reason: 'missing_dedup_key_for_update' };
  const existing = await pool.query('SELECT id, status FROM notifications WHERE dedup_key = $1', [targetKey]);
  if (existing.rows.length === 0) return { accepted: false, reason: 'notification_not_found' };
  const row = existing.rows[0];
  const nextStatus = event.event_type === 'notification.expired' ? 'expired' : (p.status || null);
  if (!nextStatus) return { accepted: false, reason: 'missing_status_for_update' };
  const t = transition(row.status, nextStatus);
  if (!t.ok) return { accepted: false, reason: 'illegal_transition', from: row.status, to: nextStatus };
  await pool.query('UPDATE notifications SET status = $1, updated_at = now() WHERE id = $2', [nextStatus, row.id]);
  await pool.query('INSERT INTO notification_events (event_type, event_id, payload, processed, processed_at) VALUES ($1,$2,$3,TRUE,now())', [event.event_type, event.event_id, event.payload || {}]);
  return { accepted: true, notificationId: row.id, from: row.status, to: nextStatus };
}

async function sendViaFeishu(pool, sender, noticeId) {
  const n = await pool.query('SELECT * FROM notifications WHERE id = $1', [noticeId]);
  if (n.rows.length === 0) return { ok: false, reason: 'notification_not_found' };
  const notice = n.rows[0];
  if (notice.feishu_sent) return { ok: true, already_sent: true };
  let result;
  try { result = await sender(notice.user_id, notice.tenant_id, notice); }
  catch (e) { result = { ok: false, failReason: e.message || 'sender_threw' }; }
  if (result.ok) {
    await pool.query('UPDATE notifications SET feishu_sent = TRUE, feishu_sent_at = now(), updated_at = now() WHERE id = $1', [noticeId]);
    return { ok: true };
  }
  const failReason = result.failReason || 'unknown';
  await pool.query('UPDATE notifications SET feishu_fail_reason = $1, retry_count = retry_count + 1, updated_at = now() WHERE id = $2', [failReason, noticeId]);
  return { ok: false, failReason, retryCount: notice.retry_count + 1 };
}

async function listFailedNotifications(pool, maxRetry) {
  const cap = Math.min(Number(maxRetry) || 3, 10);
  const r = await pool.query("SELECT id, user_id, tenant_id, type, title, deep_link, retry_count, feishu_fail_reason FROM notifications WHERE feishu_sent = FALSE AND retry_count < $1 AND status != 'processed' ORDER BY retry_count ASC, created_at ASC LIMIT 100", [cap]);
  return r.rows;
}

module.exports = { receiveEvent, sendViaFeishu, listFailedNotifications };


