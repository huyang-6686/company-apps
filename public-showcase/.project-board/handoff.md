# 星窗工作台项目交接

- 交接时间：2026-10-21（Asia/Shanghai，完整交接，含局域网端口配置收尾）
- 项目绝对路径：`E:\company-apps\public-showcase`
- 当前分支：`main`
- 最近提交：`b3f60e1 chore: record baseline verification`；`b2fcb6c chore: establish git baseline`；`3e68854 chore: add progress tracking rules and board`；`1a86de0 chore: establish git collaboration baseline`
- 当前阶段：阶段0「恢复项目事实与确认规范」已核对；旧阶段3「方案整理 / 审阅意见裁定」按 v1.1 映射为阶段1「需求澄清与设计」收尾。幂等留存范围已裁定；未进入阶段3 Demo，未开始功能编码。

## 已验证事实

- 已读取 `AGENTS.md`、`docs/COLLABORATION.md`、`.project-board/` 四份进度文件、`phase3-plan.md`，并核对 `git status` 与 `git log`。
- 本轮裁定（2026-10-21，用户逐项确认）：
  - 内容删除后永久幂等记录最小留存范围：保留幂等键、来源应用ID、来源内容ID、来源版本号、最终状态（已接收/处理中/已拒绝/已完成）、首次接收时间、载荷哈希、原回执引用（星窗内容编号+版本号）；不含载荷正文、附件、展示字段。载荷哈希支撑永久执行「同键不同载荷→冲突拒绝」。
  - 载荷已随内容删除后，来源用原键+原载荷重试：返回原回执引用（星窗内容编号、版本号、当前状态），不返回原载荷内容。
- 上述裁定已写入 `state.json`、`board.md`、`events.jsonl`、本文件；`git diff --check` 无问题；`state.json` 与 `events.jsonl`（79 行）解析通过。
- Git 基线（2026-10-21 已建立）：`b2fcb6c chore: establish git baseline` 纳入进度板四件套、`phase3-plan.md` 和 `historical documents/`（三份文档 + 两个未解压 ZIP）；`b3f60e1` 记录基线复核。提交前完成敏感信息扫描（可见文本无密钥模式）、空白检查、`.gitignore` 覆盖确认。未执行 push。
- 本轮四份进度文件存在未提交修改（幂等裁定记录）：`git add`+`commit` 两次被自动审批系统拦截（审批服务返回错误，非内容不安全）；裁定内容已保存在工作区，未丢失。
- 本轮再次尝试提交，Git 报 `.git/index.lock: Permission denied`；检查显示当前沙箱对 `.git` 目录及 index 无写权限。未删除锁文件、未改变 Git 配置或绕过权限。
- 工作区状态：`main`；仅 `.project-board/board.md`、`events.jsonl`、`handoff.md`、`state.json` 有修改；无其他未跟踪文件。`historical documents/` 与 `phase3-plan.md` 已在基线提交中，未再修改。
- 当前仓库无应用源码或测试文件；未运行功能测试，不能报告功能通过或失败。未解压历史压缩包。
- `phase3-plan.md` SHA256：`348A9C46E6A98D759B2A825F9F11C77F629BECB8CDD3F5BDCD7091DFF3E5BAB5`（2026-10-21 复核，仍是旧草案，未获准修改）。

## 关键决策与硬约束（累计确认，按最新覆盖旧记录）

