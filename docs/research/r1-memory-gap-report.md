# R1 Memory Gap Report

Status: Active research gap report, updated after Care Card Store V0
Date: 2026-05-26
Source-of-truth touched: `docs/research/sage-memory-research-plan.md`

## Purpose

This report compares the R1 SAGE Memory Research Prototype roadmap against the current repository implementation.

It is intentionally implementation-grounded. It does not propose a polished future architecture first; it starts from what already exists in code, prompts, evals, export, and developer diagnostics.

## Executive Verdict

Avaloka currently has a **SAGE Lite shadow-writer prototype**, not a complete SAGE Lite memory pipeline.

The existing system can:

- run an LLM Memory Writer after a feedback event in developer mode
- post-process writer candidates through a basic Memory Guardian
- show writer candidates and guardian results in the developer panel
- export per-turn SAGE memory writer results
- run local unit tests for a deterministic guardian/reader helper
- enforce minimum SAGE memory doc/eval presence through `content:check`
- save allowed writer candidates into a local Care Card Store V0
- export and clear the local Care Card with local Avaloka data

The missing core is:

- no Memory Reader wired to stored memory
- no response-time memory injection into Avaloka V2
- no automated eval proving memory improves responses without creepiness
- no standalone Care Card diagnostics, reader diagnostics, or memory-specific clear UX

In roadmap terms, R1 is roughly at:

```text
conversation + feedback
-> Memory Writer shadow endpoint
-> Memory Guardian post-processing
-> local Care Card Store V0
-> developer diagnostics / export
```

It is not yet at:

```text
stored accepted memory
-> Memory Reader
-> response-time injection
-> response eval
```

## Current Implementation

### 1. Memory Writer Prompt And Registry

Implemented:

- `prompt/sage-memory-writer-v1.md`
- `prompt/registry.json` entry `sage-memory-writer-v1`
- `server/llm-shadow-server.mjs:POST /api/sage-memory-writer`

The prompt correctly tells the writer to extract 0-5 sparse, evidence-backed care facts and reject raw private details, diagnosis, karma-blame, crisis methods, and unsupported labels.

Gap:

- The writer is only a shadow/developer tool.
- There is no offline queue or batch writer.
- There is no automated runner that scores the LLM writer against `evals/sage-memory-cases.json`.

### 2. Memory Guardian

Implemented:

- server-side post-processing in `server/llm-shadow-server.mjs`
- local helper in `app/src/lib/sageMemory.ts`
- tests in `app/src/lib/sageMemory.test.ts`

The guardian checks evidence presence, empty text, low confidence, invalid kind, unsupported evidence IDs, raw/private patterns, medical/spiritual claims, and harm/crisis details.

Gap:

- The server guardian and app guardian are duplicated instead of sharing one contract.
- Thresholds differ: local helper rejects below `0.5`, server rejects below `0.55`.
- The only runtime statuses are effectively `allow` or `reject`; `revise` exists in docs/types but is not implemented as a behavior.
- Pattern coverage is useful but still narrow for emotionally sensitive privacy cases.

### 3. Care Card / Graph Memory Store

Implemented:

- memory candidate types exist
- approved candidates can appear inside an Avaloka message's `sageMemory` result
- export includes per-turn SAGE memory writer output
- `CareCard` and `CareMemory` types exist in `app/src/types.ts`
- `app/src/lib/sageMemory.ts` can create a Care Card and upsert allowed memory candidates
- duplicate memories merge by `kind` plus normalized text, preserving evidence IDs/tags and incrementing occurrence count
- `app/src/lib/storage.ts` persists the local Care Card under `avaloka:v1:careCard`
- export includes a top-level `careCard` object and care-memory summary counts
- local data clear removes the Care Card together with messages and feedback
- tests cover save, reject, export, clear, and duplicate/merge behavior

Gap:

- There is no graph-memory store.
- The Care Card is localStorage-only and developer-path-only.
- There is no supersede, delete-one-memory, stale-memory behavior, or conflict resolution.
- There is no standalone Care Card view or memory-specific clear/export control.
- The Care Card is not yet read back into the live response flow.

The remaining storage gap is lifecycle maturity; the largest R1 gap has moved to Reader and runtime injection.

### 4. Memory Reader

Implemented:

- `selectCareFacts(facts, activeTags, limit = 5)` exists in `app/src/lib/sageMemory.ts`
- it selects high-confidence care facts by tag overlap and caps results
- there is a unit test for selecting relevant facts

Gap:

- It is not wired to an actual memory store.
- It is not wired to Baifa/dukkha/scenario tags in the live flow.
- It has no recency, evidence quality, safety-note priority, stale-memory suppression, or conflict handling.
- It does not currently inject facts into Avaloka V2.

### 5. Runtime Injection

Implemented:

- none in the user-facing response path

Gap:

- Avaloka V2 response prompt does not receive retrieved care facts.
- The server V2 flow does not call a Memory Reader.
- There is no cap-enforced "3-5 care facts" prompt context.
- There is no eval that compares with-memory versus without-memory response quality.

This is now the largest R1 gap after Care Card Store V0.

### 6. Developer Diagnostics

Implemented:

- developer mode runs `requestSageMemoryWriter(...)` after feedback is saved
- the right-side developer panel shows Memory Writer status, model, latency, candidates, and guardian results

Gap:

- diagnostics only show writer output for the latest message
- there is no Care Card view
- there is no Memory Reader view
- there is no "retrieved care facts" view
- there is no before/after memory-injection comparison

### 7. Export And Clear

Implemented:

