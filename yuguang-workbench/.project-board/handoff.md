# 与光工作中台 - 交接文档

## 新 OA 体系扫描复盘（2026-10-22）

- 交付：[新OA体系设计方案-2026-扫描复盘版.md](../新OA体系设计方案-2026-扫描复盘版.md)，阶段 1 设计建议稿，尚待负责人确认。
- 推荐首发：1 种应用内支出意向轻审批 + 26 种飞书审批 OA；另有 1 个行政服务受理工单，不计入审批 OA。目标仅覆盖轻立方与与光的内部成员；协会会员登记走外部表单，不列入内部 OA。
- 不建采购申请 OA。预算管控 OA 暂缓，建议先由财务应用维护预算台账与占用核验；预算制度/额度/审批权限确认后再判断是否需要独立 OA。
- 支出意向字段已包含事项用途、完整预计金额、需要使用日期、紧急程度、负责人决定的采购方式、统一采购预计时间、结算渠道及后续 OA 关联；挂账/他人代付登记后结清，不生成付款 OA。
- 证据限制：JSON 206 个模板 `fields` 全为空，不能核实逐 OA 历史字段；报告/摘要与 JSON 删除模板数 50/65 不一致，需 Doubao 解释。建议稿字段是目标设计，不是历史字段映射。
- 本节记录覆盖了下方 2026-10-21 历史快照中的“没有可用扫描结果”表述：当前已收到本地报告和 JSON 并据此完成设计复盘，但没有独立验证 Doubao 原始扫描授权、执行日志或数据完整性。
- 当前未修改现有飞书 OA、未配置飞书、未开发应用或连接外部服务；项目仍处阶段 1，等待负责人审阅模板范围及待定阈值/主体/科目。

**交接时间**：2026-10-21
**项目路径**：`E:\company-apps\yuguang-workbench`
**当前分支**：`main`
**当前 HEAD**：`0a1729a4c6157a9aa324957c1d4a2a37583f553e` — `chore: establish git baseline`

## 本次交接（2026-10-21 22:21 Asia/Shanghai）

### 已验证事实

- 项目根目录由 `git rev-parse --show-toplevel` 确认为 `E:\company-apps\yuguang-workbench`；当前工作目录也是该项目目录。
- 主工作区当前分支为 `main`。实际状态为：四个 `.project-board/` 文件已修改；`.project-board/01-exploration.md`、`.project-board/admin-01-exploration.md`、`.project-board/finance-01-exploration.md`、`historical documents/`、`scripts/build_task_docs.py` 未跟踪。未执行清理、重置或合并。
- 主工作区最近 3 条提交为：`0a1729a chore: establish git baseline`、`22d4e7c chore: record supplier management ownership`、`1219179 chore: update project board handoff`。
- OA spec 位于 `.worktrees/oa-analysis-spec/docs/superpowers/specs/2026-10-21-oa-analysis-demo-design.md`，任务 worktree 分支为 `task/oa-analysis-spec`，当前仍未提交；本次交接未修改该 spec。
- 已读取的当前任务资料：`AGENTS.md`、四个进度板文件、`historical documents/OA分析Demo设计spec审阅-20261021-v1.0.md`、OA spec，以及 `E:\company-apps\Standard Library\应用开发流程规范-20261021-v1.1.md`。执行规范仍是“发布候选稿（待负责人签发）”，不能称为已签发。
- 本轮未运行代码测试、构建、OA 扫描、真实 Doubao/飞书访问或部署。当前仓库没有可运行的 OA 分析实现或真实扫描数据。

### 用户已确认的 OA 设计决策

