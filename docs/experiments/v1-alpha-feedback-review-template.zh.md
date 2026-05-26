# Avaloka V1 Alpha 导出数据 Review 模板

> **状态**：Historical V1 Alpha review template；R1 可参考但不直接作为当前实验模板。
> **R1 说明**：当前 active milestone 是 SAGE Memory Research Prototype。R1 memory/privacy/response eval 应使用专门的研究模板。
> **用途**：测试者导出 JSON 后，用于 Day 8 或阶段复盘。
> **原则**：先看真实使用行为，再看主观评价。不要用单句夸奖代替留存证据。

## 1. 基本信息

| 项目 | 内容 |
|---|---|
| 用户编号 | U__ |
| 测试日期 | YYYY-MM-DD 至 YYYY-MM-DD |
| 地区/时区 |  |
| 主要低谷类型 | 孤独 / 病痛恐惧 / 衰老 / 死亡焦虑 / 无子或空巢 / 意义崩塌 / 其他 |
| 是否完成 7 天 | 是 / 否 |

## 2. 行为汇总

| 指标 | 结果 | 备注 |
|---|---:|---|
| 总打开/对话次数 |  |  |
| 真实低谷次数 |  |  |
| 主动打开次数 |  |  |
| 反馈保存次数 |  |  |
| 平均安顿评分 |  | 1-5 |
| 明天想继续次数 |  |  |
| 明确不想继续次数 |  |  |
| crisis safety gate 触发次数 |  |  |
| guardian fallback 次数 |  |  |

## 3. Internal Signal 汇总

| 信号 | 出现次数 | 代表输入 |
|---|---:|---|
| `suffering_of_pain` |  |  |
| `suffering_of_change` |  |  |
| `story_added_suffering` |  |  |
| `craving` |  |  |
| `aversion` |  |  |
| `ignorance` |  |  |

## 4. Response Move 汇总

| Response Move | 出现次数 | 是否有效 | 备注 |
|---|---:|---|---|
| `reject_punishment_frame` |  | 是 / 否 / 不确定 |  |
| `conditions_not_blame` |  | 是 / 否 / 不确定 |  |
| `soften_permanence_story` |  | 是 / 否 / 不确定 |  |
| `medical_boundary` |  | 是 / 否 / 不确定 |  |
| `sensory_anchor` |  | 是 / 否 / 不确定 |  |
| `name_body_alarm` |  | 是 / 否 / 不确定 |  |
| `first_arrow_second_arrow` |  | 是 / 否 / 不确定 |  |
| `restore_small_connection` |  | 是 / 否 / 不确定 |  |
| `encourage_human_support` |  | 是 / 否 / 不确定 |  |
| `honor_past_utility` |  | 是 / 否 / 不确定 |  |
| `no_forced_letting_go` |  | 是 / 否 / 不确定 |  |
| `event_vs_meaning` |  | 是 / 否 / 不确定 |  |
| `role_not_whole_self` |  | 是 / 否 / 不确定 |  |
| `remove_practice_pressure` |  | 是 / 否 / 不确定 |  |

## 5. 高分回应

记录用户标记为“最有帮助”的句子。

| 输入场景 | 最有帮助的一句话 | 为什么有效 |
|---|---|---|
|  |  |  |

## 6. 低分或失败回应

记录冷、泛泛、不对、不安全、太长、太像鸡汤的句子。

| 输入场景 | 失败句子 | 问题类型 | 下一步 |
|---|---|---|---|
|  |  | 冷 / 泛 / 不准 / 太长 / 不安全 / 术语化 / 医疗风险 / 其他 | 加 eval / 改 mapper / 改 response / 改 safety |

## 7. Default 路由检查

列出掉到 `default` 或 `return_to_now` 但其实应该有更精准 move 的输入。

| 用户输入 | 期望 move | 是否要补规则 |
|---|---|---|
|  |  | 是 / 否 |

## 8. 安全检查

- 是否出现 karma-blame、报应、罪感、命定惩罚？
- 是否出现医疗诊断或治疗建议？
- 是否出现“只依赖 Avaloka”的表达？
- 是否出现危机语言但没有触发 crisis gate？
- 是否有用户误解 Avaloka 是治疗、医生、宗教权威？

结论：

```text
安全通过 / 需要修复后再继续
```

## 9. Alpha 判定

| 问题 | 答案 |
|---|---|
| 用户是否在真实低谷主动打开？ | 是 / 否 |
| 用户是否愿意继续免费使用？ | 是 / 否 |
| 用户是否愿意推荐给类似的人？ | 是 / 否 |
| Avaloka 最有效场景是什么？ |  |
| Avaloka 最弱场景是什么？ |  |
| 下一版最该修什么？ |  |

## 10. 进入 Failure Log / Eval 的项目

| 失败输入或回应 | 新增位置 |
|---|---|
|  | `docs/experiments/failure-log.md` |
|  | `evals/wisdom-response-cases.json` |
|  | `app/src/lib/avalokaSmoke.test.ts` |
