# 星窗工作台 Demo 实现与交接审阅意见

- 审阅日期：2026-10-21
- 版本：v1.0
- 审阅对象：`E:\company-apps\public-showcase\.worktrees\task-demo`（分支 `task/REQ-03-demo`，HEAD `b3f60e1`）
- 审阅范围：基础 Demo 源码、设计 spec、实施计划、README、种子/重置脚本、固定端口脚本、测试、四份进度板文件
- 审阅方式：Harness 只读审阅；未修改被审阅代码、spec、plan、进度板或 `phase3-plan.md`；未提交 Git、未 push、未部署、未调用真实外部服务
- 审阅结论：**不通过（需整改后复审）**
- 问题统计：P1 × 5、P2 × 12、P3 × 若干
- 说明：本审阅按 Demo 模拟边界评估，未把模拟 API/本地 JSON 误判为真实系统集成，也未要求当前阶段完成线上部署。本文件为审阅存档，由 Harness 按用户要求写入 `historical documents/`，不属于被审阅代码变更。

## 审阅依据文件

- `E:\company-apps\public-showcase\.worktrees\task-demo\AGENTS.md`
- `E:\company-apps\public-showcase\.worktrees\task-demo\docs\COLLABORATION.md`
- `.project-board/state.json`、`board.md`、`events.jsonl`、`handoff.md`
- `docs/superpowers/specs/2026-10-21-xingchuang-demo-design.md`
- `docs/superpowers/plans/2026-10-21-xingchuang-demo.md`
- `README.md`、`package.json`、`scripts/check-port.ps1`、`scripts/seed-demo.mjs`、`scripts/reset-demo.mjs`
- `src/app/`、`src/lib/`、`tests/` 全部文件
- `.gitignore`、`tsconfig.json`、`vitest.config.ts`、`next.config.mjs`、`eslint.config.mjs`
- 运行产物 `.local-data/store.json`（只读核对）

## A. 结论

**不通过（需整改后复审）。**

P0 的“页面、路由、匿名响应”层面基本成立：不存在 `/content/[id]` 或 `/review` 路由；根页不枚举内容；`/share/[token]` 是唯一公开内容页面入口；公开成功响应不含内部 ID；密码验证前不返回元数据；公开失败统一 404 `NOT_AVAILABLE`。

但以下边界在信任层面不成立：

1. “审核/脱敏在星窗之外”只在文案层成立。`/source-simulator` 与 `/api/demo-submit` 都在同一个 Next.js 进程内；`demo-submit` 接收 `reviewDecision` 与任意 `payload`，在星窗服务端用共享密钥签名后再交给 `/api/receive`。批准与脱敏声明完全自证，HMAC 只能证明“星窗自己签的”。
2. “管理面不在公网受理”未成立。根页直接链接 `/admin`；`/admin` 打开后自动以“创始人”创建 session；`/api/demo-session` 只校验可伪造的 `Origin` 头。3004 上的任何客户端都能取得创始人 session 并读取全部内容。
3. “删除副本”未实现。`deleteContentPayload` 只把 `payloadPresent` 置 false，`title`、`summary`、`approvedFields` 仍留在内存和 `store.json`，且没有路由/UI 调用它。

自动化验证全部通过（11 个测试文件、26 个测试；lint/typecheck/build/check-port 均退出 0），但交接证据存在可核实缺口：声称的 Windows `fsyncSync` EPERM 回归测试不存在；无 `package-lock.json`；依赖来自外部 `zhenan-association` 的 `node_modules` junction。

## B. P1 问题

### P1-01｜严重级别：P1

