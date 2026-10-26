# 镇安县生态产业协会管理中台 · 交接文档

- 交接时间：2026-10-21 15:40（Asia/Shanghai）
- 项目路径：E:\\company-apps\\zhenan-association
- 当前分支：master（本地仓库，无远程，未 push）
- 基线提交：084a312 chore: establish git baseline
- 流程依据：《应用开发流程规范-20261021-v1.1》（Standard Library，发布候选稿待签发，用户明确要求本轮执行）
- CTX：未检测

## 一、当前阶段

**阶段5 交接顶级模型完成正式实现（用户确认局域网网页正常，Demo评审通过）**。状态：Demo spec 已获用户批准；按 Harness `historical documents/harness审阅-会员台账Demo-20261021-v1.0.md` 的 P1-1 至 P2-6 整改完成。自动化、类型、lint、build 和本机 HTTP smoke 已通过；用户确认局域网网页正常；此前另一台LAN设备的访问是历史记录，逐项员工交互证据未独立采集。真实数据、线上环境和正式 API 边界保持不变。

按 v1.1 阶段定义：当前已进入阶段5正式实现；阶段4 Demo评审记录与已有编码成果保留，不回退。

应用显示名现统一为“镇安县生态产业协会管理中台”。正式网盘映射目录仍按已确认契约保留“2. 镇安生态产业协会管理中台”；本地模拟归档区为 `2. 镇安县生态产业协会管理中台/`，不连接正式网盘。

## 二、已验证事实（本会话真实执行或读取）

1. 本会话读取并执行《应用开发流程规范-20261021-v1.1》全文；配套业务规范确认版本：应用搭建结构 v1.1、组织架构 v1.0、网盘映射 v3.1、任务发布 v1.0、统一通知 v1.0、任务接口合同 v1.0（均位于 E:\\company-apps\\Standard Library）。
2. Git 状态（交接时实测）：master @ 084a312；已修改未提交：.gitignore、package.json、.project-board 四件（board.md / events.jsonl / handoff.md / state.json）；未跟踪：.next-start.log、.next-start-err.log（运行日志，建议加入 .gitignore）。无 AGENTS.md（Test-Path 返回 False）。
3. package.json 未提交改动：新增脚本 "start:lan": "npx next start -H 0.0.0.0 -p 3000"。.gitignore 未提交改动：补强环境变量/密钥/本地数据排除规则（!.env.example 例外、.envrc、*.secret、*.token、secrets/、credentials/、local-data/、data/local/）。
4. 历史验证基线（2026-10-21 阶段0记录，本会话未重跑）：npm test -- --reporter=dot 35 文件/96 测试通过；npx tsc --noEmit、npm run lint、npm run build 通过。
5. 局域网测试服务（本会话实测）：后台启动 next start -H 0.0.0.0 -p 3000（PID 35708，日志 .next-start.log），http://192.168.0.101:3000/ 返回 HTTP 200。防火墙入站规则 zhenan-local-test-3000（TCP 3000，Private/Domain）已由用户创建成功。内网 IP 192.168.0.101（有线网卡，网关 192.168.0.1，本机另有 Tailscale 100.84.160.43）。
6. 正式会员 API app/api/membership/units/route.ts 当前固定 tenantId=null，可信身份未接入时 fail-closed 返回 401（本会话读取代码确认，未发起变更）。

## 三、关键决策（用户本会话确认）

1. Demo 核心流程：会员台账——查询、状态筛选、分页、详情（只读）。
2. Demo 仅用合成数据，页面显眼标注"演示数据/非真实会员"；新增隔离路径 /demo/membership/units，不改正式菜单层级（四级约束）。
3. 正式 API 保持 fail-closed 401 不变；模拟数据经 MemberUnitReader 接口注入，与 Drizzle 真实数据源隔离。
4. 员工测试 = 本地局域网（同一 WiFi/有线网段），HTTP 明文仅限内网，不映射公网。
5. 真实数据不进 Demo；等上线之后（阶段7测试环境起，需飞书登录+权限+备份）才使用真实数据。

## 四、未完成事项

1. 用户/员工人工验收本地页面标注、未知 ID 404、搜索/状态/分页和另一台 LAN 设备访问能力。
2. 验收通过后再决定是否提交；不得接入真实数据或线上环境。
3. 阶段5 交接顶级模型做正式实现（含阶段7测试环境规划：真实数据+身份+备份留存）。
4. 杂项：将 .next-start.log / .next-start-err.log 加入 .gitignore；5+2 个文件未提交改动待用户决定是否提交为检查点。
5. 外部未知项（不得臆造）：application_id、模块负责人、统一员工 ID/租户映射、与光联调参数、飞书机器人参数。

