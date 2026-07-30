# R1 Retrieval Measurement And Claim Grounding Implementation Plan

Status: Implemented through fallback policy V0 and Memory Lifecycle Review Queue V0; next work is user-facing lifecycle design or graph-schema spike
Owner: Hermes Soar, supervised by the Avaloka founder
Date: 2026-07-26
Source of truth: `docs/research/sage-memory-research-plan.md`
Decision: `docs/decisions/decision-log.md`

> **For Hermes Soar:** Execute this plan task by task. Do not copy SupportVectors
> bootcamp source code into Avaloka. The bootcamp labs are architecture and
> experiment references only; many files explicitly prohibit reuse without
> written permission. Reimplement the approved behavior in Avaloka's existing
> TypeScript/Node stack.

## Goal

Turn Avaloka's existing deterministic Memory Reader into a measured retrieval
baseline, add a versioned retrieval trace, and add claim-level evidence checking
before experimenting with embeddings, hybrid retrieval, or graph retrieval.

The user-visible outcome is not a new feature. The research outcome is a system
that can answer:

1. Did the reader retrieve the right care memories?
2. Did it avoid private, stale, deleted, superseded, or irrelevant memories?
3. Which claims in the final response are supported by permitted evidence?
4. When grounding fails, should Avaloka revise, hedge, retrieve again, abstain,
   or use the existing safe fallback?
5. Is a more complex retriever justified by measured failures?

## 2026-07-26 Implementation Status

Implemented in Tasks 1-7:

- retrieval metric contracts and deterministic metric tests
- 40-case privacy-safe Memory Reader gold dataset and content-check validation
- deterministic Memory Reader benchmark runner and `npm run eval:memory:reader`
- redacted `RetrievalTraceV1` summaries for reader diagnosis
- deterministic Claim Grounding V0 and `npm run eval:memory:claim-grounding`
- response-path developer diagnostics for claim grounding
- `local_claim_grounding_fallback` enforcement for unsupported personal-memory claims
- developer-mode Memory Lifecycle Review Queue V0 for allowed/rejected/superseded/deleted decisions

Deferred from this plan:

- LLM claim extractor / LLM judge
- deterministic or model-assisted safe rewrite
- vector, graph, reranker, or learned retrieval experiments
- user-facing memory-management surface

## Architecture

```text
current user turn
-> crisis and request safety gates
-> deterministic Memory Reader
-> versioned RetrievalTraceV1
-> Compassion Planner and response generator
-> claim classification
-> claim-to-evidence support check
-> existing Guardian
-> allow | revise | hedge | abstain | safe fallback
```

The Memory Writer remains offline/shadow-oriented. The online retrieval path
remains deterministic and local until benchmark evidence justifies a change.

## Technical Boundaries

- Keep the implementation in the existing TypeScript/Node/Vitest stack.
- Do not add Python runtime services.
- Do not add Qdrant, Neo4j, Microsoft GraphRAG, RAPTOR, a cross-encoder, or a
  fine-tuned relevance classifier in this plan.
- Do not put raw user text, private identifiers, hidden prompts, or chain-of-
  thought into retrieval traces or committed eval artifacts.
- Do not let normalized retrieval queries overwrite the user's original text.
- Do not alter crisis-gate precedence.
- Do not expose memory IDs, evidence IDs, scores, tags, or grounding internals
  in user mode.
- Keep runtime memory injection capped at 3-5 care facts.
- Preserve export, delete, supersede, stale filtering, and clear behavior.
- Any prompt or user-facing AI behavior change requires eval coverage and a
  rollback target.

## Bootcamp Methods Being Reimplemented

Use these methods as design references, not source-code dependencies:

- gold-set-first retrieval evaluation
- Recall@k, MRR, and NDCG@k
- hard-negative and no-match cases
- versioned stage-local traces
- claim extraction and claim-document evidence mapping
- cheap-first checks before expensive model checks
- explicit revise, retrieve-again, hedge, abstain, and fallback actions
- evidence-driven escalation to embeddings or graph retrieval

## What Already Exists

Reuse these working components:

- `app/src/lib/sageMemory.ts`
  - deterministic tag derivation
  - confidence, status, evidence, and staleness filters
  - safety-note and avoid-move risk boosts
  - top-k care-fact selection
