# 镇安县生态产业协会管理中台进度板

阶段：5. 交接顶级模型完成正式实现（Demo评审通过；正式会员查询身份边界首切片完成）

## 2026-10-21 网盘映射与文件命名规范 v3.2 更新

- 已按用户确认更新 `E:\company-apps\Standard Library\网盘映射管理与文件命名规范-20261019-v3.1.md` 的正文规则，版本标记为 v3.2、更新时间为 2026-10-21。
- 归档来源统一为 OA 附件同步和业务页面上传；页面上传不由员工选择目录，服务端使用当前页面绑定的业务大类/模块工作/事项工作/科目工作上下文归档。
- 3 级事项工作、4 级科目工作按业务实际可选；目录序号固定；无文件目录不创建；`待归档`、`已归档` 不作为业务流程目录。
- 迭代型文件只保留当前最新版，旧版移入按主题建立的 `文件主题历史资料` 并追加 `-旧版`；独立内容型文件全部保留在当前业务目录。
- 规范允许对可解析文件内容做辅助识别，但无法可靠判断时必须人工确认，不得静默改名、合并、覆盖或移动。
- 已同步 `PROJECT-DESIGN-DOCUMENT.md` 的规范版本引用；本次只更新规范与项目板，不实现上传、扫描或正式网盘连接。
- 验证：规范正文回读、旧规则检索、`git diff --check`；未运行应用测试（本次仅文档变更）。CTX：未检测。

## 2026-10-21 应用名称与本地网盘模拟区

- 应用显示名、工作台标题、品牌资料、项目设计/实施/菜单/基线文档及应用架构规范已统一为“镇安县生态产业协会管理中台”。
- 正式网盘映射路径按用户确认保留为“中台网盘 / 3. 业务部 / 1. 项目部 / 2. 镇安生态产业协会管理中台”，未擅自改动正式目录契约。
- 在仓库下创建本地模拟目录 `2. 镇安县生态产业协会管理中台/`，包含 `待归档/` 与 `已归档/`；仅用于线下模拟，不连接正式网盘且已加入 `.gitignore`。
- 当前 3000 端口由旧构建进程监听；源码已有 Demo 路由但 `http://192.168.0.101:3000/demo/membership/units` 实测返回404。重建并重启 LAN 服务后才能验证最新版页面。
- CTX：未检测。

目标：按已确认的实施计划和页面基线完成首期代码实现。

完成标准：计划范围内的数据库 schema、迁移、服务与页面按波次实现；自动化测试、构建和部署前检查通过，未决外部参数保持明确占位。

当前状态：2026-10-21 按新流程完成阶段0现状与规范核对，建立本地 Git 基线提交 `084a312 chore: establish git baseline`。本轮本地测试 35 个文件 / 96 个测试通过，`npx tsc --noEmit`、`npm run lint` 和 `npm run build` 均通过。现有工作台左树右内容交互属于既有代码；会员查询 API 在可信身份适配未接入时 fail-closed 返回 401。正在阶段1确认可操作本地 Demo 范围；不以部署为目标，不操作线上环境。

已知边界：项目 Git 仓库为本地 `master`，尚未配置远程，未 push。当前应用及模块负责人、application_id、统一身份映射及与光接口联调参数仍未在项目材料中核实；任务/通知页面以契约和基线展示为主，生产 webhook 参数、队列 worker、飞书机器人和与光生产联调未完成。历史部署记录保留为历史证据，本轮未检查线上可用性，也未操作生产服务、数据或通知。

已确认基础规范：以 `E:\company-apps\yuguang-workbench\historical documents\网盘映射管理与文件命名规范-20261018更新版正式版.md` v3 与 `E:\company-apps\yuguang-workbench\historical documents\应用搭建结构规范-20261018正式版.md` v1 为当前唯一正式依据。镇安归口租户轻立方，网盘路径为“中台网盘 / 3. 业务部 / 1. 项目部 / 2. 镇安生态产业协会管理中台”，与订单库平级。菜单严格执行 1 级业务大类 / 2 级模块 / 3 级事项 / 4 级科目，禁止 5 级；2/3 级目录未定稿前沿用已确认结构，不自行扩展，后续新版仅起草并标记“待审核”。权限采用与光工作中台下发标准，不在本应用定义角色；组织架构以飞书同步为主，补充账号方案待定；登录需支持非飞书租户用户；OA 走钉钉并回流与光工作中台统一分流；大模型只走与光总接口；归档遵守最新网盘命名规范。

