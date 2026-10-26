# 安全基线清单

| 控制项 | 状态 | 证据 |
|---|---|---|
| 飞书回调验签 | unknown | 待接口契约 |
| 防重放与事件幂等 | design | 身份授权契约 |
| Secret 环境注入或密钥管理 | design | 正式设计文档 |
| 日志和审计脱敏 | design | evidence README |
| 经工作台总接口的大模型数据保留和训练约束 | unknown | 待工作台总接口契约 |
| 提示注入防护 | design | 正式设计文档 |
| 导出授权与审计 | design | 权限矩阵及工作台授权契约待验证 |
| 个人信息删除请求 | unknown | 待合规确认 |
| 备份加密和密钥分离 | design | 备份运行手册 |

状态含义：verified 有运行证据；degraded 有明确降级；unknown 尚无证据。
