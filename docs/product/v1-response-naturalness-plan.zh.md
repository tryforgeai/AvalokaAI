# Avaloka V1 Response Naturalness Plan

Status: Active product design note  
Purpose: Reduce rigid three-part responses while keeping Avaloka safe, short, and testable.

## 1. Problem

Avaloka 当前回应经常呈现固定三段式：

1. 看见；
2. 解释/陪伴；
3. 身体动作。

这个结构对 V0 很有用，因为它能保证安全、短、稳定、不跑题。但如果每次都这样，用户会感觉：

- 像模板；
- 像客服；
- 像训练过的安慰话；
- 缺少真人对话里的节奏变化；
- 长期使用会有“我知道它接下来要说什么”的疲劳。

正常人不会永远三段式说话。真实陪伴会有停顿、追随、短句、复述、沉默、轻轻确认，也会根据用户状态调整长度。

## 2. What Must Not Change

自然化不能牺牲 Avaloka 的核心边界：

- 不做心理治疗；
- 不做医疗建议；
- 不做危机服务；
- 不讲佛法术语；
- 不输出 karma-blame、罪感、报应、命定惩罚；
- 不制造依赖；
- 不变成泛泛聊天机器人。

自然化的目标不是“更会聊”，而是：

> 更像一个稳、短、懂分寸的人。

## 3. Naturalness Dimensions

### 3.1 Length Variation

不要每次都是三段。

允许这些形态：

| Shape | When To Use | Example |
|---|---|---|
| one-breath | 用户很痛、很累、不想解释 | “先别急着解释。把脚踩住，我们只过这一分钟。” |
| two-line | 用户表达清楚，适合短承接 | “你不是做不好，是太想让自己立刻好起来了。今晚少用一点力就够。” |
| three-part | 高风险或复杂低谷 | 看见 + 去伤害性解释 + 身体动作 |
| soft-question | 用户不够具体但不危机 | “你愿意只告诉我，身体现在最紧的是哪里吗？” |
| reflective | 用户在意义崩塌/角色变化中 | “你失去的不是一个小习惯，是一个被需要的位置。” |

### 3.2 Opening Variation

不要总是“我听见你...”。

可替换开头：

- “这一下很重。”
- “先停在这里。”
- “你不用马上解释完整。”
- “这不是小题大做。”
- “我先陪你把这一分钟放慢。”
- “这句话背后有很多累。”

### 3.3 Body Action Variation

不要总是“慢慢呼一口气”。

可替换动作：

- 脚踩地；
- 手放胸口；
- 手摸杯子或桌面；
- 看见房间里一个稳定的东西；
- 听一个近处声音；
- 肩膀放低一点；
- 喝一口温水；
- 只写一个词。

### 3.4 No Forced Closure

有些回应不需要“解决动作”，只需要承认。

适用：

- 丧亲；
- 角色失落；
- 意义崩塌；
- 用户说“不想被开导”。

Example:

```text
这句话很孤单。

今晚先不用把它讲圆。它能被说出来，已经很不容易。
```

## 4. Can This Be Done Without AI?

可以改善，但有上限。

本地规则可以做到：

- 多个 response variants；
- 按 responseMove 选择不同形态；
- 避免连续使用同一种开头；
- 随机但受控地选择身体动作；
- 根据输入长度决定回应长短；
- 如果用户说“不讲道理”，自动用 one-breath shape。

本地规则难做到：

- 真正追随用户独特语气；
- 对复杂叙事做细腻重述；
- 在多轮对话中自然承接；
- 避免长期重复感；
- 对新表达方式有弹性理解。

## 5. Is OpenAI API Required?

不是马上必需，但 V1 想要“更像真实陪伴”，最终大概率需要接 AI。

推荐路径：

### Phase A: Local Naturalness Pass

先不接 API，做受控自然化：

- 每个 high-priority responseMove 增加 2-4 个 variants；
- 增加 response shape；
- 增加 body action pool；
- 增加 no-repeat rule；
- smoke test 确保仍然不破戒、不医疗化、不三段死板。

适合现在做，因为便宜、快、安全。

### Phase B: AI-Assisted Response Generator

接 OpenAI API，但只让模型在安全框架里生成最终文字。

输入给模型：

- user text；
- dukkhaTypes；
- patterns；
- responseMoves；
- forbidden phrases；
- target shape；
- max length；
- safety boundaries。

输出必须经过：

- crisis gate；
- precepts guardian；
- response quality eval；
- prompt leakage guard；
- fallback response。

### Phase C: Eval-Gated Personalization

只有当 Alpha 数据证明用户想继续，才做：

- tone memory；
- preferred response length；
- preferred grounding action；
- repeated-pattern support。

## 6. Recommended Next Step

Do **Phase A: Local Naturalness Pass** before OpenAI API.

Why:

- It fixes the visible stiffness immediately.
- It preserves safety.
- It creates baseline evals before introducing model variability.
- It helps us know exactly what AI should improve later.

Deliverables:

1. `app/src/data/responseVariants.ts`
2. `app/src/lib/naturalResponse.ts`
3. update `dukkhaResponse.ts`
4. tests for:
   - no forbidden language;
   - no repeated three-part shape every time;
   - “do not lecture” produces one-breath response;
   - outputs remain short.

## 7. Product Principle

Avaloka 的回应结构应该从：

```text
固定三段式
```

升级为：

```text
有安全骨架，但外在节奏自然变化
```

