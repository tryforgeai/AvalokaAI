# User-Facing Memory Controls Design

Status: Draft design for R1/R2 boundary
Date: 2026-07-29
Owner: AvalokaAI local research project
Related source of truth: `docs/product/product-vision.md`, `DESIGN.md`, `docs/engineering/avaloka-memory-engine-v1.md`, `docs/research/r1-memory-gap-report.md`, `docs/decisions/decision-log.md`

## 1. Executive Summary

Avaloka now has developer-mode memory observability: Care Card storage, retrieval traces, claim grounding, lifecycle events, and a durable Memory Lifecycle Review Queue V0.

The next product risk is not missing memory infrastructure. The next product risk is exposing internal memory data to a vulnerable user in a way that feels invasive, technical, or like a hidden dossier.

This document defines a safe first user-facing memory controls design. It is a design boundary, not an implementation spec. No UI should be implemented until this boundary is accepted.

Recommended first user-facing control surface:

```text
A small "Remembered care notes" section in local data controls.
```

It should let the user:

- see a plain-language summary of care-relevant notes Avaloka may use;
- delete one remembered care note;
- clear all remembered care notes;
- pause future remembering;
- export a user-safe memory summary.

It must not expose:

- memory IDs;
- candidate IDs;
- evidence IDs;
- confidence scores;
- raw review queue items;
- internal tags;
- retrieval traces;
- claim-grounding internals;
- guardian rules, policy routing, hidden prompts, or model labels.

## 2. Product Principle

Avaloka memory should feel like a small local note about what kind of care helps, not a dossier about the user's life.

User-facing copy should communicate:

```text
Avaloka keeps a few local care notes so replies can feel less repetitive and more considerate.
You can view, delete, clear, export, or pause these notes at any time.
```

It should not communicate:

```text
Avaloka analyzes you, scores you, classifies your patterns, stores your evidence trail, or decides what you are.
```

The permanent rule remains:

> Remember the way this person should be cared for, not every private detail of her life.

## 3. Scope

### In Scope For First User-Facing Controls

- Show a short list of user-safe care notes derived from active Care Card memories.
- Allow deleting a single care note.
- Allow clearing all care notes.
- Allow pausing future memory writes.
- Allow exporting a user-safe memory summary.
- Explain memory in warm, ordinary, non-technical language.
- Confirm destructive actions before real-user testing.
- Add tests that prove user mode does not leak internal memory artifacts.

### Out Of Scope For First User-Facing Controls

- Editing memory text inline.
- Showing raw conversation evidence.
- Showing developer review queue entries.
- Showing retrieval traces, claim grounding, guardian decisions, tags, scores, IDs, or source turn IDs.
- Building graph-memory UI.
- Adding Qdrant, Neo4j, embeddings, rerankers, or production storage.
- Syncing memory across devices.
- User accounts, login, cloud backup, or payment.
- Treating memory as a medical record, therapy note, or psychological profile.

## 4. Information Architecture

User mode currently shows chat, optional feedback, and local data controls. Memory controls should remain utility-level, not become the primary experience.

Recommended placement:

```text
Local data controls
├── Export conversation/data
├── Clear local data
└── Remembered care notes
    ├── Memory status: On / Paused
    ├── Note list
    ├── Delete note
    ├── Clear all care notes
    └── Export care notes
```

Avoid creating a dashboard-like page. The chat must remain the primary surface.

## 5. User-Safe Memory Representation

### Internal Memory Shape

Internal `CareMemory` and review queue data can contain:

- `id`
- `kind`
- `text`
- `confidence`
- `evidenceIds`
- `tags`
- `occurrences`
- `status`
- lifecycle metadata
- review reasons

These are developer artifacts.

### User-Facing Memory Shape

The user-facing surface should use a sanitized projection:

```ts
interface UserFacingCareNoteV0 {
  displayText: string;
  category: "what_helps" | "what_to_avoid" | "tone_preference" | "safety_boundary" | "recurring_theme";
  lastUpdatedLabel: string;
}
```

This projection intentionally omits IDs, scores, evidence links, tags, and raw lifecycle state.

Implementation may still need an internal opaque handle for delete actions, but that handle must not be displayed, exported in user-safe exports, or described to the user.

## 6. Category Mapping

Suggested first mapping from `SageMemoryCandidateKind` to user categories:

| Internal kind | User-facing category | User-facing heading |
|---|---|---|
| `helpful_response_move` | `what_helps` | What seems to help |
| `avoid_response_move` | `what_to_avoid` | What Avaloka should avoid |
| `tone_preference` | `tone_preference` | Tone and length |
| `safety_note` | `safety_boundary` | Safety boundaries |
| `recurring_pain_pattern` | `recurring_theme` | Recurring themes |

