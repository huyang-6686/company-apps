'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createDemoSharePool } = require('../src/services/shareSession');
const { createWorkbenchRouter } = require('../src/routes/workbench');

async function withServer(t, sharePool, run) {
  const app = express();
  app.use(express.json());
  app.use('/api/workbench', createWorkbenchRouter({ sharePool: sharePool }));
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  await run('http://127.0.0.1:' + server.address().port);
}

test('share pool merges duplicate open links and enforces state machine', () => {
  const pool = createDemoSharePool();
  const now = Date.now();
  const first = pool.createSession({ input: 'https://Example.com/Doc ', type: '链接' }, now);
  assert.equal(first.ok, true);
  assert.equal(first.merged, false);
  assert.equal(first.session.status, 'fetched');
  const dup = pool.createSession({ input: 'https://example.com/doc', type: '链接' }, now + 1);
  assert.equal(dup.merged, true);
  assert.equal(dup.session.id, first.session.id);
  const illegal = pool.advance(first.session.id, 'decided', now);
  assert.equal(illegal.ok, false);
  assert.equal(illegal.reason, 'illegal_transition');
  const analyzed = pool.advance(first.session.id, 'analyzed', now + 2);
  assert.equal(analyzed.ok, true);
  const asked = pool.advance(first.session.id, 'asked', now + 3);
  assert.equal(asked.ok, true);
  const noNote = pool.decide(first.session.id, 'archive', '   ', now + 4);
  assert.equal(noNote.ok, false);
  assert.equal(noNote.reason, 'founder_note_required');
  const decided = pool.decide(first.session.id, 'archive', '按品牌目录归档', now + 5);
  assert.equal(decided.ok, true);
  const done = pool.finalize(first.session.id, now + 6);
  assert.equal(done.ok, true);
  assert.equal(done.session.status, 'archived');
  const again = pool.advance(first.session.id, 'received', now + 7);
  assert.equal(again.ok, false);
  assert.equal(again.reason, 'terminal_state');
});

test('share pool apply decision finalizes to applied with founder note', () => {
  const pool = createDemoSharePool();
  const now = Date.now();
  const s = pool.createSession({ input: '某管理思路分享', type: '文本' }, now).session;
  pool.advance(s.id, 'analyzed', now + 1);
  pool.advance(s.id, 'asked', now + 2);
  const decided = pool.decide(s.id, 'apply', '整理成本周经营例会要点', now + 3);
  assert.equal(decided.ok, true);
  const done = pool.finalize(s.id, now + 4);
  assert.equal(done.session.status, 'applied');
});

test('share demo api creates, asks and finalizes sessions in memory', async t => {
  await withServer(t, createDemoSharePool(), async baseUrl => {
    const created = await fetch(baseUrl + '/api/workbench/share-demo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: '链接：某行业报告文档', type: '文档' })
    });
    assert.equal(created.status, 201);
    const { session } = await created.json();
    assert.equal(session.status, 'analyzed');
    assert.ok(session.summary.includes('模拟解析'));
    assert.ok(session.archive_suggestion);
    const video = await (await fetch(baseUrl + '/api/workbench/share-demo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: '链接：某抖音视频', type: '外链视频' })
    })).json();
    assert.equal(video.session.status, 'asked');
    const decided = await fetch(baseUrl + '/api/workbench/share-demo/' + video.session.id + '/decide', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'archive', note: '要点存档，视频不解析' })
    });
    assert.equal(decided.status, 200);
    const finalized = await (await fetch(baseUrl + '/api/workbench/share-demo/' + video.session.id + '/finalize', { method: 'POST' })).json();
    assert.equal(finalized.session.status, 'archived');
    const list = await (await fetch(baseUrl + '/api/workbench/share-demo')).json();
    assert.equal(list.source, 'mock_demo');
    assert.ok(list.sessions.some(x => x.id === session.id && x.timeout_flag === 'normal'));
    const bad = await fetch(baseUrl + '/api/workbench/share-demo/' + session.id + '/advance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'decided' })
    });
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error, 'illegal_transition');
  });
});

test('share demo api rejects missing input', async t => {
  await withServer(t, createDemoSharePool(), async baseUrl => {
    const resp = await fetch(baseUrl + '/api/workbench/share-demo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: '  ' })
    });
    assert.equal(resp.status, 400);
    assert.equal((await resp.json()).error, 'missing_input');
  });
});
