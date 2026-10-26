const state = { view: 'home', nodes: [], notices: [], role: 'founder', auditEntries: [], auditPage: 1, auditFilters: {}, noticeSequence: 0, noticeMessage: '' };

async function init() {
  state.nodes = [
    {id:"n1",title:"创始人分享：行业情报方法论要点",sensitivity:"公开",source:"创始人分享",date:"2026-10-10",summary:"关于行业情报采集口径、来源白名单和发布校验的要点摘录。",tags:["情报","方法论"]},
    {id:"n2",title:"与光工作中台权限标准 v1（模拟）",sensitivity:"内部",source:"工作台下发",date:"2026-09-30",summary:"模拟的工作台角色权限下发样例，仅用于演示权限过滤。",tags:["权限","契约"]},
    {id:"n3",title:"历史资料：叁棱镜项目复盘",sensitivity:"私属",source:"历史租户",date:"2025-06-01",summary:"未迁移历史资料，默认私属，检索不返回标题。",tags:["历史","迁移清单"]},
    {id:"n4",title:"每日新闻：2026-10-17 快讯（模拟）",sensitivity:"内部",source:"情报监测",date:"2026-10-17",summary:"模拟每日新闻条目，展示情报流与个人分享分流。",tags:["新闻","监测"]},
    {id:"n5",title:"百度网盘视频：行业论坛演讲",sensitivity:"受限",source:"百度网盘",date:"2026-08-15",summary:"仅链接+元数据节点，演示受限级别隐藏正文。",tags:["视频","链接节点"]},
    {id:"n6",title:"员工贡献：供应商管理流程建议",sensitivity:"内部",source:"贡献箱",date:"2026-10-14",summary:"模拟员工提交的贡献，进入复核队列展示。",tags:["贡献箱","流程"]}
  ];
  document.querySelectorAll('nav button').forEach(function (b) {
    b.addEventListener('click', function () {
      showView(b.dataset.view);
    });
  });
  const rf = document.getElementById('roleFounder');
  if (rf) rf.classList.add('active');
  render();
}

function sensClass(s) { return 'sens-' + s; }

function setRole(r) {
  state.role = r;
  const f = document.getElementById('roleFounder');
  const s = document.getElementById('roleStaff');
  if (f) f.classList.toggle('active', r === 'founder');
  if (s) s.classList.toggle('active', r === 'staff');
  render();
}
window.setRole = setRole;

function render() {
  const app = document.getElementById('app');
  const views = { home: renderHome, search: renderSearch, pending: renderPending, monitor: renderMonitor, audit: renderAudit, share: renderShare, contribution: renderContribution, scan: renderScan, notices: renderNotices };
  app.innerHTML = views[state.view]();
}

function showView(viewName) {
  const viewNames = ['home', 'search', 'pending', 'monitor', 'audit', 'share', 'contribution', 'scan', 'notices'];
  if (!viewNames.includes(viewName)) return;
  state.view = viewName;
  document.querySelectorAll('nav button').forEach(function (button) {
    button.classList.toggle('active', button.dataset.view === viewName);
  });
  render();
}