## 2026-10-21 阶段5会员查询身份上下文首切片

- 新增 `MemberUnitRequestContext`、`membership.units.read` 动作及默认 fail-closed provider；handler 仅接收服务端上下文，缺失上下文返回401，缺少读取动作返回403，两者均在查询前拒绝。
- 正式 Route 改为向 provider 请求上下文；当前 provider 固定返回 null，因此 formal API 仍保持401。未从客户端 query/header 读取租户或权限。
- Demo Route 仅在 Demo 环境显式注入 `demo-tenant` 和合成读取动作；Demo 模拟数据及 DB 隔离保持原状。
- 验证：全量 39 文件 / 117 测试通过；`npx tsc --noEmit`、`npm run lint`、`npm run build` 通过。build 清单含正式 API、Demo API 与页面。
- 未完成/未验证：Feishu/与光真实会话及权限协议、测试账号、联调环境；因此未启用任何真实身份适配，不允许将此切片视为正式授权已接通。
- 未操作线上、未部署、未提交；CTX 未检测。

下一步：获取经确认的可信会话及 `membership.units` 授权接口契约和测试账号后，单独实现并验证 provider adapter；继续保持正式 Route fail-closed。部署回滚点为 `/opt/zhenan-association-20261020-full` 旧目录及当前 systemd 配置。

验证：2026-10-18 已检查；阶段命名已按用户提供的标准10阶段更正；方案决策已由用户确认；当前目录仍不是 Git 仓库。

## 2026-10-21 新流程恢复检查点

- 流程规范：`E:\company-apps\Standard Library\应用开发流程规范-20261021-v1.1.md`（文件标注发布候选稿、待负责人签发）；用户明确要求本轮按该版本执行。配套正式业务规范：应用搭建结构 v1.1、组织架构 v1.0、网盘映射与命名 v3.1、任务发布与管理 v1.0、统一通知 v1.0、任务接口合同 v1.0。
- 已读项目规则、进度板、交接、Git 状态和近期提交；项目根目录无 `AGENTS.md`。Git 历史起始为空，未配置远程。
- 完成本地基线：`084a312 chore: establish git baseline`。`.gitignore` 排除环境变量、凭证、证书、真实历史资料、本地数据/缓存及部署包；暂存检查未发现匹配敏感路径。
- 本轮已验证：`npm test -- --reporter=dot`：35 文件 / 96 测试通过；`npx tsc --noEmit` 通过；`npm run lint` 通过；`npm run build`：运行中，结果待补。
- 已确认现有会员台账 API 在身份适配未接入时返回 401；这是预期 fail-closed 边界。Demo 若用本地模拟身份/数据，必须明显标注为模拟并与正式 API 隔离。
- 未知：本地 Demo 的目标核心流程和交互范围待用户确认；application_id、模块负责人、统一员工 ID/双租户映射及外部接口参数未验证。
- 下一步：用户确认 Demo 目标后，形成并评审 spec；之后编写实施计划、在隔离工作区按 TDD 实现并验证。当前不操作线上。
- 阶段：1. 需求澄清与设计；CTX：未检测。

## 2026-10-21 会员台账 Demo 实现检查点

- spec `docs/superpowers/specs/2026-10-21-member-ledger-demo-design.md` 已获用户批准。
- 已实现隔离 Demo：`/demo/membership/units`、`/demo/membership/units/[id]`、`/api/demo/membership/units`；使用固定合成数据和 `MemberUnitReader`，页面标注“演示数据 / 非真实会员”。
- 正式 API `app/api/membership/units/route.ts` 未修改，仍 fail-closed 401；正式菜单未增加 Demo 入口。
- 验证：Demo 定向测试 2 文件/9 测试通过；全量 37 文件/105 测试通过；`npx tsc --noEmit`、`npm run lint`、`npm run build` 通过。LAN/线上手工页面验收本轮未检测。
- 当前请求：交 Harness 做只读代码审阅，重点关注数据隔离、正式 API 未回归、路由/权限边界、合成数据声明和详情页行为。