- **文件及位置**：`src/app/api/demo-submit/route.ts:4`、`src/lib/services/submissionService.ts:8`、`src/lib/crypto.ts:5`、`src/app/source-simulator/page.tsx`
- **具体问题**：`/source-simulator` 是星窗应用内的页面，`/api/demo-submit` 也是星窗路由。它接收 `reviewDecision` 与任意 `payload`，在星窗进程内调用 `signDemoPayload` 用共享密钥签名，再交给 `/api/receive`。任何客户端无需 session/签名即可提交 `{reviewDecision:'approved', payload}`。因此审核/脱敏发生在星窗进程内，`redactionAttested: true` 与 `approvalRef` 完全自证；接收端 HMAC 不能证明来源身份。
- **依据**：用户约束“审核必须在来源应用模拟器之外完成；星窗只接收批准且脱敏的载荷”；`AGENTS.md`“内向星窗的投递只能经过明确的白名单字段和审核流程”；spec §2.1“批准后来源模拟器生成带批准/脱敏声明的模拟签名请求”。
- **建议修正**：把模拟来源移出星窗进程（独立本地脚本/进程，不监听 3004），或至少让 `/api/demo-submit` 仅回环可用并加显式开关；在 README/spec/handoff 中明确“同进程逻辑替身”而非“星窗之外的来源应用”。
- **验收标准**：从 3004 外部无法直接调用签名/批准入口；`/api/receive` 的 allowlist、HMAC、合同版本、时间窗、nonce、字段白名单仍全部执行；文档表述与实现一致。

### P1-02｜严重级别：P1

- **文件及位置**：`src/lib/repository.ts:25`
- **具体问题**：`deleteContentPayload` 仅把 `payloadPresent` 置 false；`title`、`summary`、`approvedFields` 仍留在 `state.versions` 与 `store.json`。`getContentVersion`/`listContentVersions` 过滤掉该记录，访问被阻断，但“删除内容及附属数据、不得保存展示字段”未实现。且没有任何路由/UI 调用它，Demo 无法演示删除。
- **依据**：spec §5.2“删除内容副本、附件/展示数据后仍保留幂等记录；不得保存正文、附件、展示字段”；spec §6.4“Demo 只提供可操作的‘删除副本’按钮”；state 决策“授权撤销或来源要求删除时下一轮同步删除内容及其附属数据（含附件和派生摘要）”。
- **建议修正**：删除时真正清空展示字段/正文，只保留幂等记录与回执引用；补管理端“删除副本”入口与审计；加测试断言 `store.json` 不含已删除字段。
- **验收标准**：调用删除后，`store.json` 对应版本的 `title/summary/approvedFields` 为空或不存在；`getContentVersion` 返回 null；幂等记录与回执引用仍在。

### P1-03｜严重级别：P1

- **文件及位置**：`src/app/api/feedback/route.ts:14`、`src/lib/services/shareService.ts:12`、`src/lib/shareAccessRateLimit.ts:10`
- **具体问题**：`/api/feedback` 接受 `x-share-password` 并调用 `resolveFeedback`→`access`，全程没有调用 `consumeShareAccessAttempt`。持有密码链接 token 的攻击者可在 `/api/feedback` 上无限次猜密码，完全绕过 `/api/share-access` 的 5 次/分钟限流。
- **依据**：state 决策“采用最小安全基线：……密码链接保护……限流”；spec §7“分享访问入口按客户端每分钟最多 5 次请求限速”；spec §9“权限/API：反馈伪造 contentVersionId、缺 Origin/CSRF”要求服务端拒绝且无状态变更。
- **建议修正**：在 `/api/feedback` 复用 `consumeShareAccessAttempt`，或把密码校验统一收敛到带限流的入口；失败统一返回 404；补测试。
- **验收标准**：对同一客户端连续 6 次错误密码请求，第 6 次返回与不存在 token 相同的不可用响应；`/api/share-access` 与 `/api/feedback` 的限流行为一致。

### P1-04｜严重级别：P1

- **文件及位置**：`src/app/page.tsx:11-12`、`src/app/admin/page.tsx:6`、`src/app/api/demo-session/route.ts:6`、`src/lib/demo.ts:6-11`
- **具体问题**：根页直接链接 `/admin`；`/admin` 的 `useEffect` 默认以“创始人”调用 `/api/demo-session`；该接口只要求 `Origin` 精确匹配，而 `Origin` 是客户端可伪造的。结果：3004 上的任何客户端都能取得创始人 session，再调用 `/api/admin/overview` 读取全部版本（含未发布、已撤回）、链接和反馈。
- **依据**：state 决策“管理面不在公网受理”“公网展示面与管理面分离”；AGENTS“星窗是唯一公网出口”；spec §7“所有 API 对授权失败执行服务端拒绝；变更 API 校验 session、角色、Origin 与 CSRF”。
- **建议修正**：管理入口不在公开根页直达；`/admin` 不自动创建创始人 session；管理面仅回环监听或需环境开关；README/spec 明确“LAN Demo 无管理面隔离”。
- **验收标准**：匿名 LAN 客户端不能直接读 `/api/admin/overview`；公开根页不再出现管理入口；文档明确该边界。

