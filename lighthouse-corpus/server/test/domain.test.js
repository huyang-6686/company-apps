'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const sm = require('../src/domain/stateMachine');
const pf = require('../src/domain/permissionFilter');

test('state machine: happy path', () => {
  for (const step of [['received','fetched'],['fetched','analyzed'],['analyzed','asked'],['asked','decided'],['decided','archived']]) {
    assert.ok(sm.canTransition(step[0], step[1]), step.join('->'));
  }
  assert.ok(sm.canTransition('decided', 'applied'));
});

test('state machine: failed terminal from any active state', () => {
  for (const s of sm.ACTIVE_STATES) assert.ok(sm.canTransition(s, 'failed'));
  assert.ok(!sm.canTransition('failed', 'fetched'));
});

test('state machine: timeout rules', () => {
  const now = Date.now();
  assert.strictEqual(sm.evaluateTimeout(now, now), 'normal');
  assert.strictEqual(sm.evaluateTimeout(now - 25 * 3600e3, now), 'pending_reminder');
  assert.strictEqual(sm.evaluateTimeout(now - 8 * 24 * 3600e3, now), 'expired');
});

test('permission: four-level matrix', () => {
  const founder = ['public', 'internal', 'restricted', 'private'];
  const staff = ['public', 'internal'];
  assert.ok(pf.canAccess('private', founder));
  assert.ok(!pf.canAccess('private', staff));
  const restrictedNode = { sensitivity: 'restricted', title: 'T', summary: 'S', body: 'B', attachments: [], references: [] };
  const view = pf.filterFields(restrictedNode, staff);
  assert.strictEqual(view.title, 'T');
  assert.strictEqual(view.body, undefined);
  assert.strictEqual(pf.filterFields({ sensitivity: 'private', title: 'X' }, staff), null);
});
