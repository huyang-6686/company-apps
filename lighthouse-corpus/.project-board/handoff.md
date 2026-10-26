# 灯塔知识库交接记录

## 恢复入口

新对话先读取以下文件，再检查源代码和测试：

1. `.project-board/state.json`
2. `.project-board/board.md`
3. `.project-board/events.jsonl` 最后 20 条
4. 本文件
5. `server/` 与 `demo/` 当前文件

当前 Superpowers 阶段：`6. 实施计划`。CTX：`未检测`。

## 2026-10-20 部署恢复核验

- 已按部署前恢复清单回读四项进度与交接文件；阶段仍为 `6. 实施计划`。
- 当前目录不是 Git 仓库，分支、最近提交和工作区状态均为“未检测”。
- 指定目录和文件均存在；入口使用 `node src/index.js`，默认 `PORT=3000`，静态托管 `demo/`，API 前缀为 `/api/workbench`。
- 在 `server/` 执行 `node --test test/*.test.js`，实际结果为 30 项通过、0 项失败；两个 Demo 文件语法检查通过。
- 本轮未启动服务；`http://localhost:3000/` 与 `/api/workbench/audit-demo` 检查均为连接被拒绝。因此没有本轮运行中的 HTTP 200 证据，也未宣称部署成功。
- 未改应用代码、未安装依赖、未部署。等待部署服务器/数据库/DNS/反向代理及飞书凭据准备信息后再进入上架前核验。

## 2026-10-20 本地服务启动验证

- 按用户指示启动 `server/src/index.js`，本地进程 PID `55464`，监听 `3000`。
- `/health`、首页 `/` 和 `/api/workbench/audit-demo` 均返回 HTTP 200；启动日志为 `Lighthouse server listening on port 3000`，无 stderr 输出。
- `audit-demo` 返回 `source=mock_demo`，仍是演示接口；真实数据库、工作台、节点基线、飞书和网盘能力均未接入。
- 本次只启动本地服务，未操作 ECS、宝塔、镇安项目、80/443 或公网域名。

## 2026-10-20 本地服务存活复核

- PID `55464` 仍在运行，进程为 `node`。
- `/health`、`/` 和 `/api/workbench/audit-demo` 再次返回 HTTP 200；日志无 stderr 输出。

## 2026-10-20 公网只读检查

- DNS 核验显示 `lh.qlf3.com` A 记录指向 `39.105.54.62`。
- 当前环境对 `lh.qlf3.com:443` 和 `zast.qlf3.com:443` 的访问被本机套接字权限阻断；公网 HTTPS 状态仍未知，未执行任何线上变更。

## 已完成

- 已完成阶段 0 设计与实施计划文档，并按最新正式规范修正租户、权限、归档和 OA 边界。
- Demo 已具备八页导航、三库定位、旧分类树说明、通知五个板块、基线 JSONL 校验、审计演示和角色切换。
- Demo 顶部可切换“创始人 / 普通员工”视角；搜索请求按视角传递权限集合。创始人可查看四级敏感内容，普通员工只传入 `public` 权限。
- Node 后端已建立 Express 入口、工作台占位路由、状态机、四级敏感字段过滤、审计服务、节点基线解析、检索服务、通知规则和通知服务。
- 已接入本地 Demo 的通知、搜索、审计和基线校验接口；服务托管 `demo/` 静态目录。
- 最近一次复测命令：在 `server/` 执行 `node --test test/*.test.js`，结果为 30 项通过、0 项失败。

## 当前阻塞

- 工作台批准接口契约尚未提供，`/api/workbench/role` 和 `/api/workbench/nodes` 仍为 `not_implemented`。
- `nodes_v2.jsonl` 未在工作区找到；历史资料存在 69685 与 69787 两个冲突数量，不能据此导入。
- PostgreSQL 托管能力、百度网盘连接器、开放平台权限和服务器部署凭据仍未取证。
- 当前目录不是 Git 仓库，分支、提交和工作树状态无法核验或提交。

## 下一步边界