// 通知板块：五 tab（未读/待办/已处理/逾期/全部），模拟与光推送的本地通知，不含飞书真实发送
function renderNotices() {
  if (!state.notices.length) {
    state.notices = [
      { id: 'no1', type: 'task_assigned', title: '资料归档任务：叁棱镜项目复盘', status: 'unread', due_at: '2026-10-22', dedup_key: 'k1', tenant: '轻立方', deep_link: '#/pending' },
      { id: 'no2', type: 'intel_alert', title: '情报提醒：行业报告新版本', status: 'unread', due_at: null, dedup_key: 'k2', tenant: '轻立方', deep_link: '#/monitor' },
      { id: 'no3', type: 'contribution_review', title: '贡献复核：供应商管理流程建议', status: 'pending', due_at: '2026-10-25', dedup_key: 'k3', tenant: '轻立方', deep_link: '#/contribution' },
      { id: 'no4', type: 'task_assigned', title: '资料归档任务：旧版分享目录', status: 'processed', due_at: null, dedup_key: 'k4', tenant: '轻立方', deep_link: '#/pending' },
      { id: 'no5', type: 'task_assigned', title: '资料归档任务：过期旧条目', status: 'expired', due_at: '2026-10-15', dedup_key: 'k5', tenant: '轻立方', deep_link: '#/pending' },
      { id: 'no6', type: 'intel_alert', title: '情报提醒：另一条新闻推送', status: 'unread', due_at: null, dedup_key: 'k6', tenant: '与光', deep_link: '#/monitor' }
    ];
  }
  const typeLabel = { task_assigned: '任务', intel_alert: '情报', contribution_review: '贡献复核' };
  const statusLabel = { unread: '未读', pending: '待办理', processed: '已处理', expired: '逾期' };
  const statusColor = { unread: '#79c0ff', pending: '#d29922', processed: '#7ee787', expired: '#f85149' };
  let html = '<div class="card"><h3>通知板块（模拟本地通知，未接飞书机器人）</h3>';
  html += '<div class="meta">按规范：来源应用自有机器人发送；本页只展示灯塔侧通知，不代发与光通知。</div>';
  html += '<button onclick="receiveSampleNotice()" style="margin-top:8px;padding:4px 10px;border:1px solid #33475b;border-radius:6px;background:#16283c;color:#c9d6e2;cursor:pointer">接收模拟归档通知</button> '
    + '<button onclick="loadNotices()" style="margin-top:8px;padding:4px 10px;border:1px solid #33475b;border-radius:6px;background:#16283c;color:#c9d6e2;cursor:pointer">刷新</button></div>';
  const tabs = ['unread', 'pending', 'processed', 'expired', 'all'];
  html += '<div class="tabs" style="display:flex;gap:8px;margin:12px 0">';
  tabs.forEach(function (t) {
    const label = t === 'all' ? '全部' : statusLabel[t];
    html += '<button data-tab="' + t + '" style="padding:6px 12px;border:1px solid #33475b;border-radius:6px;background:' + (state.noticeTab === t ? '#16283c' : 'none') + ';color:#c9d6e2;cursor:pointer" onclick="setNoticeTab(\'' + t + '\')">' + label + '</button>';
  });
  html += '</div>';
  const tab = state.noticeTab || 'unread';
  const list = tab === 'all' ? state.notices : state.notices.filter(function (n) { return n.status === tab; });
  if (!list.length) {
    html += '<div class="card"><div class="meta">该 tab 下暂无通知</div></div>';
  }
  list.forEach(function (n) {
    html += '<div class="card"><h3>' + typeLabel[n.type] + ' · ' + n.title + '</h3>';
    html += '<div class="meta">状态：<span style="color:' + statusColor[n.status] + '">' + statusLabel[n.status] + '</span> · 租户：' + n.tenant + ' · 截止：' + (n.due_at || '无') + ' · 去重键：' + n.dedup_key + '</div>';
    html += '<div class="meta">深链：<a href="#' + n.deep_link + '" style="color:#79c0ff">' + n.deep_link + '</a></div>';
    if (n.status === 'unread') html += '<button onclick="updateNoticeStatus(\'' + n.dedup_key + '\', \'pending\')">转为待办理</button> ';
    if (n.status === 'pending') html += '<button onclick="updateNoticeStatus(\'' + n.dedup_key + '\', \'processed\')">标记已处理</button> ';
    if (n.status === 'expired') html += '<button onclick="updateNoticeStatus(\'' + n.dedup_key + '\', \'pending\')">重新打开</button> ';
    html += '</div>';
  });
  if (state.noticeMessage) html += '<p class="meta">' + state.noticeMessage + '</p>';
  return html;
}

async function loadNotices() {
  try {
    const resp = await fetch('/api/workbench/notices-demo');
    const data = await resp.json();
    if (Array.isArray(data.notices)) {
      state.notices = data.notices.map(function (n) { return Object.assign({}, n); });
      render();
    }
  } catch (e) { /* 接口不可用时保留本地 mock */ }
}