- 仅分析 2026 年 OA；按 `Asia/Shanghai` 归年，`2026-01-01T00:00:00+08:00` 含、`2027-01-01T00:00:00+08:00` 不含。
- 轻立方与与光是关联租户；轻立方是主体公司；跨租户 OA 只允许“与光发起 → 轻立方审核”，同一实例按发起端计一次。
- 新 OA 体系完成后，两个租户的 OA 分类、模板规则和流程配置保持一致；差异直接判定配置冲突、输出差异并人工修正，不建立人工映射表。
- 与光工作台不反向写入或自动修改飞书 OA；统一体系沟通确认后，由实施人员分别人工修改两个租户的飞书 OA。分析器只读脱敏扫描结果并按批准基线检查一致性。
- Doubao 输出人读报告和固定 JSON；JSON 是校验、关联、去重、统计依据，报告供人工复核。
- 报告出现手机号、邮箱、user_id 等值级敏感内容时，禁用预览并标记 `REPORT_SENSITIVE_BLOCKED`，JSON 统计继续；仅确证凭据形态才整批拒绝。
- 负责人本次确认：`expectedCatalog` 基线同时适用于 `lightcube` 与 `yuguang` 两租户；`required=false` 条目不生成缺失 OA 候选。已更新 OA spec 至 v1.2。
- Demo 只使用脱敏/合成输入，不连接真实服务、不读取生产数据、不修改 OA、不发送通知；端口 `3002`、`start:lan` 和 `0.0.0.0` 监听属于 Demo 完成后的独立联调门禁。

### 当前阶段、未完成事项和阻塞

- 当前阶段：应用开发流程阶段 1「需求澄清与设计」；本次已停止工作，未进入阶段 2、实施计划或编码。
- OA spec 已完成审阅整改，但仍待负责人最终评审/确认；此前审阅是独立静态只读审阅，不是正式 Harness 集成审阅，也不是运行验证。
- 尚未确认：敏感豁免清单、`pendingReview` 是否在主统计卡片展示、是否覆盖附件/抄送/通知摘要、导出 schema 是否阶段 1 附全、未知 JSON 字段拒绝策略、重复批次口径、统一 `oaKey` 字典的具体生成格式。
- 未知/阻塞：Doubao 双租户授权、实际 OA 模板/版本/实例关联字段、数据覆盖范围、最终 JSON schema、附件授权、负责人/application_id/接口凭据/测试环境均未提供；不得推断或填写。

### 当前禁止事项

- 不修改现有飞书 OA，不从工作台反向写入 OA；不连接生产或外部服务，不读取真实扫描数据，不发送通知，不部署。
- 不把脱敏/合成 Demo、静态审阅或历史资料描述为真实集成、生产扫描或已批准设计。
- 不清理或重置主工作区既有未提交/未跟踪内容；不把 `historical documents/`、探索记录或 `scripts/build_task_docs.py` 纳入本次交接提交。

### 新对话恢复命令

```powershell
Set-Location -LiteralPath 'E:\company-apps\yuguang-workbench'
Get-Location
git rev-parse --show-toplevel
Get-Content -Raw -Encoding UTF8 .\AGENTS.md
Get-Content -Raw -Encoding UTF8 .\.project-board\handoff.md
Get-Content -Raw -Encoding UTF8 .\.project-board\state.json
Get-Content -Raw -Encoding UTF8 .\.project-board\board.md
Get-Content -Encoding UTF8 .\.project-board\events.jsonl | Select-Object -Last 3
Get-Content -Raw -Encoding UTF8 'E:\company-apps\Standard Library\应用开发流程规范-20261021-v1.1.md'
Get-Content -Raw -Encoding UTF8 '.worktrees\oa-analysis-spec\docs\superpowers\specs\2026-10-21-oa-analysis-demo-design.md'
git -c safe.directory='E:\company-apps\yuguang-workbench' status --short --branch
git -c safe.directory='E:\company-apps\yuguang-workbench' log -3 --oneline
```

本次交接未创建提交；本次恢复后负责人已确认 `expectedCatalog` 两租户共同适用且 `required=false` 不生成缺失候选（spec v1.2）。接手者先复核上述状态，再从阶段 1 剩余待决项继续，一次确认一个业务口径。CTX：未检测。