### P1-05｜严重级别：P1

- **文件及位置**：`src/app/admin/page.tsx:9-11`
- **具体问题**：管理 UI 只有“发布/生成公开链接/撤回”；没有密码链接、内部链接、单链接撤销、密码重置、反馈列表、审计时间线、链接列表。spec §2 要求“管理操作员……创建一个或多个分享链接；链接可选择公开链接、密码链接或仅内部访问”“可以撤销单个链接、重置其密码、撤销/下架内容版本”。
- **依据**：spec §2.3、§2.5、§3；用户要求“基础可操作 Demo”；`v1.1` 阶段 3 要求核心流程真实可操作。
- **建议修正**：补齐上述 UI；或经用户书面同意后下调 spec/README 的“可操作”声明，并明确哪些流程只能通过 API 演示。
- **验收标准**：不依赖 curl，在 UI 上可完成密码链接/内部链接创建、单链接撤销、密码重置、反馈查看、审计查看。

## C. P2 问题

### P2-01｜管理角色范围未实现

- **位置**：`src/lib/demo.ts:5`、`src/app/api/admin/overview/route.ts:4`
- **问题**：`isManager` 是二值判断；创始人、品牌部负责人、项目部负责人、授权商务人员都能读取全部版本/链接/反馈并执行发布、撤回、建链。
- **依据**：spec §3“创始人可查看所有 Demo 管理内容；其他管理角色仅查看显式授予的模拟范围”。
- **修正**：增加角色范围矩阵与固定假授权数据；补矩阵测试。

### P2-02｜到期、下线、副本删除不可操作

- **位置**：`src/lib/services/shareService.ts:12`、`src/lib/domain.ts:1`
- **问题**：`expiresAt` 从未被设置；没有 `已到期` 转换/扫描；没有 `已下线` 动作；没有副本删除入口/审计。
- **依据**：spec §6.4；state 生命周期“已接收、已发布、已撤回、已下线、已到期”。
- **修正**：提供设置 `expiresAt` 的入口、惰性到期转换、已到期/已下线审计；补删除副本。

### P2-03｜写入失败回滚不完整

- **位置**：`src/lib/repository.ts:23-25`、`:48-49`
- **问题**：只有 `commitSubmission` 用 `structuredClone` 快照回滚；`putLink`、`updateLink`、`addAudit`、`addFeedback`、`updateContentVersion` 都是先改内存再 `persist()`，失败不回滚。`createLink`/`publish`/`withdraw`/`feedback` 的“业务写入 + 审计”分两次写，非原子。
- **依据**：spec §5.2“写入失败必须回滚内存状态并返回通用存储错误”。
- **修正**：统一写事务/快照回滚；业务写入与审计尽量同一次持久化。

### P2-04｜内部回执与状态不完整

- **位置**：`src/lib/services/submissionService.ts:45-48`
- **问题**：内部回执只有 `receiptId`、`contentId`、`contentVersionId`、`status`；缺 `sourceId`、`idempotencyKey`、`sourceVersion`、`resultCode`、`receivedAt`、`payloadHash`。首次 201 返回 `已接收`，重放 200 返回记录里的 `已完成`。没有独立 `Submission` 记录；schema/白名单失败无最小拒绝记录。
- **依据**：spec §5.2 内部回执 schema 与响应矩阵。
- **修正**：补齐字段；统一首次/重放状态语义；补 `Submission` 记录或明确合并说明；schema 失败记最小拒绝结果。

### P2-05｜密码学与规范化不达 spec