## 五、下一步\n\n用户/员工完成人工验收后，由用户决定是否提交检查点。不得连接线上（zast.qlf3.com为旧版生产，与本机Demo无关）。\n\n## 六、多应用端口备忘（用户已确认分配）

镇安协会 3000（已分配；当前监听 PID 35708，进程归属未核实）/ 望向山 3001 / 特产店 3002 / 旅拍馆 3003 / 旅行社 3004 / 新应用从 3005 顺延。

## 七、运行命令

- 局域网启动：npm run start:lan（或 npx next start -H 0.0.0.0 -p 3000）
- 测试：npm test -- --reporter=dot
- 类型/静态：npx tsc --noEmit；npm run lint
- 构建：npm run build
- 停止后台服务：Stop-Process -Id 35708（PID 可能变化，用 netstat -ano | Select-String ':3000.*LISTENING' 查最新）

## 八、2026-10-21 归档规范更新

- 用户确认将归档规则写入正式网盘映射规范；已更新 `E:\company-apps\Standard Library\网盘映射管理与文件命名规范-20261019-v3.1.md` 为 v3.2（正文日期 2026-10-21）。
- 规则：OA 附件同步与业务页面上传为两类来源；页面上传不让员工选择目录，按当前页面绑定的 1-4 级菜单上下文归档。1-2 级必有，3-4 级按业务实际可选；目录按固定序号创建，有文件才创建。
- 迭代型文件按主题只保留最新版，旧版进入 `文件主题历史资料` 并追加 `-旧版`；独立内容型文件全部保留在当前业务目录。可解析文件允许内容扫描辅助命名，无法可靠判断则人工确认。
- 不使用 `待归档`、`已归档` 作为业务流程目录；本地模拟目录不代表正式归档实现。
- 本次未实现上传、内容扫描、自动移动或正式网盘连接；未操作线上、未提交。规范正文和项目引用已回读，旧规则检索无残留；应用测试未运行，CTX：未检测。

## 九、2026-10-21 LAN Demo 已启用

- 已停止旧的 3000 端口进程并以 `npm run start:lan` 重启，当前监听 PID 为 54844，脚本注入 `DEMO_MODE=true`。
- 实测 `http://192.168.0.101:3000/demo/membership/units` 返回 200；详情返回 200；未知 ID 返回 404；`/api/demo/membership/units` 返回 200；正式 `/api/membership/units` 仍返回 401。
- 这表示局域网现在访问的是当前 `.next` 构建中的 Demo 路由。真实会员数据、正式身份适配、上传归档和其他“下一波”模块仍未启用。

## 十、2026-10-21 菜单路由与测试账号边界

- 对当前导航定义的 33 个目标路由逐项发起 HTTP GET，全部返回 200；“打不开”与“页面可达但显示待接入骨架”需要区分处理。
- 除会员台账 Demo 外，其余路由当前是页面/导航/权限资源码骨架，未实现真实业务数据、写入操作或外部同步；不能宣称已具备每项功能测试能力。
- 当前仓库没有登录页、会话存储、密码认证或补充账号实现。正式权限设计要求飞书 OAuth/补充账号与服务端可信会话，并由与光下发权限绑定；因此本轮不编造员工账号、不用固定密码绕过正式 API。
- 员工线下可立即测试 Demo 路径；正式会员页继续按未接入身份返回 401。要提供按角色登录测试，下一步必须先确认本地测试身份方案和与正式权限的隔离边界，再实现并验证。

## 十一、2026-10-21 本地合成页面测试层

- 用户确认当前先不依赖身份权限进行线下页面测试；已为 `DEMO_MODE=true` 下的 catch-all 菜单页面增加本地合成测试层。
- 合成测试层覆盖搜索、状态筛选、视图切换、重置、分页和只读查看，页面明确标注“线下测试数据”，不接正式 API、不写数据库、不代表真实业务功能已上线。
- 代码文件：`components/workspace/local-module-test-panel.tsx`、`app/[...slug]/page.tsx`、`app/globals.css`。
- 验证：npm test 39 文件/117 测试通过；npx tsc --noEmit、npm run lint、npm run build 通过；重启 LAN 后 `/admin/accounts` 返回 200 且包含线下测试层，正式会员 API 仍 401。
- 当前 LAN 由 `npm run start:lan` 提供，员工无需账号即可测试合成页面。真实身份/按角色权限账号仍待可信会话协议，不生成固定密码账号。

