'use strict';
/**
 * 检索鉴权与召回排序纯函数层（2026-10-18 设计确认：服务端先鉴权过滤，再召回、排序、组装）
 * 真实全文检索（pg_trgm / tsvector / pgvector）由数据库层后续实现；本模块只做内存集合上的鉴权过滤与排序逻辑。
 */

const { filterFields } = require('../domain/permissionFilter');

/**
 * searchNodes(nodes, query, userPermissions, opts): 先过滤后排序，确保越权节点不参与召回。
 * nodes: [{ id, title, summary, sensitivity, tags?, updated_at? }]
 * opts: { limit? }
 * 返回：裁剪后的节点数组；无权访问的节点完全不出现在结果里。
 */
function searchNodes(nodes, query, userPermissions, opts) {
  const o = opts || {};
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const node of nodes) {
    const filtered = filterFields(node, userPermissions);
    if (!filtered) continue; // private 无权限者完全不可见，不进入候选集
    const title = String(node.title || '').toLowerCase();
    const summary = String(node.summary || '').toLowerCase();
    let score = 0;
    let matched = false;
    for (const term of terms) {
      if (title.includes(term)) { score += 3; matched = true; }
      if (summary.includes(term)) { score += 1; matched = true; }
      if (Array.isArray(node.tags) && node.tags.some(function (t) { return String(t).toLowerCase().includes(term); })) {
        score += 2;
        matched = true;
      }
    }
    if (matched) scored.push({ node: filtered, score });
  }
  scored.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    const ta = a.node.updated_at ? new Date(a.node.updated_at).getTime() : 0;
    const tb = b.node.updated_at ? new Date(b.node.updated_at).getTime() : 0;
    return tb - ta;
  });
  return scored.slice(0, Math.min(Number(o.limit) || 20, 100)).map(function (s) { return s.node; });
}

module.exports = { searchNodes };
