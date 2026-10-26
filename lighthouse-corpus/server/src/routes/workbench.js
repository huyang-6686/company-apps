'use strict';
const express = require('express');
const { filterFields } = require('../domain/permissionFilter');
const { canAccept } = require('../domain/noticeRules');
const ni = require('../services/nodeImport');
const { searchNodes } = require('../services/retrieval');
const { createDemoNoticePool } = require('../services/demoNoticeStore');
const noticeService = require('../services/noticeService');
const { createDemoSharePool } = require('../services/shareSession');
const defaultNoticePool = createDemoNoticePool();

/** 模拟解析：按输入类型生成摘要与建议（不调用外部模型，不经工作台总接口）。 */
function mockAnalyze(session) {
  return {
    summary: '（模拟解析）已提取要点：' + String(session.input).slice(0, 60),
    archive_suggestion: '建议归档到：行业情报 / 外部分享',
    apply_suggestion: '可提炼为结构化方案（需创始人补充意见）'
  };
}

function createWorkbenchRouter(options) {
const router = express.Router();
const noticePool = options && options.noticePool ? options.noticePool : defaultNoticePool;
const sharePool = options && options.sharePool ? options.sharePool : createDemoSharePool();

// 内置示例节点集：仅用于 demo 搜索演示，不代表真实基线
const SAMPLE_NODES = [
  { id: 's1', title: '镇安真味品牌规划 v2', source_type: 'feishu', sensitivity: 'public', tags: ['品牌'], summary: '区域公用品牌三年规划要点。' },
  { id: 's2', title: '供应商合同范本', source_type: 'local', sensitivity: 'internal', tags: ['供应链'], summary: '标准采购合同条款与注意事项。' },
  { id: 's3', title: '核心配方工艺记录', source_type: 'local', sensitivity: 'restricted', tags: ['供应链'], summary: '受限级，无权者仅见标题。' },
  { id: 's4', title: '创始人合伙人协议草案', source_type: 'feishu', sensitivity: 'private', tags: ['组织'], summary: '私属级，仅创始人可见。' },
  { id: 's5', title: '行业周报 2026W42', source_type: 'feishu', sensitivity: 'public', tags: ['情报'], summary: '本周行业动态与竞品动作。' }
];

/**
 * 工作台相关接口
 * 当前状态：待工作台批准接口契约后实测
 */

// 获取用户角色（待实现）
router.get('/role', async (req, res) => {
  res.json({ error: 'not_implemented', message: '待工作台角色接口契约' });
});

// 获取节点列表（待实现）
router.get('/nodes', async (req, res) => {
  // 契约到位前无真实数据；权限过滤与节点解析以纯函数形式集成在此，不返回模拟业务数据
  const userPermissions = req.headers['x-user-permissions']
    ? String(req.headers['x-user-permissions']).split(',')
    : [];
  const baselineText = req.headers['x-demo-baseline'];
  let baselineReport = null;
  if (baselineText) {
    baselineReport = ni.parseNodeBaseline(baselineText);
  }
  res.json({
    error: 'not_implemented',
    message: '待节点基线接口契约',
    baselineReport,
    filter_demo: {
      received_permissions: userPermissions,
      example: filterFields({ sensitivity: 'restricted', title: '示例标题', summary: '示例摘要', body: '正文内容', attachments: [], references: [] }, userPermissions)
    }
  });
});

// 本地检索逻辑演示：契约到位前仅接受显式传入的模拟节点，不访问外部数据源。
router.post('/search-demo', (req, res) => {
  const body = req.body || {};
  const nodes = body.useSample ? SAMPLE_NODES : (body.nodes || []);
  if (!Array.isArray(nodes)) {
    return res.status(400).json({ source: 'explicit_demo_input', error: 'nodes_must_be_array' });
  }
  if (body.permissions !== undefined && !Array.isArray(body.permissions)) {
    return res.status(400).json({ source: 'explicit_demo_input', error: 'permissions_must_be_array' });
  }
  const results = searchNodes(nodes, body.query, body.permissions || [], { limit: body.limit });
  res.json({ source: 'explicit_demo_input', results });
});

// 通知板块演示接口：返回固定 mock 通知数组；不含真实飞书发送和与光事件
router.get('/notices-demo', (req, res) => {
  const notices = noticePool.listNotifications().map(function (n) {
    return Object.assign({}, n, {
      tenant: n.tenant_id === 'lightcube' ? '轻立方' : (n.tenant_id === 'yuguang' ? '与光' : n.tenant_id),
      type_allowed: canAccept(n.type)
    });
  });
  res.json({ source: 'mock_demo', notices: notices });
});

router.post('/notices-demo/events', async (req, res) => {
  try {
    const result = await noticeService.receiveEvent(noticePool, req.body);
    res.status(result.accepted ? 200 : 400).json({ source: 'mock_demo', result: result });
  } catch (error) {
    res.status(500).json({ source: 'mock_demo', error: 'notice_event_failed' });
  }
});

// 节点基线解析：POST body 为 JSONL 文本；返回批次报告；不落库
router.post('/parse-baseline', (req, res) => {
  const text = typeof req.body === 'string' ? req.body : (req.body && req.body.text);
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'missing_jsonl_text' });
  }
  const report = ni.parseNodeBaseline(text);
  res.json({ source: 'explicit_demo_input', report });
});