- `app/src/lib/sageMemoryEndToEndEval.ts`
  - in-memory writer/guardian/store/reader fixture execution
- `app/src/lib/memoryInspector.ts`
  - developer-only memory diagnostics
- `app/src/lib/llmPipeline.ts`
  - safe application of orchestrator results
- `server/llm-shadow-server.mjs`
  - V2 orchestration, Guardian repair, and fallback path
- `evals/sage-end-to-end-cases.json`
- `evals/memory-response-cases.json`
- existing content, unit, coverage, build, and live eval commands

Do not build parallel replacements for these modules.

## Implementation Sequence

The tasks are ordered. Hermes must finish each verification gate before starting
the next task. If a gate fails, record the failure in
`docs/experiments/failure-log.md` when it represents a behavior or safety
failure, then fix the current layer before proceeding.

---

### Task 1: Freeze Retrieval Metric Contracts

**Purpose:** Define the measurement vocabulary before adding fixtures or code.

**Files:**

- Modify: `app/src/types.ts`
- Create: `app/src/lib/retrievalMetrics.ts`
- Create: `app/src/lib/retrievalMetrics.test.ts`

**Implement:**

- [ ] Add a graded relevance type with integer grades `0`, `1`, and `2`.
- [ ] Add a retrieval-eval result type containing:
  - `precisionAtK`
  - `recallAtK`
  - `reciprocalRank`
  - `ndcgAtK`
  - `noMatchCorrect`
  - `unsafeRetrievalCount`
  - `staleRetrievalCount`
  - `deletedRetrievalCount`
  - `supersededRetrievalCount`
  - `latencyMs`
- [ ] Implement pure functions for Precision@k, Recall@k, reciprocal rank,
  DCG@k, and NDCG@k.
- [ ] Define edge behavior explicitly:
  - empty expected set
  - empty retrieved set
  - duplicate result IDs
  - `k <= 0`
  - relevance grades outside the accepted range
- [ ] Do not silently divide by zero or return `NaN`.

**Tests:**

- [ ] Hand-calculated perfect ranking.
- [ ] Relevant result at ranks 1, 2, and 5.
- [ ] Multiple graded results in the wrong order.
- [ ] No-match case returning no results.
- [ ] False-positive result in a no-match case.
- [ ] Empty and invalid inputs.

**Acceptance gate:**

```bash
cd app
npx vitest run src/lib/retrievalMetrics.test.ts
```

All metric examples must match hand-calculated expected values.

---

### Task 2: Create The Memory Reader Gold Dataset

**Purpose:** Establish ground truth for the existing reader before changing it.

**Files:**

- Create: `evals/memory-reader-retrieval-cases.json`
- Modify: `scripts/check-content-ingestion.mjs`
- Test: `scripts/check-content-ingestion.test.mjs` if the content checker has a
  dedicated test surface; otherwise add fixture-validation assertions to the
  existing checker and cover them through the normal content check.

**Fixture contract:**

Each case must contain:

```json
{
  "id": "stable_case_id",
  "group": "semantic_paraphrase",
  "description": "Why this case exists",
  "careCard": {},
  "readerContext": {},
  "relevance": {
    "memory-id": 2,
    "secondary-memory-id": 1
  },
  "expectedNoMatch": false,
  "forbiddenMemoryIds": [],
  "now": "2026-07-26T00:00:00.000Z"
}
```

**Create at least 40 cases:**

- [ ] 8 exact tag/alias matches.
- [ ] 8 semantic paraphrases that express the same care need with different
  wording.
- [ ] 6 hard negatives with similar language but different care implications.
- [ ] 5 no-match cases.
- [ ] 3 stale-memory cases.
- [ ] 3 superseded/deleted-memory cases.
- [ ] 3 safety-note priority cases.
- [ ] 2 tone-preference cases.
- [ ] 2 avoid-response-move cases.
- [ ] At least 10 Chinese-language cases.
- [ ] At least 5 cases where more than one memory is relevant with different
  relevance grades.

**Privacy rule:**

- [ ] Use invented or redacted fixtures only.
- [ ] Do not copy raw tester conversations or identities.

**Acceptance gate:**

```bash
cd app
npm run content:check
```

The checker must reject malformed cases, duplicate case IDs, missing evidence
IDs, forbidden active memories, and invalid relevance grades.

---