可以继续做不依赖外部凭据的本地开发：

- 通知 Demo 与 `noticeService` 的更完整联动；或
- 审计查询页的筛选和分页演示；或
- 角色字段矩阵的纯函数测试扩展。

不得把 Demo 模拟数据当成真实节点库，也不得在批准契约缺失时实现真实工作台调用、真实权限同步或节点导入。

## 恢复命令

```powershell
Set-Location E:\company-apps\lighthouse-corpus\server
node --test test/*.test.js
node src/index.js
```

浏览器访问：`http://localhost:3000`。

## 交接状态

本文件用于恢复上下文，不代表阶段 0 已验收。真实外部接口和数据验证仍保持阻塞。

## 2026-10-21 分享页安全回归补充

- 变更：新增 `demo/shareView.js`，对分享页所有动态 HTML 文本进行转义；`demo/index.html` 在 `demo.js` 前加载该模块。
- 验证：`node --test server/test/*.test.js` 为 39 pass/0 fail；JavaScript 语法检查通过；隔离 `127.0.0.1:3210` 的 `/health` 和分享状态机 HTTP 流程通过。
- 固定局域网端口：`npm run start:lan` 固定 `0.0.0.0:3003`，实测当前已有 PID `16028` 监听，因此按要求报错退出；未改端口、未停止未知进程。当前不能宣称 3003 正常启动路径已验证。
- 后续只读核验：`http://127.0.0.1:3003/health` 与 `/` 均 HTTP 200，返回符合灯塔服务；PID 命令行读取被系统拒绝，进程归属未确认，故未停止。
- 局域网访问核验：`http://192.168.0.101:3003/health` 与 `/` 均 HTTP 200，首页标题为“灯塔知识库 Demo（模拟数据）”。这是本地模拟 Demo 的访问证据，不是飞书租户扫描或真实新闻情报接入证据。
- 边界：分享存储仍为进程内 `mock_demo`，不接真实工作台、飞书、数据库或生产知识库；XSS 回归只验证渲染转义辅助，未执行浏览器自动化 CSP/DOM 执行扫描。

## 2026-10-21 分享卡片渲染上下文回归

- 会话 ID 进入内联 `onclick` 时存在 HTML 属性与 JavaScript 字符串嵌套上下文风险。已将卡片渲染提取至 `demo/shareView.js`，只允许服务端生成的 `sh` 加数字 ID 生成操作按钮；恶意/异常 ID 不生成操作按钮。普通展示字段仍统一 HTML 转义。
- 新增恶意内容和 ID 回归，以及正常生成 ID 的按钮回归；`node --test server/test/*.test.js` 为 41 pass/0 fail。
- 语法检查通过；LAN `/health`、`/` 和 `/shareView.js` 均 HTTP 200。页面标记为模拟数据 Demo，真实租户扫描、新闻情报、工作台、数据库和飞书仍未接入。

## 2026-10-21 本地接口场景回归补充

- 使用隔离 `127.0.0.1:3211` 启动并停止服务，未修改或停止固定 `3003` 服务。
- 已验证：健康检查；分享空输入拒绝；重复链接合并；非法状态迁移拒绝；外链视频进入 `asked`；创始人意见为空拒绝；公开/无权限检索；受限正文裁剪；JSONL 有效/非法行计数。
- 证据结果：`200`、`400` 和返回字段均符合当前模拟契约。所有数据来自显式请求或进程内存，不得解释为真实租户、新闻来源或生产数据库验证。

## 2026-10-21 通知错误边界回归补充

- 隔离 `127.0.0.1:3212` 完成并停止：合法通知首次接收、事件幂等重试、不允许 OA 类型、非法状态迁移、缺失基线文本和模拟审计来源均已验证。
- 结果均来自进程内 `mock_demo` 存储；真实飞书通知、工作台审计和数据库仍未验证。

## 2026-10-21 根目录验证入口

