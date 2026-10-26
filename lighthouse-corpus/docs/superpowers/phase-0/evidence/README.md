# 阶段 0 证据规则

- 文件名格式：YYYY-MM-DD-topic-source.ext
- 每份证据记录 SHA-256、采集时间、采集命令或来源。
- 凭据、Token、Secret、员工个人信息和内部链接参数必须脱敏；统一使用 [REDACTED_SECRET]。
- 只保存必要的元数据和脱敏结果；原始业务数据不复制进本项目。
- 证据状态只能是 verified、degraded 或 unknown。
