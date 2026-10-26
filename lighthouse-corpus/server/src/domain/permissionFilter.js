'use strict';
/**
 * 四级敏感分级字段权限矩阵（2026-10-18 设计确认）
 * 级别: public / internal / restricted / private
 * 字段规则（最小可见集）:
 *   public     : 所有登录用户可见全部字段
 *   internal   : 所有登录用户可见；导出需权限矩阵允许
 *   restricted : 无权限者只可见标题与摘要，正文/附件/引用隐藏
 *   private    : 无权限者完全不可见（含标题）
 */

const LEVELS = ['public', 'internal', 'restricted', 'private'];

const FIELD_MATRIX = {
  public: { title: true, summary: true, body: true, attachments: true, references: true, export: true },
  internal: { title: true, summary: true, body: true, attachments: true, references: true, export: false },
  restricted: { title: true, summary: true, body: false, attachments: false, references: false, export: false },
  private: { title: false, summary: false, body: false, attachments: false, references: false, export: false },
};

/**
 * canAccess(level, userPermissions): userPermissions 为数组或 Set，含级别名表示有权。
 * 创始人全量由工作台下发权限保证，本模块不设旁路。
 */
function canAccess(level, userPermissions) {
  if (!LEVELS.includes(level)) return false;
  const perms = userPermissions instanceof Set ? userPermissions : new Set(userPermissions || []);
  return perms.has(level);
}

/**
 * filterFields(node, userPermissions): 按矩阵裁剪字段。
 * restricted 无权限者仍返回标题+摘要（矩阵本身控制）；private 无权限者返回 null（完全不可见）。
 */
function filterFields(node, userPermissions) {
  if (!LEVELS.includes(node.sensitivity)) return null;
  const perms = userPermissions instanceof Set ? userPermissions : new Set(userPermissions || []);
  if (!perms.size) return null;
  if (node.sensitivity === 'private' && !canAccess('private', perms)) return null;
  if (node.sensitivity !== 'restricted' && !canAccess(node.sensitivity, perms)) return null;
  const matrix = FIELD_MATRIX[node.sensitivity] || FIELD_MATRIX.private;
  const out = {};
  for (const field of ['id', 'sensitivity', 'source_type', 'tags', 'updated_at']) {
    if (field in node) out[field] = node[field];
  }
  for (const [field, allowed] of Object.entries(matrix)) {
    if (allowed && field in node) out[field] = node[field];
  }
  return out;
}

module.exports = { LEVELS, FIELD_MATRIX, canAccess, filterFields };