- `package.json` 已提供 `npm test` 和 `npm run check`；本轮实测分别为 41 pass/0 fail 和退出码 0。
- `npm run start:lan` 固定监听 0.0.0.0:3003；当前端口被占用时以退出码 1 拒绝启动，未自动换端口。
- 提交尝试受 `.git/index.lock` `Permission denied` 阻断；未修改 Git ACL 或绕过权限。当前成果仍在工作区，HEAD 保持 `3871f07`，无远程。
- 21:45 再次重试暂存/提交仍失败，同样为 `.git/index.lock` `Permission denied`；无残留锁文件，未改 ACL、全局配置或工作区内容。
- 用户随后明确授权仓库写入；已使用命令级临时提交者身份完成提交 `0a29f89 feat: complete local demo validation baseline`。提交后 `npm test` 为 41 pass/0 fail，`npm run check` 通过；工作区仅保留未跟踪 `.superpowers/` 临时目录。

## 2026-10-21 通知联动续作

- 按阶段 6 范围完成本地通知 Demo 联动：`server/src/services/demoNoticeStore.js` 提供进程内数据；`POST /api/workbench/notices-demo/events` 复用 `noticeService.receiveEvent`；Demo 页面操作后刷新服务端状态。
- 数据仅为 `mock_demo`。没有接入真实数据库、飞书机器人、工作台、节点基线或云服务器。
- 验证：在 `server/` 执行 `node --test test/*.test.js`，33 pass、0 fail；`node --check` 检查路由、模拟存储与 `demo/demo.js` 通过。PORT=3137 本地服务 `/health` 返回 ok、首页 HTTP 200、GET 通知 6 条；POST 合法 created 事件后 GET 为 7 条。
- 测试服务当前由本轮启动在本机 3137 端口；不是公网服务。
- 下一步：手动验收通知五 tab 与按钮交互；真实接口/生产部署继续等待工作台契约、`nodes_v2.jsonl`、服务器和部署授权。





## 2026-10-21T09:24:29+08:00 部署恢复检查点

- 用户已授权部署 Demo/API 基线；当前阶段仍为 6. 实施计划。项目不是 Git 仓库，分支/提交/工作区状态未检测。
- 指定目录、phase-0 清单和实施计划均存在；四份进度文件已回读。
- 本轮实际测试 33 通过、0 失败；Demo 两文件、入口、数据库探针语法通过；两个部署 Python 脚本 compile 通过。localhost:3000 首页和 audit-demo 均连接被拒绝，历史 PID 不作为当前存活证据。
- 已核对本地入口 HOST 回环绑定及独立 systemd/环境文件/数据库/迁移/Nginx/打包/回滚配置文件。这些只是本地准备，尚未上传或执行。
- 部署审查发现通知 SQL 重复单引号；旧版本切回与迁移数量严格检查存在兼容约束，尚待处理。
- 本轮 Workbench 页面仍为阿里云登录页，已请求用户直接在页面恢复登录。未执行服务器写入、创建数据库或发布；服务器端口、宝塔和镇安现状需登录后重新取证。
- 计划采用 127.0.0.1:3100、独立 lighthouse_corpus 数据库与受限角色；最终以服务器实时端口检查为准。不得启动第二套 Nginx。
- 真实工作台 role/nodes、节点基线、飞书、网盘接入仍未完成；生产知识库功能尚未上线。
- 回滚目前仅为 deploy/README.md 中的待执行模板；因没有本轮线上变更，无已执行回滚或数据库迁移记录。

## 2026-10-21T09:29:21+08:00 本地部署候选包检查点

