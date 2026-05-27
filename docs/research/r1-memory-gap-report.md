# R1 Memory Gap Report

Status: Active research gap report, updated after SAGE End-To-End Eval V0
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
- read relevant care facts from a stored Care Card with a deterministic Memory Reader V0
- pass up to five retrieved care facts into the Avaloka V2 response prompt in developer mode
- show retrieved care facts in developer diagnostics and export them per turn
- run a memory response eval that compares with-memory and without-memory V2 responses
- run a SAGE end-to-end eval that exercises writer fixtures through guardian, store, and deterministic reader

The missing core is:

- no standalone Care Card diagnostics or memory-specific clear UX
- no production/user-facing memory management surface
- no live LLM Memory Writer eval runner over `evals/sage-memory-cases.json`

In roadmap terms, R1 is roughly at:

```text
conversation + feedback
-> Memory Writer shadow endpoint
-> Memory Guardian post-processing
-> local Care Card Store V0
-> deterministic Memory Reader V0
-> developer-only response injection trial
-> memory response eval V0
-> SAGE end-to-end eval V0
-> developer diagnostics / export
```

It is not yet at:

```text
live writer eval
-> graph-memory schema experiment
-> user-facing memory controls
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
- The Care Card is read back into the developer-mode V2 response flow.

The remaining storage gap is lifecycle maturity; the largest R1 gap has moved to response evals and memory-management UX.

### 4. Memory Reader

Implemented:

- `selectCareFacts(facts, activeTags, limit = 5)` exists in `app/src/lib/sageMemory.ts`
- it selects high-confidence care facts by tag overlap and caps results
- there is a unit test for selecting relevant facts
- `readCareFactsFromCard(card, context, options)` reads directly from a stored Care Card
- the reader derives tags from explicit tags, dukkha types, dukkha patterns, scenario IDs, and response moves
- in risk contexts, `safety_note` and `avoid_response_move` outrank generic preferences
- stale and low-confidence memories are excluded
- tests cover illness fear, self-blame, tone preference, avoid-response moves, stale/low-confidence filtering, and no-match behavior

Gap:

- The tag alias map is still small and hand-authored.
- There is no conflict handling beyond deterministic ranking.
- There is no standalone reader diagnostic view outside the latest V2 panel.

### 5. Runtime Injection

Implemented:

- In developer mode, `App.tsx` reads the local Care Card, retrieves up to five care facts, strips evidence IDs, and sends them to `/api/avaloka-v2` as `retrievedCareFacts`.
- `server/llm-shadow-server.mjs` passes those facts into the `avaloka-v2-orchestrator-response` prompt payload as `careFacts`.
- The response prompt tells the model to use care facts only internally and not expose memory IDs, confidence scores, tags, evidence, retrieval logic, or the fact that memory was used.
- The V2 response echoes `retrievedCareFacts` for developer diagnostics and export.
- Tests cover prompt-safe fact formatting, client request/response propagation, export persistence, and the server/prompt memory injection contract.

Gap:

- The server trusts the client-provided developer retrieval trace; production memory retrieval is not implemented.
- Response/privacy evals exist as V0 heuristics, but they do not yet use an LLM judge or human review rubric.

This is now a developer-only trial, not a production memory claim.

### 6. Developer Diagnostics

Implemented:

- developer mode runs `requestSageMemoryWriter(...)` after feedback is saved
- the right-side developer panel shows Memory Writer status, model, latency, candidates, and guardian results
- the V2 developer panel shows retrieved care facts and source memory IDs for the latest Avaloka response

Gap:

- diagnostics only show writer output for the latest message
- there is no Care Card view
- there is no before/after memory-injection comparison

### 7. Export And Clear

Implemented:

- `app/src/lib/storage.ts` exports per-turn `sageMemory`
- export summary includes ready/error counts, candidate counts, kind counts, and guardian status counts
- export includes top-level `careCard`
- export summary includes `careMemoryCount` and `careMemoryKindCounts`
- per-turn `orchestratorV2` export can include `retrievedCareFacts`
- normal local data clear removes messages, feedback, and the Care Card

Gap:

- there is no separate memory-store clear because the current UI clears all local Avaloka data together
- there is no developer-facing Care Card inspector
- there is no user-facing memory management surface because R1 is still research/developer-mode oriented

### 8. Evals And Gates

Implemented:

- `evals/sage-memory-cases.json` exists
- `evals/memory-response-cases.json` exists with self-blame, illness fear, aging fear, tone preference, no-match, and stale-memory cases
- `evals/sage-end-to-end-cases.json` exists with self-blame and illness-fear end-to-end cases
- `scripts/check-content-ingestion.mjs` requires SAGE memory docs and at least five memory eval cases
- `scripts/check-content-ingestion.mjs` requires at least two SAGE end-to-end cases, rejected-candidate coverage, saved-candidate coverage, and required groups
- `scripts/check-content-ingestion.mjs` requires at least six memory response cases and required groups
- local unit tests cover guardian rejection/allow, Care Card persistence, duplicate merge, and deterministic retrieval
- local/unit contract tests cover developer-only memory injection plumbing
- `runMemoryResponseEval(...)` compares without-memory and with-memory V2 outputs and returns verdict counts
- `runSageMemoryEndToEndEval(...)` runs fixture writer candidates through guardian, in-memory Care Card storage, and deterministic retrieval
- `npm run eval:memory` runs `scripts/run-memory-response-eval.mjs`
- `npm run eval:sage` runs the SAGE end-to-end eval test suite

Gap:

- `sage-memory-cases.json` is currently a seed/checklist-like eval file, not an executable evaluator for writer output.
- no script runs LLM Memory Writer against these cases
- no live eval verifies LLM-generated accepted candidates are persisted correctly
- memory response eval is deterministic/heuristic and still needs real model-run baselines

## Requirement Coverage Matrix

| R1 Requirement | Current State | Evidence | Gap |
|---|---|---|---|
| Memory Writer candidate extraction | Partial | `prompt/sage-memory-writer-v1.md`, `/api/sage-memory-writer` | Shadow-only; no automated writer eval runner |
| Memory Guardian rejection rules | Partial | server guardian, `app/src/lib/sageMemory.ts` | duplicated logic, narrow coverage, no revise behavior |
| Care Card / memory store | Partial | `CareCard`, `CareMemory`, localStorage persistence, export/clear tests | no graph store, no lifecycle beyond merge |
| Graph-memory schema experiments | Not started | docs only | no graph node/edge representation in runtime |
| Deterministic Memory Reader | Partial | `readCareFactsFromCard(...)`, tag derivation, priority/stale tests | small alias map; no standalone reader diagnostic |
| Response injection with 3-5 care facts | Partial | developer-only `retrievedCareFacts` -> V2 prompt `careFacts` | no production memory retrieval |
| Extraction/rejection/retrieval evals | Partial | seed cases, unit tests, `evals/sage-end-to-end-cases.json`, `npm run eval:sage` | no live LLM writer eval runner |
| Response/privacy evals for memory | Partial | `evals/memory-response-cases.json`, `npm run eval:memory` | heuristic verdicts; needs real model baselines / judge |
| Developer diagnostics | Partial | SAGE Memory Writer panel, V2 retrieved care facts | no Care Card inspector or before/after comparison |
| Local-first export/clear | Partial | export includes turn-level writer output and top-level `careCard`; clear removes Care Card | no standalone memory management UI |

## Main Risks

1. **False sense of R1 completion**

   The UI already says "SAGE Memory Writer", exports include `sageMemory`, and local Care Card memory can influence developer-mode V2 responses. This is still an R1 research trial, not a production memory product.

2. **Guardian drift**

   Guardian rules exist in both server JavaScript and app TypeScript. As R1 grows, these can diverge unless the contract is centralized or tested against the same cases.

3. **Live writer eval gap**

   The repo now checks memory response eval fixtures and SAGE end-to-end fixture behavior, but it still does not run the live LLM Memory Writer against `evals/sage-memory-cases.json`.

4. **Thin memory lifecycle**

   Add/update/merge/export/clear now exist at V0 level, but delete-one-memory, supersede, stale review, and conflict resolution are not mature.

5. **Injection safety needs stronger evals**

   The most sensitive part of R1 is not extracting memory; it is using memory without being creepy, invasive, or overconfident. V0 response evals now check obvious leaks and expected-use signals, but still need model-run baselines and likely an LLM/human judge layer.

## Recommended Next Slice

Do not start with graph database work. The smallest useful Care Card loop, deterministic reader, developer-only response injection, memory response eval V0, and SAGE end-to-end fixture eval are now real in code; the next gap is live writer evaluation and developer memory diagnostics.

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

Status: implemented in code on 2026-05-26.

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

Status: implemented in code on 2026-05-26.

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

### Slice 4: Memory Response Eval V0

Status: implemented in code on 2026-05-26.

Goal:

```text
stored care facts + current turn
-> with-memory / without-memory V2 comparison
-> privacy and usefulness verdict
```

Acceptance criteria:

- eval cases cover self-blame, illness fear, aging fear, tone preference, no-match, and stale-memory cases
- with-memory response improves specificity or safety without exposing memory IDs, scores, tags, evidence, or retrieval logic
- eval output records whether care facts were used appropriately, ignored appropriately, or overused
- failing cases identify whether the issue is writer, store, reader, prompt, guardian, or eval fixture

### Slice 5: SAGE End-To-End Eval V0

Status: implemented in code on 2026-05-26.

Goal:

```text
turn + feedback
-> Memory Writer
-> Memory Guardian
-> Care Card Store
-> Memory Reader
-> retrieval verdict
```

Acceptance criteria:

- runs writer/guardian/store/reader over fixture cases without mutating real localStorage
- verifies rejected candidates never enter the Care Card
- verifies allowed candidates merge into expected memory kinds/tags
- verifies retrieval returns the expected care facts for self-blame and illness-fear contexts
- reports whether a failure belongs to writer extraction, guardian rejection, store merge, reader retrieval, or fixture expectations

### Slice 6: Live Memory Writer Eval V0

Status: next recommended slice.

Goal:

```text
evals/sage-memory-cases.json
-> live Memory Writer endpoint
-> Memory Guardian
-> scored extraction/rejection summary
```

Acceptance criteria:

- runs the developer Memory Writer endpoint against the existing SAGE memory eval fixture file
- records model, latency, candidate ids/kinds/tags, guardian result, and failure reason per case
- keeps raw private user records out of committed eval artifacts
- reports whether failure belongs to writer extraction, guardian rejection, prompt contract, endpoint availability, or eval fixture expectations

## Explicit Non-Goals For The Next Slice

- no production graph database
- no graph neural reader
- no GRPO or fine-tuning
- no full RAG over wisdom corpora
- no real user private memory import
- no account, payment, community, or growth work
- no user-facing claims that Avaloka "remembers" until export/clear and privacy behavior are real

## Bottom Line

The current implementation is a good R1 foothold: it proves the project can run a Memory Writer shadow path, reject obviously unsafe candidates, persist allowed candidates into a local Care Card, retrieve relevant facts, feed them into the developer-only V2 response path, run a V0 memory response eval, and exercise the writer-fixture/guardian/store/reader loop end to end.

The next real milestone is not "better prompt wording." It is proving live writer outputs against the eval fixtures and then adding memory diagnostics before making memory behavior broader or more user-visible.