## 当前阶段

按《应用开发流程规范-20261021-v1.1》重新映射：阶段 0「恢复项目事实与确认规范」已完成；OA 分析专项阶段 1「需求澄清与设计」仍进行中，spec 已形成并通过两轮独立静态只读复审，未发现剩余 P1，待负责人评审确认。阶段 2 实施计划、Demo、验证及后续阶段均未开始。

## 支出意向登记轻审批更新（2026-10-21）

用户已确认不设置采购申请 OA。已在 `E:\company-apps\Standard Library\任务发布与管理规范-20261020-v1.0.md` 和 `任务接口合同-20261020-v1.0.md` 增加“支出意向登记”独立轻审批边界：个人工作台发起日常费用/小项目，大项目和经营支出由来源应用发起并自动关联 ID；低于 200 元首位负责人审核，达到 200 元通过后送创始人；首位负责人 1 个工作日未处理升级；采购方式、收货确认、采购逾期和挂账/他人代付（无需公司结算）已定义。任务模块只承载待办、通知、逾期、统计和审计，轻审批保留独立状态、字段和结算台账。未修改应用代码、飞书配置或现有 OA。

规范位于 `E:\company-apps\Standard Library\应用开发流程规范-20261021-v1.1.md`，文件自身状态是“发布候选稿（待负责人签发）”。用户已明确要求本工作按其路线推进；记录保留候选状态，不称其为正式签发版。Superpowers 是适用技能工作链，不是固定十阶段。

## 目标与已确认决策

- 盘点范围仅为 2026 年 OA 审批；最终交付应统计各 OA 使用次数，诊断各 OA，列出修改建议、OA 间/租户间/与已批准要求间的冲突，并建议缺失 OA。
- 双租户为轻立方与与光，二者为关联租户；与光员工可发起 OA，后续审批节点可经飞书关联租户路由到轻立方租户账号。两个租户对应 OA 的规则要求一致；汇总需按统一 OA 分类并区分发起租户、跨租户办理方向。
- 同一跨租户审批按发起端 OA 实例计一次；轻立方侧后续节点或镜像记录不重复算作新发起。不能以可靠实例/关联标识核实关系的记录单列为待匹配，不强行去重。
- Demo 已选为 Doubao 扫描结果离线分析器。Doubao 扫描交付包括人读报告和固定 JSON；分析器只用 JSON 做结构校验、跨租户关联去重和统计，人读报告用于人工复核。
- Demo 将使用脱敏扫描结果或清楚标记的合成数据/本地模拟数据。当前没有真实 Doubao 或飞书集成；不连接生产、不发送通知、不修改 OA、不做线上部署。
- 网络边界更新（2026-10-21）：当前只推进本地 Demo；网络接入、真实飞书/Doubao 连接、生产通知和公网访问延后到 Demo 完成后的联调阶段。固定局域网端口仅作为未来本地启动约束，与光工作中台规范分配端口为 `3002`，不代表当前已完成网络接入。
- 飞书 OA 是审批事实来源；后续集成遵守批准接口、双租户身份/路由、附件网盘映射和审计要求。不得以 Demo 代替 OA 审批或真实系统集成。
- 大型中台建议按人力、行政、财务、项目、经营分模块、分独立任务和对话推进；统一身份、组织、租户路由、权限、接口、通知和网盘合同作为跨模块约束，不因模块并行而复制或分叉。该建议不代表所有模块 spec 已确认。
- 当前 OA spec 位于独立 worktree：`.worktrees/oa-analysis-spec/docs/superpowers/specs/2026-10-21-oa-analysis-demo-design.md`；工作树分支为 `task/oa-analysis-spec`，未提交。审阅为独立只读代理复核，不是已验证的正式 Harness 集成调用。

## 已验证事实