- **位置**：`src/lib/crypto.ts:5-18`
- **问题**：`canonicalize` 用 `localeCompare` 排序 + `JSON.stringify`，不是 RFC 8785；`DEMO_SIGNING_SECRET` 与 `DEMO_SESSION_SECRET` 有硬编码默认值，不是“进程环境中生成”；scrypt 固定 salt，`passwordMatches` 用 `===` 而非定时安全比较；静态 HMAC 同时是来源唯一认证。
- **依据**：spec §5.1、§5.2；state 决策“静态共享密钥不得作为唯一校验方式”。
- **修正**：改为 RFC 8785 规范化；密钥缺失即失败关闭；每链接随机 salt + `timingSafeEqual`；注明 Demo 的静态 HMAC 不是真实来源认证。

### P2-06｜spec/plan 与实现不一致

- **位置**：`docs/superpowers/specs/2026-10-21-xingchuang-demo-design.md:45-62`、`docs/superpowers/plans/2026-10-21-xingchuang-demo.md:154`、`:174-184`、`:256-260`
- **问题**：spec §4 列出的 `src/lib/contracts/`、`src/lib/adapters/`、`src/lib/repository/` 目录，以及 `accessService`/`roleService`/`feedbackService` 不存在；plan Task 3/4/5/6 引用 Zod、`ui-contract.test.tsx`、`validation.test.ts`、`seed-demo.ts` 等不存在；复选框全部未勾选；plan 的 as-built 与 Task 3 自相矛盾。
- **修正**：按实际文件/技术栈重写模块清单与任务记录；勾选复选框或改为“执行记录”；删除不存在的引用。

### P2-07｜交接证据缺口

- **位置**：`.project-board/handoff.md:174`、`:5`、`state.json:155`、`:158`、`board.md:58`、`:65`
- **问题**：handoff 声称“新增回归覆盖：Windows `fsyncSync` 返回 `EPERM` 时仍完成 JSON 临时文件原子替换”，但 `tests/` 中没有任何 `fsync`/`EPERM` 的 mock 或断言；`store.json` 的密码链接 `passwordGeneration=1`，不能佐证“重置后旧密码 404”；“4 文件/8 测试”与“11 文件/26 测试”、“main”与 `task/REQ-03-demo` 并存。
- **修正**：删除不实表述或真正补测试；统一测试计数与分支表述；给历史段落加时间标注；补密码重置证据。

### P2-08｜复现性不足

- **位置**：`package.json`、`node_modules`
- **问题**：没有 `package-lock.json`；`node_modules` 是 Junction → `E:\company-apps\zhenan-association\node_modules`；`node_modules.partial` 不完整（缺 `vitest/package.json`）。干净克隆必须联网安装，且没有 lockfile 固定传递依赖。
- **修正**：提交 `package-lock.json`；不要依赖外部项目 node_modules；README 写清安装/复现步骤。

### P2-09｜receive 校验顺序与错误语义

- **位置**：`src/lib/services/submissionService.ts:30-32`、`src/app/api/receive/route.ts:4`
- **问题**：未知字段/schema 校验在验签之前，未认证请求可区分 `UNKNOWN_FIELD`、`INVALID_SUBMISSION`、`SIGNATURE_INVALID`；畸形 JSON 或 `null` payload 走 catch 返回 503 `STORE_ERROR`，语义应为 4xx。
- **修正**：先验签，再 schema；畸形 body 返回 4xx；避免未认证请求探测 schema。

### P2-10｜管理接口暴露哈希与反馈联系方式

- **位置**：`src/app/api/admin/overview/route.ts:4`
- **问题**：`admin/overview` 返回 `links`（含 `tokenHash`、`passwordHash`）和 `feedback`（含 `contact`），对任何管理角色可见。
- **修正**：前端不需要的哈希不返回；反馈联系方式按最小必要返回；补权限测试。

### P2-11｜`failForward` 客户端可控

- **位置**：`src/app/api/feedback/route.ts:16`
- **问题**：公开端在 body 里传 `failForward: true` 就能把反馈状态置为 `forward_failed`，失败注入应由服务端/演示配置控制。
- **修正**：改为服务端配置或仅测试环境可注入。

### P2-12｜测试覆盖不足