### Task 3: Build The Deterministic Reader Benchmark

**Purpose:** Produce reproducible baseline measurements for the current reader.

**Files:**

- Create: `scripts/memory-reader-benchmark-runner.mjs`
- Create: `scripts/memory-reader-benchmark-runner.test.mjs`
- Create: `scripts/run-memory-reader-benchmark.mjs`
- Modify: `app/package.json`
- Modify: `docs/research/r1-memory-gap-report.md`

**Implement:**

- [ ] Load and validate `evals/memory-reader-retrieval-cases.json`.
- [ ] Execute the existing `readCareFactsFromCard(...)` behavior without
  mutating localStorage or real user state.
- [ ] Produce per-case:
  - retrieved IDs and order
  - expected relevance grades
  - Recall@3 and Recall@5
  - reciprocal rank
  - NDCG@5
  - no-match verdict
  - forbidden retrieval verdict
  - stage-attributed failure reason
  - latency
- [ ] Produce aggregate:
  - Recall@3
  - Recall@5
  - MRR
  - NDCG@5
  - no-match precision
  - unsafe/private/stale/deleted/superseded retrieval counts
  - p50 and p95 latency
- [ ] Add:

```json
"eval:memory:reader": "node ../scripts/run-memory-reader-benchmark.mjs"
```

- [ ] Print results to stdout by default.
- [ ] Support an explicit `--output <path>` for a developer-requested JSON
  report, but do not automatically commit generated reports.

**Failure taxonomy:**

```text
missing_tag_or_alias
semantic_paraphrase_miss
hard_negative_false_hit
correct_candidate_ranked_low
no_match_false_positive
stale_or_inactive_leak
safety_priority_failure
fixture_or_contract_error
```

**Initial research targets, not release promises:**

- unsafe/private/stale/deleted/superseded retrieval count: `0`
- Recall@5: `>= 0.90`
- NDCG@5: `>= 0.80`
- no-match precision: `>= 0.95`
- local p95 latency: `< 20 ms`

**Acceptance gate:**

```bash
cd app
npm run eval:memory:reader
npm test
```

Record the actual baseline in `docs/research/r1-memory-gap-report.md`. Do not
change the reader just to make the first baseline pass.

---

### Task 4: Add RetrievalTraceV1

**Purpose:** Make retrieval failures attributable without exposing private data.

**Files:**

- Modify: `app/src/types.ts`
- Create: `app/src/lib/retrievalTrace.ts`
- Create: `app/src/lib/retrievalTrace.test.ts`
- Modify: `app/src/lib/sageMemory.ts`
- Modify: `app/src/lib/memoryInspector.ts`
- Modify: `app/src/lib/memoryInspector.test.ts`
- Modify: `app/src/lib/storage.ts`
- Modify: relevant storage/export tests

**Contract:**

```ts
interface RetrievalTraceV1 {
  version: "retrieval_trace_v1";
  traceId: string;
  queryId: string;
  originalInputHash: string;
  activeTags: string[];
  candidateMemoryIds: string[];
  selectedMemoryIds: string[];
  rejected: Array<{
    memoryId: string;
    reason:
      | "low_confidence"
      | "inactive"
      | "missing_evidence"
      | "stale"
      | "irrelevant"
      | "over_limit";
  }>;
  policyVersion: string;
  readerVersion: string;
  latencyMs: number;
}
```

**Implement:**

- [ ] Refactor reader internals only as much as needed to emit a trace and keep
  the existing `readCareFactsFromCard(...)` public behavior stable.
- [ ] Use a deterministic hash helper for test fixtures.
- [ ] Never store raw input text in the trace.
- [ ] Expose the trace only in developer diagnostics and export.
- [ ] Add trace version and reader version to every report.
- [ ] Ensure deletion and clearing remove associated local trace state where
  appropriate.

**Acceptance gate:**

```bash
cd app
npx vitest run src/lib/retrievalTrace.test.ts src/lib/memoryInspector.test.ts src/lib/storage.test.ts
npm run eval:sage
```

Existing retrieval behavior must remain unchanged unless a failing regression
test proves the old behavior unsafe.

---

### Task 5: Define Claim And Evidence Contracts

**Purpose:** Separate verifiable claims from ordinary compassionate language.

**Files:**

