'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { filterAuditEntries, paginateAuditEntries } = require('../../demo/auditView');

const entries = [
  { actor_id: 'founder', action: 'archive', target_type: 'node' },
  { actor_id: 'founder', action: 'search_denied', target_type: 'node' },
  { actor_id: 'founder', action: 'permission_change', target_type: 'node' }
];

test('audit view filters by actor, action, and target type', () => {
  assert.deepEqual(filterAuditEntries(entries, { actorId: 'founder', action: 'archive', targetType: 'node' }), [entries[0]]);
  assert.deepEqual(filterAuditEntries(entries, { action: 'missing' }), []);
});

test('audit view paginates with stable one-based pages', () => {
  assert.deepEqual(paginateAuditEntries(entries, 1, 2), { items: [entries[0], entries[1]], page: 1, pageSize: 2, total: 3, pageCount: 2 });
  assert.deepEqual(paginateAuditEntries(entries, 2, 2), { items: [entries[2]], page: 2, pageSize: 2, total: 3, pageCount: 2 });
  assert.deepEqual(paginateAuditEntries(entries, 9, 2).page, 2);
});