- 实际生成候选包 `artifacts/releases/lighthouse-20261021-092825.tar.gz`，SHA-256 `f4f11a20ade6250b8a5444a5d82fa6836fee1c310359b6e1aeaa9e510664218d`；36 个文件与包内清单及当前源文件逐项哈希一致，无 node_modules、环境秘密文件、日志、证书密钥或符号链接。包类型 demo_api_baseline，production_knowledge_base=false。
- 候选包尚未上传，且含尚未修复的通知 SQL 引号问题，禁止直接上线。Node 33 项测试不覆盖 PostgreSQL 迁移成功。
- `deploy/README.md` 回滚模板已补充目录约束、迁移文件名/SHA 一致性检查和独立库 dry-run。不同 schema 版本禁止直接切旧版；未来必须先做独立恢复验证或前向修复。没有执行线上回滚演练。
- 本机两个 Python 脚本 AST 检查通过；本地 3000 首页/API 仍无本轮运行证据（本次恢复检测为 ECONNREFUSED）。
- 外部阻塞仍为 Workbench 阿里云登录；本轮未上传、未创建数据库、未迁移、未修改服务/Nginx/HTTPS；生产知识库功能尚未上线。
- 下一步：等待用户完成已打开的阿里云页面登录；恢复后先只读复核服务器和镇安，再处理独立库 SQL dry-run、上传及隔离部署。

## 2026-10-21T11:00:59+08:00 SQL 修复与控制通道阻塞

- 当前阶段仍为 `6. 实施计划`；部署 Demo/API 基线已获授权。项目不是 Git 仓库，分支、提交和工作区状态均未检测。
- 修复 `server/migrations/002_notifications.sql` 中重复单引号；修复前回归命令失败，修复后 SQL 字面量静态检查通过。`node --test test/*.test.js` 实测 33 pass、0 fail；两个 Demo 文件、Node 入口语法检查通过；Python bootstrap/migrate AST 检查通过。
- 新候选包：`artifacts/releases/lighthouse-20261021-105925.tar.gz`，36 文件 manifest 与每项 SHA-256 匹配；包 SHA-256 `229a85d401084d33209a818b15fb389f72b92aa4072ae715012c68a744c68979`；标记为 `demo_api_baseline`，`production_knowledge_base=false`。
- 本机 `127.0.0.1:3000/` 与 `/api/workbench/audit-demo` 均返回 ECONNREFUSED；本机无 `psql`，PostgreSQL 事务 dry-run 未验证。SQL 静态检查不能替代 PostgreSQL 实测。
- 阿里云 Workbench 标签 UI 曾显示 root ECS Shell/文件管理已连接。Computer Use 因无法可靠判定浏览器 URL 而停止；auto-review 拒绝定位包含具体 ECS 实例标识的 Workbench URL，并明确要求不得绕过。未输入命令、未上传、未写服务器。
- 下一步需使用其它获准且可审计的 ECS 控制通道，先重新只读核验镇安、监听端口、宝塔 Nginx、PostgreSQL 与独立灯塔库可行性，再上传、认证、迁移和隔离部署。没有本轮服务器状态证据。
- 飞书工作台契约、`nodes_v2.jsonl`、飞书应用凭据/权限和网盘连接器仍未提供；即使 Demo/API 基线上线，生产知识库功能仍未上线。回滚模板未演练，无线上回滚步骤执行记录。

## 2026-10-21 本地 Git 基线准备

- 本地 .git 已初始化。.gitignore 排除 .env 和密钥文件、数据库/备份、日志、依赖与构建目录、原始语料/归档、发布暂存/压缩包、历史交接资料及 state.tmp.json。
- 候选内容限进度文件、Demo、部署模板、设计文档、Node 源码/测试及 lockfile；历史资料、artifacts、日志和 brainstorm 草稿不纳入。
- 未添加远程、未推送、未部署。


## 2026-10-21 Git 初始提交完成

- 已完成 root commit：3871f07 chore: establish git baseline，共 68 个文件。
- git remote -v 无输出；未 push、未创建远程、未部署。提交者身份仅通过本次命令参数提供，没有写入全局或仓库配置。
- 已读回状态：分支 master；忽略规则生效；.superpowers/ 目录有临时草稿，保持未跟踪，不在提交内。



## 2026-10-21 SSH 连接诊断

