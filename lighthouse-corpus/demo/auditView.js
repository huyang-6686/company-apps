'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.auditView = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  function filterAuditEntries(entries, filters) {
    const f = filters || {};
    return (Array.isArray(entries) ? entries : []).filter(function (entry) {
      return (!f.actorId || entry.actor_id === f.actorId)
        && (!f.action || entry.action === f.action)
        && (!f.targetType || entry.target_type === f.targetType);
    });
  }

  function paginateAuditEntries(entries, page, pageSize) {
    const all = Array.isArray(entries) ? entries : [];
    const size = Math.max(1, Number(pageSize) || 10);
    const pageCount = Math.max(1, Math.ceil(all.length / size));
    const safePage = Math.min(Math.max(1, Number(page) || 1), pageCount);
    const start = (safePage - 1) * size;
    return { items: all.slice(start, start + size), page: safePage, pageSize: size, total: all.length, pageCount: pageCount };
  }

  return { filterAuditEntries: filterAuditEntries, paginateAuditEntries: paginateAuditEntries };
}));
