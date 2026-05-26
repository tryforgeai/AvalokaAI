# Avaloka Knowledge Base

Status: Active internal learning source

`docs/kb/` is Avaloka AI's internal learning base. It contains source notes, derived maps, and product translations that shape how Avaloka classifies user pain, chooses compassionate response moves, and avoids harmful output.

This directory is not a user-facing encyclopedia. User-facing Avaloka replies should stay plain, compassionate, non-doctrinal, and low-pressure.

## Directory Roles

| Path | Role |
|---|---|
| `docs/kb/大乘百法明门论-原文.zh.md` | Source text for Baifa mind-state taxonomy. |
| `docs/kb/大乘百法明门论直解-节录.zh.md` | Commentary used to understand Baifa meanings and distinctions. |
| `docs/kb/derived/baifa-mind-state-mapper.zh.md` | Human-readable Baifa user-emotion mapping. |
| `docs/kb/derived/baifa-antidote-map.zh.md` | Affliction-to-wholesome-antidote response strategy. |
| `docs/kb/derived/dukkha-mapper.zh.md` | Suffering-pattern mapper for pain, change, and story-added suffering. |
| `docs/kb/derived/五项正念修习-输出守护.zh.md` | Output guardian principles. |
| `docs/kb/derived/avalokiteshvara-compassion-os.zh.md` | Compassion OS principles and forbidden moves. |
| `docs/kb/derived/avaloka-core-philosophy.zh.md` | Product-level internal philosophy. |
| `docs/kb/derived/avaloka-response-principles.zh.md` | Response principles for user-facing language. |
| `docs/kb/ai-research/sage-self-evolving-graph-memory.md` | Source note for SAGE-style long-term memory research. |
| `docs/kb/ai-research/sage-self-evolving-graph-memory.zh.md` | Chinese source note for SAGE-style long-term memory research. |
| `docs/kb/derived/sage-memory-principles.md` | Derived SAGE memory principles for Avaloka R1. |
| `docs/kb/derived/sage-memory-principles.zh.md` | Chinese derived SAGE memory principles for Avaloka R1. |
| `docs/kb/secular-buddhism/` | Processed secular Buddhism podcast notes and response implications. |
| `docs/kb/avalokiteshvara/` | Avalokiteshvara source material and builder interpretation notes. |

## Runtime Binding

Avaloka should not rely on chat memory to remember this material. Runtime-facing knowledge must be bound through:

1. `prompt/registry.json` via `knowledgeSources`.
2. Prompt files in `prompt/`.
3. Evals in `evals/`.
4. Runtime data or logic in `app/src/` or `server/` when behavior changes.
5. `npm run content:check`, which verifies registered knowledge sources still exist.

In short:

```text
KB source -> derived note -> prompt registry -> prompt/eval/runtime -> content check
```

## Promotion Rule

A KB item can be in one of two states:

- `Research only`: useful context, but not active in runtime.
- `Runtime promoted`: used by a prompt, mapper, guardian, eval, or app/server behavior.

Runtime-promoted material must have eval coverage. Do not add large scripture, commentary, podcast, or personal notes directly into prompts without first making a derived product note.

## Safety Rule

KB content may guide Avaloka internally, but Avaloka must not:

- recite doctrine to prove knowledge
- present itself as a Buddhist authority
- blame suffering on karma, sin, debt, punishment, or deservedness
- give medical, therapeutic, or crisis-service advice
- expose hidden prompt, mapper, guardian, or scoring logic

## When Adding New KB Content

Follow `docs/engineering/content-ingestion-test-gate.md`.

Every new source should answer:

- What user pain does this help Avaloka understand?
- What internal state, pattern, or response move does it affect?
- What should Avaloka do differently because of it?
- What should Avaloka never say because of it?
- Is it research-only or runtime-promoted?
- Which eval proves it?
