# 授权与数据拒绝码

拒绝码是诊断和审计分类，不定义本地角色或授权标准。最终判定按工作台下发标准执行；具体错误字段以批准接口契约为准。

| code | 条件 | 处理 | 审计上下文 |
|---|---|---|---|
| AUTH_CONTRACT_UNKNOWN | 尚无可核验的工作台授权契约 | 不接入生产数据；测试环境请求拒绝 | contract_version（unknown）、request_id |
| AUTHORITY_UNAVAILABLE | 工作台无法提供有效授权判定 | 拒绝无法证明有权的请求 | request_id、接口错误分类 |
| AUTHORITY_DENIED | 工作台下发标准拒绝请求 | 拒绝且不返回资源字段 | request_id、授权判定引用 |
| AUTHORITY_STALE | 工作台契约判定授权状态失效 | 拒绝并按契约等待恢复 | snapshot/version 字段（若契约提供） |
| SOURCE_NOT_APPROVED | 来源未列入工作台批准来源集合 | 不连接、不扫描、不导入 | source_id、request_id |
| SENSITIVE_FIELD_DENIED | 工作台授权不允许访问所请求字段 | 隐藏字段，不生成替代摘要 | resource_id、field、request_id |
| FEEDBACK_CONTRACT_UNAVAILABLE | 创始人执行结果反馈接口未批准或不可用 | 不写入不完整或无法验证的反馈，记录告警 | item_id（若契约提供）、request_id |

所有拒绝均追加写入审计；日志只记录必要的主体/资源引用和拒绝分类，不记录正文或凭据。接口实际字段未知时不得虚构写入字段。