- **位置**：`tests/`
- **问题**：`public-directory.test.tsx` mock 了根页未使用的 repository，断言近乎空转；没有路由级 admin/Origin/CSRF、撤回/到期/删除、坏签名/时间窗/合同版本、回滚/损坏 store、密码前无元数据等测试；26 个测试覆盖不了 spec §9 矩阵。
- **修正**：按 spec §9 矩阵补测试；删除空转 mock；补路由级集成测试。

## D. P3 加固项

1. 密码哈希固定 salt + `===` 比较；建议随机 salt + `timingSafeEqual`。
2. session cookie 无 `Secure`；HTTP Demo 可接受，但应在 spec 标注生产需 HTTPS + Secure。
3. 无 CSP、X-Frame-Options、Referrer-Policy；公开分享页建议至少加 `Referrer-Policy: no-referrer`。
4. 限流信任 `x-forwarded-for`/`x-real-ip`，且成功访问也计数；README 已说明是 Demo 标识，但应避免把成功浏览计入 5 次/分钟。
5. `linkId` 取 token 前 8 字符；建议独立随机 linkId，避免从审计/日志泄露 token 片段。
6. `contentId` 由 `sourceContentId` 派生（`content-${sourceContentId}`）；建议星窗独立生成随机内容 ID。
7. 来源模拟器不能改 `idempotencyKey`/`sourceVersion`，无法通过 UI 演示新版本/版本递增。
8. 移动端仅一个 680px 断点；360/390/768/1280 无人工证据；长 ID/长标题存在横向溢出风险。
9. `check-port.ps1` 在 `netstat` 失败时可能 fail-open；建议 netstat 失败即报错。
10. `requestId` 用 `Date.now()`，同毫秒可能碰撞；建议 `randomUUID`。
11. `pg`、`drizzle-orm` 未使用；`@eslint/eslintrc` 未在 `package.json` 直接声明；建议清理/补齐。
12. `.local-data` 有 `persist-test.json`、`test-route.json` 测试残留；建议清理或加 `.gitignore` 说明。
13. `seed-demo.mjs` 把明文 token 打到 stdout；手动 seed 可接受，但不应在 CI 日志中执行。
14. spec §5.2 的 `deleted_payload_replay` 结果码未单独实现，当前与 `idempotent_replay` 同为 200。

## E. 与已确认边界一致的部分

1. 不存在 `/content/[id]` 公开页面，也不存在 `/review` 路由或 `reviewStatus` 字段。
2. 根页是静态说明页，不读取仓储，不列内容、标题、摘要、密码链接或 token。
3. 公开内容唯一页面入口为 `/share/[token]`；`/api/share-access` 只接受 `token`/`password`，未知字段 404。
4. 公开成功响应不含内部内容 ID/版本 ID；密码验证前不返回标题、摘要、来源或版本。
5. 不存在 token、密码错误、已撤销、已过期、内容不可用统一返回 404 `NOT_AVAILABLE` + “内容不可用”，不返回原因、不跳转。
6. 来源 allowlist、HMAC、合同版本、5 分钟时间窗、nonce 防重放、未知字段拒绝、`redactionAttested`/`approvalRef` 校验均执行。
7. 来源版本严格递增、允许跳号；同键同载荷回放、同键不同载荷 409、并发最多一个版本。
8. ShareLink 绑定 `contentVersionId`；单链接撤销、密码代次重置、内容撤回立即阻断访问。
9. 内部分享要求 Demo session；项目参与者固定范围 `demo-participant-001`/`seed-case-001`；反馈从 token 推导版本并拒绝客户端版本 ID。
10. 管理变更 API 校验 session、角色、精确 Origin、CSRF。
11. 本地 JSON 仓储使用临时文件 + `fsync` + 原子 rename；只对 `EPERM`/`ENOSYS` 降级；损坏 JSON fail closed。
12. `commitSubmission` 写失败回滚；token 只存哈希、密码只存哈希；`store.json` 无明文 seed token/密码；源码无 `console.log`。
13. 全局 Demo 横幅与 API `meta.demo=true`；来源模拟器提示审核在星窗之外；README/spec 明确不连接真实身份、通知、网盘、数据库、模型或生产服务。
14. 固定端口 3004；`start:lan` 为 `npx next start -H 0.0.0.0 -p 3004`；`check-port` 退出 0。