async function postNoticeEvent(event) {
  const response = await fetch('/api/workbench/notices-demo/events', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.result && data.result.reason || data.error || 'event_rejected');
  return data.result;
}

async function receiveSampleNotice() {
  state.noticeSequence += 1;
  const suffix = Date.now() + '-' + state.noticeSequence;
  try {
    await postNoticeEvent({
      event_type: 'notification.created', event_id: 'demo-created-' + suffix,
      payload: {
        user_id: 'demo-user-1', tenant_id: 'lightcube', type: 'task_assigned',
        title: '模拟归档任务：' + suffix, deep_link: '/pending', due_at: null,
        dedup_key: 'demo-created-key-' + suffix, source_ref: { demo: true }
      }
    });
    state.noticeMessage = '已通过 notification.created 接收模拟通知';
    await loadNotices();
  } catch (error) {
    state.noticeMessage = '事件接收失败：' + error.message;
    render();
  }
}
window.receiveSampleNotice = receiveSampleNotice;

async function updateNoticeStatus(dedupKey, status) {
  state.noticeSequence += 1;
  try {
    const result = await postNoticeEvent({
      event_type: 'notification.updated', event_id: 'demo-updated-' + Date.now() + '-' + state.noticeSequence,
      payload: { dedup_key: dedupKey, status: status }
    });
    state.noticeMessage = '状态已更新：' + result.from + ' → ' + result.to;
    await loadNotices();
  } catch (error) {
    state.noticeMessage = '状态更新失败：' + error.message;
    render();
  }
}
window.updateNoticeStatus = updateNoticeStatus;

function setNoticeTab(tab) {
  state.noticeTab = tab;
  render();
}

function renderHome() {
  const total = state.nodes.length;
  const bySens = {};
  state.nodes.forEach(function (n) { bySens[n.sensitivity] = (bySens[n.sensitivity] || 0) + 1; });
  const pending = state.nodes.filter(function (n) { return n.sensitivity === '受限' || n.sensitivity === '私属'; });
  const recent = state.nodes.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 3);
  let html = '<div class="stat">'
    + '<div><b>' + total + '</b>知识节点</div>'
    + '<div><b>' + (bySens['公开'] || 0) + '</b>公开</div>'
    + '<div><b>' + (bySens['内部'] || 0) + '</b>内部</div>'
    + '<div><b>' + (bySens['受限'] || 0) + '</b>受限</div>'
    + '<div><b>' + (bySens['私属'] || 0) + '</b>私属</div>'
    + '</div>';
  html += '<div class="card"><h3>采集解析建议（模拟）</h3>'
    + '<div>· 今日已采集 3 条来源，解析成功率 100%</div>'
    + '<div>· 2 条情报建议置顶到个人检索页</div>'
    + '<div>· 1 个来源目录超出白名单，已跳过</div></div>';
  html += '<div class="card"><h3>待确认（' + pending.length + '）</h3>';
  pending.forEach(function (n) {
    html += '<div class="meta">' + n.title + ' · ' + n.sensitivity + ' · 创始人自行执行</div>';
  });
  html += '</div>';
  html += '<div class="card"><h3>最近归档</h3>';
  recent.forEach(function (n) {
    html += '<div class="meta"><span class="' + sensClass(n.sensitivity) + '">' + n.sensitivity + '</span> · ' + n.title + ' · ' + n.date + '</div>';
  });
  html += '</div>';
  html += '<div class="card"><h3>三库定位（模拟）</h3>'
    + '<div class="meta">飞书资料库：方案、文档、合同、文件、logo 和小图标；不存视频正文</div>'
    + '<div class="meta">本地素材库：运行态与临时素材，后续可按清单清理</div>'
    + '<div class="meta">百度网盘成果库：成品视频与素材，对外分享使用可鉴权共享链接</div></div>';
  return html
    + '<div class="demo-note">所有数据为模拟数据，不连接真实接口；权限过滤规则按设计稿 2.4 分级矩阵在检索视图中演示。</div>';
}

