'use strict';
/**
 * 节点基线导入解析校验（2026-10-18 设计确认：冻结基线 + 新 schema 批量导入）
 * 纯函数层：解析、逐行校验、批次报告。真实 nodes_v2.jsonl 数据与批次提交待授权位置取证后执行。
 */

const SENSITIVITY_LEVELS = ['public', 'internal', 'restricted', 'private'];
const SOURCE_TYPES = ['feishu', 'local', 'baidu_pan'];

/**
 * parseNodeLine(raw, lineNo): 校验单行 JSONL 节点记录，返回 { ok, node?, errors[] }。
 */
function parseNodeLine(raw, lineNo) {
  const errors = [];
  let obj;
  try {
    obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    return { ok: false, lineNo, errors: ['invalid JSON: ' + e.message] };
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, lineNo, errors: ['not an object'] };
  }
  if (!obj.title || typeof obj.title !== 'string' || !obj.title.trim()) errors.push('title required');
  if (!obj.source_type || !SOURCE_TYPES.includes(obj.source_type)) {
    errors.push('source_type must be one of ' + SOURCE_TYPES.join('|'));
  }
  if (!obj.sensitivity || !SENSITIVITY_LEVELS.includes(obj.sensitivity)) {
    errors.push('sensitivity must be one of ' + SENSITIVITY_LEVELS.join('|'));
  }
  if (obj.legacy_id !== undefined && !Number.isInteger(obj.legacy_id)) errors.push('legacy_id must be integer when present');
  if (obj.parent_legacy_id !== undefined && !Number.isInteger(obj.parent_legacy_id)) errors.push('parent_legacy_id must be integer when present');
  if (errors.length) return { ok: false, lineNo, errors };
  return { ok: true, lineNo, node: obj };
}

/**
 * parseNodeBaseline(text): 解析整份 JSONL 文本，返回批次报告。
 * 报告: { total, valid, invalid, errors[], nodes[] }；不执行写入。
 */
function parseNodeBaseline(text) {
  const lines = String(text).split(/\r?\n/).filter(function (l) {
    return l.trim();
  });
  const report = { total: lines.length, valid: 0, invalid: 0, errors: [], nodes: [] };
  const seenIds = new Set();
  lines.forEach(function (line, i) {
    const r = parseNodeLine(line, i + 1);
    if (r.ok) {
      if (r.node.legacy_id !== undefined) {
        if (seenIds.has(r.node.legacy_id)) {
          report.invalid += 1;
          report.errors.push({ lineNo: r.lineNo, errors: ['duplicate legacy_id ' + r.node.legacy_id] });
          return;
        }
        seenIds.add(r.node.legacy_id);
      }
      report.valid += 1;
      report.nodes.push(r.node);
    } else {
      report.invalid += 1;
      report.errors.push({ lineNo: r.lineNo, errors: r.errors });
    }
  });
  return report;
}

module.exports = { parseNodeLine, parseNodeBaseline, SENSITIVITY_LEVELS, SOURCE_TYPES };
