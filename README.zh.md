# Avaloka AI

当前方向：私人情绪疏导陪伴者。

Avaloka AI 第一版只服务一个核心场景：

> 当目标用户在深夜、独处、病痛、衰老、死亡焦虑、无子/丁克遗憾或意义崩塌中感到撑不住时，Avaloka 用私密、稳定、慈悲、有智慧的方式接住她，并帮助她回到一个清明的下一步。

## 当前阶段

V1 本地 MVP 准备阶段。V0 的 7 天免费验证已经通过，现在重点是把低谷情绪安顿的本地聊天原型做好。

现在不做付费实验，不做完整 RAG 系统，不做佛法百科，不做心理治疗替代品。

## 最终愿景

Avaloka AI 的长期方向是成为一个私密、可信赖的慈悲智慧情绪安顿陪伴者，服务用户在孤独、病痛、衰老、死亡焦虑、无子遗憾和意义崩塌等脆弱时刻的安顿与反思。

## 当前版本

当前 active version 是 V1：服务低谷情绪安顿的本地聊天 MVP。

当前本地应用有两个模式：

- 用户模式：`http://127.0.0.1:5173/`，只显示安静聊天界面、轻量反馈、本地隐私说明，以及导出/清空入口。
- 开发者模式：`http://127.0.0.1:5173/?dev=1`，额外显示 Internal Debug、Local Baseline、LLM Orchestrator V2、Compassion OS 和 Baifa Mapper。

本地运行：

```bash
cd app
npm run dev
npm run dev:shadow
```

版本权威请看：

- [Product Vision](docs/product/product-vision.md)
- [Version Roadmap](docs/product/version-roadmap.md)
- [Decision Log](docs/decisions/decision-log.md)
- [Design Notes](DESIGN.md)

## 必读文档

1. [Product Vision](docs/product/product-vision.md)
2. [Version Roadmap](docs/product/version-roadmap.md)
3. [Decision Log](docs/decisions/decision-log.md)
4. [Design Notes](DESIGN.md)
5. [V1 Alpha Readiness Checklist](docs/experiments/v1-alpha-readiness-checklist.md)
6. [7 天用户验证计划](docs/business/2026-05-12-avaloka-ai-7-day-user-validation-zh.md)
7. [商业计划修订稿](docs/business/2026-05-12-avaloka-ai-business-plan-revision-zh.md)
8. [MVP 设计文档](docs/superpowers/specs/2026-05-06-avaloka-ai-mvp-design-zh.md)
9. [MVP 中文执行计划](docs/superpowers/plans/2026-05-06-avaloka-ai-mvp-zh.md)
10. [系统模块说明](docs/superpowers/plans/2026-05-06-avaloka-ai-system-modules-explained-zh.md)
11. [计划步骤与系统模块对应表](docs/superpowers/plans/2026-05-06-avaloka-ai-plan-module-map-zh.md)
12. [CEO 漏洞清单与可行性复盘](docs/superpowers/reviews/2026-05-12-avaloka-ai-ceo-review-zh.md)
13. [Harness Engineering Setup](docs/engineering/harness-engineering-setup.md)
14. [AI Production Safety Harness](docs/engineering/ai-production-safety-harness.md)
15. [Harness Engineering 应用计划](docs/engineering/2026-05-13-harness-engineering-for-avaloka-zh.md)
16. [7 天免费验证 Runbook](docs/experiments/validation-runbook.md)
17. [用户反馈记录模板](docs/experiments/user-feedback-log-template.md)
18. [Failure Log](docs/experiments/failure-log.md)
19. [V0 20 条场景回应](docs/product/2026-05-14-v0-20-scenario-responses-zh.md)
20. [V1 回应库](docs/product/2026-05-16-v1-response-library-zh.md)
21. [V0 Day 8 验证报告](docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md)
22. [V0 目标用户 Persona](docs/product/2026-05-14-v0-target-personas-zh.md)
23. [V0 测试用户候选画像](docs/experiments/2026-05-14-v0-test-user-candidates-zh.md)
24. [V0 真实用户洞察（脱敏版）](docs/experiments/2026-05-14-v0-real-user-insights-redacted-zh.md)
25. [回应质量 Checklist](docs/product/quality-checklist.md)
26. [文档园艺 Checklist](docs/maintenance/doc-gardening-checklist.md)

## 已归档内容

旧版“佛法 AI / RAG 优先 / 职场关系泛烦恼 / Mac Mini 开发路线图”等文档已移动到：

[archive/2026-05-13-superseded-docs](archive/2026-05-13-superseded-docs)

这些内容不再作为当前计划依据，只保留作历史参考。