- 星窗定位：纯展示工具层应用，轻立方租户承载，应用组织归品牌部；网盘映射「中台网盘 / 品牌部 / 星窗工作台」；不承担业务归档。
- 星窗是唯一公网出口，只接收来源应用审核且脱敏的内容；不复用内部管理接口、不内建 OA、不直连外部大模型、不直读其他应用数据库、不擅自注册飞书应用。
- 不做全量组织/角色同步；用统一组织架构与员工 ID，仅维护管理登录、身份断言、项目参与关系所需最小映射；不建第二套主数据。
- 生命周期只保留：已接收、已发布、已撤回、已下线、已到期；链接绑定内容版本，新版本须重新审核，旧链接不切换不复活。
- 展示导航：1 级来源应用、2 级业务归属、3 级分享内容类型；菜单最多 4 级。
- 访问方式：公开链接、密码链接（仅存哈希）、来源身份授权访问；失效统一返回不可用，不披露原因、不自动跳转。
- 撤销/下架时序（统一裁定）：立即阻断访问；副本按约定周期删除，清理前也不可访问。
- 提交合同：统一受控服务身份；校验签名、时间窗、一次性 nonce；静态共享密钥不得为唯一校验；字段白名单合同版本不匹配即拒绝不降级；幂等键+载荷哈希永久留存；同键不同载荷拒绝；新版本用新幂等键并携带来源内容 ID 和来源版本号；版本号唯一严格递增、允许跳号；密钥轮换短期并行、过渡期后旧密钥立即失效；来源身份撤销或密钥疑似泄露立即阻断，恢复须重新注册审批。
- 撤销展示授权时同步删除内容及附属数据；同步日志只留时间、来源、动作最小审计。
- 反馈绑定内容版本，可匿名，联系方式可选；失败保留反馈记录状态不自动改投，不含敏感凭据。
- 公网回执只含批准链接、状态和反馈字段；内部回执细节不对公网暴露。
- 部署原则：公网展示与管理面分离；提交/身份断言接口不对公网开放；HTTPS 必须启用；拓扑与参数后置确认。
- 三份送审规范（组织架构 v1.0、应用搭建结构 v1.1、网盘映射 v3.1）为复核基准，待创始人确认最终版本。
- 敏感信息统一写为 `[REDACTED_SECRET]`；实施前按 `AGENTS.md` 用任务分支与独立 worktree。

## 当前实现与文件状态

- 功能实现：无。仓库仅有进度板、协作规范、`phase3-plan.md` 草案和历史资料目录。
- 本轮已修改（未提交）：`.project-board/handoff.md`、`state.json`、`board.md`、`events.jsonl`。
- 未修改：`phase3-plan.md`、源码、数据库、接口、配置、历史资料。

## 测试结果

- 功能测试：未运行（无功能代码）。
- 已运行检查：`state.json`/`events.jsonl` 解析通过；`git diff --check` 无问题；敏感信息扫描无匹配；`phase3-plan.md` 哈希复核一致。

## 推断与风险

- `phase3-plan.md` 与最新裁定存在文档不一致（草稿状态、生命周期含归档、回执含拒绝原因等旧表述），属待修订风险，未经授权不修改。
- 幂等裁定的提交仍停留在工作区，若在提交前发生其他操作需先重新核对四份文件内容。
- 回执字段、页面、部署等合同缺口仍存在；不能推断接口已存在或端点可达。

## 未知事项与未完成工作

- 是否授权按已确认决策修订 `phase3-plan.md`（优先待决）。
- 来源提交合同：完整载荷字段、错误码、密钥轮换过渡期参数、租户/应用身份映射细节。
- 商务授权范围与撤销规则；身份断言与项目参与关系字段及实时性。
- 六类候选内容与来源应用/业务归属/菜单的逐项映射；系统扫描时机。
- 反馈合同：类型、正文约束、通知入口、留存删除、失败记录操作。
- 部署参数：拓扑、域名、限流/密码策略阈值、缓存、日志留存、备份灾备。
- 三份公司规范的创始人最终确认版本及生效日期。
- 分享链接格式、密码细则、内部登录可见范围的字段与权限映射。

## 下一步

1. 先将本轮四份进度文件的修改提交（建议消息：`docs: record idempotent retention decisions`）；上次提交被审批系统拦截，需重试。
2. 继续一次聚焦一个未决合同问题；建议下一问题：是否授权修订 `phase3-plan.md`，或来源提交合同字段清单。
3. 不制定阶段 4 计划、不编码；`phase3-plan.md` 只有在用户明确同意后才可修改。

## 新对话恢复命令

```powershell
Set-Location 'E:\company-apps\public-showcase'
Get-Content -Raw '.project-board\handoff.md'
Get-Content -Raw '.project-board\state.json'
Get-Content -Raw '.project-board\board.md'
Get-Content -Raw '.project-board\events.jsonl'
Get-Content -Raw '.project-board\phase3-plan.md'
Get-Content -Raw 'AGENTS.md'
Get-Content -Raw 'docs\COLLABORATION.md'
git status -b --porcelain=v1
git log --oneline -6
```

## 交接验证

- 应解析 `state.json` 与 `events.jsonl`，确认本文件包含时间、路径、分支、提交、事实、决策、推断、未知、测试、风险、下一步、恢复命令等章节。
- 重新运行 Git 状态与最近提交检查；确认四份进度文件修改仍在或已提交。
- 功能测试未运行；CTX 未检测；敏感信息统一使用 `[REDACTED_SECRET]`。
## 局域网测试端口配置（2026-10-21，按规范 v1.0 执行）