// 审计留痕演示：返回 mock 审计流（等数据库部署后接真实 audit_log）
router.get('/audit-demo', (req, res) => {
  res.json({ source: 'mock_demo', entries: [
    { actor_id: 'founder', action: 'archive', target_type: 'node', target_id: 's1', detail: { level: 'public', result: 'ok' }, created_at: '2026-10-20T09:00:00+08:00' },
    { actor_id: 'founder', action: 'search_denied', target_type: 'node', target_id: 's4', detail: { level: 'private', reason: 'no_permission' }, created_at: '2026-10-20T09:05:00+08:00' },
    { actor_id: 'founder', action: 'permission_change', target_type: 'node', target_id: 's2', detail: { from: 'internal', to: 'restricted', result: 'ok' }, created_at: '2026-10-20T09:10:00+08:00' }
  ]});
});

// ---- 分享会话演示接口（核心功能 4）：进程内模拟存储，统一状态机，不接真实飞书/数据库 ----

// 提交分享：received 解析为模拟 fetched，同链接合并
router.post('/share-demo', (req, res) => {
  const body = req.body || {};
  const result = sharePool.createSession(body, Date.now());
  if (!result.ok) return res.status(400).json({ source: 'mock_demo', error: result.reason });
  if (result.merged) return res.json({ source: 'mock_demo', merged: true, session: result.session });
  // 模拟自动解析：fetched -> analyzed 附摘要与建议；外链视频先追问（asked），符合“分享先追问”设计
  const now = Date.now();
  if (result.session.type === '外链视频') {
    // fetched -> analyzed -> asked：外链视频先追问（fetched 无法直达 asked）
    sharePool.advance(result.session.id, 'analyzed', now);
    sharePool.advance(result.session.id, 'asked', now);
  } else {
    sharePool.attachAnalysis(result.session.id, mockAnalyze(result.session), now);
  }
  res.status(201).json({ source: 'mock_demo', merged: false, session: sharePool.get(result.session.id) });
});

// 会话列表（带 24h/7d 超时标记）
router.get('/share-demo', (req, res) => {
  res.json({ source: 'mock_demo', sessions: sharePool.withTimeoutFlags(Date.now()) });
});

// 通用状态推进（需合法状态机迁移）
router.post('/share-demo/:id/advance', (req, res) => {
  const to = String((req.body || {}).to || '');
  const result = sharePool.advance(req.params.id, to, Date.now());
  if (!result.ok) return res.status(400).json({ source: 'mock_demo', error: result.reason, from: result.from, to: result.to });
  res.json({ source: 'mock_demo', session: result.session });
});

// 创始人决定：asked -> decided（必须附意见）
router.post('/share-demo/:id/decide', (req, res) => {
  const body = req.body || {};
  const result = sharePool.decide(req.params.id, body.decision, body.note, Date.now());
  if (!result.ok) return res.status(400).json({ source: 'mock_demo', error: result.reason, from: result.from });
  res.json({ source: 'mock_demo', session: result.session });
});

// 终态落库：decided -> archived | applied（模拟标记，不写真实知识库）
router.post('/share-demo/:id/finalize', (req, res) => {
  const result = sharePool.finalize(req.params.id, Date.now());
  if (!result.ok) return res.status(400).json({ source: 'mock_demo', error: result.reason, from: result.from });
  res.json({ source: 'mock_demo', session: result.session });
});

return router;
}

module.exports = { createWorkbenchRouter: createWorkbenchRouter };
