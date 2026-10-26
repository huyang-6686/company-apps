'use strict';
const VALID_TYPES = ['task_assigned', 'intel_alert', 'contribution_review'];
const VALID_STATUS = ['unread', 'pending', 'processed', 'expired'];
function transition(current, next) {
  if (!VALID_STATUS.includes(current) || !VALID_STATUS.includes(next)) return { ok: false, reason: 'invalid_status' };
  const allowed = { unread: ['pending','processed','expired'], pending: ['processed','expired'], processed: [], expired: ['pending'] };
  return allowed[current].includes(next) ? { ok: true } : { ok: false, reason: 'illegal_transition', from: current, to: next };
}
function isOverdue(n, now) { return n.status === 'pending' && n.due_at && new Date(n.due_at) < new Date(now); }
function canAccept(type) { return VALID_TYPES.includes(type); }
module.exports = { VALID_TYPES, VALID_STATUS, transition, isOverdue, canAccept };
