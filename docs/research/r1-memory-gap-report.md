# R1 Memory Gap Report

Status: Active research gap report, updated after Memory Lifecycle Review Queue V0
Date: 2026-07-28
Source-of-truth touched: `docs/research/sage-memory-research-plan.md`, `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md`, `docs/decisions/decision-log.md`

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
- run a live Memory Writer eval against `evals/sage-memory-cases.json`
- run a deterministic Memory Reader benchmark against `evals/memory-reader-retrieval-cases.json`
- inspect the local Care Card and copy a developer memory report in `?dev=1`
- delete or supersede individual local Care Card memories in developer mode
- measure deterministic Memory Reader quality with retrieval metrics and a 40-case privacy-safe gold dataset
- emit redacted `RetrievalTraceV1` summaries for reader diagnosis without raw private text
- check explicit personal-memory claims against retrieved care facts with deterministic Claim Grounding V0
- keep claim-grounding diagnostics visible in developer mode and export summaries
- fall back to the local baseline when a V2 response contains unsupported personal-memory claims
- record allowed, rejected, superseded, and deleted memory decisions in a local developer-mode Memory Lifecycle Review Queue V0

The missing core is:

- no production/user-facing memory management surface
- no graph-memory schema/runtime experiment
- no user-facing lifecycle review surface beyond local developer controls

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
-> live Memory Writer eval V0
-> Care Card Inspector / Eval Report V0
-> Memory Lifecycle Control V0
-> Retrieval Metrics + Reader Benchmark V0
-> RetrievalTraceV1
-> Claim Grounding V0
-> unsupported memory claim fallback policy
-> Memory Lifecycle Review Queue V0
-> developer diagnostics / export
```

It is not yet at:

```text
graph-memory schema experiment
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
- The live writer eval runner is V0 and scores only committed allow/reject fixture cases; retrieval cases remain covered by deterministic reader/E2E evals.

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
- export includes top-level `careCard` object and care-memory summary counts
- export includes top-level `memoryLifecycleReviewQueue` and review-count summary fields
- local data clear removes the Care Card together with messages and feedback
- tests cover save, reject, export, clear, duplicate/merge, delete, supersede, lifecycle events, and lifecycle review queue behavior

Gap:

- There is no graph-memory store.
- The Care Card is localStorage-only and developer-path-only.
- Supersede/delete are local developer controls only; review decisions are durable in developer export/diagnostics, but there is no user-facing memory-management surface.
- Conflict resolution beyond manual supersede is not mature.
- The Care Card is read back into the developer-mode V2 response flow.

The remaining storage gap is user-facing lifecycle maturity beyond local developer controls; the largest R1 gap has moved toward graph-memory schema experiments and user-facing memory controls.

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

- diagnostics now include Care Card inspection and a copyable memory report, but still only in developer mode
- diagnostics now include Memory Lifecycle Review Queue V0 counts and recent allowed/rejected/superseded/deleted review items
- there is no before/after memory-injection comparison
- there is no per-memory edit surface

### 7. Export And Clear

Implemented:

- `app/src/lib/storage.ts` exports per-turn `sageMemory`
- export summary includes ready/error counts, candidate counts, kind counts, and guardian status counts
- export includes top-level `careCard`
- export includes top-level `memoryLifecycleReviewQueue`
- export summary includes `careMemoryCount` and `careMemoryKindCounts`
- export summary includes `memoryLifecycleReview*Count` fields for pending, allowed, rejected, superseded, and deleted review items
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
- `buildMemoryInspectorReport(...)` summarizes Care Card memories, writer output, latest retrieval, and eval commands for developer inspection
- `runMemoryResponseEval(...)` compares without-memory and with-memory V2 outputs and returns verdict counts
- `runSageMemoryEndToEndEval(...)` runs fixture writer candidates through guardian, in-memory Care Card storage, and deterministic retrieval
- `runSageMemoryWriterEval(...)` runs the live Memory Writer endpoint against `evals/sage-memory-cases.json`
- `runMemoryReaderBenchmark(...)` runs the unchanged deterministic Memory Reader against `evals/memory-reader-retrieval-cases.json`
- `npm run eval:memory` runs `scripts/run-memory-response-eval.mjs`
- `npm run eval:memory:reader` runs `scripts/run-memory-reader-benchmark.mjs`
- `npm run eval:sage` runs the SAGE end-to-end eval test suite
- `npm run eval:sage:writer` runs `scripts/run-sage-memory-writer-eval.mjs`