## 十二、2026-10-21 本地角色账号与新增会员测试

- 修复 `/membership/units` 在 Demo 模式下的静态预渲染问题，页面改为动态读取 `DEMO_MODE`；`/demo/login` 同样改为动态路由。LAN 服务已重新构建并重启，当前 PID 25292。
- “新增会员单位”在 Demo 模式下可点击，打开本地测试表单；保存内容仅写浏览器 `localStorage`，不写数据库、不进入正式 API。
- 本地测试登录入口：`http://192.168.0.101:3000/demo/login`。账号仅在 `DEMO_MODE=true` 有效：
  - `founder` / `DemoFounder-2026`：创始人
  - `finance` / `DemoFinance-2026`：财务
  - `project-lead` / `DemoProjectLead-2026`：项目负责人
  - `project-member-1` / `DemoProjectMember1-2026`：项目成员
  - `project-member-2` / `DemoProjectMember2-2026`：项目成员
- 这些是本地合成测试身份，角色范围用于测试展示，不等同飞书/与光正式权限；正式 API 仍保持 401。
- 验证：新增账号单测 2 项、新增会员页面单测 1 项；全量 41 文件/120 测试通过；tsc、lint、build 通过；LAN `/demo/login`=200、`/membership/units`=200、正式API=401、Demo API=200。
- 浏览器若仍显示旧的禁用按钮，需要强制刷新页面（Ctrl+F5），因为之前标签页已缓存旧构建 HTML。


## 2026-10-21 Harness 整改与本机浏览器验收补充

- P1-1 至 P2-6 整改完成；最终自动化测试39文件/114测试通过，tsc、lint、build通过（以当日实际运行记录为准）。
- production build 本机浏览器验收：琥珀色警示、详情演示声明、未知ID专属404、分页、停用筛选、名称搜索通过。
- 3000端口既有PID 35708监听，start:lan启动失败EADDRINUSE；进程详情读取被系统拒绝，未杀进程。隔离回环端口3188验收后已停止。
- 未验证：LAN另一台设备访问；员工视觉/交互人工验收。
- 工作区未提交，不部署，不接真实数据，不做数据库写入/迁移。启动日志仍被现有进程占用，已加入.gitignore但未删除。
- CTX：未检测。


## 2026-10-21 阶段5恢复补充

- 用户明确确认局域网网页正常，Demo评审通过；按流程进入阶段5正式实现，不再等待Demo人工验收。
- 实施计划指出可信租户/权限须由已验证会话和与光权限注入。真实字段/授权协议、测试账号和联调环境仍未核实；正式会员 API 继续 fail-closed 401。
- 建议首个切片：会员单位正式只读查询的可信会话与 `membership.units` 授权适配。若用户希望并行推进不依赖外部参数的其他模块，请指定目标；新功能按已批准设计/spec执行，未有设计的部分先补齐设计和计划。
- CTX：未检测。工作区未提交；未操作线上。

## 2026-10-21 阶段5身份上下文首切片完成

- 用户确认身份适配设计：服务端 `RequestContextProvider` 提供已验证用户上下文；handler 不信任客户端租户；缺失上下文401、缺读取动作403；Drizzle reader 仅做租户过滤；未有真实协议前正式 API 继续 fail-closed。
- 已新增 `modules/shared/auth/request-context.ts`，定义 `MemberUnitRequestContext`、`MEMBER_UNIT_READ_ACTION`、`RequestContextProvider` 与 `createFailClosedRequestContextProvider()`。
- `modules/membership/member-unit-route.ts` 改为接收 context，授权后仅将 context.tenantId 传给查询契约；401/403 时不访问 reader。正式 Route 调用默认 null provider；Demo Route 注入 demo-tenant 与合成 read action。
- 测试：`npm test -- tests/membership/member-unit-route.test.ts --reporter=dot` 7/7通过；formal/Demo focused 3文件12测试通过；最终 `npm test -- --reporter=dot` 39文件/117测试通过；`npx tsc --noEmit`、`npm run lint`、`npm run build` 均通过。构建首次发现 Next route 不允许导出自定义 provider 常量，已改为模块私有并重跑全部检查成功。
- 未完成：外部 Feishu/与光可信会话和权限协议、测试账号、联调环境；formal API 仍401。未接真实数据、未操作线上、未部署、未提交。CTX 未检测。
- 下一步：取得并核验外部上下文协议后再实现具体 provider；任何真实访问启用前保留 fail-closed。

