# 审计 Schema 基线

审计日志追加写入，不提供更新和物理删除接口。

| 字段 | 要求 |
|---|---|
| audit_id | UUID，唯一 |
| actor_id / tenant_id | 操作主体与租户 |
| action / resource_type / resource_id | 操作和资源 |
| decision / reason_code | 允许、拒绝及原因 |
| snapshot_version | 授权快照版本 |
| request_id | 请求幂等关联 |
| payload_hash | 脱敏载荷哈希 |
| created_at | UTC 时间 |

查看和导出均须符合工作台下发的权限标准并留痕；不在灯塔内定义审计角色。保留期限、WORM 存储能力和跨区域复制状态目前为 unknown。
