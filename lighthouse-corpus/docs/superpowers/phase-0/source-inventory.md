# 来源清单

| source_id | tenant_id | authority | scan_mode | visibility_default | evidence_status |
|---|---|---|---|---|---|
| workbench-approved-source-set | 轻立方 | 工作台批准的数据分流契约；具体来源清单 unknown | unknown，待契约确认 | 按工作台下发权限标准；未确认时拒绝无法证明有权的访问 | unknown |
| baidu-video-links | 轻立方归档映射内的可鉴权链接；具体来源与连接器 unknown | 工作台下发权限标准及获批来源契约 | 仅按获批契约登记链接；不解析视频 | 按工作台下发权限标准 | unknown |
| historical-material-candidates | unknown | 接入源仍须获批；迁移/删除/保留由创始人按清单执行 | 仅在获批来源契约确认后生成清单并记录执行反馈 | 默认私属 | unknown |
| local-runtime-cache | local-only | 应用运行产生；具体目录和部署位置 unknown | 运行态缓存，不作为正式归档 | 按工作台下发权限标准 | unknown |

当前未发现获批来源清单或可核验的工作台接口契约。待确认：轻立方飞书应用身份、批准来源及范围、权限与组织数据契约、六清单实际路径、执行结果反馈字段、百度网盘连接器及巡检责任人。未确认前不得探测其他租户或将候选来源视为已批准。

注意：v3 正式规范明确 `2. 灯塔知识库` 为唯一归口，但并未提供实际云盘 ID、API 凭证或连接器契约；目录规范已确认不等于运行访问已经验证。

历史接口材料：`historical documents/06-数据库与接口（已补API契约）.md` 描述旧灯塔应用及其历史外部依赖，不构成现行工作台批准来源或接入契约。