## 2026-10-21 Harness 意见整改检查点

- 按 Harness 审阅文档 P1-1 至 P2-6 完成整改：warning banner 和页面样式；不可拨演示电话；未知 ID Next 404；纯查询契约/handler 与 DB 隔离、惰性 DB 初始化；页面/依赖/环境测试；DEMO_MODE 默认关闭且 LAN 启动显式开启；getById；详情链接提示及 Demo 专用文案。
- 验证：39 个测试文件 / 112 个测试通过；`npx tsc --noEmit`、`npm run lint`、`npm run build` 通过。本机 `DEMO_MODE=true` 下列表/API 200、未知详情 404、正式会员 API 401。
- 未验证：另一台 LAN 设备访问；由员工确认视觉警示是否足够显眼，以及完整交互人工验收。
- 正式会员 API 和正式菜单未改；无真实数据、数据库写入、迁移、线上操作或提交。

复评准备更新（2026-10-19）：三份 2026-10-19 送审规范已读取并完成一致性复核；飞书用印首期接入并经与光回流；钉钉模板、与光字段/签名、会费书面确认等仍待外部确认，复评包待交 Harness 审阅。

Harness 复评结论（2026-10-19）：有条件通过，不冻结设计。P1-1 至 P1-12 条件已处置：四级硬约束与页内标签承载、验收缺页补齐、管理入口以基线为准、协会部门残留清除、入会审批语义更正、与光角色映射、审批载体例外占位、数据对象补口、权限矩阵与异常规则、归档命名与保管字典、部署验证带入阶段 6、未决项清单校正。设计文档 v0.3 与页面基线 v1.1 已同步更新；P2 问题带入阶段 6 实施计划。仍待外部确认：镇安支出审批载体例外、钉钉模板、与光字段/签名、飞书用印参数、理事单位档位书面确认、年中折算、保管期限、部署承载、病毒扫描。三份送审规范尚未经创始人确认生效。

阶段7补充记录（2026-10-19）：用户授权 Codex 安装依赖。首次安装进程因长时间无输出被中止，留下不完整 node_modules；再次网络调用因自动审批服务断连未执行。未尝试绕过审批。离线缓存检查返回 EPERM。理事单位档位、年中折算留待后续确定，不阻塞编码。

阶段7恢复记录（2026-10-20）：进度板阶段名称和 handoff 当前阶段统一为“编码实现”；events.jsonl 第81至88条尾部多余的字面量 `\n` 已清理，旧阶段7记录已统一命名。测试命令因 vitest 不存在而未能启动，仍待依赖安装。

阶段7验证记录（2026-10-20）：npm install 成功，package-lock.json 已生成；补充 `@types/pg` 并升级 `drizzle-orm` 至 0.45.4 解决严格类型检查；修正 Drizzle 唯一约束测试断言。npm test 结果 8 个文件/11 个测试通过，`npx tsc --noEmit` 通过，`npm run db:generate` 通过并确认无新增差异，`npm run build` 通过。Next/Drizzle 在本机默认用户缓存目录遇到 EPERM，验证时将 `LOCALAPPDATA` 指向项目内可写临时目录；未写入生产配置。

阶段7最终验证（2026-10-20）：将旧 `next lint` 脚本迁移为 ESLint 9 flat config（`eslint.config.mjs`），忽略 Next 生成的 `next-env.d.ts`；`npm run lint` 通过。最终重跑结果：npm test 8/8 文件、11/11 测试通过；`npx tsc --noEmit`、`npm run lint`、`npm run build`、`npm run db:generate` 均通过。`db:migrate` 仍待真实 DATABASE_URL。