function renderSearch() {
  const sources = [...new Set(state.nodes.map(function (n) { return n.source; }))];
  const tags = [...new Set(state.nodes.flatMap(function (n) { return n.tags; }))];
  let filterHtml = '<div style="margin-bottom:10px"><b>筛选：</b> '
    + '来源 <select id="fSource" onchange="doSearch(document.getElementById(&quot;q&quot;).value)"><option value="">全部</option>'
    + sources.map(function (s) { return '<option>' + s + '</option>'; }).join('')
    + '</select> '
    + '级别 <select id="fSens" onchange="doSearch(document.getElementById(&quot;q&quot;).value)"><option value="">全部</option>'
    + ['公开','内部','受限','私属'].map(function (s) { return '<option>' + s + '</option>'; }).join('')
    + '</select> '
    + '标签 <select id="fTag" onchange="doSearch(document.getElementById(&quot;q&quot;).value)"><option value="">全部</option>'
    + tags.map(function (t) { return '<option>' + t + '</option>'; }).join('')
    + '</select></div>';
  return filterHtml
      + '<input class="search" id="q" placeholder="输入关键词检索（调 /search-demo 内置示例集）" oninput="doSearch(this.value)">'
    + '<div id="results"></div>'
    + '<div class="card"><h3>知识导航（沿用旧分类树，模拟）</h3>'
    + '<div class="meta">行业情报 / 运营管理 / 供应链 / 组织制度</div>'
    + '<div class="meta">展示层按权限过滤；扫描后只生成分类补充、合并和层级调整建议，不自动改动分类树。</div></div>'
    + '<div class="demo-note">演示说明：私属节点不返回标题；受限节点隐藏正文只显示标题和级别；检索、问答引用、附件下载和导出共用同一套分级判定（真实实现为服务端过滤）。</div>';
}

async function doSearch(q) {
  const box = document.getElementById('results');
  const fS = document.getElementById('fSource') ? document.getElementById('fSource').value : '';
  const fSe = document.getElementById('fSens') ? document.getElementById('fSens').value : '';
  const fT = document.getElementById('fTag') ? document.getElementById('fTag').value : '';
  if (!q && !fS && !fSe && !fT) { box.innerHTML = ''; return; }
  let results = [];
  try {
    const resp = await fetch('/api/workbench/search-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useSample: true, query: q.trim(), permissions: state.role === 'founder' ? ['public','internal','restricted','private'] : ['public'] })
    });
    const data = await resp.json();
    results = Array.isArray(data.results) ? data.results : [];
  } catch (e) {
    box.innerHTML = '<p class="meta">检索接口不可用：' + e.message + '</p>';
    return;
  }
  const kw = q.trim().toLowerCase();
  let html = '';
  const seMap = { public: '公开', internal: '内部', restricted: '受限', private: '私属' };
  results.forEach(function (n) {
    const tags = n.tags || [];
    const kwMatch = !kw || (n.title || '').toLowerCase().includes(kw) || tags.some(function (t) { return t.toLowerCase().includes(kw); });
    const sMatch = !fS || n.source_type === fS;
    const seMatch = !fSe || seMap[n.sensitivity] === fSe;
    const tMatch = !fT || tags.includes(fT);
    if (!kwMatch || !sMatch || !seMatch || !tMatch) return;
    const body = n.sensitivity === 'restricted'
      ? '<span class="hidden-node">[受限内容] 正文与附件按分级矩阵隐藏</span>'
      : (n.summary || '');
    const tagHtml = tags.map(function (t) { return '<span class="tag">#' + t + '</span>'; }).join('');
    html += '<div class="card">'
      + '<h3>' + n.title + '</h3>'
      + '<div class="meta"><span class="' + sensClass(seMap[n.sensitivity]) + '">' + seMap[n.sensitivity] + '</span> · ' + n.source_type + '</div>'
      + '<div>' + body + '</div>'
      + '<div style="margin-top:6px">' + tagHtml + '</div>'
      + '</div>';
  });
  box.innerHTML = html || '<p>无匹配结果（服务端过滤后为空）。</p>';
}


