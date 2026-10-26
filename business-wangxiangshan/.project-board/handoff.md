# 望向山经营中台开发交接（2026-10-21 更新）

## 当前阶段

阶段1「需求澄清与设计」。Harness 对 v1.0 的审阅已收到；Spec v1.1 已完成文档整改，用户已裁决 C1-C5，待 Harness 复审。当前没有业务代码实现。

## 当前交付物

- `.project-board/specs/purchase-sign-demo-spec-v1.0.md`：保留原稿，不修改。
- `.project-board/specs/purchase-sign-demo-spec-v1.1.md`：按 Harness P0-1 至 P0-5、P1-1 至 P1-10、P2 整改。
- `.project-board/specs/purchase-sign-demo-user-decisions-v1.1.md`：C1-C5 已裁决，保留裁决记录供复审。

## 已确认的六条业务澄清

1. 行政拒绝进入创始人复签；创始人拒绝为最终拒绝。
2. 行政和创始人均可退回补充。
3. 会签完成前提交人可以撤回，撤回后可以重提。
4. 每24小时提醒一次；C1 选择 B：行政、创始人同时提醒；48小时通知标记升级、归入逾期分类并抄送创始人，替代当次普通提醒。
5. 48小时升级后行政和创始人仍可处理。
6. Demo 使用 SQLite 本地文件。

以上六条已逐条追加 `decision-confirmed` 事件，并同步到 `state.json` 与 Spec 来源说明。

## 用户裁决清单

- C1 已裁决为方案 B：24小时同时提醒行政、创始人；48小时通知标记升级、归入逾期分类并抄送创始人，替代当次普通提醒。
- C2 已裁决纳入持久化草稿：首次保存生成单号；提交人可继续编辑、删除；草稿不触发提醒，正式提交后开始计时。
- C3 已裁决连续计时：整张单据从首次正式提交时间计算；行政转创始人复签、退回重提、撤回重提均不重置计时。
- C4 已裁决：店员提交进入行政处理；行政提交进入创始人处理；创始人不填写采购需求单；提交人不得会签本人单据。
- C5 已裁决：修复 `.git/refs/heads/task` 权限，遵循 `task/<编号>-<短名>` 和 `.worktrees/<任务名>`，不使用平铺分支名。

Harness 复审前不进入实施计划。

## 已知阻塞与边界

- `git worktree add .worktrees/purchase-sign-demo -b task/001-purchase-sign-demo` 曾因 `.git/refs/heads/task` Access denied 失败。没有重试、没有建 worktree；根因未验证。C5 已裁决先修复权限，Harness 复审通过后再处理。
- 仓库无可运行应用、无 `package.json`、无依赖清单；本轮未写代码、未安装依赖、未运行应用测试。
- Demo 仍须固定端口3001、构建后监听 `0.0.0.0:3001`，启动前端口占用则报错不换端口。
- application_id、租户映射、接口负责人和部署环境仍未知。

## 下一步

1. 将 v1.1 提交 Harness 复审。
2. 复审通过后修复 `.git/refs/heads/task` 权限并创建规范 worktree。
3. 编写实施计划，再进入 Demo 实施。
4. 实施阶段再建立 Next.js、SQLite、`start:lan`、测试和局域网验收。
