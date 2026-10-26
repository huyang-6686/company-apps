# 镇安县生态产业协会菜单与页面基线 v1

状态：阶段 5 设计文档配套基线 v1.1（2026-10-19，按 Harness P1 条件修订）

本表是重写工程的唯一页面验收清单。菜单层级固定为：1 级业务大类、2 级模块工作、3 级事项工作、4 级科目工作。一级只展开二级；四级是最深菜单。路由是目标路由，不代表现有系统已有实现。六类业务全部属于首期，`波次`只用于实施顺序。四级科目可对应独立路由，但路由内部只能使用标签、筛选、状态视图、操作区和弹窗，严禁生成第五级或等价导航结构。多个状态机对象可在同一四级科目页面内以标签/筛选呈现，不能增加导航层级。

| 编号 | 1级 | 2级 | 3级事项 | 4级科目/视图 | 目标路由 | 波次 | 权限资源码 | 历史映射 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P00 | 工作台 | 总览 | 运营总览 | 会员与会费/财务与待办/档案与提醒 | `/workspace` | W1 | `workspace.overview` | P00 |
| M01 | 会员与组织 | 会员基础 | 会员台账 | 单位会员/类型与身份/状态变更 | `/membership/units` | W1 | `membership.units` | P01 |
| M02 | 会员与组织 | 会员基础 | 入会管理 | 资料核验/补正状态/归档草稿 | `/membership/applications` | W1 | `membership.applications` | 缺口补齐 |
| M03 | 会员与组织 | 会费运营 | 标准管理 | 身份档位与年度金额/生效与表决附件 | `/membership/fees/standards` | W1 | `membership.fee_standards` | P02 增补 |
| M04 | 会员与组织 | 会费运营 | 收缴管理 | 年度应收/缴费核销/缴清状态 | `/membership/fees/collection` | W1 | `membership.fee_collection` | P02 |
| M05 | 会员与组织 | 会费运营 | 欠费管理 | 欠费视图/催缴记录 | `/membership/fees/arrears` | W1 | `membership.fee_arrears` | P03 |
| M06 | 会员与组织 | 组织协同 | 项目组织范围 | 与光同步的项目组织范围（只读） | `/membership/organization` | W2 | `membership.organization` | P12/P14 关联 |
| F01 | 财务与资金 | 收支管理 | 收支台账 | 收入/支出/分类/凭证关联 | `/finance/entries` | W1 | `finance.entries` | P04 |
| F02 | 财务与资金 | 审批管理 | 支出申请 | 申请草稿/审批镜像/回流流水草稿 | `/finance/expenses` | W1 | `finance.expenses` | P05 |
| F03 | 财务与资金 | 报表管理 | 期间报表 | 月度/季度/年度/收支构成 | `/finance/reports` | W1 | `finance.reports` | P06 |
| P01 | 项目与活动 | 项目管理 | 项目台账 | 基本信息/预算负责人 | `/projects` | W2 | `projects.projects` | P07 |
| P02 | 项目与活动 | 项目管理 | 项目执行 | 阶段里程碑/风险结项 | `/projects/execution` | W2 | `projects.execution` | P08 |
| P03 | 项目与活动 | 活动管理 | 活动台账 | 活动计划/活动执行 | `/activities` | W2 | `projects.activities` | P11 部分映射 |
| P04 | 项目与活动 | 活动管理 | 活动复盘 | 成效费用/资料归档 | `/activities/reviews` | W2 | `projects.activity_reviews` | P11 |
| B01 | 品牌与会员服务 | 品牌授权 | 授权企业 | 授权主体/期限状态/授权文件 | `/brand/authorizations` | W2 | `brand.authorizations` | P09 |
| B02 | 品牌与会员服务 | 品牌授权 | 授权产品 | 产品主数据/授权-产品关系/上架状态 | `/brand/products` | W2 | `brand.products` | P10 |
| B03 | 品牌与会员服务 | 会员服务 | 服务事项 | 服务记录/参与记录 | `/brand/member-services` | W2 | `brand.member_services` | 新增 |
| B04 | 品牌与会员服务 | 会员展示 | 展示目录 | 会员单位/授权产品 | `/brand/showcase` | W3 | `brand.showcase` | P10 增补 |
| A01 | 档案与合规 | 档案基础 | 档案目录 | 档案条目/档号 | `/archives/catalog` | W1 | `archive.catalog` | P15 |
| A02 | 档案与合规 | 档案基础 | 著录管理 | 题名责任者/日期分类/密级保管 | `/archives/description` | W1 | `archive.description` | P15 |
| A03 | 档案与合规 | 归档运营 | 归档任务 | 自动任务/手动任务/超期提醒 | `/archives/tasks` | W1 | `archive.tasks` | A4 增补 |
| A04 | 档案与合规 | 归档运营 | 文件关联 | 网盘路径版本/业务关联/借阅/归还/移交（页内标签与状态视图） | `/archives/files` | W1 | `archive.files` | P15 增补 |
| A05 | 档案与合规 | 合规迎检 | 检查准备 | 检查清单/检查台账 | `/compliance/inspections` | W2 | `compliance.inspections` | 迎检专项 |
| A06 | 档案与合规 | 合规迎检 | 材料汇编 | 材料包目录/生成记录 | `/compliance/material-packs` | W2 | `compliance.material_packs` | 迎检专项 |
| A07 | 档案与合规 | 合规迎检 | 整改留痕 | 整改问题/佐证/销号 | `/compliance/rectifications` | W2 | `compliance.rectifications` | 迎检专项 |
| H01 | 人事与行政 | 人员管理 | 人员台账 | 工作人员/部门岗位 | `/hr/employees` | W2 | `hr.employees` | P12 |
| H02 | 人事与行政 | 考勤管理 | 考勤记录 | 月度汇总/异常 | `/hr/attendance` | W2 | `hr.attendance` | P13 |
| H03 | 人事与行政 | 请假管理 | 请假审批 | 申请/审批镜像/考勤回写 | `/hr/leave` | W2 | `hr.leave` | P14 |
| H04 | 人事与行政 | 行政事务 | 行政事项 | 印章/会议/采购/资产（页内标签与状态视图） | `/hr/administration` | W3 | `hr.administration` | 新增 |
| S01 | 管理入口 | 账号管理 | 补充账号 | 长期协作者/临时访客/有效期回收 | `/admin/accounts` | W1 | `admin.accounts` | 新增 |
| S02 | 管理入口 | 组织同步 | 业务范围 | 与光项目节点/成员同步批次 | `/admin/organization-sync` | W1 | `admin.organization_sync` | 新增 |
| S03 | 管理入口 | 权限审计 | 授权绑定查询 | 与光下发绑定/数据范围的只读查询与审计 | `/admin/permissions` | W1 | `admin.permissions` | 新增 |
| S04 | 管理入口 | 集成配置 | OA与平台集成 | 钉钉/与光/网盘配置引用 | `/admin/integrations` | W1 | `admin.integrations` | 新增 |
| S05 | 管理入口 | 审计记录 | 业务与访问审计 | 登录/变更/导出/回调 | `/admin/audit` | W1 | `admin.audit` | 新增 |
| S06 | 管理入口 | 系统参数 | 枚举与规则 | 字典/参数/保留期限 | `/admin/settings` | W1 | `admin.settings` | 新增 |