- Modify: `app/src/types.ts`
- Create: `app/src/lib/claimEvidence.ts`
- Create: `app/src/lib/claimEvidence.test.ts`
- Create: `evals/claim-grounding-cases.json`
- Modify: `scripts/check-content-ingestion.mjs`

**Types:**

```ts
type ClaimKind =
  | "personal_memory"
  | "health_or_safety"
  | "external_fact"
  | "compassionate_expression";

type EvidenceSupportStatus =
  | "direct_support"
  | "supported_inference"
  | "uncertain"
  | "contradicted"
  | "unsupported";
```

Each claim record must include:

- stable claim ID
- claim text
- kind
- support status
- permitted evidence IDs
- action
- public-safe reason code

Allowed actions:

```text
allow
hedge
retrieve_again
revise
abstain
safe_fallback
```

**Implement deterministic V0 helpers:**

- [ ] Validate evidence IDs against the retrieved evidence set.
- [ ] Reject memory claims referencing evidence outside the permitted set.
- [ ] Treat ordinary compassionate expression as not requiring factual citation.
- [ ] Require health/safety certainty claims to have approved evidence or be
  hedged/revised.
- [ ] Mark contradiction as revision-blocking.
- [ ] Never expose hidden evidence IDs or reasons in user-visible text.

**Create at least 30 eval cases:**

- [ ] Supported personal-memory claim.
- [ ] Invented personal history.
- [ ] Correct but creepy over-specific memory use.
- [ ] Unsupported medical certainty.
- [ ] Appropriately hedged medical uncertainty.
- [ ] Karma/fate certainty.
- [ ] Contradiction between response and care memory.
- [ ] Ordinary empathy that should not require citation.
- [ ] Safe suggestion presented as a suggestion, not a fact.
- [ ] Prompt-injection request to reveal evidence or memory internals.
- [ ] Chinese and English coverage.

**Acceptance gate:**

```bash
cd app
npx vitest run src/lib/claimEvidence.test.ts
npm run content:check
```

---

### Task 6: Add A Shadow Claim Extractor

**Purpose:** Learn whether claims can be classified reliably before blocking
user-visible responses.

**Files:**

- Create: `prompt/claim-extractor-v1.md`
- Modify: `prompt/registry.json`
- Modify: `server/llm-shadow-server.mjs`
- Create or modify server runner tests
- Modify: `app/src/types.ts`
- Create: `app/src/lib/claimGroundingClient.ts`
- Create: `app/src/lib/claimGroundingClient.test.ts`

**Implement:**

- [ ] Add strict structured output for claim ID, text, and `ClaimKind`.
- [ ] Run at temperature `0`.
- [ ] Add a developer-only `/api/claim-grounding` endpoint or an internal
  orchestrator stage with an independently testable handler.
- [ ] Input only:
  - candidate response
  - permitted retrieved care facts
  - approved safety evidence when applicable
- [ ] Do not send raw historical transcripts.
- [ ] Return `status: error` on schema failure; do not silently sentence-split
  Chinese text and call it successful extraction.
- [ ] Keep this stage shadow-only. It must not alter the response yet.
- [ ] Register prompt knowledge sources and rollback target.

**Acceptance gate:**

```bash
cd app
npm run content:check
npm test
npm run eval:v2
```

Run the claim-grounding fixtures manually or through the runner added in Task 7.
Do not promote the extractor if unsupported personal or medical claims are
missed at an unacceptable rate.

---

### Task 7: Build The Claim-Grounding Eval Runner

**Purpose:** Measure claim extraction and evidence decisions before enforcement.

**Files:**

- Create: `scripts/claim-grounding-eval-runner.mjs`
- Create: `scripts/claim-grounding-eval-runner.test.mjs`
- Create: `scripts/run-claim-grounding-eval.mjs`
- Modify: `app/package.json`

**Metrics:**

- claim-kind accuracy
- unsupported-claim recall
- contradiction recall
- supported-claim precision
- ordinary-compassion false-positive rate
- evidence leakage count
- action accuracy
- endpoint/schema failure count
- p50/p95 latency

**Add command:**

```json
"eval:grounding": "node ../scripts/run-claim-grounding-eval.mjs"
```

**Promotion targets:**

- evidence leakage: `0`
- invented personal-history miss: `0`
- medical-certainty miss: `0`
- contradiction miss: `0`
- ordinary-compassion false-positive rate: `<= 0.05`

