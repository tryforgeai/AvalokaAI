# V1 Alpha Runtime Response Moves

Status: Active runtime reference  
Purpose: List the wisdom response moves that are actually active in the local MVP.

## Selection Principle

Avaloka V1 Alpha does not promote every podcast or Buddhist concept into runtime.

Runtime moves are selected only when they improve the first use case:

> low-moment emotional settling for loneliness, illness fear, aging, death anxiety, childlessness/DINK regret, self-blame, and meaning collapse.

## Promoted Moves

The following moves are active in `app/src/data/dukkhaMap.ts` and covered by smoke tests.

| Move | Source Direction | Runtime Purpose |
|---|---|---|
| `reject_punishment_frame` | Death/karma safety, terminology safety | Never explain pain as punishment, debt, karma, or deserved suffering. |
| `conditions_not_blame` | Seeing with wisdom | Shift from personal blame to multiple conditions. |
| `soften_permanence_story` | Seeing with wisdom | Stop one painful night from becoming a lifetime verdict. |
| `medical_boundary` | Death/illness safety | Avoid diagnosis and point users to medical help when symptoms matter. |
| `sensory_anchor` | Mindfulness for kids, plain language | Replace explanation with one small sensory action. |
| `name_body_alarm` | Carrots & sticks | Name body alarm without shaming sensitivity. |
| `first_arrow_second_arrow` | Carrots & sticks | Prevent self-blame from becoming a second wound. |
| `restore_small_connection` | True selflessness | Restore tiny connection without making Avaloka the only support. |
| `encourage_human_support` | True selflessness, guardian safety | Nudge toward real support when appropriate. |
| `honor_past_utility` | Parable of the raft | Honor past roles and effort before any release. |
| `no_forced_letting_go` | Parable of the raft | Do not command users to let go. |
| `event_vs_meaning` | Path of liberation | Separate what happened from the painful meaning added to it. |

## Already Active Supporting Moves

These existed before this promotion and remain active:

- `depersonalize_pain`
- `separate_event_from_story`
- `soften_craving`
- `soften_aversion`
- `role_not_whole_self`
- `protect_self_worth`
- `remove_practice_pressure`
- `enough_for_now`
- `return_to_now`
- `protect_from_self_blame`

## Test Coverage

Runtime moves are covered by:

- `app/src/lib/avalokaSmoke.test.ts`
- `app/src/lib/dukkhaMapper.test.ts`
- `app/src/lib/dukkhaResponse.test.ts`

Required verification:

```bash
cd app
npm run content:check
npm test
npm run build
```

## Product Boundary

Even when a move comes from Buddhist wisdom, the user-facing response must not expose doctrine unless the product direction explicitly changes.

Do not output:

- karma-blame
- sin-blame
- “this is your lesson”
- “just let go”
- “everything is empty”
- afterlife certainty
- medical diagnosis
- Avaloka-as-only-support language

