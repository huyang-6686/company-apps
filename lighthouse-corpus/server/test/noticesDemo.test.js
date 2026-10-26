'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createDemoNoticePool } = require('../src/services/demoNoticeStore');
const { createWorkbenchRouter } = require('../src/routes/workbench');

async function withServer(t, pool, run) {
  const app = express();
  app.use(express.json());
  app.use('/api/workbench', createWorkbenchRouter({ noticePool: pool }));
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  await run('http://127.0.0.1:' + server.address().port);
}

const createdEvent = {
  event_type: 'notification.created',
  event_id: 'demo-event-1',
  payload: {
    user_id: 'demo-user', tenant_id: 'lightcube', type: 'task_assigned',
    title: '测试资料归档任务', deep_link: '/pending', dedup_key: 'demo-dedup-1'
  }
};

test('notice demo accepts events and exposes created notices from memory store', async t => {
  await withServer(t, createDemoNoticePool(), async baseUrl => {
    const response = await fetch(baseUrl + '/api/workbench/notices-demo/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createdEvent)
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).result.accepted, true);
    const list = await (await fetch(baseUrl + '/api/workbench/notices-demo')).json();
    assert.ok(list.notices.some(n => n.dedup_key === 'demo-dedup-1' && n.status === 'unread'));
    assert.equal(list.source, 'mock_demo');
  });
});

test('notice demo deduplicates event ids and enforces status transitions', async t => {
  await withServer(t, createDemoNoticePool(), async baseUrl => {
    const send = event => fetch(baseUrl + '/api/workbench/notices-demo/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event)
    });
    await send(createdEvent);
    const duplicate = await (await send(createdEvent)).json();
    assert.equal(duplicate.result.reason, 'duplicate_event');
    const updated = await (await send({
      event_type: 'notification.updated', event_id: 'demo-event-2',
      payload: { dedup_key: 'demo-dedup-1', status: 'pending' }
    })).json();
    assert.equal(updated.result.accepted, true);
    const illegal = await (await send({
      event_type: 'notification.updated', event_id: 'demo-event-3',
      payload: { dedup_key: 'demo-dedup-1', status: 'unread' }
    })).json();
    assert.equal(illegal.result.reason, 'illegal_transition');
    const list = await (await fetch(baseUrl + '/api/workbench/notices-demo')).json();
    assert.equal(list.notices.find(n => n.dedup_key === 'demo-dedup-1').status, 'pending');
  });
});

test('notice demo rejects event types outside the knowledge-task boundary', async t => {
  await withServer(t, createDemoNoticePool(), async baseUrl => {
    const response = await fetch(baseUrl + '/api/workbench/notices-demo/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'notification.created', event_id: 'oa-event', payload: { ...createdEvent.payload, type: 'oa_approval' } })
    });
    const data = await response.json();
    assert.equal(response.status, 400);
    assert.equal(data.result.reason, 'unsupported_notice_type');
  });
});