window.doSearch = doSearch;

// ---- share→archive state machine（服务端 /api/workbench/share-demo，进程内模拟存储）----
let shareLoaded = false;
const shareFallback = [
  { id:'s1', input:'（后端不可用，示例）链接：某行业报告文档', type:'文档', status:'analyzed', timeout_flag:'normal', summary:'示例摘要', archive_suggestion:'行业情报 / 外部分享' }
];
const statusFlow = ['received','fetched','analyzed','asked','decided','archived/applied'];
const timeoutLabel = { normal: '正常', pending_reminder: '挂起提醒(24h+)', expired: '已过期(7d+)', terminal: '终态' };

async function loadShare() {
  try {
    const resp = await fetch('/api/workbench/share-demo');
    const data = await resp.json();
    if (Array.isArray(data.sessions)) { state.shareSessions = data.sessions; shareLoaded = true; }
  } catch (e) { state.shareSessions = shareFallback; shareLoaded = false; }
}

function renderShare() {
  if (!state.shareSessions) state.shareSessions = shareFallback;
  let html = '<h2>分享 → 归档/应用 流程（服务端模拟存储）</h2>'
    + '<p class="meta">统一会话状态机：received → fetched → analyzed → asked → decided → archived/applied；failed/expired 终态；超 24h 挂起提醒，7 天未处理标记 expired。数据存于服务端进程内存，不接真实飞书。</p>';
  html += '<div class="card"><h3>模拟提交入口</h3><div>'
    + '<select id="shType"><option>链接</option><option>文本</option><option>文档</option><option>外链视频</option></select> '
    + '<input id="shInput" placeholder="粘贴链接或输入文本" style="width:50%"> '
    + '<button onclick="submitShare()">提交分享</button>'
    + (shareLoaded ? '' : ' <span class="meta" style="color:#f85149">后端不可用，显示示例数据</span>')
    + '</div><div class="meta" style="margin-top:6px">重复提交同一链接自动合并到现有会话。</div></div>';
  html += window.renderShareCards(state.shareSessions);
  html += '<div class="demo-note">演示说明：归档建议和应用建议分别生成；只有创始人明确表达意图才推进 decided → archived/applied；本页不写真实知识库。</div>';
  return html;
}

async function submitShare() {
  const input = document.getElementById('shInput');
  const type = document.getElementById('shType');
  if (!input || !input.value.trim()) return;
  try {
    await fetch('/api/workbench/share-demo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: input.value.trim(), type: type.value })
    });
    input.value = '';
  } catch (e) { /* 后端不可用时不破坏当前页面 */ }
  await loadShare();
  showView('share');
}
window.submitShare = submitShare;

async function shareAdvance(id, to) {
  try { await fetch('/api/workbench/share-demo/' + id + '/advance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: to }) }); } catch (e) {}
  await loadShare();
  showView('share');
}
window.shareAdvance = shareAdvance;

async function shareDecide(id) {
  const note = document.getElementById('note-' + id);
  const dec = document.getElementById('dec-' + id);
  try {
    const resp = await fetch('/api/workbench/share-demo/' + id + '/decide', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: dec.value, note: note.value })
    });
    if (!resp.ok) { const d = await resp.json(); alert('决定失败：' + d.error); return; }
  } catch (e) { return; }
  await loadShare();
  showView('share');
}
window.shareDecide = shareDecide;

async function shareFinalize(id) {
  try { await fetch('/api/workbench/share-demo/' + id + '/finalize', { method: 'POST' }); } catch (e) {}
  await loadShare();
  showView('share');
}
window.shareFinalize = shareFinalize;

function renderPending() {
  const pend = state.nodes.filter(function (n) { return n.sensitivity === '受限' || n.sensitivity === '私属'; });
  let html = '<h2>待确认清单（模拟）</h2>'
    + '<p>迁移/删除/保留清单仅为执行参考，整个体系不参与 OA；创始人按清单自行操作，灯塔记录结果反馈。</p>';
  pend.forEach(function (n) {
    html += '<div class="card"><h3>' + n.title + '</h3><div class="meta">' + n.sensitivity + ' · ' + n.source + ' · ' + n.date + '</div></div>';
  });
  return html;
}