## F. 验证复跑（真实输出）

执行目录：`E:\company-apps\public-showcase\.worktrees\task-demo`。

### F.1 测试

```text
> public-showcase-demo@0.1.0 test
> vitest --run

 ✓ tests/bootstrap.test.ts (1 test)
 ✓ tests/repository.test.ts (4 tests)
 ✓ tests/rate-limit.test.ts (1 test)
 ✓ tests/session.test.ts (4 tests)
 ✓ tests/public-directory.test.tsx (1 test)
 ✓ tests/submission.test.ts (4 tests)
 ✓ tests/demo-submit-api.test.ts (1 test)
 ✓ tests/share-access-api.test.ts (1 test)
 ✓ tests/feedback-api.test.ts (2 tests)
 ✓ tests/access.test.ts (6 tests)
 ✓ tests/port-check.test.ts (1 test)

 Test Files  11 passed (11)
      Tests  26 passed (26)
TEST_EXIT=0
```

非致命警告：Vite CJS Node API 已弃用；Vitest `cache.dir` 已弃用。

### F.2 lint / typecheck

```text
> eslint . --max-warnings=0
LINT_EXIT=0

> tsc --noEmit
TYPECHECK_EXIT=0
```

### F.3 build

```text
▲ Next.js 15.5.28
✓ Compiled successfully in 1948ms
✓ Generating static pages (14/14)
BUILD_EXIT=0
```

路由表含 `/`、`/admin`、`/participant`、`/source-simulator`、`/share/[token]`、`/api/receive`、`/api/share-access`、`/api/share-links`、`/api/admin/*`、`/api/content-versions/[versionId]/withdraw` 等；不含 `/content/[id]`，也不含 `/review`。

### F.4 check-port

```text
> powershell -ExecutionPolicy Bypass -File scripts/check-port.ps1
Port 3004 is available.
CHECKPORT_EXIT=0
```

### F.5 Git

```text
$ git status --short --branch
## task/REQ-03-demo
 M .gitignore
 M .project-board/board.md
 M .project-board/events.jsonl
 M .project-board/handoff.md
 M .project-board/state.json
?? README.md
?? docs/superpowers/
?? eslint.config.mjs
?? next-env.d.ts
?? next.config.mjs
?? package.json
?? scripts/...
?? src/app/
?? src/lib/
?? tests/...
?? tsconfig.json
?? vitest.config.ts
```

`git status --porcelain=v1 -uall` 共 56 条：5 个已跟踪修改 + 51 个未跟踪文件。`git diff --check` 退出 0。`git diff --stat` 仅 5 个进度板文件，233 行新增/80 行删除。

```text
$ git log -5 --oneline
b3f60e1 chore: record baseline verification
b2fcb6c chore: establish git baseline
3e68854 chore: add progress tracking rules and board
1a86de0 chore: establish git collaboration baseline
```

只有 4 条提交，HEAD 为 baseline，不含 Demo 提交；与“预期存在未提交 Demo”一致。

### F.6 产物佐证

`.local-data/store.json` 实测：2 个版本（seed + HTTP 测试）、1 条幂等记录、3 个链接、5 条审计、0 条反馈；只有 `tokenHash`/`passwordHash`，无明文 token/密码。密码链接的 `passwordGeneration` 为 1，不能佐证“重置后旧密码 404”的完整流程。

### F.7 运行环境说明

本机 workspace-write 模式下 `pwsh` 启动即返回 `0xC0000142`；经批准后以 `danger-full-access` 执行上述只读命令。这是 DSH 运行环境问题，不是项目失败。`node_modules` 是 Junction → `E:\company-apps\zhenan-association\node_modules`，其 next/react/vitest/typescript 版本与 `package.json` 一致，但不是本仓库自有依赖。

## G. 未验证事项与不能声称

本轮未独立复跑 HTTP，因此不能声称以下事项已由审阅者重新验证：