## 页面基线规则

- 页面编号、路由、资源码和三级事项一一对应；四级科目作为页面内标签、视图、状态视图或操作区，除非具有独立状态机才拆成独立路由；禁止第五级。
- 旧 16 页是历史参考，不是新工程页面数量上限；本表是唯一实施验收清单。
- W1/W2/W3 只是实施波次，不影响首期范围和菜单可见性。
- 权限资源码必须注册到 `permission_resource`，数据范围由与光下发后绑定。
- 管理入口层级以本表 S01-S07 为准；设计文档中的管理功能枚举只表示功能范围。S03 不提供授予、回收或修改授权的动作。
- 匿名会员表单、用印镜像、借阅/移交和回收站均在既有四级页面或独立四级科目内落位；不得在四级页面内增加导航子级。

## 补充验收页面（编号与主表连续，不得合并层级）

| 编号 | 1级 | 2级 | 3级事项 | 4级科目/视图 | 目标路由 | 波次 | 权限资源码 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M07 | 会员与组织 | 会员基础 | 外部资料收集 | 公开填写/提交回执与补正/锁定状态 | `/membership/apply/[token]` | W1 | `membership.external_form.public` | 匿名入口；仅限有效令牌 |
| F04 | 财务与资金 | 审批管理 | 用印记录 | 飞书用印镜像/回流状态 | `/finance/seal-records` | W1 | `finance.seal_records` | 外部审批只读镜像 |
| A08 | 档案与合规 | 归档运营 | 档案流转 | 借阅/归还/移交记录 | `/archives/circulation` | W1 | `archive.circulation` | 独立状态记录，仍为四级 |
| A09 | 档案与合规 | 归档运营 | 删除管理 | 回收站/恢复/到期清理 | `/archives/recycle-bin` | W1 | `archive.recycle_bin` | 软删除与网盘同步状态 |
| S07 | 管理入口 | 通知运维 | 投递监控 | 通知投递状态/失败原因 | `/admin/notifications` | W1 | `admin.notifications` | 失败可见及重试审计 |