阶段7 schema第一轮（2026-10-20）：按设计文档补齐 `member_unit.credit_code` 全局唯一、`permission_binding.action`、person/resource 外键、`audit_event.trace_id`、`summary` 和 actor 外键；先新增失败测试，后完成最小实现。生成 `db/migrations/0001_unknown_tag.sql`。最终重跑 8 个测试文件/11 个测试、tsc、lint、build、db:generate 全部通过。下一步进入会员模块与页面波次实现。

阶段7会员会费第一批（2026-10-20）：按 TDD 新增 `fee_standard`、`fee_bill`、`fee_payment` schema 与测试；金额统一 `numeric(14,2)`，账单按租户+会员单位+年度唯一，外部折算规则和理事档位不写死。生成 `db/migrations/0002_mushy_squadron_sinister.sql`。最终验证 9 个测试文件/14 个测试、tsc、lint、build、db:generate 全部通过。

阶段7外部会员表单规则（2026-10-20）：按 TDD 实现 `createFormToken`、`getDefaultFormExpiry`、`validateAttachmentBatch`；令牌使用 32 字节 base64url，默认有效期 7 天，单文件上限 20MB、单次最多 10 个附件。专测及最终验证通过：11 个测试文件/22 个测试、tsc、lint、Next build、db:generate 均通过。下一步实现外部表单 API、提交幂等和附件接收流程；真实 `db:migrate` 仍待 DATABASE_URL。

阶段7外部会员表单提交服务（2026-10-20）：按 TDD 实现 `validateExternalFormSubmission`、`createSubmissionIdempotencyKey` 和 `submitExternalForm`；覆盖五项必填资料、提交编号非空、租户级幂等键、令牌摘要查询、链接生命周期拒绝，以及由存储层保证的原子 get-or-create。最终验证 13 个测试文件/29 个测试、tsc、lint、Next build、db:generate 均通过。真实 Route、PostgreSQL 存储适配和飞书临时区附件上传仍待平台上传参数及 DATABASE_URL。

2026-10-20 与光最终规范接入登记：已读取并核对组织架构管理规范 v1.0、应用搭建结构规范 v1.1、网盘映射管理与文件命名规范 v3.1、任务发布与管理规范 v1.0、统一信息通知与应用消息通道规范、任务接口合同 v1.0、任务功能配置启动清单及一致性自检记录。镇安应用归属轻立方 / 业务部 / 项目部，正式网盘目录保持“中台网盘 / 业务部 / 项目部 / 镇安生态产业协会管理中台”。新增接入前提：正式 application_id、模块 ID、负责人、接口签名和回调注册、轻立方租户本应用机器人、统一员工 ID 映射、测试账号与联调环境。当前不得开启生产通知或生产任务接入。

阶段7统一员工ID映射（2026-10-20）：按 TDD 新增 `person.unified_employee_id` 及租户内唯一索引，新增 `createPersonIdentityMapping` 纯函数服务，校验租户与统一员工ID必填并规范化外部ID；生成 `db/migrations/0004_noisy_iron_lad.sql`。最终验证 14 个测试文件/32 个测试、tsc、lint、Next build、db:generate 均通过。真实 `db:migrate` 仍待 DATABASE_URL；与光正式映射和联调参数仍待外部登记。

阶段7统一通知契约（2026-10-20）：按 TDD 新增 `notification_event` 表及 `createNotificationEvent` 纯函数服务，覆盖 `created/updated/expired` 事件、来源应用、统一员工 ID 收件人、幂等键、权限感知深链和重试状态；生成 `db/migrations/0005_typical_scarecrow.sql`。最终验证 15 个测试文件/36 个测试、tsc、lint、Next build、db:generate 均通过。真实外发 worker、飞书机器人、与光回调和运行时深链权限校验仍待外部参数与后续波次。

