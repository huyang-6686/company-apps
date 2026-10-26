# 中文检索技术验证报告

## 验证状态

- PostgreSQL 实例：unknown
- PostgreSQL 版本：unknown
- CREATE EXTENSION 权限：unknown
- zhparser/pg_jieba：unknown
- pg_trgm：unknown
- pgvector：unknown
- 验证日期：2026-10-18
- 当前结论：未执行数据库性能测试，不作通过声明

## 固定输入

查询样本：search-fixtures.jsonl。当前包含 20 个合成中文查询候选；其中 10 条为初始占位相关性，另 10 条明确标记为待人工复核。50 篇脱敏文档和人工相关性标注仍为 unknown，完成人工标注后才可形成正式验收样本。

## 待执行对比

| 路径 | Top-10 命中率 | 排序正确率 | P95 | 索引体积 | 状态 |
|---|---:|---:|---:|---:|---|
| 中文分词扩展 | unknown | unknown | unknown | unknown | unknown |
| pg_trgm | unknown | unknown | unknown | unknown | unknown |
| 应用层分词 + tsvector | unknown | unknown | unknown | unknown | unknown |

## 决策门槛

1. 先验证托管 PostgreSQL 是否允许扩展和索引配置。
2. 以 20 个查询、50 篇脱敏文档进行人工相关性标注。
3. 扩展路径未达到可接受指标或不可安装时，回退 pg_trgm 或应用层分词 + tsvector。
4. 在数据库实例和样本集齐备前，不引入外部搜索引擎，也不宣称全文检索验收通过。