These targets gate enforcement. If they are not met, keep grounding in shadow
mode and add failure fixtures.

**Acceptance gate:**

```bash
cd app
npm run eval:grounding
npm test
```

---

### Task 8: Integrate Claim Grounding Into V2 With A Feature Flag

**Purpose:** Enforce evidence decisions safely and reversibly.

**Files:**

- Modify: `server/llm-shadow-server.mjs`
- Modify: `prompt/avaloka-v2-guardian.md` or create a versioned grounding-aware
  Guardian prompt
- Modify: `prompt/registry.json`
- Modify: `app/src/types.ts`
- Modify: `app/src/lib/orchestratorClient.ts`
- Modify relevant tests and V2 eval fixtures

**Feature flag:**

```text
AVALOKA_CLAIM_GROUNDING_MODE=off|shadow|enforce
```

Default must remain `shadow` until Task 7 targets pass.

**Online sequence:**

```text
candidate response
-> claim extraction
-> deterministic evidence-contract checks
-> grounding decision
-> existing Guardian
-> at most one repair
-> second grounding + Guardian check
-> safe fallback if still blocked
```

**Rules:**

- [ ] `contradicted` personal, health, or safety claim triggers revision.
- [ ] `unsupported` personal claim triggers revision or omission.
- [ ] `uncertain` health claim must be hedged and must not become medical advice.
- [ ] ordinary compassionate expression passes without fabricated citations.
- [ ] repair receives only safe reason codes, not hidden policy text.
- [ ] one repair maximum preserves the current bounded orchestration rule.
- [ ] crisis flow remains earlier and independent.
- [ ] off/shadow mode provides a clean rollback.

**Acceptance gate:**

```bash
cd app
npm run eval:grounding
npm run eval:v2
npm run eval:memory
npm run eval:sage
npm run eval:sage:writer
```

Do not switch the default to `enforce` unless all grounding promotion targets
and existing safety suites pass.

---

### Task 9: Add Developer Diagnostics Without User-Mode Leakage

**Purpose:** Make research failures inspectable while preserving the calm UI.

**Files:**

- Modify: `app/src/App.tsx`
- Modify: `app/src/styles.css` only if needed
- Modify: `app/src/lib/memoryInspector.ts`
- Modify relevant tests
- Follow: `DESIGN.md`

**Developer mode may show:**

- grounding mode
- claim counts by kind
- support-status counts
- action taken
- retrieved memory IDs
- reader/grounding versions
- stage latencies
- copyable redacted report

**Developer mode must not show:**

- raw hidden prompts
- chain-of-thought
- private historical transcripts
- unrestricted evidence text
- internal policy prose

**User mode:**

- [ ] No new diagnostic panel.
- [ ] No mention of retrieval, grounding, memory score, evidence ID, or model
  routing.
- [ ] Error and fallback language remains compassionate and ordinary.

**Acceptance gate:**

- [ ] Browser/manual QA at `/` and `/?dev=1`.
- [ ] Verify no developer content appears in user mode.
- [ ] Verify narrow and desktop layouts.
- [ ] Verify copy/export report is redacted.

---

### Task 10: Decide Whether Retrieval Complexity Is Earned

**Purpose:** Use measured failures to choose the next experiment.

**Files:**

- Modify: `docs/research/r1-memory-gap-report.md`
- Modify: `docs/research/sage-memory-research-plan.md`
- Add a new decision-log entry only if an upgrade is accepted.

**Decision table:**

| Observed failure | Smallest next experiment |
|---|---|
| missing tag or alias | improve deterministic tag derivation |
| semantic paraphrase miss | add an offline dense candidate lane |
| exact term or negation miss | add a lexical candidate lane |
| correct candidate ranked low | add a lightweight rerank experiment |
| irrelevant context crowding | threshold, dedupe, diversity, or context-budget fix |
| relationship/multi-hop miss | build local graph projection and traversal experiment |
| no meaningful baseline gap | do not add a new retriever |

**Required comparison for any new retriever:**

- same gold dataset
- same top-k budget
- paired per-case results
- Recall@5 and NDCG@5 delta
- unsafe/private/stale retrieval delta
- p95 latency delta
- implementation and operating cost
- debuggability impact

**Stop gate:**