阶段7任务契约（2026-10-20）：按 TDD 新增 `task_item` 表及 `createTaskContract` 纯函数服务，覆盖日常/业务/项目三类任务、命名收件人、发布人验收、租户内幂等键、状态和失败重试字段；生成 `db/migrations/0006_loving_mongoose.sql`。最终验证 17 个测试文件/40 个测试、tsc、lint、Next build、db:generate 均通过。任务看板页面、与光 API、来源应用机器人、回调和生产接入仍待后续波次及外部参数。

阶段7 webhook 回调契约（2026-10-20）：按 TDD 新增 `webhook_event` 表及回调纯函数服务，覆盖 `notification.created/updated/expired` 白名单、provider+event 幂等键、queued/retry 状态和 HMAC-SHA256 验签；生成 `db/migrations/0007_same_the_hood.sql`。最终验证 19 个测试文件/44 个测试、tsc、lint、Next build、db:generate 均通过。真实回调地址、密钥、worker 消费和生产接入仍待外部登记与后续波次。

阶段7深链权限校验（2026-10-20）：按 TDD 新增 `authorizeDeepLink` 纯函数服务，要求租户、统一员工 ID、资源码、动作和权限绑定全部匹配，缺失上下文或不匹配默认拒绝；未新增数据库表或迁移。最终验证 20 个测试文件/47 个测试、tsc、lint、Next build 均通过。真实路由接入、与光权限同步和 worker 消费仍待后续波次。

阶段7来源应用机器人配置（2026-10-20）：按 TDD 新增 `integration_config` 表及 `createRobotConfig` 纯函数服务，校验轻立方租户、application_id、机器人标识、Feishu provider、启用状态和 `secret://` 凭据引用，拒绝明文凭据和禁用发送配置；生成 `db/migrations/0008_wet_wither.sql`。最终验证 22 个测试文件/51 个测试、tsc、lint、Next build、db:generate 均通过。真实机器人凭据、飞书 API 发送适配器和生产接入仍待外部登记。

阶段7共享失败补偿策略（2026-10-20）：按 TDD 新增 `getRetryDecision` 和 `isReplayableStatus`，统一最多 3 次尝试、1/2/4 分钟指数退避、死信状态和 queued/retry 可重放判定；未新增数据库表或迁移。最终验证 23 个测试文件/54 个测试、tsc、lint、Next build 均通过。真实队列 worker、死信存储和外部发送补偿仍待后续波次。

阶段7 outbox/worker 事件契约（2026-10-20）：按 TDD 新增 `outbox_event` 表及 `createOutboxEvent` 纯函数服务，记录租户、事件主体、幂等键、载荷、pending 状态、尝试次数、可执行时间和最后错误；生成 `db/migrations/0009_last_red_hulk.sql`。最终验证 25 个测试文件/58 个测试、tsc、lint、Next build、db:generate 均通过。真实队列消费、事务内原子入队实现和外部发送仍待后续波次。

阶段7 outbox worker 状态转换（2026-10-20）：按 TDD 新增 `claimOutboxEvent`、`completeOutboxEvent`、`failOutboxEvent`，复用共享退避策略处理 pending/retry → processing → succeeded/retry/dead_letter，拒绝未到执行时间或非法状态；未新增数据库表或迁移。最终验证 26 个测试文件/61 个测试、tsc、lint、Next build 均通过。真实数据库 claim、worker 进程、事务内原子入队和外部发送仍待后续波次。

阶段7 outbox 原子入队契约（2026-10-20）：按 TDD 新增 `enqueueOutboxEvent` 与 `OutboxStore.insertOrGet` 接口，保证同租户同幂等键首次创建、后续重放返回已有事件；未新增数据库表或迁移。最终验证 27 个测试文件/63 个测试、tsc、lint、Next build 均通过。PostgreSQL `insertOrGet` 适配、真实事务验证和队列消费仍待 DATABASE_URL 与后续波次。

阶段7 webhook 入站适配（2026-10-20）：按 TDD 新增 `receiveWebhook` 纯函数，将 HMAC 验签、JSON 解析、通知事件白名单和 `202/400/401` 结果组合为可供 Route 调用的契约；未新增数据库表或迁移。最终验证 28 个测试文件/66 个测试、tsc、lint、Next build 均通过。实际 Next Route、持久化入队和生产回调仍待外部回调参数与 DATABASE_URL。

