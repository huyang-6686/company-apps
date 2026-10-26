'use strict';
/**
 * 统一状态机（2026-10-18 设计确认）
 * 适用于分享、扫描、解析、归档、删除流程。
 * 主链路: received -> fetched -> analyzed -> asked -> decided -> archived | applied
 * failed 为可从任意活动态进入的终态；挂起 24h、过期 7 天规则由调用方按业务传入时间戳判断。
 */

const ACTIVE_STATES = ['received', 'fetched', 'analyzed', 'asked', 'decided'];
const TERMINAL_STATES = ['archived', 'applied', 'failed', 'expired'];
const ALL_STATES = [...ACTIVE_STATES, ...TERMINAL_STATES];

const TRANSITIONS = {
  received: ['fetched', 'failed'],
  fetched: ['analyzed', 'failed'],
  analyzed: ['asked', 'failed'],
  asked: ['decided', 'failed'],
  decided: ['archived', 'applied', 'failed'],
};

function canTransition(from, to) {
  if (!ALL_STATES.includes(from)) return false;
  if (!ALL_STATES.includes(to)) return false;
  return (TRANSITIONS[from] || []).includes(to);
}

function isActive(state) {
  return ACTIVE_STATES.includes(state);
}

function isTerminal(state) {
  return TERMINAL_STATES.includes(state);
}

/**
 * 挂起超 24 小时进入挂起提醒；超 7 天未推进标记 expired。
 * updatedAt 与 now 均为毫秒时间戳。
 */
function evaluateTimeout(updatedAt, now) {
  const elapsedMs = now - updatedAt;
  if (elapsedMs >= 7 * 24 * 60 * 60 * 1000) return 'expired';
  if (elapsedMs >= 24 * 60 * 60 * 1000) return 'pending_reminder';
  return 'normal';
}

module.exports = { ACTIVE_STATES, TERMINAL_STATES, ALL_STATES, TRANSITIONS, canTransition, isActive, isTerminal, evaluateTimeout };