If the actual code uses a smaller or different set of candidate kinds, implement the mapping from the observed `SageMemoryCandidateKind` union in `app/src/types.ts`; do not invent unsupported kinds.

## 7. Copy Rules

### General Voice

Use ordinary, compassionate Chinese in user mode.

Good:

```text
Avaloka 记住了一些照顾你的方式。你可以随时删除或关闭。
```

Good:

```text
这些记忆只保存在本机，用来让回答少一点重复，多一点贴近你。
```

Bad:

```text
Memory Guardian allowed this candidate with confidence 0.82.
```

Bad:

```text
We detected a recurring suffering pattern and ranked it with retrieval score 0.91.
```

### Empty State

```text
现在还没有保存的照顾笔记。
当你明确反馈某种回答有帮助，或某种说法不适合你时，Avaloka 可能会在本机留下一条简短笔记。
```

### Memory Status On

```text
记忆已开启。Avaloka 只会保存少量和照顾方式有关的本机笔记。
```

### Memory Status Paused

```text
记忆已暂停。Avaloka 现在不会新增照顾笔记，已有笔记仍可查看、删除或清空。
```

### Delete One Note Confirmation

```text
要删除这条照顾笔记吗？删除后，Avaloka 以后不会再用它来调整回答。
```

### Clear All Notes Confirmation

```text
要清空所有照顾笔记吗？这不会删除聊天记录，但 Avaloka 会失去这些个性化照顾线索。
```

If clear-all is coupled to the broader `clearAvalokaData()` flow, copy must say that messages and feedback are also cleared. Do not hide broad deletion behind memory-only wording.

### Export Copy

```text
导出一份可读的照顾笔记摘要。
```

Avoid:

```text
Export lifecycle review queue JSON.
```

## 8. Delete, Clear, Pause, And Export Semantics

### Delete Single Care Note

User intent:

```text
I do not want Avaloka to use this note again.
```

System behavior should:

- remove or deactivate the active memory from user-facing retrieval;
- preserve any developer lifecycle event only in developer diagnostics;
- avoid showing internal deletion IDs in user mode;
- update the user-facing list immediately.

Current `deleteCareMemory(memoryId)` physically removes a memory and appends a lifecycle event/review item. A user-facing delete can call this internally if a hidden handle maps to `memoryId`, but the UI must not display the ID.

### Clear All Care Notes

User intent:

```text
Forget the care notes you use to personalize responses.
```

Preferred future behavior:

- clear Care Card memories and memory lifecycle review queue;
- preserve messages and feedback unless the user chooses broader local data clearing;
- keep the copy explicit about what is and is not deleted.

Current `clearAvalokaData()` removes messages, feedback, and the Care Card together. That is acceptable for current broad local-data control, but it is too broad for a future memory-only clear action. The first implementation should either add a dedicated memory-only clear helper or label the broad clear honestly.

### Pause Future Remembering

User intent:

```text
Do not create new care notes for now.
```

Preferred behavior:

- existing active notes may still be used unless the user also clears them;
- Memory Writer output should not be saved while paused;
- developer diagnostics may show that memory writing is paused, but user mode should only show simple status.

This likely requires a small local setting such as:

```text
avaloka:v1:memoryConsent = "on" | "paused"
```

Do not reuse broad app consent unless product copy clearly distinguishes chat consent from memory-write consent.

### User-Safe Export

User intent:

```text
Show me what Avaloka remembers in readable language.
```

The user-safe export should include only:

- display text;
- category heading;
- approximate updated date if needed;
- memory status on/paused;
- a short explanation of local-only storage.

It must not include internal JSON fields, IDs, tags, confidence, evidence IDs, or lifecycle review queue items.

Developer export can remain separate and explicit in developer mode.

## 9. Privacy And Safety Boundaries

User-facing memory controls must preserve these boundaries:

1. **No hidden dossier feeling** — do not show technical classifications or speculative labels.
2. **No medical record framing** — safety notes should describe response boundaries, not diagnoses.
3. **No spiritual judgment** — never present karma, guilt, purity, or moral labels as memory.
4. **No raw transcript snippets** — user-facing memory should be abstracted and short.
5. **No third-party private facts** — avoid making remembered notes about other people.
6. **No crisis means or self-harm details** — do not preserve crisis specifics as reusable memory.
7. **No scores or opaque ranking** — hidden scores may be useful for retrieval, not for user copy.
8. **No dependency language** — do not imply Avaloka is the user's only safe support.

## 10. Developer/User Boundary

Keep two separate surfaces:

