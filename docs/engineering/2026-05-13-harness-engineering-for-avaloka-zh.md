# Harness Engineering 如何应用到 Avaloka AI

日期：2026-05-13

状态：Historical governance context；部分 V0/V1 阶段判断已被 2026-05-26 R1 研究方向取代

R1 说明：本文保留 OpenAI Harness Engineering 对 Avaloka agent-first 文档治理的启发，但关于“用户发现和 7 天免费验证阶段”的项目判断已经过时。当前 active milestone 以 `docs/product/version-roadmap.md` 的 `R1: SAGE Memory Research Prototype` 为准。

来源：[OpenAI Harness Engineering](https://openai.com/index/harness-engineering/)

## 1. 文章核心总结

OpenAI 这篇文章的核心不是“AI 写代码很快”，而是：

> 当 Agent 成为主要执行者时，人类工程师的工作从写代码转向设计环境、写清意图、建立反馈循环、维护架构边界。

文章里几个最重要的原则：

- 人类负责方向、判断、验收；Agent 负责执行。
- 仓库内文档是唯一真理。Agent 看不到的东西，对它来说就不存在。
- `AGENTS.md` 不应该是巨大手册，而应该是地图，指向真正的 docs。
- 计划应该成为仓库里的执行文件，而不是只存在聊天记录里。
- 应用本身要对 Agent 可读：日志、截图、浏览器、测试、指标都要让 Agent 能访问。
- 架构和品味不能只靠提醒，要通过测试、lint、结构规则来强制。
- Agent 会复制仓库里的旧模式，所以需要定期垃圾回收和文档园艺。

## 2. 对 Avaloka 的判断

Avaloka 现在还不适合照搬 OpenAI 的“0 行人工代码”模式。

原因（历史判断，已被 R1 方向取代）：

- 当时判断 Avaloka 还在用户发现和 7 天免费验证阶段。
- 最大风险不是工程速度，而是用户是否真的需要、是否持续使用、回应是否安全。
- 产品涉及情绪低谷、抑郁、死亡焦虑、病痛恐惧，安全边界比速度更重要。

但文章里的方法非常适合 Avaloka 的下一阶段：

> 把 Avaloka 的仓库变成 Agent 能稳定理解、执行和验证的系统。

## 3. Avaloka 应该采用的 7 条原则

### 原则一：仓库是唯一真理

所有关键判断都必须进入仓库：

- 目标用户是谁。
- 第一版服务什么场景。
- 什么不做。
- 安全边界是什么。
- 五项正念守护怎么执行。
- 7 天测试怎么判断成功或失败。

不能只放在聊天记录、脑子里或零散笔记里。

### 原则二：`AGENTS.md` 只做地图

根目录新增 `AGENTS.md`。

它不写长篇规则，只告诉 Agent：

- 当前产品方向。
- 必读文档。
- 不能复活的旧方向。
- 安全边界。
- 执行工作流。

这样以后任何 Agent 进来都不会误以为 Avaloka 还是“佛法 AI / RAG 优先 / 职场关系泛情绪产品”。

### 原则三：执行计划必须版本化

复杂工作不要只在对话里说。

每个阶段都应该有一个 Markdown 执行计划：

- 当前目标。
- 输入文档。
- 任务列表。
- 验收标准。
- 风险。
- 决策记录。
- 完成状态。

Avaloka 现在已有：

- `docs/business/2026-05-12-avaloka-ai-7-day-user-validation-zh.md`
- `docs/superpowers/plans/2026-05-06-avaloka-ai-mvp-zh.md`

下一步应该新增一个更具体的执行文件：

> `docs/experiments/2026-05-13-7-day-validation-runbook-zh.md`

### 原则四：优先让“用户验证”对 Agent 可读

OpenAI 让 Codex 读日志、指标、截图。Avaloka 现在最重要的“可观测性”不是系统性能，而是用户验证记录。

7 天测试需要结构化记录：

- 用户编号。
- 使用日期。
- 是否真实低谷。
- 是否主动打开。
- 场景类型。
- 回应安顿评分。
- 有效句子。
- 失败句子。
- 是否想继续使用。
- 安全问题。

这应该成为 Agent 能读取的表格或 Markdown 日志。

### 原则五：把品味变成检查表

Avaloka 的“品味”不是视觉风格，而是回应质量。

每条回应都必须检查：

- 是否先承接情绪。
- 是否避免说教。
- 是否避免佛法术语堆砌。
- 是否避免心理诊断。
- 是否避免医疗建议。
- 是否只给一个小练习。
- 是否通过五项正念守护。
- 是否符合危机安全边界。

这应该从文档变成 checklist，后续再变成自动测试。

### 原则六：垃圾回收要制度化

Avaloka 已经出现过一次典型问题：旧文档里有“佛法 AI / RAG 优先 / 职场关系泛烦恼”，新方向已经变了。

以后每次重大方向变化，都要做一次文档垃圾回收：

- 找旧定位。
- 找冲突范围。
- 找过期架构。
- 找重复计划。
- 归档或更新。

建议建立固定文档：

> `docs/maintenance/2026-05-13-doc-gardening-checklist-zh.md`

### 原则七：Agent 卡住时，先修环境

如果 Agent 后续写错代码，不要只改那一处。

先问：

- 它是不是没读到正确文档？
- `AGENTS.md` 有没有指向正确地方？
- 测试有没有覆盖这个错误？
- 检查表是不是不够具体？
- 架构边界是不是没有写清？
- 旧文档是不是还在误导它？

修复方式应该优先是补文档、补测试、补 guardrail，而不是只修局部。

## 4. Avaloka 的 Agent-First 仓库结构建议

当前可以调整成：

```text
AGENTS.md
README.md
docs/
  business/
  engineering/
  experiments/
  maintenance/
  product/
  superpowers/
archive/
```

其中：

- `AGENTS.md`：Agent 地图。
- `README.md`：人类入口。
- `docs/business/`：商业判断和用户发现。
- `docs/engineering/`：系统设计、架构、开发流程。
- `docs/experiments/`：7 天测试 runbook、用户记录模板。
- `docs/maintenance/`：文档园艺、垃圾回收、质量检查。
- `archive/`：历史参考，不作为当前依据。

## 5. 立刻要做的事情

### 已完成

- 清理旧文档。
- 归档旧方向。
- 建立新的 `README.md`。
- 建立新的 `AGENTS.md`。
- 写入本 Harness Engineering 应用计划。

### 下一步

1. 新建五项正念守护测试样例。
2. 用 7 天验证 runbook 招募并执行第一轮测试。
3. 用用户反馈记录模板持续记录。
4. 用回应质量 checklist 评估每条场景回应。
5. 每次方向变化后运行文档园艺 checklist。

这些完成后，Avaloka 的仓库就会更像一个 Agent 能持续工作的产品环境，而不是一堆一次性计划文档。

## 6. 不要照搬的部分

不要现在追求：

- 0 行人工代码。
- 大量 PR 自动合并。
- 完整 CI/CD。
- 复杂 observability stack。
- 多 Agent 自动审查。
- 大规模本地模型基础设施。

这些是后期工程规模化问题。Avaloka 当前最重要的是：

> 让 Agent 和人类都围绕同一个清晰、可验证、安全的用户实验工作。
