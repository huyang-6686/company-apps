# 灯塔阶段 0 基线与验证实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans (recommended). Steps use checkbox syntax for tracking.

**Goal:** 在创建功能代码前完成身份授权、数据基线、中文检索、备份恢复和安全边界验证，形成可审阅、可回滚的阶段 0 交付物。

**Architecture:** 保持模块化单体、PostgreSQL 和异步任务队列设计。阶段 0 只验证平台能力和输入基线，不接入生产数据、不执行迁移/删除、不创建员工可用功能。灯塔归口轻立方工具层；权限、组织和分流数据只按工作台批准接口契约接入；整个体系不参与飞书 OA，迁移/删除由创始人按清单自行执行。所有结论必须附命令输出、接口响应或人工核对证据。

**Tech Stack:** PostgreSQL（版本与托管能力待验证）、中文检索扩展候选、pg_trgm 降级、应用层分词 + tsvector 降级、JSONL、SHA-256、加密备份。任何大模型能力只经与光工作中台总接口；总接口契约尚未取得时不发起调用。

---

### Task 1: 建立阶段 0 证据目录和决策登记

**Files:**
- Create: docs/superpowers/phase-0/README.md
- Create: docs/superpowers/phase-0/decision-log.md
- Create: docs/superpowers/phase-0/evidence/README.md

- [x] **Step 1:** README 已说明阶段 0 仅做验证和取证，列明交付物与禁止操作。
- [x] **Step 2:** decision-log 已固定字段并要求未知项明确记录。
- [x] **Step 3:** evidence/README 已规定命名、哈希、脱敏与禁止保存凭据/个人信息。
- [x] **Step 4:** 已检查阶段 0 文件清单和 JSON/JSONL；凭据样式赋值扫描无匹配。该扫描只覆盖阶段 0 文档，不证明旧历史材料不存在凭据。

### Task 2: 冻结来源清单和节点库基线

**Files:**
- Create: docs/superpowers/phase-0/source-inventory.md
- Create: docs/superpowers/phase-0/node-baseline.md
- Create: docs/superpowers/phase-0/evidence/baseline-manifest.json

- [x] **Step 1:** 来源清单仅保留工作台批准来源集合及待确认候选；未批准来源不探测、不直连。
- [x] **Step 2:** 已搜索当前项目工作区和历史交接包；文件未找到，清单状态为 missing/unknown。外部获批位置尚未确认，未声称全盘搜索。
- [x] **Step 3:** 导入幂等、分批、抽样、对账和回滚规则已记录，并补充取得源文件后的六步执行顺序；旧字段映射与丢弃字段仍须待实际源文件 schema 和目标 schema 可核验后完成。
- [x] **Step 4:** 已复核文件缺失状态及 manifest JSON；因无文件不生成 SHA-256 或行数，待获批文件位置后重查。

### Task 3: 验证身份、租户和权限契约

**Files:**
- Create: docs/superpowers/phase-0/identity-authorization-contract.md
- Create: docs/superpowers/phase-0/permission-matrix.md
- Create: docs/superpowers/phase-0/rejection-codes.md
- Create: docs/superpowers/phase-0/authorization-test-cases.md

- [x] **Step 1:** 已记录轻立方飞书身份及组织通讯录经工作台同步边界；不建立第二份组织主数据、跨租户授权映射或应用内角色定义。
- [ ] **Step 2:** 从工作台责任方取得并核验已批准权限/组织/数据接口契约，记录接口路径、字段、鉴权、版本、失效语义和 SLA。未提供的字段、频率、缓存、重试和死信参数均标记 unknown，不得自行设值。
- [x] **Step 3:** 已定义无法证明工作台授权时拒绝访问及审计拒绝码；不设本地旁路。
- [x] **Step 4:** 已把四级敏感分级限定为内容处理规则，字段放行仍由工作台标准决定。
- [x] **Step 5:** 已定义 8 个授权契约用例和 2 个创始人执行结果反馈用例，覆盖已批准/拒绝请求、未批准来源、字段范围、无效授权、工作台不可用、引用回源、导出及反馈校验；待取得当前契约后运行。

### Task 4: 完成中文检索技术验证

**Files:**
- Create: docs/superpowers/phase-0/search-spike-report.md
- Create: docs/superpowers/phase-0/search-fixtures.jsonl

- [ ] **Step 1:** 记录 PostgreSQL 版本、CREATE EXTENSION 权限、中文扩展、pg_trgm、pgvector、索引空间和写入放大。
- [ ] **Step 2:** 准备 20 个中文查询和 50 篇脱敏样本文档，记录人工相关性标签。已补足 20 个合成查询候选，其中 10 条明确标记待人工复核；样本文档与人工相关性标注仍待完成，本步保持未勾选。
- [ ] **Step 3:** 分别测试中文分词、pg_trgm、应用层分词 + tsvector，记录 Top-10 命中率、排序正确率、P95 延迟和索引体积。
- [ ] **Step 4:** 选择可回滚主路径；扩展不可用时记录降级路径，不引入外部搜索引擎。

### Task 5: 建立审计、备份恢复和安全基线

**Files:**
- Create: docs/superpowers/phase-0/audit-schema.md
- Create: docs/superpowers/phase-0/backup-restore-runbook.md
- Create: docs/superpowers/phase-0/security-checklist.md

- [x] **Step 1:** 已定义追加写入审计字段；查看/导出遵从工作台授权，保留期限与 WORM 能力保持 unknown。
- [x] **Step 2:** 已记录备份和恢复目标、加密与密钥分离步骤；数据库平台和演练结果保持 unknown。
- [x] **Step 3:** 安全清单已覆盖回调、防重放、日志脱敏、工作台模型总接口和个人信息请求；OA 数据项已按 2026-10-18 修订移除。
- [x] **Step 4:** 安全控制项已按 verified/design/unknown 分类并关联证据或下一步。

### Task 6: 验证网盘归档映射与命名

**Files:**
- Create: docs/superpowers/phase-0/archive-mapping-check.md
- Create: docs/superpowers/phase-0/archive-test-cases.md

- [x] **Step 1:** 已按正式规范确认唯一归口为“轻立方 / 个人网盘 / 2. 灯塔知识库”，不得自行新建顶层目录；实际盘 ID 和连接器仍为 unknown。
- [x] **Step 2:** 已记录菜单 1–4 级规则和禁止 5 级；“待业务大类梳理后定稿”的子菜单不自行定稿。已补入 post-authorization-checklist.md 作为权限获批后首日执行依据。
- [x] **Step 3:** 已记录固定数字前缀、文件名不带公司名称、生效制度平铺、0 号历史汇总目录、失效版本标记及草稿更新流程。
- [x] **Step 4:** 已编写来源重绑、原始路径追溯、批次幂等、路径/哈希对账、创始人执行清单结果反馈、云盘删除与回收站、百度网盘月度链接巡检及菜单边界的设计级测试用例；未连接或写入实际网盘。

### Task 7: 形成阶段 0 出口评审包

**Files:**
- Create: docs/superpowers/phase-0/exit-review.md

- [x] **Step 1:** 已核对凭据扫描范围、接口契约状态、来源清单、节点基线、检索报告、审计 schema、备份恢复、容量与回滚交付物；运行态验证缺口保留为 pending/unknown。
- [x] **Step 2:** 已将工作台接口、节点库、PostgreSQL、网盘连接器和部署落点列为阻塞；不进入功能编码。
- [x] **Step 3:** 已执行文档状态扫描；出口评审为每个未知项指定责任角色和取证下一步，具体联系人均明确标记 unknown。