| Surface | Audience | May show | Must hide |
|---|---|---|---|
| User memory controls | ordinary user | sanitized care notes, delete/clear/pause/export controls | IDs, scores, tags, review reasons, traces, raw JSON |
| Developer diagnostics | local developer | review queue, lifecycle events, counts, traces, export JSON | secrets, external credentials, hidden chain-of-thought |

Developer mode remains explicit through `?dev=1` or `?mode=dev` per `DESIGN.md`.

## 11. Acceptance Criteria For First Implementation

A future implementation of User-Facing Memory Controls V0 should meet these criteria:

1. User mode displays a remembered care notes section only when local data controls are visible.
2. User-facing notes are rendered from a sanitized projection, not raw `CareMemory` objects.
3. User-facing text contains no memory IDs, candidate IDs, evidence IDs, confidence scores, tags, or review reasons.
4. Deleting one note removes it from user-facing retrieval and appends developer lifecycle observability.
5. Clearing all care notes does not silently clear unrelated chat/feedback data unless copy explicitly says it will.
6. Pausing memory prevents future memory writes from being saved.
7. Developer diagnostics continue to show review queue data only in developer mode.
8. Export has two clear paths: user-safe memory summary and developer JSON export.
9. Unit tests cover sanitized projection, delete, clear, pause, and no-leak behavior.
10. Manual QA verifies destructive confirmations and copy clarity.

## 12. Test Plan For Future Implementation

### Unit Tests

Add focused tests for:

- `toUserFacingCareNotes(careCard)` strips IDs, evidence IDs, confidence, tags, and review metadata.
- category mapping from actual `SageMemoryCandidateKind` values.
- deleted and superseded memories are absent from user-facing active notes.
- paused memory setting prevents `saveMemoryCandidates(...)` from mutating the Care Card.
- memory-only clear does not remove messages or feedback.
- user-safe export does not include forbidden internal keys.

Suggested forbidden-token assertions:

```text
memoryId
candidateId
evidenceIds
confidence
tags
lifecycleReviewQueue
retrieval_trace_v1
memory_claim_grounding_v0
guardian
```

### Integration / UI Tests

If a UI testing layer is added, verify:

- default user mode does not render developer review queue strings;
- `?dev=1` still renders developer diagnostics;
- delete and clear actions require confirmation;
- paused state is visible and reversible.

### Manual QA Checklist

- Read copy as a vulnerable user: does it feel like care, not surveillance?
- Confirm delete wording matches actual deletion scope.
- Confirm clear wording matches actual deletion scope.
- Confirm export output can be safely sent to a non-technical user.
- Confirm no internal IDs or scores appear in user mode.

## 13. Recommended Implementation Slice After This Design

Implementation status as of 2026-07-29:

```text
Slice 1: sanitized projection helper — implemented
Slice 2: memory write pause setting — implemented
Slice 3: memory-only clear helper — not started
Slice 4: small user-mode UI surface — not started
```

Once accepted, implement in four small slices:

1. **Sanitized projection helper**
   - Add a pure helper that maps `CareCard` to `UserFacingCareNoteV0[]`.
   - Write tests first for no-leak behavior.

2. **Memory write pause setting**
   - Add local memory-write status helper.
   - Gate `saveMemoryCandidates(...)` or its caller behind the setting.
   - Test that pause prevents new saved candidates.

3. **Memory-only clear helper**
   - Add a helper that clears only Care Card memory state.
   - Test that messages and feedback survive.

4. **Small user-mode UI surface**
   - Render care notes under local data controls.
   - Add delete, clear, pause/resume, and user-safe export actions.
   - Keep developer diagnostics unchanged.

Do not add graph, vector search, reranking, accounts, cloud sync, or product growth features in this slice.

## 14. Open Questions

1. Should pausing memory also prevent current active notes from being retrieved, or only prevent future writes?
   - Recommended first answer: only prevent future writes; use clear/delete to stop use of existing notes.

2. Should user-facing delete physically remove memory or mark it deleted?
   - Recommended first answer: use existing delete semantics internally; preserve developer lifecycle observability only in developer diagnostics.

3. Should the first user-safe export be Markdown or JSON?
   - Recommended first answer: Markdown/plain text for ordinary user readability; keep JSON export developer-only.

4. Should user-facing memory controls appear by default or behind an expandable disclosure?
   - Recommended first answer: behind a calm expandable local-data section so the chat remains primary.

## 15. Final Recommendation

Proceed only after this design is accepted.

The first implementation should be conservative and test-driven:

```text
sanitized projection -> pause setting -> memory-only clear -> small user-mode controls
```

This keeps Avaloka aligned with its research-first identity while giving users meaningful control over the memory system that now exists.
