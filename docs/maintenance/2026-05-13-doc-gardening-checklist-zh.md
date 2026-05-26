# Avaloka AI 文档园艺 Checklist

日期：2026-05-13

状态：Active maintenance workflow；2026-05-26 已按 R1 研究方向更新

R1 说明：本文最初为 V0/V1 用户验证阶段创建。当前文档园艺必须以 `docs/decisions/decision-log.md` 最新 accepted decision、`docs/product/version-roadmap.md` 的 R1、以及 `docs/research/sage-memory-research-plan.md` 为准。

## 1. 目的

Avaloka 的方向会随着用户验证改变。为了避免 Agent 复制旧方向，必须定期清理文档。

文档园艺的目标是：

- 保持 `docs/` 是当前真理。
- 保持 `archive/` 是历史参考。
- 防止旧的“佛法 AI / RAG 优先 / 泛情绪产品”方向复活。
- 让 Agent 读到的内容一致、清楚、可执行。

## 2. 什么时候执行

以下情况必须执行一次：

- 产品定位改变。
- 目标用户改变。
- MVP 范围改变。
- 安全边界改变。
- 7 天测试结束。
- 新增或删除核心模块。
- 开始工程实现前。
- 任何 Agent 明显被旧文档误导时。

## 3. 检查范围

- [ ] `README.md`
- [ ] `AGENTS.md`
- [ ] `docs/business/`
- [ ] `docs/engineering/`
- [ ] `docs/experiments/`
- [ ] `docs/product/`
- [ ] `docs/superpowers/`
- [ ] `archive/`

## 4. 冲突关键词扫描

扫描以下旧方向关键词：

- 佛法 AI
- 佛法百科
- 佛教百科
- 观音菩萨人设
- 经论语料
- 大藏经
- 职场压力
- 情感困惑
- 泛情绪
- RAG 优先
- 付费测试
- 心理治疗替代
- 心理医生人设
- 业力责备

如果这些词出现在 active docs 中，判断：

- 是否只是说明“不做这个”。
- 是否是过期方向。
- 是否需要改写或归档。

## 5. 当前方向检查

active docs 必须一致表达：

- [ ] 当前 active milestone 是 `R1: SAGE Memory Research Prototype`。
- [ ] Avaloka 当前是 research-first AI companion lab，不是商业 MVP、付费实验、治疗/医疗/危机服务、宗教 chatbot 或泛情绪聊天产品。
- [ ] V0/V1 低谷情绪安顿材料是历史证据和研究 fixture，不是当前商业 roadmap。
- [ ] R1 聚焦 SAGE Lite：Memory Writer、Memory Guardian、Care Card / graph-memory store、Memory Reader、response injection 和 evals。
- [ ] `docs/kb/` 是 protected internal learning base，不是 archive，也不能因为出现佛法、RAG、长期记忆等词而被归档。
- [ ] full RAG over large wisdom corpora、payment、account、community、broad growth、GRPO、fine-tuning、production graph database 等仍在 R1 scope 外。
- [ ] 用户可见语言保持慈悲、清楚、实用、非教义化。
- [ ] 危机安全闸门优先于普通回应。
- [ ] Five Mindfulness Guardian、Precepts Guardian、Memory Guardian 是隐藏安全与质量层。

## 6. 文档状态判断

每份文档标记为：

- **Active**：当前依据。
- **Superseded**：被新版取代，应移入 archive。
- **Reference**：历史参考，不作为当前依据。
- **Draft**：未确认草稿。

## 7. 归档规则

不要直接删除有业务含义的文档。移动到：

`archive/YYYY-MM-DD-superseded-docs/`

归档目录必须包含 README，说明：

- 归档日期。
- 归档原因。
- 当前替代文档在哪里。

## 8. 保留规则

以下文件应始终保留在 active 区域：

- `README.md`
- `AGENTS.md`
- `docs/product/product-vision.md`
- `docs/product/version-roadmap.md`
- `docs/decisions/decision-log.md`
- `docs/research/sage-memory-research-plan.md`
- `docs/engineering/avaloka-memory-engine-v1.md`
- `docs/engineering/avaloka-memory-engine-v1.zh.md`
- `docs/engineering/harness-engineering-setup.md`
- `docs/engineering/ai-production-safety-harness.md`
- `docs/kb/README.md`
- `docs/kb/` 下的 source、derived、AI research、podcast/source notes，除非有明确人工决定移动。
- 当前回应质量 checklist 和 failure log。

以下文件可以保留在 `docs/` 作为 historical fixture，但必须清楚标注为 historical，不得冒充当前 active roadmap：

- V0/V1 business plans。
- V0/V1 validation runbooks。
- V0/V1 personas and candidate profiles。
- V0/V1 response libraries and scenario responses。
- 旧 superpowers specs/plans/reviews。

## 9. 完成标准

文档园艺完成后，应满足：

- [ ] 新 Agent 只读 active docs 也能理解当前方向。
- [ ] 旧方向都在 archive 或被明确标为“不做”。
- [ ] README 指向正确入口。
- [ ] AGENTS.md 指向正确入口。
- [ ] 没有重复互相冲突的计划。
- [ ] 当前下一步行动清楚。