- 用户报告阿里云密钥对已创建并绑定；尚未独立验证。Codex SSH 显示连接失败。
- 本机 OpenSSH 测试在 TCP 建连阶段返回 Permission denied，未进入用户认证；执行环境网络权限限制可能导致该结果，因此 ECS 端 SSH/端口状态仍未知。未执行服务器命令或改动 ECS。
- 请先读取 Codex SSH 失败旁的信息图标中的错误详情，再决定是否检查安全组入站 TCP 22、实例绑定状态或登录用户。不要把本机套接字权限错误解释成线上服务故障。


## 2026-10-21 SSH 诊断续记

- OpenSSH 曾因本地私钥 ACL 过宽而忽略密钥；将密钥移至用户下载目录并收紧 ACL 后，ssh-keygen 能识别密钥格式。私钥路径与指纹未写入交接记录。
- 后续只读连接测试到 ECS TCP 22 返回 Connection timed out，未进入 SSH 主机密钥或用户认证。当前不能判断是安全组、服务器 sshd、防火墙还是路由问题。
- 未执行服务器命令或线上配置变更。请先检查实例关联安全组的入方向 TCP 22 是否仅允许当前客户端公网 IPv4/32；若已有规则，通过 Workbench 检查 sshd/防火墙。不得开放 0.0.0.0/0 或在未评估影响时重启。

## 2026-10-21T12:20:45+08:00 SSH 安全组只读核验续记

- 已在阿里云控制台只读确认：安全组入方向 SSH/TCP 22 仅允许来源 100.104.0.0/16。已有某客户端 IP 对宝塔 9066 的规则不能证明它仍为当前出口，也不适用于 22。
- 阿里云 Workbench 当前页面状态栏为“已断开”。本机此前 SSH 探测到 TCP 22 超时，未进入密钥认证；未执行服务器命令、未改安全组。
- 待办：用户确认当前客户端公网 IPv4，并在确认后仅新增该来源 /32 的 SSH TCP 22 入站规则；随后重新测试 SSH。不要开放 0.0.0.0/0，不要删除现有规则。

## 2026-10-21 入站规则清理判断（待证）

- 用户报告2026年4月规则来自合作伙伴协助H5上线；当前H5已更换子域名。用户报告2026年10月新增规则与近期H5上线相关。此为规则来源背景，不能单凭日期确定服务依赖。
- 安全组不识别子域名，只按来源IP、协议与端口控制。80/443为镇安和灯塔共用宝塔Nginx入口，保留。SSH 22旧来源保留到新本机 /32 规则连接认证成功。
- 控制台表中8888、39066描述为宝塔端口；5000和9066的当前用途未核实。8888的任意来源规则存在时，同端口指定IP规则不改变实际可访问范围。需先检查`ss -lntp`与宝塔Nginx配置，确认当前面板端口及服务代理后再清理。
- Workbench 当前显示已断开；没有服务器监听/配置证据。未删除或新增安全组规则。待获取当前本机公网IPv4并确认新增TCP 22来源 /32，然后重测SSH。

## 2026-10-21 本地 API 错误边界修复

- 已确认事实：`POST /api/workbench/search-demo` 接收非数组 `nodes` 或 `permissions` 时原先会进入异常路径并返回 500。
- 已实施：路由在检索前拒绝错误 JSON 类型，分别返回 `nodes_must_be_array`、`permissions_must_be_array`；未改变权限矩阵、检索排序或任何真实外部接口。
- 验证证据：回归测试先因 `TypeError: nodes is not iterable` 失败；修复后 `node --test server/test/retrieval.test.js` 5/5，`npm test` 42/42，`npm run check` 通过。
- 未验证边界：生产数据库、工作台正式契约、租户扫描、新闻情报和线上部署仍未接入；固定 LAN 端口 3003 的已运行进程未被本轮停止或重启。
- 交接建议：继续以本地模拟输入做错误、权限和状态机回归；取得正式契约及节点基线前，不把 Demo 行为描述为生产集成。
- 固定端口证据：`npm run start:lan` 在 3003 被 PID 16028 占用时按设计拒绝启动；`http://192.168.0.101:3003/health` 和首页均返回 HTTP 200。该现有进程未被本轮停止。