Gap:

- live writer eval output is not yet persisted as a research report artifact
- live writer eval is endpoint/model-dependent and should be treated as a development gate, not a deterministic unit test
- no live eval verifies LLM-generated accepted candidates are persisted correctly
- memory response eval is deterministic/heuristic and still needs real model-run baselines

### 8.1 Memory Reader Benchmark Baseline

Source-of-truth touched: `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md`

Implemented on 2026-07-26:

- `app/src/lib/retrievalMetrics.ts`
- `app/src/lib/retrievalMetrics.test.ts`
- `evals/memory-reader-retrieval-cases.json`
- `scripts/memory-reader-benchmark-runner.mjs`
- `scripts/memory-reader-benchmark-runner.test.mjs`
- `scripts/run-memory-reader-benchmark.mjs`
- `npm run eval:memory:reader`

Baseline command:

```bash
cd app
npm run eval:memory:reader
```

Baseline result from the unchanged deterministic Memory Reader V0:

| Metric | Result |
|---|---:|
| Cases | 40 |
| Passed | 40 |
| Failed | 0 |
| Recall@3 | 1.000 |
| Recall@5 | 1.000 |
| MRR | 0.875 |
| NDCG@5 | 0.979 |
| No-match precision | 1.000 |
| Unsafe retrieval count | 0 |
| Stale retrieval count | 0 |
| Deleted retrieval count | 0 |
| Superseded retrieval count | 0 |
| p50 latency | 0.010ms |
| p95 latency | 0.074ms |

Failure taxonomy:

```text
none=40, missing_tag_or_alias=0, semantic_paraphrase_miss=0,
hard_negative_false_hit=0, correct_candidate_ranked_low=0,
no_match_false_positive=0, stale_or_inactive_leak=0,
safety_priority_failure=0, fixture_or_contract_error=0
```

Interpretation:

- The current deterministic reader clears the first privacy-safe gold dataset.
- Ranking is not perfect: MRR is below 1.0 and NDCG@5 is below 1.0 because several multi-grade cases retrieve a secondary relevant memory before the strongest memory.
- This baseline should not be used to claim production RAG quality. The dataset is intentionally small, synthetic, and contract-oriented.
- RetrievalTraceV1 now exposes redacted developer/research diagnostics for why each memory was selected or rejected. The next improvement should be claim-level grounding, not graph/vector RAG.

### RetrievalTraceV1 Baseline

Implemented on 2026-07-26 for the deterministic Memory Reader path.

Trace contract:

- versioned as `retrieval_trace_v1`
- records `readerVersion`, `policyVersion`, requested limit, confidence/stale policy, latency, active tags, selected memory IDs, candidate decisions, scores, matched tags, and rejection reasons
- hashes reader input into a 64-character hex `inputHash`
- does not persist raw user text, raw memory text, raw evidence text, or evidence IDs
- remains a developer/research diagnostic artifact, not user-mode response content

Current rejection reasons:

```text
tag_overlap, risk_kind_boost, low_confidence, inactive_or_superseded,
missing_evidence, stale, no_tag_overlap, ranked_below_limit
```

Verification evidence:

```bash
cd app
npx vitest run src/lib/sageMemory.test.ts src/lib/retrievalMetrics.test.ts
node --test ../scripts/memory-reader-benchmark-runner.test.mjs
npm run eval:memory:reader -- --json
npm run content:check
npm test
npm run build
```