阶段7生产部署验证（2026-10-20）：通过阿里云 ECS Workbench 完成服务器侧收尾。修正 PostgreSQL 本机 TCP 认证规则并重设 `zhenan_app` 凭据，使用受限 `/etc/zhenan-association/app.env`；真实 `db:migrate` 成功，`drizzle.__drizzle_migrations` 记录 10 条。systemd `zhenan-association` 已切换至 `/opt/zhenan-association-20261020-full` 并加载环境文件，状态 active；`curl http://127.0.0.1:3000/` 返回 200。宝塔 Nginx 进程监听 80/443，服务器和浏览器访问 `https://zast.qlf3.com/` 均返回 200。凭据未写入仓库或进度板。

阶段7实际 webhook Route（2026-10-20）：按 TDD 新增 `modules/shared/integration/webhook-route.ts` 与 `app/api/webhooks/yuguang/route.ts`。Route 读取可配置签名请求头，复用 HMAC 验签、事件白名单和 JSON 校验，调用数据库 `webhook_event` 的 provider+event 幂等入队，返回 202/400/401/503；不在 Route 内写业务表。新增 5 个测试，最终 29 个测试文件/71 个测试通过，tsc、lint、Next build、db:generate 均通过。该切片尚未重新发布到已验证的生产目录，待外部回调参数和受控发布。

阶段7飞书品牌资料（2026-10-20）：新增 `public/brand/zhenan-association-icon.svg` 与 1024px PNG 图标，并记录飞书应用名称、测试版简介、正式版简介和图标寓意。当前图标可用于企业自建应用测试版；应用业务功能和外部联调状态仍按进度板边界执行。

阶段7飞书图标迭代（2026-10-20）：根据用户反馈重做图标，主图改为简洁的抽象 Z 形协作路径与单片叶片，已更新主 PNG/SVG 文件并保留 v2 文件留档；PNG 重新转换并检查为 1024×1024。

阶段7飞书测试版发布（2026-10-20）：飞书企业自建应用版本 1.0.0 已发布，范围为“部分成员”，当前成员为“轻立方-胡杨”；移动端和桌面端默认能力均为网页应用，入口为 https://zast.qlf3.com/。对外群与外部用户单聊保持关闭。首次保存提示“参数不合法”，返回版本列表核实状态为“已发布”。

阶段7工作台与模块页（2026-10-20）：按页面基线实现 `/workspace` 工作台、`/membership/units` 会员台账以及其余菜单模块的通用路由页；导航契约和模块页定义新增测试。模块页显示资源码、实施波次、页内视图和“待接入”状态，不伪造业务数据。最终验证 31 个测试文件/76 个测试、tsc、lint、Next build 全部通过；本地预览已验证 `/workspace` 与 `/admin/integrations` 返回 200。新版部署包为 `deploy/zhenan-association-20261020-workspace.tar.gz`，待 Workbench 登录恢复后发布。

阶段7新版受控部署（2026-10-20）：新版包 `deploy/zhenan-association-workspace-v2.tgz` 通过服务器端 SHA256 校验，解包至 `/opt/zhenan-association-20261020-workspace-v2`；服务器 `npm ci`、`npm run build`、加载受限环境文件后的 `npm run db:migrate` 均成功。systemd 已切换到新版目录；本机根路由为 307、`/workspace` 和 `/membership/units` 为 200，公网 HTTPS 三个路由均为 200。Workbench 上传任务仍显示阿里云 `NoSuchKey`，本次改用终端小分块传输完成，未修改受限环境文件。

阶段7根入口缓存修复（2026-10-20）：确认旧白色基线页来自宝塔 Nginx 全局 `proxy_cache` 缓存；已备份 `/www/server/panel/vhost/nginx/zast.qlf3.com.conf`，对该站点加入 `proxy_cache off`、`proxy_no_cache 1`、`proxy_cache_bypass 1`，清空旧代理缓存并 reload Nginx。服务器公网验证：`https://zast.qlf3.com/` 返回 307 到 `/workspace`，`/workspace` 页面包含“运营总览”，不再显示旧基线文案。

