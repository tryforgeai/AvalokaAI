# R1 Retrieval Grounding Post-Push Review

Date: 2026-07-28 22:04 PDT
Commit reviewed: `4026e7c feat: add R1 retrieval grounding safeguards`
Branch state: `main` synced with `origin/main`
Source-of-truth touched: `docs/research/sage-memory-research-plan.md`, `docs/product/version-roadmap.md`, `docs/decisions/decision-log.md`, `docs/research/r1-memory-gap-report.md`, `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md`

## Executive Verdict

R1 retrieval grounding is in a healthy post-push state.

The committed slice successfully turns Avaloka's deterministic Memory Reader into a measured, reproducible baseline and adds a conservative claim-grounding safeguard before any vector, graph, reranker, or learned retrieval work. The system remains a research-first local prototype, not a full RAG system or production graph-memory system.

Recommended next move: do not add advanced retrieval infrastructure yet. Start the next slice with durable memory lifecycle review, then consider a small Graph Memory Schema V0 experiment only if measured failures justify it.

## What Landed

Commit `4026e7c` added or updated 29 files with the following major outcomes:

- Retrieval metric contracts and tests for Precision@k, Recall@k, reciprocal rank, DCG@k, NDCG@k, no-match correctness, forbidden retrieval counts, and latency fields.
- A 40-case privacy-safe Memory Reader gold dataset in `evals/memory-reader-retrieval-cases.json`.
- Content ingestion validation for memory reader retrieval and claim-grounding fixtures.
- Deterministic Memory Reader benchmark runner and `npm run eval:memory:reader`.
- Redacted `RetrievalTraceV1` / `readCareFactsFromCardWithTrace(...)` for developer/research diagnosis.
- Deterministic Claim Grounding V0 and `npm run eval:memory:claim-grounding`.
- Runtime fallback policy for unsupported explicit personal-memory claims: `local_claim_grounding_fallback`.
- Developer diagnostics/export additions for retrieval and claim grounding.
- Decision log, roadmap, research plan, gap report, and execution plan updates.

## Post-Push Repository State

Verified with:

```bash
git status --short --branch
git log -1 --oneline --decorate
git rev-parse HEAD origin/main
git show --stat --oneline --no-renames --format=short -1
```

Observed:

```text
## main...origin/main
4026e7c (HEAD -> main, origin/main, origin/HEAD) feat: add R1 retrieval grounding safeguards
HEAD == origin/main == 4026e7cba370e5f73697fcca4c1389509bd912dc
29 files changed, 6105 insertions(+), 47 deletions(-)
```

## Verification Evidence

Post-push verification was re-run from `app/`.

### Content Gate

Command:

```bash
npm run content:check
```

Result:

```text
passed
12 episode notes
17 wisdom eval cases
10 Baifa eval cases
20 Baifa unwholesome cases
8 Avaloka V2 cases
20 Avaloka V2 golden cases
10 Avalokiteshvara compassion cases
5 SAGE memory cases
2 SAGE end-to-end cases
6 memory response cases
8 memory claim grounding cases
40 memory reader retrieval cases
```

### Focused Unit Tests

Command:

```bash
npx vitest run \
  src/lib/retrievalMetrics.test.ts \
  src/lib/sageMemory.test.ts \
  src/lib/memoryClaimGrounding.test.ts \
  src/lib/llmPipeline.test.ts \
  src/lib/storage.test.ts \
  src/lib/memoryInspector.test.ts
```

Result:

```text
6 files passed
43 tests passed
```

### Benchmark Runner Tests

Command:

```bash
node --test \
  ../scripts/memory-reader-benchmark-runner.test.mjs \
  ../scripts/memory-claim-grounding-runner.test.mjs
```

Result:

```text
7 tests passed
0 failed
```

### Deterministic Memory Reader Benchmark

Command:

```bash
npm run eval:memory:reader -- --json
```

Result summary:

```text
total: 40
passed: 40
failed: 0
Recall@3: 1
Recall@5: 1
MRR: 0.875
NDCG@5: 0.9787692689319669
No-match precision: 1
Unsafe retrieval count: 0
Stale retrieval count: 0
Deleted retrieval count: 0
Superseded retrieval count: 0
```

Interpretation: the current deterministic reader passes the first privacy-safe synthetic gold set and does not leak stale, deleted, superseded, or unsafe memories in this benchmark. Ranking is not perfect (`MRR 0.875`, `NDCG@5 0.9787`), which is useful evidence for trace-driven diagnosis rather than immediate infrastructure escalation.

### Claim Grounding Benchmark

Command:

```bash
npm run eval:memory:claim-grounding -- --json
```

Result summary:

```text
total: 8
passed: 8
failed: 0
verdictCounts:
  pass: 4
  warn: 4
unsupportedClaimCount: 4
supportedClaimCount: 3
rawLeakCount: 0
claimCount: 7
```

Interpretation: Claim Grounding V0 distinguishes supported explicit personal-memory claims from unsupported ones in the committed fixtures and does not leak raw claim text in benchmark output.

### Full Unit Suite And Coverage

Commands:

```bash
npm test
npm run coverage
```

Results:

```text
npm test: 21 files passed, 95 tests passed
coverage:
  statements: 97.72%
  branches: 84.97%
  functions: 96.59%
  lines: 97.72%
```

Coverage remains above the `AGENTS.md` 80% threshold for statements, branches, functions, and lines.

### Build

Command:

```bash
npm run build
```

Result:

```text
tsc passed
vite build passed
1597 modules transformed
dist built successfully
```