Observed result: 40/40 reader benchmark cases passed, 20 Vitest files passed, 88 tests passed, build passed. A focused leak check asserted the JSON benchmark trace does not contain `evidenceIds`, sample raw memory text, or sample raw user text.

### Claim Grounding V0 Baseline

Implemented on 2026-07-26 as a deterministic first-pass guard for explicit memory claims in generated answers.

Scope:

- detects explicit memory-claim language such as `我记得你...`, `你之前...`, `你以前...`, and English `I remember you...`
- compares each detected claim against the retrieved care facts available to the response
- marks claims as `supported` or `unsupported`; generic supportive text with no memory-claim marker abstains by producing no claims
- hashes claim text into `claimTextHash` and does not persist raw answer text or raw retrieved memory text in the grounding result
- reports `pass` when no unsupported memory claims are found and `warn` when one or more unsupported claims appear

Current deterministic eval:

| Metric | Result |
|---|---:|
| Cases | 8 |
| Passed | 8 |
| Failed | 0 |
| Pass verdicts | 4 |
| Warn verdicts | 4 |
| Supported claims | 3 |
| Unsupported claims | 4 |
| Raw leak count | 0 |

Fixture coverage:

```text
supported_claim, unsupported_claim, abstain_non_memory,
stale_deleted_boundary, safety_sensitive
```

Verification evidence:

```bash
cd app
npx vitest run src/lib/memoryClaimGrounding.test.ts
node --test ../scripts/memory-claim-grounding-runner.test.mjs
npm run eval:memory:claim-grounding -- --json
npm run content:check
```

This is intentionally V0. It is not an LLM judge, does not extract all possible factual claims, and does not enforce response rewrite. It gives R1 a deterministic, privacy-safe tripwire for the most dangerous pattern: a generated answer claiming personal memory that was not retrieved.

### Claim Grounding Shadow Diagnostics

Implemented on 2026-07-26 as a developer-only response-path diagnostic.

Scope:

- `applyAvalokaV2Result(...)` now attaches `memoryClaimGrounding` to ready V2 orchestrator results
- the visible response text and `responseSource` are unchanged; unsupported claims warn only in diagnostics
- the LLM Orchestrator V2 debug panel shows claim-grounding verdict/counts
- the Care Card Inspector memory report includes latest claim-grounding summary and claim-grounding eval command
- export summary records `memoryClaimGroundingWarnCount` and `unsupportedMemoryClaimCount`

Verification evidence:

```bash
cd app
npx vitest run src/lib/llmPipeline.test.ts src/lib/memoryInspector.test.ts src/lib/storage.test.ts
```

This diagnostic step was originally shadow-only. It is now paired with the fallback policy below: unsupported personal-memory claims no longer reach user-visible text, but no automatic rewrite or user-visible warning is shown.

### Unsupported Memory Claim Fallback Policy V0

Implemented on 2026-07-26 as the first enforcement step after shadow diagnostics.

Scope:

- ready V2 responses still run `MemoryClaimGroundingResultV0` before becoming visible
- if any claim is `unsupported`, the user-visible response falls back to the existing local baseline text
- `orchestratorV2.candidateText` and `orchestratorV2.memoryClaimGrounding` are preserved for developer inspection
- `responseSource` becomes `local_claim_grounding_fallback` so exports can count the intervention
- supported memory claims and responses with no memory claims still use the V2 candidate text

Verification evidence:

```bash
cd app
npx vitest run src/lib/llmPipeline.test.ts src/lib/storage.test.ts src/lib/memoryInspector.test.ts src/lib/memoryClaimGrounding.test.ts
```

This policy intentionally chooses fallback over deterministic text surgery. It prevents unsupported personal-memory claims from reaching the user while preserving the rejected V2 candidate for diagnosis.

## Requirement Coverage Matrix

