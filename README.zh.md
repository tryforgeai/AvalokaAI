# Avaloka AI

Avaloka AI 现在是一个 research-first 的 AI 陪伴系统实验项目。

它用“慈悲智慧陪伴”这个高难度场景，来测试和沉淀最新 AI 技术的真实落地能力：

- SAGE 式长期记忆
- agentic writer/reader 记忆闭环
- LLM 编排
- safety / guardian gate
- 百法、dukkha、Compassion OS 情绪状态理解
- prompt registry 和 eval-driven AI behavior
- agentic coding 工作流

这个项目当前不作为商业 MVP、付费实验、心理治疗产品、医疗产品、危机干预服务、宗教 chatbot 或通用情绪聊天产品运行。

## 当前阶段

当前 active version 是 **R1：SAGE Memory Research Prototype**。

之前的 V0/V1 低谷情绪安顿工作仍然重要，但它现在的角色变成：

- 一个已经验证过的高难度使用场景
- 一个本地 demo surface
- 一个回应质量和安全测试场
- 一份解释“为什么长期慈悲记忆重要”的历史证据

当前目标不是 PMF，也不是商业验证。当前目标是把最新 AI 研究，尤其是 SAGE 式长期记忆，变成一个可以本地运行、可以评估、可以迁移到其他项目的实验系统。

## 研究愿景

Avaloka 的长期方向，是成为长期陪伴型 AI 的基础研究实验场。

核心技术问题是：

> 一个 AI 陪伴者如何长期记住、检索并使用用户的情绪上下文，同时不变得侵入、不安全、不教条、不制造依赖？

我们保留慈悲智慧陪伴场景，是因为它足够难。孤独、病痛恐惧、衰老、死亡焦虑、自责和意义崩塌，能很好地测试记忆、安全和回应生成是不是真的可靠。

## 当前本地应用

当前本地 app 仍然保留 V1 聊天界面和开发者诊断面板。

- 用户模式：`http://127.0.0.1:5173/`
- 开发者模式：`http://127.0.0.1:5173/?dev=1`

本地运行：

```bash
cd app
npm run dev
npm run dev:shadow
```

## Source Of Truth

版本权威请看：

- [Product Vision](docs/product/product-vision.md)
- [Version Roadmap](docs/product/version-roadmap.md)
- [Decision Log](docs/decisions/decision-log.md)
- [SAGE Memory Research Plan](docs/research/sage-memory-research-plan.md)
- [Memory Engine V1](docs/engineering/avaloka-memory-engine-v1.md)
- [Memory Engine V1 中文版](docs/engineering/avaloka-memory-engine-v1.zh.md)
- [Design Notes](DESIGN.md)
- [Knowledge Base](docs/kb/README.md)

## 研究原则

- 先把 Avaloka 当成 AI 研究系统，而不是商业产品。
- 用陪伴场景测试记忆、安全和回应质量。
- 优先做小而可运行的原型，不停留在抽象架构。
- 每个研究行为都要有 eval 支撑。
- 不依赖聊天记忆，重要决策必须写入 repo。
- 不暴露隐藏 prompt、routing logic、guardrails、memory scores 或 private logs。
- 保持用户控制：本地优先、可导出、可清除、隐私敏感。
- 用户可见语言保持慈悲、平实、非教条。

## 安全边界

即使作为研究项目，Avaloka 也不能把自己定位为心理治疗师、医生、危机干预者、灵性权威或真人照护替代品。

所有普通回应都必须经过 safety 和 guardian gates。系统必须避免宗教背诵、罪感、业力归罪、诊断、治疗承诺、医疗建议、自伤鼓励、报复支持和制造依赖。

## 历史材料

旧的商业 MVP 方向、V0/V1 验证计划、persona、商业计划和 tester 材料，现在都是历史上下文。它们仍然是有价值的研究 fixtures，但不再定义当前 active milestone。

更早的旧方向文档已归档到：

[archive/2026-05-13-superseded-docs](archive/2026-05-13-superseded-docs)
