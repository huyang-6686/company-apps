(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.escapeHtml = factory().escapeHtml;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderActions(session) {
    // Session IDs also enter inline JavaScript string literals. HTML escaping
    // alone is insufficient there, so accept only the server's generated ID form.
    if (!/^sh[0-9]+$/.test(String(session.id || ''))) return '';
    var id = escapeHtml(session.id);
    var html = '<div style="margin-top:8px">';
    if (session.status === 'analyzed') html += '<button onclick="shareAdvance(\'' + id + '\',\'asked\')">追问创始人</button> ';
    if (session.status === 'asked') html += '<input id="note-' + id + '" placeholder="创始人意见（必填）" style="width:40%"> '
      + '<select id="dec-' + id + '"><option value="archive">归档</option><option value="apply">应用</option></select> '
      + '<button onclick="shareDecide(\'' + id + '\')">确认</button> ';
    if (session.status === 'decided') html += '<button onclick="shareFinalize(\'' + id + '\')">落库（' + escapeHtml(session.decision === 'apply' ? 'applied' : 'archived') + '）</button> ';
    return html + '</div>';
  }

  function renderShareCards(sessions) {
    var statusFlow = ['received', 'fetched', 'analyzed', 'asked', 'decided', 'archived/applied'];
    var timeoutLabel = { normal: '正常', pending_reminder: '挂起提醒(24h+)', expired: '已过期(7d+)', terminal: '终态' };
    return (Array.isArray(sessions) ? sessions : []).map(function (session) {
      var idx = statusFlow.indexOf(session.status);
      var flowHtml = statusFlow.map(function (status, i) {
        return '<span class="' + (i <= idx ? 'tag' : 'tag dim') + '">' + escapeHtml(status) + '</span>';
      }).join(' → ');
      if (['failed', 'expired'].includes(session.status)) {
        flowHtml = '<span class="tag" style="color:#f66">' + escapeHtml(session.status) + '</span>';
      }
      return '<div class="card"><h3>' + escapeHtml(session.type) + '：' + escapeHtml(session.input) + '</h3>'
        + '<div class="meta">' + flowHtml + ' · 超时：' + escapeHtml(timeoutLabel[session.timeout_flag] || session.timeout_flag) + '</div>'
        + (session.summary ? '<div>摘要：' + escapeHtml(session.summary) + '</div>' : '')
        + (session.archive_suggestion ? '<div class="meta">归档建议：' + escapeHtml(session.archive_suggestion) + '</div>' : '')
        + (session.apply_suggestion ? '<div class="meta">应用建议：' + escapeHtml(session.apply_suggestion) + '</div>' : '')
        + renderActions(session) + '</div>';
    }).join('');
  }

  return { escapeHtml: escapeHtml, renderShareCards: renderShareCards };
}));