function renderMonitor() {
  let html = '<h2>情报监测（模拟）</h2>'
    + '<h3>监测关键词配置</h3>'
    + '<div class="card"><div>'
    monitorKeywords.forEach(function (k, i) {
      html += '<span class="tag">' + k + '</span> ';
    });
    html += '<input id="newKw" placeholder="新增关键词" style="margin-left:8px"> <button onclick="addKeyword()">添加</button>'
    + '<div class="meta" style="margin-top:8px">演示：关键词仅创始人可配置；命中后进入情报流并按来源校验。</div></div></div>'
    + '<div class="card"><h3>每日新闻 2026-10-17</h3><div class="meta">内部 · 情报监测</div><div>模拟条目：展示独立内容流与个人分享分流。</div></div>'
    + '<div class="card"><h3>告警</h3><div class="meta">当日无产出 / 周报缺失 / 推送失败 / 校验不通过</div><div>演示四类告警占位。</div></div>'
    + '<div class="demo-note">真实实现：命名红线词典 + 实体白名单 + 来源必填 + 日期唯一 + 幂等键；跨租户推送经工作台批准路由。</div>';
  return html;
}

const monitorKeywords = ['行业报告', '竞品动态', '供应链', '门店运营', '咖啡烘焙'];
function addKeyword() {
  const input = document.getElementById('newKw');
  if (input && input.value.trim()) { monitorKeywords.push(input.value.trim()); input.value = ''; }
  showView('monitor');
}
window.addKeyword = addKeyword;

// ---- contribution box demo ----
const contributions = [
  { id:'c1', from:'员工A', type:'链接', content:'某供应商管理系统介绍页', status:'待复核', note:'已解析，质量分 82' },
  { id:'c2', from:'员工B', type:'文本', content:'建议把每周例会纪要模板沉淀到知识库', status:'已采纳', note:'创始人标记采纳，进入编辑队列' }
];

function renderContribution() {
  let html = '<h2>贡献箱（模拟）</h2>'
    + '<p>员工经飞书私聊机器人提交链接/文本/文件；系统自动解析、去重、分类、质量评估；合格内容进入复核队列。整个体系不参与 OA，复核只判断内容质量。</p>'
    + '<div class="card"><h3>模拟提交入口</h3><div>'
    + '<select id="cType"><option>链接</option><option>文本</option><option>文件</option></select> '
    + '<input id="cContent" placeholder="输入内容或链接" style="width:50%"> '
    + '<button onclick="submitContribution()">提交</button></div>'
    + '<div class="meta" style="margin-top:6px">演示：重复链接自动合并；闲聊/非工作内容不入库。</div></div>';
  contributions.forEach(function (c) {
    html += '<div class="card"><h3>' + c.type + '：' + c.content + '</h3>'
      + '<div class="meta">提交人 ' + c.from + ' · ' + c.status + ' · ' + c.note + '</div></div>';
  });
  return html;
}

function submitContribution() {
  const type = document.getElementById('cType').value;
  const content = document.getElementById('cContent').value.trim();
  if (content) {
    contributions.unshift({ id:'c' + (contributions.length + 1), from:'当前用户（模拟）', type: type, content: content, status:'待复核', note:'已进入解析队列（模拟）' });
    document.getElementById('cContent').value = '';
  }
  showView('contribution');
}
window.submitContribution = submitContribution;

// ---- scan batch progress demo ----
const scanBatches = [
  { id:'b1', source:'历史租户·叁棱镜', total:340, done:340, failed:6, status:'已完成', date:'2026-10-16' },
  { id:'b2', source:'本地素材库', total:520, done:312, failed:4, status:'进行中', date:'2026-10-18' },
  { id:'b3', source:'百度网盘·成果视频', total:96, done:0, failed:0, status:'待执行', date:'2026-10-19' }
];

