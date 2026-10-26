'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const audit = require('../src/services/audit');
const ni = require('../src/services/nodeImport');

test('audit: rejects missing required fields', () => {
  assert.throws(() => audit.validate({ action: 'x' }), /missing required/);
  assert.doesNotThrow(() => audit.validate({ actor_id: 'u1', action: 'create', target_type: 'node' }));
});

test('audit: writeAudit uses parameterized INSERT', async () => {
  const calls = [];
  const fakePool = { query: async (sql, params) => { calls.push({ sql, params }); return { rows: [{ id: 42 }] }; } };
  const id = await audit.writeAudit(fakePool, { actor_id: 'u1', action: 'update', target_type: 'node', target_id: 7, detail: { k: 'v' } });
  assert.strictEqual(id, 42);
  assert.match(calls[0].sql, /INSERT INTO audit_log/);
  assert.deepStrictEqual(calls[0].params[4], { k: 'v' });
});

test('nodeImport: valid line parses', () => {
  const r = ni.parseNodeLine(JSON.stringify({ title: '咖啡手册', source_type: 'feishu', sensitivity: 'internal', legacy_id: 101 }), 1);
  assert.ok(r.ok);
  assert.strictEqual(r.node.title, '咖啡手册');
});

test('nodeImport: baseline batch report catches duplicates and bad lines', () => {
  const report = ni.parseNodeBaseline([
    JSON.stringify({ title: 'a', source_type: 'feishu', sensitivity: 'public', legacy_id: 1 }),
    JSON.stringify({ title: 'b', source_type: 'feishu', sensitivity: 'public', legacy_id: 1 }),
    JSON.stringify({ title: 'c', source_type: 'baidu_pan', sensitivity: 'private' }),
    'not-json',
  ].join('\n'));
  assert.strictEqual(report.total, 4);
  assert.strictEqual(report.valid, 2);
  assert.strictEqual(report.invalid, 2);
  assert.ok(report.errors.some((e) => e.errors.some((m) => m.includes('duplicate'))));
  assert.ok(report.errors.some((e) => e.errors.some((m) => m.includes('invalid JSON'))));
});
