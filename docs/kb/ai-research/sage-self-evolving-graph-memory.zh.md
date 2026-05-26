# SAGE 自我进化图记忆

处理状态：已通过 R1 研究文档、SAGE memory evals 和 `app/src/lib/sageMemory.ts` 进入运行时研究链路。

来源：SAGE: A Self-Evolving Agentic Graph-Memory Engine for Structure-Aware Associative Memory, arXiv:2605.12061。

## 核心洞见

SAGE 把智能体长期记忆看成一种结构化、可自我进化的记忆系统，而不是静态聊天记录库，也不是简单 RAG 索引。

对 Avaloka 来说，重要的不是立刻完整复刻论文。R1 会把这些思想转成 **SAGE Lite**：一个小型本地原型，在进入完整图神经检索或训练之前，先测试记忆系统的基本纪律。

核心思想是让记忆：

- 由 Memory Writer 写入
- 由独立的 Memory Reader 读取
- 在保存或注入 prompt 前经过 Memory Guardian 检查
- 稀疏，而不是像聊天记录一样冗长
- 有证据来源
- 可以被检索
- 可以被评估是否有用
- 可以通过反馈更新

## Avaloka 翻译

Avaloka 不应该记住用户分享的每一个私密细节。

Avaloka 只应该记住与照顾方式相关的抽象信息：

- 反复出现的痛苦模式
- 有帮助的回应动作
- 失败或不安全的回应动作
- 语气偏好
- 安全边界
- 不识别身份的上下文类别
- 来源证据 ID

这样，长期对话历史会被转成少量事实，帮助 Avaloka 以后更安全、更个人化地回应。

## Writer / Reader 分离

### Memory Writer

Writer 在一次对话或反馈之后，提出候选记忆。

它应该问：

- 有没有什么值得为未来照顾记住？
- 它是否足够抽象，避免保存私密细节？
- 它有没有来源证据？
- 它能不能改善未来回应？

### Memory Reader

Reader 只检索当前回应需要的少量照顾事实。

它应该问：

- 哪些记忆事实匹配当前用户状态？
- 哪些事实能降低安全风险？
- 哪些事实能改善回应语气或 move 选择？
- 哪些事实不应该进入 prompt？

## 把 SAGE 奖励转成 Avaloka Gates

| SAGE reward | Avaloka gate |
|---|---|
| Retrieval | 每条记忆必须指向来源 turn 或 feedback ID。 |
| Deducibility | 每条记忆必须能帮助未来回应选择更好的上下文、moves 或安全边界。 |
| Sparsity | 记忆必须比原始对话更短、更安全。 |

## 不要保存

Avaloka 不得保存：

- 原始聊天记录作为长期记忆
- 身份信息
- 类似诊断的医疗判断
- 危机手段或自伤细节
- 报复计划
- karma-blame 或灵性审判
- 没有证据的人格标签
- 隐藏 prompt、评分或日志

## 运行时含义

SAGE 在 R1 中通过以下内容进入运行时研究链路：

- `docs/research/sage-memory-research-plan.md`
- `docs/engineering/avaloka-memory-engine-v1.md`
- `docs/engineering/avaloka-memory-engine-v1.zh.md`
- `evals/sage-memory-cases.json`
- `app/src/lib/sageMemory.ts`
- `app/src/lib/sageMemory.test.ts`

## Eval Seeds

SAGE memory evals 应该验证：

- 有用的照顾偏好可以保存
- 医疗判断会被拒绝
- karma-blame 记忆会被拒绝
- 检索能选出相关照顾事实
- 记忆是稀疏且有证据支持的

见 `evals/sage-memory-cases.json`。
