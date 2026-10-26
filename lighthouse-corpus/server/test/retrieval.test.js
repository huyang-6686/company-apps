'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { searchNodes } = require('../src/services/retrieval');
const express = require('express');
const { createWorkbenchRouter } = require('../src/routes/workbench');

const NODES = [
  { id: 1, title: '咖啡萃取手册', summary: '浓缩咖啡参数与研磨度', sensitivity: 'public', tags: ['咖啡', 'SOP'], updated_at: '2026-10-01' },
  { id: 2, title: '门店定价策略', summary: '含成本毛利测算', sensitivity: 'internal', tags: ['定价'], updated_at: '2026-10-02' },
  { id: 3, title: '供应商合同归档', summary: '含敏感商务条款', sensitivity: 'restricted', tags: ['合同'], updated_at: '2026-10-03' },
  { id: 4, title: '创始人私人笔记', summary: '咖啡相关私人记录', sensitivity: 'private', tags: [] },
  { id: 5, title: '设备保养清单', summary: '咖啡机清洁与除垢周期', sensitivity: 'internal', tags: ['设备'], updated_at: '2026-09-01' },
];

const STAFF = ['public', 'internal'];

test('retrieval: staff query excludes restricted and private before ranking', () => {
  const results = searchNodes(NODES, '咖啡', STAFF);
  const ids = results.map(function (n) { return n.id; });
  assert.ok(!ids.includes(3), 'restricted hidden from staff');
  assert.ok(!ids.includes(4), 'private hidden from staff');
  assert.ok(ids.includes(1));
  assert.ok(ids.includes(5));
});

test('retrieval: restricted body stripped but title+summary visible for staff', () => {
  const results = searchNodes(NODES, '合同', STAFF);
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].id, 3);
  assert.strictEqual(results[0].body, undefined);
  assert.strictEqual(results[0].title, '供应商合同归档');
});

test('retrieval: title match outranks summary match; ties break by recency', () => {
  const results = searchNodes(NODES, '定价', STAFF);
  assert.strictEqual(results[0].id, 2);
  const recent = searchNodes(NODES, '咖啡', STAFF);
  assert.strictEqual(recent[0].id, 1, 'newer node first on tie');
});

test('retrieval: empty query returns empty; no permission returns empty for private', () => {
  assert.deepStrictEqual(searchNodes(NODES, '', STAFF), []);
  assert.deepStrictEqual(searchNodes(NODES, '咖啡', []), []);
  const founder = ['public', 'internal', 'restricted', 'private'];
  const fResults = searchNodes(NODES, '咖啡', founder);
  assert.ok(fResults.some(function (n) { return n.id === 4; }), 'founder sees private node');
});

test('search demo API rejects non-array nodes and permissions', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/workbench', createWorkbenchRouter());
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;

  const badNodes = await fetch(base + '/api/workbench/search-demo', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '咖啡', nodes: {}, permissions: [] })
  });
  assert.equal(badNodes.status, 400);
  assert.equal((await badNodes.json()).error, 'nodes_must_be_array');

  const badPermissions = await fetch(base + '/api/workbench/search-demo', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '咖啡', nodes: [], permissions: {} })
  });
  assert.equal(badPermissions.status, 400);
  assert.equal((await badPermissions.json()).error, 'permissions_must_be_array');
});