| R1 Requirement | Current State | Evidence | Gap |
|---|---|---|---|
| Memory Writer candidate extraction | Partial | `prompt/sage-memory-writer-v1.md`, `/api/sage-memory-writer`, `npm run eval:sage:writer` | Shadow-only; live eval is V0 and model-dependent |
| Memory Guardian rejection rules | Partial | server guardian, `app/src/lib/sageMemory.ts` | duplicated logic, narrow coverage, no revise behavior |
| Care Card / memory store | Partial | `CareCard`, `CareMemory`, localStorage persistence, export/clear/delete/supersede tests | no graph store; lifecycle is local developer-only |
| Graph-memory schema experiments | Not started | docs only | no graph node/edge representation in runtime |
| Deterministic Memory Reader | Partial | `readCareFactsFromCard(...)`, `readCareFactsFromCardWithTrace(...)`, tag derivation, priority/stale tests, RetrievalTraceV1 benchmark output | small alias map; trace is developer/research-only and not yet wired into UI inspection |
| Response injection with 3-5 care facts | Partial | developer-only `retrievedCareFacts` -> V2 prompt `careFacts` | no production memory retrieval |
| Extraction/rejection/retrieval evals | Partial | seed cases, unit tests, `evals/sage-end-to-end-cases.json`, `evals/memory-reader-retrieval-cases.json`, `evals/memory-claim-grounding-cases.json`, `npm run eval:sage`, `npm run eval:sage:writer`, `npm run eval:memory:reader`, `npm run eval:memory:claim-grounding`, RetrievalTraceV1 | no persisted live eval report artifact; claim grounding is deterministic V0 only |
| Response/privacy evals for memory | Partial | `evals/memory-response-cases.json`, `evals/memory-claim-grounding-cases.json`, `npm run eval:memory`, `npm run eval:memory:claim-grounding`, response-path claim-grounding diagnostics, `local_claim_grounding_fallback` | heuristic verdicts; needs real model baselines / judge and safer rewrite policy beyond fallback |
| Developer diagnostics | Partial | SAGE Memory Writer panel, V2 retrieved care facts, Claim Grounding V0 warning counts, Care Card Inspector, copyable memory report | no before/after memory-injection comparison; unsupported claims fallback rather than rewrite |
| Local-first export/clear | Partial | export includes turn-level writer output, top-level `careCard`, lifecycle events, claim-grounding warning counts, and claim-grounding fallback count; clear removes Care Card | no durable lifecycle review workflow |

## Main Risks

1. **False sense of R1 completion**

   The UI already says "SAGE Memory Writer", exports include `sageMemory`, and local Care Card memory can influence developer-mode V2 responses. This is still an R1 research trial, not a production memory product.

2. **Guardian drift**

   Guardian rules exist in both server JavaScript and app TypeScript. As R1 grows, these can diverge unless the contract is centralized or tested against the same cases.

3. **Live writer eval volatility**

   The repo can now run the live LLM Memory Writer against `evals/sage-memory-cases.json`, but the result depends on endpoint availability, model behavior, and API access. Treat it as a development gate and research signal, not a deterministic unit test.

4. **Thin memory lifecycle**

   Add/update/merge/export/clear/delete/supersede and developer inspection now exist at V0 level, but durable stale review and conflict resolution are not mature.

5. **Injection safety needs stronger evals**

   The most sensitive part of R1 is not extracting memory; it is using memory without being creepy, invasive, or overconfident. V0 response evals now check obvious leaks and expected-use signals, but still need model-run baselines and likely an LLM/human judge layer.

## Recommended Next Slice

The smallest useful Care Card loop, deterministic reader, redacted RetrievalTraceV1, deterministic Claim Grounding V0, developer-only response injection, shadow claim-grounding diagnostics, unsupported-claim fallback policy, memory response eval V0, SAGE end-to-end fixture eval, live Memory Writer eval V0, Care Card Inspector / Eval Report V0, Memory Lifecycle Control V0, and deterministic Memory Reader benchmark V0 are now real in code. The next gap is a safer rewrite policy and live-model memory response baseline before any graph/vector RAG work.

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

Status: implemented in code on 2026-05-26.

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