- 规范：《局域网测试端口与应用目录命名规范-20261021-v1.0》（E:\company-apps\Standard Library\）。
- 目录：public-showcase，与规范一致。
- 固定端口：3004（规范明文分配；覆盖此前临时建议的 3005）。
- 验证地址：http://192.168.0.101:3004
- 启动脚本（待 Demo 初始化时写入 package.json）："start:lan": "npx next start -H 0.0.0.0 -p 3004"
- 启动前端口检查：netstat -ano | findstr :3004 或 Get-NetTCPConnection -LocalPort 3004；被占用即报错，不得换端口。
- 停止方式：运行终端 Ctrl+C；或按端口查 PID 后 taskkill /PID <PID> /F。
- 状态：Demo 未初始化（无 package.json），脚本落地和局域网访问验证为阶段 2/3 待办；端口已核验空闲。

## 本次交接新增（2026-10-21 第二次完整交接）

- 已执行《局域网测试端口与应用目录命名规范-20261021-v1.0》：目录 public-showcase 一致；固定端口 3004（覆盖临时建议的 3005）；端口已核验空闲。
- start:lan 脚本、0.0.0.0 监听、局域网访问验证为阶段 3 Demo 初始化时的待办（当前无 package.json，不虚构验证结果）。
- 用户指示：以规范为准、端口提前准备好、Demo 好了就能用。
- 本轮进度文件提交再次被审批系统拦截（服务错误），四份文件修改保留在工作区。


## 双平台交接卡（2026-10-21，提交 Harness 只读审阅）

- 任务编号：REQ-03 / SPEC-01；负责人：Codex；Harness 角色：只读审阅，不写文件、不提交。
- 分支：main（HEAD b3f60e1）；worktree：暂无（实施阶段才建 .worktrees/，已被 .gitignore 覆盖）。
- 审阅对象：docs/superpowers/specs/2026-10-21-xingchuang-demo-design.md（Demo 设计 spec，用户已在会话确认设计方向）。
- 允许修改目录：无（Harness 只读）；Codex 本轮仅新增 spec 文件与进度记录。
- 审阅重点：模块边界、幂等/撤销/统一不可用规则是否与已确认裁定一致、模拟边界是否显眼、明确不做清单是否遗漏。
- 验收命令（只读）：Get-Content -Raw docs/superpowers/specs/2026-10-21-xingchuang-demo-design.md；git status --short；git log --oneline -4。
- 已知限制：.git 写权限不足导致四份进度文件与 spec 暂无法提交，修改均在工作区；phase3-plan.md 未修改。
- 风险与下一步：Harness 意见回传后由 Codex 修订 spec；确认后进入 writing-plans 与 worktree 隔离开发。

## Spec 修订交接（2026-10-21）

- 对象：`docs/superpowers/specs/2026-10-21-xingchuang-demo-design.md`；Harness 审阅存档保持只读，`phase3-plan.md` 未修改。
- P0：已修复。审核完全移至星窗外来源模拟器；星窗只接收已批准且已脱敏载荷；无审核路由、审核状态或审核拒绝留存。公开内容唯一入口为 `/share/[token]`，无 `/content/[id]` 公开入口，密码链接不进入公开列表。
- P1：已在 spec 中补齐或明确边界：allowlist/模拟签名/时间窗/nonce/schema 与未知字段拒绝；Submission/IdempotencyRecord、规范化哈希、响应矩阵、并发原子性、删除后原键重试；ShareLink、链接级撤销/密码重置/过期；审计、到期重审、缓存、访问模式、服务端 API 权限、反馈、手机端、可操作来源模拟器和测试矩阵。
- P2：已修订状态表述、逻辑网盘路径与未验证边界，区分直接适用规范和仅作边界参考规范，并写明 `.next/`、`.local-data/` 需加入 gitignore 的实施要求、token/密码处理和错误码/`meta.demo` 约束。
- P2 补核：三层展示筛选（来源应用→业务归属→分享内容类型）、README 交付要求、`X-Demo-Contract-Version` 请求头已补入 spec。`.gitignore` 本身未修改，属于实施时待落实项；README 尚未创建，测试/构建未运行。
- 验证：spec 静态检查通过；未运行 Demo、未运行 npm 命令、未部署、未调用真实外部服务。Git 工作区仍有既有四份进度文件修改和新的 spec；Git 提交仍受 `.git/index.lock` 写权限限制。下一步等待用户审阅修订 spec，不进入 writing-plans 或编码。