- 启动 3004 后的根页 200、来源拒绝 422、批准 201、管理会话 200、发布 200、分享 201、撤回后 404、伪造 Origin 403；
- 密码链接错误 404/正确 200、重启后持久化恢复；
- 真实浏览器 360/390/768/1280 视口人工验收；
- 多进程/分布式并发、生产数据库、HTTPS/域名/CDN/WAF、部署拓扑；
- 真实身份、租户/员工 ID、来源/通知/网盘接口、模型或生产服务。

其他不能从当前产物推出的事项：

- 不能推出真实 `application_id`、负责人、租户映射、凭证、云端接口或生产验证；
- 不能推出 `phase3-plan.md` 未被修改（该文件不在 worktree 中，本轮未读取主仓库该文件）；
- 不能推出删除副本、到期、下线、密码重置的完整流程已验收；
- 不能推出管理面与公开面已隔离；
- 不能推出测试已覆盖 spec §9 全部矩阵。

## H. 整改与复审门槛

建议整改顺序：

1. P1-01 审核/签名边界（或用户书面接受为 Demo 限制）；
2. P1-02 删除副本；
3. P1-03 反馈限流；
4. P1-04 管理面隔离；
5. P1-05 管理 UI；
6. P2-03 写入回滚、P2-04 回执、P2-05 密码学；
7. P2-06 文档、P2-07 证据、P2-08 复现性；
8. P2-09～P2-12；
9. P3 加固项。

复审门槛：

- P1 全部修复，或由用户书面豁免并记录在 spec/handoff；
- P2 修复或有明确“不修复+理由+用户裁定”；
- `npm test -- --run`、`npm run lint`、`npm run typecheck`、`npm run build`、`npm run check-port`、`git diff --check` 全部退出 0；
- 为每条 P1/P2 提供测试或可复核证据；
- 更新 spec、plan、README、四份进度板；修正不实/过期表述；
- 不改 `phase3-plan.md`、不 push、不部署、不接真实服务、固定端口 3004。

---

## 附录：给实施方的整改提示词