function renderScan() {
  let html = '<h2>扫描批次（模拟）</h2>'
    + '<p class="meta">每批上限 200 文件；执行前后保存原路径、目标路径、理由、批次和恢复信息；批次级校验含文件数、哈希抽检、权限快照比对。</p>';
  html += '<div class="card"><h3>节点基线校验（POST /api/workbench/parse-baseline）</h3>';
  html += '<p class="meta">粘贴 nodes_v2.jsonl 文本，或选择本地 .jsonl 文件，后端会做逐行校验和批次报告。本接口不写库。</p>';
  html += '<input type="file" id="baselineFile" accept=".jsonl,.json,.txt" style="margin-bottom:8px" onchange="readBaselineFile(this)">';
  html += '<textarea id="baselineText" rows="6" style="width:100%;background:#101c2b;color:#e6edf3;border:1px solid #33475b;border-radius:6px;padding:8px;font-family:monospace"></textarea>';
  html += '<button onclick="runBaselineCheck()" style="margin-top:8px;padding:6px 14px;border:1px solid #33475b;border-radius:6px;background:#16283c;color:#e6edf3;cursor:pointer">校验基线</button>';
  html += '<div id="baselineResult" style="margin-top:12px;font-size:13px;color:#c9d6e2"></div></div>';
  scanBatches.forEach(function (b) {
    const pct = Math.round(b.done / b.total * 100);
    const barColor = b.status === '已完成' ? '#4a9' : b.status === '进行中' ? '#59f' : '#666';
    html += '<div class="card"><h3>' + b.source + ' · ' + b.status + '</h3>'
      + '<div class="meta">' + b.date + ' · 总数 ' + b.total + ' · 已处理 ' + b.done + ' · 失败 ' + b.failed + '</div>'
      + '<div style="background:#16283c;border-radius:4px;height:12px;margin:8px 0"><div style="background:' + barColor + ';width:' + pct + '%;height:12px;border-radius:4px"></div></div>'
      + '<div class="meta">' + pct + '%</div></div>';
  });
  html += '<div class="card"><h3>分类整理建议（模拟）</h3>'
    + '<div class="meta">建议：将“行业论坛演讲”补充到“行业情报 / 外部分享”分支</div>'
    + '<div class="meta">建议：合并重复的“供应商流程”叶节点，保留原节点引用</div>'
    + '<div class="meta">状态：待创始人确认；系统不会自动修改沿用的旧分类树</div></div>';
  html += '<div class="demo-note">演示说明：失败项保留原因供下次重试；迁移/删除操作由创始人按清单自行执行，灯塔只记录结果反馈。云盘删除同步进回收站保留 30 天。</div>';
  return html;
}

function readBaselineFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    document.getElementById('baselineText').value = String(reader.result || '').slice(0, 5000000);
  };
  reader.readAsText(file);
}

async function runBaselineCheck() {
  const text = document.getElementById('baselineText').value.trim();
  const out = document.getElementById('baselineResult');
  if (!text) { out.textContent = '请先粘贴 JSONL 文本或选择文件'; return; }
  try {
    const resp = await fetch('/api/workbench/parse-baseline', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: text });
    const data = await resp.json();
    if (data.error) { out.textContent = '错误：' + data.error; return; }
    const r = data.report;
    let s = '共 ' + r.total + ' 行 · 有效 ' + r.valid + ' · 无效 ' + r.invalid;
    if (r.errors.length) {
      s += '<br><span style="color:#f85149">错误明细：</span>';
      r.errors.slice(0, 10).forEach(function (e) { s += '<br>· 行 ' + e.lineNo + ': ' + e.errors.join('; '); });
      if (r.errors.length > 10) s += '<br>… 其余 ' + (r.errors.length - 10) + ' 条省略';
    } else {
      s += '<br><span style="color:#7ee787">全部通过，未发现错误</span>';
    }
    out.innerHTML = s;
  } catch (e) {
    out.textContent = '请求失败：' + e.message;
  }
}