Do not add Qdrant, a production graph database, a Python service, a
cross-encoder, or fine-tuning merely because the bootcamp lab demonstrates it.

---

### Task 11: Full Verification And Handoff

**Required commands:**

```bash
cd app
npm run content:check
npm test
npm run coverage
npm run build
npm run eval:memory:reader
npm run eval:grounding
npm run eval:v2
npm run eval:memory
npm run eval:sage
npm run eval:sage:writer
```

**Coverage gate:**

- statements >= 80%
- branches >= 80%
- functions >= 80%
- lines >= 80%
- configured surface remains `app/src/data` and `app/src/lib`

**Hermes handoff report must contain:**

1. Tasks completed and deferred.
2. Files changed.
3. Commands run and exact results.
4. Retrieval baseline metrics.
5. Grounding metrics.
6. New failure cases added.
7. Feature-flag default and rollback procedure.
8. Manual QA evidence.
9. Remaining unresolved decisions.
10. Confirmation that no bootcamp source was copied.

## Expected Implementation Tasks

- [ ] **T1 (P1)** — Retrieval metrics — implement and unit-test metric contracts.
- [ ] **T2 (P1)** — Gold dataset — add at least 40 privacy-safe reader cases.
- [ ] **T3 (P1)** — Reader benchmark — record the unchanged V0 baseline.
- [ ] **T4 (P1)** — Retrieval trace — add redacted, versioned diagnostics.
- [ ] **T5 (P1)** — Claim contracts — add deterministic evidence decisions.
- [ ] **T6 (P1)** — Shadow extractor — add structured developer-only extraction.
- [ ] **T7 (P1)** — Grounding eval — measure failure and leakage rates.
- [ ] **T8 (P1)** — Flagged enforcement — integrate bounded repair and fallback.
- [ ] **T9 (P2)** — Developer diagnostics — expose redacted research state.
- [ ] **T10 (P2)** — Escalation decision — select or reject the next retriever.
- [ ] **T11 (P1)** — Full verification — satisfy all project gates.

## Parallelization

Default to sequential execution through Task 4 because types, fixtures, runner,
and trace contracts depend on one another.

After Task 4:

```text
Lane A: Task 5 -> Task 6 -> Task 7 -> Task 8
Lane B: Task 9 preparation and developer report design
```

Task 9 must merge after the final Task 8 result contract is stable. Task 10 and
Task 11 run after all implementation lanes merge.

Avoid parallel edits to:

- `app/src/types.ts`
- `server/llm-shadow-server.mjs`
- `prompt/registry.json`
- `scripts/check-content-ingestion.mjs`

## Failure Modes To Test

| Code path | Production failure | Required handling |
|---|---|---|
| metric runner | malformed fixture produces misleading aggregate | fail closed with case ID and schema reason |
| deterministic reader | stale or superseded memory leaks | zero-tolerance test and blocked selection |
| retrieval trace | raw user text enters export | hash/redact and regression test |
| claim extractor | invalid schema or timeout | shadow error; existing response path continues safely |
| claim classifier | empathy misclassified as factual claim | eval false-positive rate and no forced citation |
| evidence mapper | fabricated personal history marked supported | block/revise with zero-tolerance fixture |
| repair loop | repaired answer remains unsupported | one retry, then safe fallback |
| feature flag | enforcement causes regression | switch to `shadow` or `off` without code rollback |
| diagnostics | hidden internals appear in user mode | browser/manual QA and render-condition tests |

## NOT In Scope

- copying or vendoring bootcamp lab code
- production vector database
- production graph database
- GraphRAG community summaries
- RAPTOR
- semantic response cache
- ModernBERT relevance fine-tuning
- generic grammar correction of user text
- generic toxicity or gibberish rejection replacing Avaloka safety gates
- raw wisdom-corpus RAG
- real-user private-memory import
- account, tenant, payment, community, or growth work

## Completion Definition

This plan is complete when:

- the unchanged deterministic reader has a reproducible benchmark
- every retrieval result can be explained through a redacted trace
- claim-grounding behavior is eval-backed
- enforcement is reversible through a feature flag
- unsupported personal and medical-certainty claims are caught by committed
  fixtures
- all existing safety and memory evals still pass
- coverage remains above the project threshold
- the next retrieval architecture decision is based on measured failure, not
  tool availability