### Slice 7: Care Card Inspector / Eval Report V0

Status: implemented in code on 2026-05-27.

Goal:

```text
local Care Card + eval summaries
-> developer-readable diagnostics
-> safer memory iteration
```

Acceptance criteria:

- show current Care Card memories in developer mode without exposing raw private logs
- make clear which memories came from writer output versus fixture/eval data
- add a lightweight way to copy or export latest memory eval summaries for research review
- keep user-facing mode free of memory internals

### Slice 8: Memory Lifecycle Control V0

Status: implemented in code on 2026-05-27.

Goal:

```text
stored Care Card memories
-> inspect stale/problematic entries
-> delete or supersede one memory
-> exportable lifecycle trail
```

Acceptance criteria:

- developer mode can delete one Care Card memory without clearing the whole app
- superseded memory behavior is explicit in storage and export
- stale memory review is visible in the inspector
- tests cover delete, supersede, stale filtering, export, and clear behavior

### Slice 9: Retrieval Measurement And Trace V1

Status: measurement implemented on 2026-07-26; retrieval trace remains next.

Goal:

```text
privacy-safe gold dataset
-> unchanged deterministic Memory Reader
-> Recall@k / MRR / NDCG@k / no-match / privacy / latency baseline
-> versioned redacted retrieval trace
```

Acceptance criteria:

- add at least 40 retrieval cases including hard negatives, no-match, stale,
  superseded, deleted, safety-priority, tone, and avoid-move cases
- report Recall@3, Recall@5, MRR, NDCG@5, no-match precision, forbidden
  retrieval counts, and p50/p95 latency
- preserve the first unchanged reader result as the baseline
- trace selected and rejected memory IDs without storing raw user text
- classify failures before changing reader architecture

### Slice 10: Claim-Level Evidence Grounding V1

Status: follows Slice 9.

Goal:

```text
candidate response + permitted evidence
-> claim classification
-> claim-to-evidence support decision
-> allow | hedge | retrieve again | revise | abstain | safe fallback
```

Acceptance criteria:

- distinguish personal-memory, health/safety, external-fact, and ordinary
  compassionate-expression claims
- distinguish direct support, inference, uncertainty, contradiction, and
  unsupported claims
- run in shadow mode until eval targets pass
- use a reversible `off|shadow|enforce` feature flag
- preserve crisis-gate priority, one bounded repair attempt, and safe fallback
- never expose evidence IDs, memory scores, or hidden policy in user mode

### Deferred Slice: Graph Memory Schema V0

Status: gated by Slice 9 evidence.

Start only if the benchmark shows relationship or multi-hop failures that cannot
be fixed by deterministic tags, thresholds, or a smaller retrieval experiment.

If justified:

- define a local graph projection without adding a production database
- represent `evidenced_by`, `supersedes`, `tagged_as`, and
  `supports_response_move` edges
- compare graph retrieval against the same deterministic-reader gold dataset
- keep prompt injection capped at 3-5 care facts

## Explicit Non-Goals For The Next Slice

- no production graph database
- no graph neural reader
- no GRPO or fine-tuning
- no full RAG over wisdom corpora
- no real user private memory import
- no account, payment, community, or growth work
- no user-facing claims that Avaloka "remembers" until export/clear and privacy behavior are real

## Bottom Line

The current implementation is a good R1 foothold: it proves the project can run a Memory Writer shadow path, reject obviously unsafe candidates, persist allowed candidates into a local Care Card, retrieve relevant facts, feed them into the developer-only V2 response path, run a V0 memory response eval, exercise the writer-fixture/guardian/store/reader loop end to end, run a live writer eval against committed fixtures, inspect/copy the local memory state in developer mode, and delete or supersede one memory with an exportable lifecycle trail.

The next real milestone is not "better prompt wording" or a graph database. It
is measuring the current Memory Reader, making retrieval traceable, and testing
claim-level evidence grounding. Graph-shaped retrieval becomes the next
experiment only if those measurements expose relationship or multi-hop failures.