function renderAudit() {
  const entries = state.auditEntries || [];
  const filters = state.auditFilters || {};
  const filtered = window.auditView ? window.auditView.filterAuditEntries(entries, filters) : entries;
  const paged = window.auditView ? window.auditView.paginateAuditEntries(filtered, state.auditPage, 2) : { items: filtered, page: 1, pageSize: filtered.length || 1, total: filtered.length, pageCount: 1 };
  const actors = [...new Set(entries.map(function (e) { return e.actor_id; }))];
  const actions = [...new Set(entries.map(function (e) { return e.action; }))];
  const targetTypes = [...new Set(entries.map(function (e) { return e.target_type; }))];
  let html = '<h2>审计留痕（模拟）</h2>'
    + '<p>演示字段：操作者、时间、动作（检索拒绝/归档/权限变更/导出）、级别、依据、结果。</p>'
    + '<div class="card"><button onclick="loadAudit()" style="padding:4px 10px;border:1px solid #33475b;border-radius:6px;background:#16283c;color:#c9d6e2;cursor:pointer">刷新（读 /audit-demo）</button>'
    + ' <select id="auditActor" onchange="setAuditFilter(\'actorId\', this.value)"><option value="">全部操作者</option>' + actors.map(function (a) { return '<option value="' + a + '"' + (filters.actorId === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select>'
    + ' <select id="auditAction" onchange="setAuditFilter(\'action\', this.value)"><option value="">全部动作</option>' + actions.map(function (a) { return '<option value="' + a + '"' + (filters.action === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select>'
    + ' <select id="auditTargetType" onchange="setAuditFilter(\'targetType\', this.value)"><option value="">全部目标</option>' + targetTypes.map(function (a) { return '<option value="' + a + '"' + (filters.targetType === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select></div>'
    + '<div id="auditList">';
  paged.items.forEach(function (e) {
    html += '<div class="card"><div class="meta">' + e.created_at + ' · ' + e.actor_id + ' · ' + e.action + ' · ' + e.target_type + ':' + e.target_id + '</div><div>' + JSON.stringify(e.detail) + '</div></div>';
  });
  html += paged.items.length ? '</div>' : '<p class="meta">暂无匹配审计记录</p></div>';
  html += '<div class="meta">共 ' + paged.total + ' 条 · 第 ' + paged.page + ' / ' + paged.pageCount + ' 页 '
    + '<button onclick="changeAuditPage(-1)" ' + (paged.page <= 1 ? 'disabled' : '') + '>上一页</button> '
    + '<button onclick="changeAuditPage(1)" ' + (paged.page >= paged.pageCount ? 'disabled' : '') + '>下一页</button></div>'
    + '<div class="card"><h3>结构化字段（与后端 audit_log 表对齐）</h3>'
    + '<div class="meta">actor_id · action · target_type · target_id · detail（JSON） · created_at</div>'
    + '<div class="meta">当前 server/src/services/audit.js 已实现 writeAudit / readAudit，真实数据等数据库部署。</div></div>'
    + '<div class="card"><h3>示例记录</h3><div class="meta">2026-10-18 09:00 · 创始人 · 归档 · 公开 · 成功</div><div>演示一条追加写入的审计记录。</div></div>'
    + '<div class="demo-note">真实实现：审计日志追加写入、防篡改、含拒绝码，覆盖归档、迁移、删除、权限变更、检索拒绝、脱敏、问答引用和跨应用交付。</div>';
  return html;
}

async function loadAudit() {
  const box = document.getElementById('auditList');
  if (!box) return;
  try {
    const resp = await fetch('/api/workbench/audit-demo');
    const data = await resp.json();
    state.auditEntries = Array.isArray(data.entries) ? data.entries : [];
    state.auditPage = 1;
    render();
  } catch (e) {
    box.innerHTML = '<p class="meta">审计接口不可用：' + e.message + '</p>';
  }
}

function setAuditFilter(key, value) {
  state.auditFilters[key] = value;
  state.auditPage = 1;
  render();
}
window.setAuditFilter = setAuditFilter;

function changeAuditPage(delta) {
  state.auditPage = Math.max(1, state.auditPage + delta);
  render();
}
window.changeAuditPage = changeAuditPage;

loadShare();
init();