> 你是星窗工作台 Demo 的实施方（Codex）。请在隔离 worktree `E:\company-apps\public-showcase\.worktrees\task-demo`、分支 `task/REQ-03-demo` 内，按 Harness 只读审阅意见完成整改。
>
> 审阅存档：`E:\company-apps\public-showcase\historical documents\harness审阅-星窗工作台-Demo实现与交接-2026-10-21-v1.0.md`。请先完整读取存档，再逐项整改；不要只改文档掩盖实现问题。
>
> 一、必须修复（P1，逐项给证据）
> 1. P1-01 审核/签名边界：`/source-simulator` 与 `/api/demo-submit` 目前都在星窗应用内，`demo-submit` 用共享密钥在服务端签名，批准/脱敏声明完全自证。请把模拟来源移出星窗进程（独立本地脚本/端口，不监听 3004），或至少让 `/api/demo-submit` 仅回环可用并加显式开关；同时修正 README/spec/handoff 中“审核在星窗之外”的表述，明确是“同进程逻辑替身”还是“独立进程”。验收：从 3004 外部无法直接调用签名/批准入口；`/api/receive` 的 allowlist、HMAC、合同版本、时间窗、nonce、字段白名单仍全部执行。
> 2. P1-02 删除副本：`deleteContentPayload` 目前只把 `payloadPresent` 置 false，`title`/`summary`/`approvedFields` 仍在内存和 `store.json`。请真正删除展示字段，只保留幂等记录与回执引用；补管理端“删除副本”入口与审计；加测试断言 `store.json` 不含已删除字段。
> 3. P1-03 反馈限流：`/api/feedback` 接受 `x-share-password` 并调用 `access`，没有限流，可被用来爆破密码链接。请复用 `share-access` 的限流或把密码校验统一收敛到带限流的入口；失败统一 404；补测试。
> 4. P1-04 管理面隔离：根页直接链接 `/admin`，`/admin` 自动以“创始人”创建 session，`/api/demo-session` 只校验可伪造的 Origin 头。请至少做到：管理入口不在公开根页直达；不自动创建创始人 session；管理面仅回环或需环境开关；README/spec 明确“LAN Demo 无管理面隔离”。验收：匿名 LAN 客户端不能直接读 `/api/admin/overview`。
> 5. P1-05 管理 UI：补齐密码链接、内部链接、单链接撤销、密码重置、反馈列表、审计时间线、链接列表；或经用户书面同意后下调 spec/README 的“可操作”声明。
>
> 二、必须修复（P2）
> - P2-01 角色范围：创始人全量，其他管理角色仅显式授权范围；补矩阵测试。
> - P2-02 到期/下线：提供设置 `expiresAt` 的入口、惰性到期转换、已到期/已下线审计；补删除副本。
> - P2-03 写入回滚：`putLink`/`updateLink`/`addAudit`/`addFeedback`/`updateContentVersion` 失败时回滚内存；业务写入+审计尽量原子。
> - P2-04 回执：内部回执补齐 `sourceId`/`idempotencyKey`/`sourceVersion`/`resultCode`/`receivedAt`/`payloadHash`；统一首次/重放状态；补 `Submission` 记录或说明合并；schema 失败记最小拒绝结果。
> - P2-05 密码学：改为 RFC 8785 规范化；去掉硬编码默认密钥（缺失即失败关闭）；scrypt 每链接随机 salt + `timingSafeEqual`；注明静态 HMAC 不是来源唯一认证。
> - P2-06 文档：spec §4 模块清单、plan Task 3–6 的文件/技术栈与实现对齐；勾选计划复选框或改为“执行记录”；删除/更新不存在的 Zod、`ui-contract.test.tsx`、`validation.test.ts`、`seed-demo.ts` 引用。
> - P2-07 交接证据：删除“fsync EPERM 回归测试”不实表述，或真正补该测试；修正 8/8 与 26/26、main 与 `task/REQ-03-demo` 的历史矛盾；补密码重置证据。
> - P2-08 复现性：提交 `package-lock.json`；不要依赖 `zhenan-association` 的 `node_modules` junction；在 README 写清安装/复现步骤。
> - P2-09 receive 顺序：先验签再 schema；畸形 body 返回 4xx 而不是 503；避免未认证请求区分 schema 错误。
> - P2-10 管理接口：不要返回 `tokenHash`/`passwordHash`；反馈联系方式按最小必要返回。
> - P2-11 `failForward`：改由服务端/演示配置控制。
> - P2-12 测试：补路由级 admin/Origin/CSRF、撤回/到期/删除、坏签名/时间窗/合同版本、回滚/损坏 store、根页非枚举、密码前无元数据等测试。
>
> 三、硬约束
> - 固定端口 3004；不换端口；`start:lan` 保持 `npx next start -H 0.0.0.0 -p 3004`。
> - 不部署、不 push、不调用真实身份/通知/网盘/数据库/模型/生产服务。
> - 不修改 `phase3-plan.md`；不清理既有未提交变更。
> - 公开访问只走 `/share/[token]`；不得新增 `/content/[id]` 或按 content ID 枚举的公开入口。
> - token/密码/凭证不得进入日志、持久化正文或公开响应；Demo 标识保留。
> - 不虚构 `application_id`、负责人、租户映射、凭证、云端接口或生产验证。
> - 保留 `meta.demo=true` 与失败统一不可用。
>
> 四、验证与交付
> - 逐项执行并粘贴真实输出：`npm test -- --run`、`npm run lint`、`npm run typecheck`、`npm run build`、`npm run check-port`、`git diff --check`、`git status --short --branch`、`git log -5 --oneline`。
> - 更新 `.project-board/state.json`、`board.md`、`events.jsonl`、`handoff.md` 和 spec/plan，记录每条 P1/P2 的整改状态与证据。
> - 输出《整改报告》：按 P1-01～P1-05、P2-01～P2-12 列出“已修复/部分修复/不修复+理由+证据”，附命令输出和文件行号。
> - 若不同意某条，必须给出代码/规范证据并请用户裁定，不得静默跳过。
> - 修复顺序建议：P1-01 → P1-02 → P1-03 → P1-04 → P1-05 → P2-03/04/05 → P2-06/07/08 → P2-09～P2-12 → P3。

---

审阅记录：本次只读审阅未修改被审阅代码、spec、plan、进度板或 `phase3-plan.md`；未提交 Git；未部署；未调用真实外部服务。本存档为按用户要求新增的审阅记录文件。
