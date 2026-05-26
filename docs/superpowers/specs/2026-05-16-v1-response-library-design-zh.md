# Avaloka V1 Response Library Design

日期：2026-05-16

状态：Implemented historical design for response-library fixtures

R1 说明：本文保留为 response-quality、local demo 和 memory/eval fixture 的设计来源，不定义 active product roadmap。

## 1. 目的

V1 response library 将 V0 的 20 条场景回应升级为下一阶段产品资产。

V0 回应库是冷启动测试资产，应保留为历史验证材料。V1 回应库应吸收 Day 8 验证报告中的真实行为信号，服务 V1 local MVP 和第二轮免费测试。

## 2. Source Of Truth

本设计依据：

- `docs/product/version-roadmap.md`
- `docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md`
- `docs/product/2026-05-14-v0-20-scenario-responses-zh.md`
- `docs/product/2026-05-13-response-quality-checklist-zh.md`
- `docs/engineering/ai-production-safety-harness.md`

## 3. V1 核心变化

V1 不再追求“更会讲道理”。V1 应该更短、更稳、更身体化。

Day 8 数据显示，高分回应共同点是：

- 不催用户变好。
- 不要求用户解释太多。
- 不给泛泛建议。
- 不用鸡汤式保证。
- 用身体和空间语言帮助用户落地。

低分回应共同点是：

- “你应该……”式建议。
- “一切都会好起来”式鸡汤。
- “为什么你觉得……”式追问。

## 4. V1 回应结构

每条非危机回应默认三段：

1. **接住**：一句话承认用户此刻的具体处境。
2. **稳住**：一句短陪伴，不急着解释，不催用户变好。
3. **落地**：一个身体或空间动作，1-3 分钟内可做。

每条回应应短于 V0，默认不超过 3 小段。

## 5. V1 内容范围

V1 response library 应包含：

- V0 核心 20 条场景的短回应版本。
- Day 8 后新增的 5 条重点场景：
  - 慢性病深夜疼痛。
  - 下半辈子的虚无感。
  - 深夜自责与胸口紧。
  - 丧亲后还没准备好开口。
  - 用户需要具体解决方案时的边界回应。

## 6. 禁止模式

V1 response library 必须明确禁止：

- “你应该……”
- “一切都会好起来。”
- “为什么你觉得……”
- 泛泛生活建议，例如没有上下文的“去散散步”。
- 医疗诊断、治疗承诺、药物建议。
- 宗教术语、因果责备、业力解释、死亡后确定性承诺。
- 过度解释、长篇开导、像咨询师布置作业。

## 7. 安全边界

危机场景仍优先进入 crisis fallback，不走普通 V1 回应。

普通 V1 回应必须通过：

- crisis safety gate
- response quality checklist
- Five Mindfulness Guardian
- AI production safety harness

## 8. 输出文件

新建：

- `docs/product/2026-05-16-v1-response-library-zh.md`

保留：

- `docs/product/2026-05-14-v0-20-scenario-responses-zh.md`

更新：

- `docs/product/version-roadmap.md`
