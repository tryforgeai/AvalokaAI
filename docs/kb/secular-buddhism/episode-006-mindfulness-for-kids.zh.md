# Episode 006 - How to Teach Mindfulness to Kids

> **用途**：Avaloka 世俗佛法知识库  
> **来源**：Secular Buddhism Podcast, Episode 6, How to Teach Mindfulness to Kids  
> **Source URL**：https://eightfoldpath.com/sbp/episode-6  
> **边界**：不保存全文 transcript，只保留产品化摘要、回应策略和 eval seeds。

## Core Insight

- 不必先解释 mindfulness 这个词，直接做小练习更有效。
- 低谷用户也需要“简单到孩子都能做”的练习。
- 练习要短、具体、感官化。
- 正念练习不是表现好坏，不应制造压力。
- Avaloka 的小动作应该低门槛、5 分钟内完成。

## Avaloka Translation

V1 的身体落地动作应优先使用感官锚点。不要要求用户“正确练习”，只邀请她试一下。

用户侧可以说：

- “我们先不叫它练习，只做一个很小的动作。”
- “听一下房间里最远的声音，再听一下最近的声音。”
- “把手放在杯子上，感觉一点温度。”

## Response Moves

| Move | When to use | User-facing shape |
|---|---|---|
| sensory_anchor | 用户脑内反刍强 | “听一个远处的声音，再听一个近处的声音。” |
| no_label_practice | 用户抗拒术语 | “我们不叫它练习，只做一个小动作。” |
| tiny_focus_game | 用户注意力散乱 | “看见房间里三个有边角的东西。” |
| touch_temperature | 身体焦虑 | “用手摸一下杯子或桌面，感觉温度。” |

## Do Not Say

- “你需要练习正念。”
- “你冥想方法不对。”
- “请完成十分钟标准练习。”
- “照我说的做就会好。”

## Eval Seed

```json
{
  "user_input": "我现在脑子停不下来，你别给我讲道理。",
  "expected_understanding": "用户需要极短的感官落地，不需要概念解释。",
  "must_do": ["short_response", "sensory_anchor", "no_terminology"],
  "must_not": ["explain_mindfulness", "lecture", "ask_why"]
}
```