- 仓库当前是 `main`，HEAD 为 `0a1729a4c6157a9aa324957c1d4a2a37583f553e`。最近十条提交可由下方命令复核；最新提交是 `chore: establish git baseline`。
- `src/`、`tests/`、`infra/` 当前仅有 `.gitkeep`；仓库没有可运行的 OA 分析应用，也没有已导入的 OA 扫描结果或测试数据。因此当前没有可报告的 OA 次数、诊断结论或代码测试结果。
- 适用已批准业务规范位于 `E:\company-apps\Standard Library`：组织架构 v1.0、应用搭建结构 v1.1、网盘映射 v3.1、统一信息通知 v1.0、任务接口合同 v1.0。按具体功能适用时继续核对其他已批准文件。
- 本轮开始时已观察到：四个 `.project-board/` 文件修改；未跟踪的三个探索记录、`historical documents/` 和 `scripts/build_task_docs.py`。不得丢弃或擅自纳入提交，以新对话现场 `git status` 为准。
- 本次是文档交接：没有 OA 扫描、外部服务访问、功能代码修改、构建或自动化代码测试。

## 推断与未知

- **推断**：下一阶段可在需求与设计门槛内完成 OA 分析 Demo 的设计/spec；只有设计评审确认后才进入实施计划。这是流程安排，不代表设计已获批准。
- **未知**：Doubao 是否获轻立方和与光管理员授权，以及是否可读取模板、流程、2026 实例、附件、抄送和通知记录；实际 OA 清单、模板/版本配对、跨租户实例关联字段、2026 数据覆盖范围、JSON schema、报告与数据的关联方式、附件读取授权均没有可核验材料。
- **未知**：应用负责人、`application_id`、模块 ID、接口凭据、运行环境和正式接入映射。不得推测或生成虚构值。任何敏感值在交接记录中统一写成 `[REDACTED_SECRET]`，不得复制原值。

## 当前实现与文件状态

- **当前实现**：没有 OA 分析 Demo 或生产 OA 集成；不得把规范文档或模拟设想描述成已实现能力。
- **网络状态**：未连接真实网络服务；固定端口配置只作为后续本地启动约束。当前不读取生产数据、不写入真实 OA、不发送外部消息。
- **本次交接更新的文件**：`.project-board/handoff.md`、`.project-board/state.json`、`.project-board/board.md`、`.project-board/events.jsonl`。
- **工作区范围**：四个进度板文件为未提交修改；此前已存在的未跟踪探索记录、`historical documents/` 与 `scripts/build_task_docs.py` 继续保留。以新对话读取的 `git status` 为准。
- **提交信息**：本次不创建提交；当前提交号仍为 `0a1729a4c6157a9aa324957c1d4a2a37583f553e`。不得通过重置或清理来处理现存改动。

## 未完成事项与下一步

- 本次恢复后已确认并写入 spec v1.2：`expectedCatalog` 两租户共同适用、`required=false` 不生成缺失候选。其余待决项见上方更新后的清单。

1. 新对话先运行下方恢复命令并重新核对 Git、交接和阶段状态。
2. 留在阶段 1，完成 Doubao 输入 JSON schema、报告关联、两个租户 OA/版本映射、2026 时间和状态统计、发起端去重、未匹配记录、诊断/冲突/缺失建议、脱敏、本地验收场景及模拟边界的设计/spec。
3. 按项目要求展示设计供用户审阅；设计/spec 未获确认前不进入实施计划、隔离开发或编码。
4. 设计确认后再完成阶段 2 实施计划和隔离工作区准备，Demo 用脱敏/合成数据本地验证。扫描授权和真实数据可用性另行核实，不阻断独立可做的本地工作。

**未解决阻塞**：没有经验证的 Doubao 双租户授权/读取权限，也没有可用扫描结果和模板清单。没有这些材料时，只能开发并验证数据分析流程的模拟输入，不得声称已完成 OA 现状扫描。

## 新对话启动命令

在 PowerShell 中先执行以下只读恢复命令：