## 2026-10-20 W1 会员单位查询切片

- 新增服务端会员单位查询 Route：`GET /api/membership/units`，支持名称/统一社会信用代码搜索、状态过滤、分页、稳定排序及总数。
- SQL reader 始终按可信租户 ID 过滤；客户端不得传入 `tenantId`。
- 当前项目尚无可信会话与权限适配器，Route 明确固定无租户上下文，返回 401（fail-closed）；页面仍为占位页，线上未部署本轮代码。
- 验证：33 个测试文件 / 83 个测试通过，`npx tsc --noEmit`、`npm run lint`、`npm run build`、`npm run db:generate` 通过。无 schema 变化，无需迁移。
- 下一步：接入可信 Feishu/与光会话及 `membership.units` 授权检查，再连接页面；获得验证与受控发布条件后部署。
- CTX：未检测。项目目录不是 Git 仓库，无提交可记录。

## 2026-10-20 工作台左树右内容交互

- 新增可复用客户端侧栏组件：一级菜单默认折叠，点击一级菜单按钮展开，再次点击折叠。
- 二级菜单使用同一工作台壳层切换右侧内容；左侧菜单树保留，当前项高亮，展开状态保存在当前浏览会话中。
- `/workspace`、`/membership/units` 和通用模块路由均接入同一侧栏，不再使用只有右侧内容的独立页壳层。
- 本地浏览器验证：默认折叠、展开/折叠、点击会员台账后左树保留且右侧显示台账内容均通过。
- 验证：34 个测试文件 / 85 个测试通过，`npx tsc --noEmit`、`npm run lint`、`npm run build`、`npm run db:generate` 通过；本轮 UI 修改未部署。
- 下一步：制作新版部署包并按受控流程发布；发布后再验证公网左树右内容交互。
- CTX：未检测。项目目录不是 Git 仓库，无提交可记录。

## 2026-10-21 会员台账 Demo Harness 整改与本机验收

- 当前阶段：阶段4 优先线下验证和 Demo 评审；整改和本机浏览器验收完成，待用户员工验收。
- Harness P1-1 至 P2-6 已逐项完成；最终自动化 39 文件/114 测试、tsc、lint、build 通过（以此前实际输出及 events 记录为准）。
- 本轮使用 production build 浏览器检查：列表警示 banner 可见；详情字段与标注正确；未知 ID 呈现 Demo 专属 404；分页、停用状态筛选、名称搜索可用。正式 API 401 smoke 已记录，边界未改变。
- 3000 端口由既有 PID 35708 监听；系统拒绝读取进程详情，未停止该进程。start:lan 遇 EADDRINUSE。隔离端口 3188 已用于本机验证并停止。
- 未验证：另一台 LAN 设备访问、员工本人视觉/交互验收。
- 无线上操作、无提交、无真实数据、无数据库写入/迁移。CTX：未检测。


## 2026-10-21 Demo评审通过，进入阶段5

- 用户确认：“现在局域网网页是好的”，据此将阶段4 Demo评审记为通过；之前本机浏览器检查覆盖 banner、详情、未知ID 404、搜索、筛选和分页。LAN页面的用户确认来源于用户陈述；LAN异机逐项交互证据仍未独立采集。
- 按《应用开发流程规范-20261021-v1.1》进入阶段5正式实现。Harness P1-1至P2-6整改、39文件/114测试、tsc、lint、build及本机生产构建 smoke 见前序事件。
- 建议首个正式实现切片：会员单位正式只读查询的可信会话和 `membership.units` 授权适配。实施计划要求租户/权限由可信服务端上下文注入；与光真实字段/授权协议、测试账号及联调环境尚未核实。缺少这些输入时，正式 API 保持 fail-closed 401，不以模拟身份放开。
- 用户尚未指定阶段5首个切片/外部联调参数；待本次需求澄清，不操作线上、不提交。
- CTX：未检测。