## Safety And Privacy Review

### User-Mode Exposure

Reviewed `app/src/App.tsx`, `app/src/lib/llmPipeline.ts`, `app/src/lib/memoryInspector.ts`, `app/src/lib/memoryClaimGrounding.ts`, and `app/src/lib/sageMemory.ts`.

Findings:

- Memory retrieval is gated by `developerMode` in `App.tsx` before retrieved care facts are built and sent to the V2 request.
- Internal panels that show scenario IDs, retrieved care facts, claim grounding, candidate text, memory IDs, tags, scores, evidence counts, and lifecycle events are rendered only inside the `developerMode` block.
- `applyAvalokaV2Result(...)` preserves claim-grounding diagnostics inside `orchestratorV2`, but user-visible text falls back to the local baseline when unsupported explicit personal-memory claims are found.
- `RetrievalTraceV1` hashes input text and stores structural retrieval metadata, but it still includes memory IDs, tags, and scores. This is acceptable only for developer/research diagnosis and must remain out of user mode.
- `memoryInspector` includes memory text, IDs, tags, evidence counts, and lifecycle IDs. This is explicitly developer-only and should not become a user-facing memory surface without a redaction/passive wording design.

No direct user-mode exposure of retrieval trace internals was found in this audit.

### Claim-Grounding Boundary

Current behavior is conservative:

```text
unsupported explicit personal-memory claim -> local_claim_grounding_fallback
```

This is consistent with the 2026-07-26 decision log entry. It avoids deterministic text surgery as the first enforcement step.

Known limitation: the claim detector is intentionally simple and pattern-based. It is suitable for V0 safeguards and fixtures, not a comprehensive factuality system.

### RAG / Retrieval Architecture Boundary

The current implementation is not a complete RAG system:

- no vector database
- no Qdrant
- no Neo4j / production graph DB
- no embedding reader
- no reranker
- no LLM judge
- no production graph-memory runtime

This is consistent with the accepted decision to measure deterministic retrieval and ground claims before adding advanced retrieval infrastructure.

## Documentation Consistency Review

Docs reviewed or searched:

- `docs/product/version-roadmap.md`
- `docs/research/sage-memory-research-plan.md`
- `docs/research/r1-memory-gap-report.md`
- `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md`
- `docs/decisions/decision-log.md`

Findings:

- Roadmap now lists retrieval baseline, redacted retrieval traces, claim grounding, and fallback enforcement as R1 scope/success criteria.
- Decision log records both ordering decisions: measure retrieval before advanced RAG, and fall back on unsupported personal-memory claims.
- Gap report correctly says Avaloka has a SAGE Lite shadow-writer prototype plus measured deterministic reader / grounding safeguards, not a complete graph-memory pipeline.
- Execution plan status says implemented through fallback policy V0 and defers LLM claim extractor/judge, rewrite policy, vectors, graph, reranker, and learned retrieval.
- No conflicting `shadow-only` / `no fallback` phrasing was found in the docs search performed for this review.

## Risks Remaining

### 1. Durable Memory Lifecycle Review Is Still Missing

The system has local developer controls for delete/supersede/clear/export, but no durable review queue or mature lifecycle workflow.

This is now the strongest practical next slice because it improves trust and governance without introducing new retrieval infrastructure.

### 2. User-Facing Memory Management Is Still Missing

R1 remains developer-mode oriented. A user-facing memory surface would require careful redaction, consent wording, delete/export UX, and no hidden scores/IDs/tags.

Do not expose `memoryInspector` directly to users.

### 3. Guardian Logic Is Still Split

The gap report records server/app guardian duplication and threshold differences. This is not blocking the pushed retrieval-grounding slice, but it should be cleaned before memory writer/store behavior becomes more central.

### 4. Claim Grounding V0 Is Pattern-Based

The current implementation protects against a targeted class of unsupported explicit personal-memory claims. It does not provide full factuality checking for all response claims, medical certainty, or broad hallucination control.

### 5. Deterministic Reader Ranking Is Good But Not Perfect

The first gold set passes, but `MRR 0.875` and `NDCG@5 0.9787` show ranking imperfections. Use `RetrievalTraceV1` to diagnose these before adding embeddings or graph retrieval.

## Recommended Next Work

### Recommended Next Slice: Durable Memory Lifecycle Review Queue V0

Purpose: turn memory lifecycle events into a reviewable developer workflow before designing user-facing memory controls or graph memory.

Suggested scope:

- Add a durable review queue / lifecycle report for pending, allowed, rejected, superseded, and deleted memory events.
- Keep it developer-mode only.
- Include summary counts in export.
- Add tests for lifecycle transitions and report shape.
- Do not expose memory scores, hidden trace logic, raw prompts, or evidence IDs in user mode.

### After That: Graph Memory Schema V0 Spike

Only after lifecycle review is stable, consider a small graph-memory schema experiment:

- TypeScript types and JSON fixtures first.
- No Neo4j/Qdrant/prod DB.
- Define node/edge contracts and eval cases that prove graph structure helps a real retrieval or grounding failure.

### Deferred

- LLM claim extractor / LLM judge.
- Safe rewrite policy for unsupported memory claims.
- Embedding / hybrid / reranker retrieval.
- Production graph database.
- User-facing memory UI.

## Final Assessment

R1 retrieval grounding is safe to build on. The pushed commit is synchronized with `origin/main`, passes the relevant local gates, and documents the architectural boundary clearly.

The next winning move is governance, not power: make memory lifecycle review durable before increasing retrieval complexity.
