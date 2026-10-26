'use strict';
/**
 * 追加式审计日志服务（2026-10-18 设计确认：追加写入 + 防篡改存储）
 * 写入侧仅 INSERT；防篡改由数据库权限层保证（应用账号不授予 UPDATE/DELETE，见 001_init.sql 注释）。
 * 本模块只负责构造与校验记录结构；真实连接池由调用方注入。
 */

const REQUIRED_FIELDS = ['actor_id', 'action', 'target_type'];

function validate(entry) {
  const missing = REQUIRED_FIELDS.filter(function (f) {
    return !entry || entry[f] === undefined || entry[f] === null || entry[f] === '';
  });
  if (missing.length) {
    const err = new Error('audit entry missing required fields: ' + missing.join(','));
    err.code = 'AUDIT_MISSING_FIELDS';
    throw err;
  }
}

/**
 * writeAudit(pool, entry): 返回插入行 id。
 * entry: { actor_id, action, target_type, target_id?, detail? }
 */
async function writeAudit(pool, entry) {
  validate(entry);
  const detail = entry.detail && typeof entry.detail === 'object' ? entry.detail : {};
  const result = await pool.query(
    'INSERT INTO audit_log (actor_id, action, target_type, target_id, detail) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [entry.actor_id, entry.action, entry.target_type, entry.target_id ?? null, detail]
  );
  return result.rows[0].id;
}

/**
 * readAudit(pool, opts): 只读查询，按时间倒序。
 * opts: { actorId?, targetType?, limit? }
 */
async function readAudit(pool, opts) {
  const o = opts || {};
  const conds = [];
  const params = [];
  if (o.actorId) {
    params.push(o.actorId);
    conds.push('actor_id = $' + params.length);
  }
  if (o.targetType) {
    params.push(o.targetType);
    conds.push('target_type = $' + params.length);
  }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  params.push(Math.min(Number(o.limit) || 100, 1000));
  const sql = 'SELECT id, actor_id, action, target_type, target_id, detail, created_at FROM audit_log '
    + where
    + ' ORDER BY created_at DESC LIMIT $' + params.length;
  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = { writeAudit, readAudit, validate, REQUIRED_FIELDS };