```powershell
Set-Location -LiteralPath 'E:\company-apps\yuguang-workbench'
Get-Content -Raw -Encoding UTF8 .\AGENTS.md
Get-Content -Raw -Encoding UTF8 .\.project-board\handoff.md
Get-Content -Raw -Encoding UTF8 .\.project-board\state.json
Get-Content -Raw -Encoding UTF8 .\.project-board\board.md
Get-Content -Raw -Encoding UTF8 .\.project-board\events.jsonl
Get-Content -Raw -Encoding UTF8 'E:\company-apps\Standard Library\应用开发流程规范-20261021-v1.1.md'
git status --short --branch
git log --oneline -10
git rev-parse HEAD
```

## 新对话提示词

```text
请接手 E:\company-apps\yuguang-workbench 的双租户 2026 年 OA 盘点分析 Demo 工作。先按 .project-board/handoff.md 中的 PowerShell 命令读取 AGENTS.md、全部进度板、最新应用开发流程规范、Git 状态和近期提交；以现场文件/Git 为准，保护所有现有未提交和未跟踪内容。

当前阶段是《应用开发流程规范-20261021-v1.1》阶段 1：需求已确认，设计/spec 尚未形成。该规范在 Standard Library 标注为待签发候选稿，但本任务按负责人明确指令采用；不得把它称为已签发。目标是离线分析 Doubao 扫描结果：范围仅 2026 年 OA；轻立方和与光为关联租户且两边 OA 规则应一致；与光发起并转到轻立方办理的同一实例按发起端只计一次，无法可靠匹配的记录单列；Doubao 同时提供人读报告和固定 JSON，分析器只用 JSON 校验、关联、去重及统计，报告用于人工复核。

先完成阶段 1 设计/spec，覆盖 schema、报告关联、OA/版本映射、统计、诊断/冲突/缺失建议、隐私脱敏、错误/未匹配处理、本地验收和模拟边界。按适用设计流程向我展示设计并等待确认；确认前不写实现计划、不编码、不扫描或连接生产系统。当前 src/tests/infra 仅占位，暂无 Demo、OA 数据或自动化测试。不得编造扫描结果、权限、application_id、负责人、凭据或测试结论；未经明确要求不部署。
```

## 交接校验

- CTX：未检测；没有真实 statusline 数值。
- 本文、`state.json`、`board.md` 和 `events.jsonl` 写入后已回读；`state.json` 解析有效、`events.jsonl` 154 行逐行解析有效，handoff 必需章节与恢复命令存在，`git diff --check` 退出码 0（有既有 CRLF 转换提示）。
- 当前提交号：`0a1729a4c6157a9aa324957c1d4a2a37583f553e`；本次交接未提交。

以下内容保留为早期交接的历史快照，状态以本文件开头的当前交接为准。

## OA 分析 Demo 设计复核补充（2026-10-21）

- 设计文件：`.worktrees/oa-analysis-spec/docs/superpowers/specs/2026-10-21-oa-analysis-demo-design.md`；分支 `task/oa-analysis-spec`，当前仅有未跟踪 spec 目录，尚未提交。
- 两轮独立静态只读复审已完成，未发现剩余 P1；这不是正式 Harness 集成审阅。设计待负责人确认，未确认前不进入阶段 2、不编码。
- 已修订 handler-only 记录表示、模板多版本复合键、关联证据门槛、移除无输入基线的路由冲突诊断、canonical OA key 规则、敏感字段/报告拒绝粒度。
- 负责人评审项：归年时区、OA 基线适用范围及 `required=false`、结果 JSON schema 深化、Demo 安全约定接受度、OA 多名称与未归一化边界。
- 本轮没有运行代码测试、真实 OA 扫描、外部服务连接或部署；真实权限、数据和跨租户关联字段仍未知。
- 项目同时存在其他并行 OA/模块讨论；本补充只记录 OA 分析 Demo 流，不覆盖其他对话的全局 `state.json` 阶段/焦点。
