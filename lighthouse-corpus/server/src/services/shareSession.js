'use strict';
/**
 * 分享会话本地模拟存储（核心功能 4：日常分享知识点解析归档与应用）
 * 状态机复用 domain/stateMachine；数据仅存于进程内存，不接真实飞书或数据库。
 * 状态: received -> fetched -> analyzed -> asked -> decided -> archived | applied；failed/expired 终态。
 */
const { canTransition, isTerminal, evaluateTimeout } = require('../domain/stateMachine');

function normalizeLink(raw) {
  return String(raw || '').trim().toLowerCase();
}

function clone(s) { return Object.assign({}, s); }

function createDemoSharePool() {
  const sessions = [];
  let nextId = 1;

  function findOpenByLink(link) {
    const key = normalizeLink(link);
    if (!key) return null;
    return sessions.find(function (s) {
      return s.link_key === key && !isTerminal(s.status) && s.status !== 'failed';
    }) || null;
  }

  /** 创建分享会话；同一链接已有未终态会话时合并（返回 merged）。now 为毫秒时间戳。 */
  function createSession(payload, now) {
    const text = String((payload && payload.input) || '').trim();
    if (!text) return { ok: false, reason: 'missing_input' };
    const type = ['链接', '文本', '外链视频', '文档'].includes(payload.type) ? payload.type : '链接';
    const existing = findOpenByLink(text);
    if (existing) {
      existing.updated_at = now;
      return { ok: true, merged: true, session: clone(existing) };
    }
    // 初始解析为模拟：直接进入 fetched（拿到内容），后续由调用方推进
    const session = {
      id: 'sh' + nextId++,
      input: text,
      type: type,
      link_key: normalizeLink(text),
      status: 'fetched',
      summary: null,
      archive_suggestion: null,
      apply_suggestion: null,
      founder_note: null,
      fail_reason: null,
      created_at: now,
      updated_at: now
    };
    sessions.push(session);
    return { ok: true, merged: false, session: clone(session) };
  }

  function get(id) {
    return sessions.find(function (s) { return s.id === id; }) || null;
  }

  /** 推进状态；to 必须符合统一状态机。 */
  function advance(id, to, now) {
    const s = get(id);
    if (!s) return { ok: false, reason: 'not_found' };
    if (isTerminal(s.status)) return { ok: false, reason: 'terminal_state', from: s.status };
    if (!canTransition(s.status, to)) return { ok: false, reason: 'illegal_transition', from: s.status, to: to };
    s.status = to;
    s.updated_at = now;
    return { ok: true, session: clone(s) };
  }

  /** fetched/analyzed 阶段填写摘要与归档/应用建议（模拟解析产物）。 */
  function attachAnalysis(id, analysis, now) {
    const s = get(id);
    if (!s) return { ok: false, reason: 'not_found' };
    if (s.status !== 'analyzed' && s.status !== 'fetched') return { ok: false, reason: 'invalid_state_for_analysis', from: s.status };
    s.summary = String((analysis && analysis.summary) || '').slice(0, 500) || null;
    s.archive_suggestion = analysis && analysis.archive_suggestion ? String(analysis.archive_suggestion).slice(0, 200) : null;
    s.apply_suggestion = analysis && analysis.apply_suggestion ? String(analysis.apply_suggestion).slice(0, 200) : null;
    if (s.status === 'fetched') s.status = 'analyzed';
    s.updated_at = now;
    return { ok: true, session: clone(s) };
  }

  /** asked → decided：记录创始人意见；decision 为 archive | apply。 */
  function decide(id, decision, note, now) {
    const s = get(id);
    if (!s) return { ok: false, reason: 'not_found' };
    if (s.status !== 'asked') return { ok: false, reason: 'invalid_state_for_decision', from: s.status };
    if (!['archive', 'apply'].includes(decision)) return { ok: false, reason: 'invalid_decision' };
    if (!note || !String(note).trim()) return { ok: false, reason: 'founder_note_required' };
    s.decision = decision;
    s.founder_note = String(note).trim().slice(0, 300);
    s.status = 'decided';
    s.updated_at = now;
    return { ok: true, session: clone(s) };
  }

  /** decided → archived/applied（模拟落库标记，不写真实知识库）。 */
  function finalize(id, now) {
    const s = get(id);
    if (!s) return { ok: false, reason: 'not_found' };
    if (s.status !== 'decided') return { ok: false, reason: 'invalid_state_for_finalize', from: s.status };
    const to = s.decision === 'apply' ? 'applied' : 'archived';
    if (!canTransition(s.status, to)) return { ok: false, reason: 'illegal_transition', from: s.status, to: to };
    s.status = to;
    s.updated_at = now;
    return { ok: true, session: clone(s) };
  }

  function fail(id, reason, now) {
    const s = get(id);
    if (!s) return { ok: false, reason: 'not_found' };
    if (isTerminal(s.status)) return { ok: false, reason: 'terminal_state', from: s.status };
    s.status = 'failed';
    s.fail_reason = String(reason || 'unspecified').slice(0, 200);
    s.updated_at = now;
    return { ok: true, session: clone(s) };
  }

  function list() {
    return sessions.map(clone);
  }

  /** 挂起/过期标记：返回超时提示，不自动改状态（显式 advance 触发状态变化）。 */
  function withTimeoutFlags(now) {
    return sessions.map(function (s) {
      const c = clone(s);
      c.timeout_flag = isTerminal(s.status) ? 'terminal' : evaluateTimeout(s.updated_at, now);
      return c;
    });
  }

  return { createSession: createSession, get: get, advance: advance, attachAnalysis: attachAnalysis, decide: decide, finalize: finalize, fail: fail, list: list, withTimeoutFlags: withTimeoutFlags };
}

module.exports = { createDemoSharePool: createDemoSharePool, normalizeLink: normalizeLink };
