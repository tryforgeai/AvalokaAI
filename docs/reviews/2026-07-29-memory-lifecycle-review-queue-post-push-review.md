# Memory Lifecycle Review Queue V0 Post-Push Review

Date: 2026-07-29 22:31 PDT
Commit reviewed: `ce97d74 feat: add memory lifecycle review queue`
Branch state: `main` synced with `origin/main`
Source-of-truth touched: `docs/decisions/decision-log.md`, `docs/product/version-roadmap.md`, `docs/research/r1-memory-gap-report.md`, `docs/research/sage-memory-research-plan.md`, `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md`

## Executive Verdict

Memory Lifecycle Review Queue V0 is in a healthy post-push state.

The pushed slice gives R1 a durable local developer-mode review trail for allowed, rejected, superseded, and deleted memory decisions. It extends the Care Card export and developer memory inspector without turning the feature into a user-facing memory manager and without adding graph, vector, reranker, or external database infrastructure.

Recommended next move: keep the system stable and write a user-facing Memory Controls design spec before adding any UI or graph-memory runtime work.

## What Landed

Commit `ce97d74` added or updated 11 files with the following major outcomes:

- `MemoryLifecycleReviewItemV0`, `MemoryLifecycleReviewStatus`, and `MemoryLifecycleReviewAction` in `app/src/types.ts`.
- Optional `CareCard.lifecycleReviewQueue` storage contract.
- Review items for allowed and rejected writer candidates through `saveMemoryCandidates(...)`.
- Review items for developer deletes through `deleteCareMemory(...)`.
- Review items for developer supersedes and replacements through `supersedeCareMemory(...)`.
- Export-level `memoryLifecycleReviewQueue` plus summary counts for pending, allowed, rejected, superseded, and deleted items.
- Developer memory-inspector summary counts and recent review-item display.
- Unit tests covering lifecycle review queue export and developer inspector fallback behavior.
- Decision log, roadmap, research plan, gap report, and implementation-plan updates.

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
ce97d74 (HEAD -> main, origin/main, origin/HEAD) feat: add memory lifecycle review queue
HEAD == origin/main == ce97d742ace040b498920d3461f6274568f020fe
11 files changed, 318 insertions(+), 33 deletions(-)
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
npx vitest run src/lib/storage.test.ts src/lib/memoryInspector.test.ts
```

Result:

```text
2 files passed
7 tests passed
```

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
  statements: 97.8%
  branches: 84.99%
  functions: 96.73%
  lines: 97.8%
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

### Benchmark Runner And Eval Regression Check

Commands:

```bash
npm run eval:memory:reader -- --json
npm run eval:memory:claim-grounding -- --json
node --test \
  ../scripts/memory-reader-benchmark-runner.test.mjs \
  ../scripts/memory-claim-grounding-runner.test.mjs
```

Results:

```text
node --test: 7 tests passed, 0 failed
```

Deterministic Memory Reader result summary:

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

Claim Grounding result summary:

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

## Safety And Privacy Review

Reviewed:

- `app/src/App.tsx`
- `app/src/lib/storage.ts`
- `app/src/lib/memoryInspector.ts`
- `app/src/types.ts`
- `app/src/lib/storage.test.ts`
- `app/src/lib/memoryInspector.test.ts`

### User-Mode Exposure

Findings:

- The review queue display is inside the developer diagnostics area rendered under the developer-mode branch in `App.tsx`.
- The review queue summary is shown in the "Memory Eval Report" developer card, not in the normal user response surface.
- The review item display currently shows recent `status:id` pairs and therefore must remain developer-only because candidate IDs and memory IDs are internal artifacts.
- Export includes `memoryLifecycleReviewQueue`, memory text, reasons, evidence count, and tags. This is acceptable for local developer export but not for a future user-facing memory control surface without a redaction and explanation design.

No direct normal user-mode display of lifecycle review items, candidate IDs, memory IDs, evidence counts, tags, or hidden review logic was found in this audit.

### Export Boundary

Current export behavior is intentionally diagnostic:

- `exportAvalokaData()` emits top-level `memoryLifecycleReviewQueue`.
- Summary fields include review counts for pending, allowed, rejected, superseded, and deleted decisions.
- `clearAvalokaData()` removes the Care Card together with messages and feedback, so review queue data stored inside the Care Card is cleared with local Avaloka data.

This is consistent with R1 local-first developer diagnostics. It should not be described as a polished user memory-management product.

### Lifecycle Contract Review

Current behavior:

- `saveMemoryCandidates(...)` records review items for both allowed and rejected candidates after applying `guardMemoryCandidate(...)`.
- Allowed candidates carry `memoryId`; rejected candidates only carry `candidateId`.
- `deleteCareMemory(...)` appends a `deleted` review item and preserves the older lifecycle event contract.
- `supersedeCareMemory(...)` appends a `superseded` review item for the old memory and an `allowed` review item for the replacement candidate.
- Existing cards with only `lifecycleEvents` are converted into review items by fallback helper behavior.

Known limitation: review items include `memoryText`. That is useful for developer inspection but is not safe enough to expose in user mode without a dedicated user-facing copy/redaction policy.

## Documentation Consistency Review

Docs reviewed or searched:

- `docs/decisions/decision-log.md`
- `docs/product/version-roadmap.md`
- `docs/research/r1-memory-gap-report.md`
- `docs/research/sage-memory-research-plan.md`
- `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md`
- `docs/reviews/2026-07-28-r1-retrieval-grounding-post-push-review.md`

Patterns checked for stale contradictions:

```text
shadow-only
no fallback
RAG-first
Qdrant
Neo4j
GraphRAG
user-facing memory management
Memory Lifecycle Review Queue
```

Findings:

- Decision log now has an accepted Memory Lifecycle Review Queue V0 decision.
- Roadmap lists developer-mode durable lifecycle review as R1 in-scope and as part of success criteria.
- Gap report says R1 is now at Memory Lifecycle Review Queue V0 and still not at graph-memory schema or user-facing memory controls.
- The docs continue to avoid claiming Qdrant, Neo4j, vector retrieval, reranker, production graph memory, or user-facing memory management.

No blocking doc contradiction was found.

## Remaining Risks

1. **Developer-only review item text** — review items include memory text, reasons, evidence count, and tags. This is acceptable for local developer diagnostics but should not be promoted to user mode as-is.
2. **No user-facing memory controls yet** — R1 has governance observability, not a polished user memory-management UI.
3. **No graph-memory schema/runtime yet** — this remains a future research slice. Current benchmark results do not justify adding Qdrant, Neo4j, embeddings, rerankers, or a production graph DB.
4. **Guardian duplication remains** — local and server guardian thresholds still differ, as already noted in the gap report.
5. **Review queue is localStorage-bound** — persistence is adequate for R1 local research but not a production storage design.

## Recommended Next Slice

Recommended next move:

```text
User-facing Memory Controls Design Spec
```

Do not implement UI first. Write a spec that defines:

- what a user may safely see about remembered care facts;
- how delete, clear, and export should be worded;
- what must remain hidden: memory IDs, evidence IDs, scores, tags, retrieval traces, and raw review logic;
- how to explain memory without making Avaloka feel invasive;
- which evals or manual QA should gate any future user-facing memory surface.

Only after that spec is accepted should Avaloka implement a small user-facing memory-control prototype.

## Audit Conclusion

Memory Lifecycle Review Queue V0 is pushed, synchronized, tested, and consistent with R1's research-first boundaries.

The system now has durable developer-mode observability for memory lifecycle decisions. The next risk is not missing code; the next risk is exposing this internal governance layer to users without a careful design boundary.