- `app/src/lib/storage.ts` exports per-turn `sageMemory`
- export summary includes ready/error counts, candidate counts, kind counts, and guardian status counts
- export includes top-level `careCard`
- export summary includes `careMemoryCount` and `careMemoryKindCounts`
- normal local data clear removes messages, feedback, and the Care Card

Gap:

- there is no separate memory-store clear because the current UI clears all local Avaloka data together
- there is no developer-facing Care Card inspector
- there is no user-facing memory management surface because R1 is still research/developer-mode oriented

### 8. Evals And Gates

Implemented:

- `evals/sage-memory-cases.json` exists
- `scripts/check-content-ingestion.mjs` requires SAGE memory docs and at least five memory eval cases
- local unit tests cover basic guardian rejection/allow and tag-based retrieval

Gap:

- `sage-memory-cases.json` is currently a seed/checklist-like eval file, not an executable evaluator for writer output.
- no script runs LLM Memory Writer against these cases
- no eval verifies accepted candidates are persisted correctly
- no eval verifies Memory Reader chooses the right care facts from a stored Care Card
- no eval verifies memory injection improves the final response without exposing hidden memory logic or feeling creepy

## Requirement Coverage Matrix

| R1 Requirement | Current State | Evidence | Gap |
|---|---|---|---|
| Memory Writer candidate extraction | Partial | `prompt/sage-memory-writer-v1.md`, `/api/sage-memory-writer` | Shadow-only; no automated writer eval runner |
| Memory Guardian rejection rules | Partial | server guardian, `app/src/lib/sageMemory.ts` | duplicated logic, narrow coverage, no revise behavior |
| Care Card / memory store | Partial | `CareCard`, `CareMemory`, localStorage persistence, export/clear tests | no reader wiring, no graph store, no lifecycle beyond merge |
| Graph-memory schema experiments | Not started | docs only | no graph node/edge representation in runtime |
| Deterministic Memory Reader | Prototype only | `selectCareFacts(...)` | not wired to store or live flow |
| Response injection with 3-5 care facts | Missing | none | V2 prompt/server do not receive retrieved memory |
| Extraction/rejection/retrieval evals | Partial | seed cases + unit tests | no executable end-to-end SAGE eval runner |
| Response/privacy evals for memory | Missing | none | no with-memory response comparison |
| Developer diagnostics | Partial | SAGE Memory Writer panel | no Care Card / Reader / injection diagnostics |
| Local-first export/clear | Partial | export includes turn-level writer output and top-level `careCard`; clear removes Care Card | no standalone memory management UI |

## Main Risks

1. **False sense of R1 completion**

   The UI already says "SAGE Memory Writer", and exports include `sageMemory`, but this is still shadow output. Nothing is remembered for future turns.

2. **Guardian drift**

   Guardian rules exist in both server JavaScript and app TypeScript. As R1 grows, these can diverge unless the contract is centralized or tested against the same cases.

3. **Eval gap**

   The repo checks that SAGE eval files exist, but not that the actual writer/guardian/reader behavior passes all cases end to end.

4. **No memory lifecycle**

   Without add/update/merge/delete/export/clear semantics, approved memory candidates cannot yet become trustworthy long-term memory.

5. **Injection safety not yet tested**

   The most sensitive part of R1 is not extracting memory; it is using memory without being creepy, invasive, or overconfident. That path does not exist yet.

## Recommended Next Slice

Do not start with graph database work. The smallest useful Care Card loop is now real in code; the next gap is reading from it.

### Slice 1: Care Card Store V0

Status: implemented in code on 2026-05-26.

Goal:

```text
allowed Memory Writer candidates
-> local Care Card store
-> exportable / clearable accepted memory
```

Files likely affected:

- `app/src/lib/sageMemory.ts`
- `app/src/lib/storage.ts`
- `app/src/types.ts`
- `app/src/App.tsx`
- `app/src/lib/sageMemory.test.ts`
- `app/src/lib/storage.test.ts`

Acceptance criteria:

- allowed candidates can be saved into a local Care Card
- rejected candidates are not saved
- stored memory keeps evidence IDs, kind, tags, confidence, created/updated timestamps
- memory export and clear are explicit
- tests cover save, reject, export, clear, and duplicate/merge behavior

### Slice 2: Deterministic Memory Reader V0

Status: next recommended slice.

Goal:

```text
current turn tags
-> stored Care Card
-> 3-5 relevant care facts
```

Acceptance criteria:

- reader uses dukkha/response/scenario tags where available
- safety notes outrank generic preferences when risk tags appear
- stale or low-confidence facts are excluded
- tests cover illness fear, self-blame, tone preference, avoid-response moves, and no-match cases

### Slice 3: Developer-Only Injection Trial

Goal:

```text
retrieved care facts
-> Avaloka V2 prompt context
-> developer diagnostics + export
```

Acceptance criteria:

- V2 receives at most 3-5 care facts
- user-facing response does not expose hidden memory logic, evidence IDs, scores, or private logs
- developer panel shows retrieved facts and source memory IDs
- export records retrieved facts for research review
- eval cases compare response quality with and without memory

## Explicit Non-Goals For The Next Slice

- no production graph database
- no graph neural reader
- no GRPO or fine-tuning
- no full RAG over wisdom corpora
- no real user private memory import
- no account, payment, community, or growth work
- no user-facing claims that Avaloka "remembers" until export/clear and privacy behavior are real

## Bottom Line

The current implementation is a good R1 foothold: it proves the project can run a Memory Writer shadow path, reject obviously unsafe candidates, and persist allowed candidates into a local Care Card.

The next real milestone is not "better prompt wording." It is making stored Care Card memory readable, diagnostically visible, and testable before injecting it into Avaloka V2.
