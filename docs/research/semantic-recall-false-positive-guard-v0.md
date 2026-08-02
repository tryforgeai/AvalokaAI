# Semantic Recall False-Positive Guard V0

Date: 2026-08-01 20:08 PDT
Status: Active R1 research artifact

## Verdict

Semantic Recall False-Positive Guard V0 is complete.

The guard benchmark passes with semantic recall enabled:

```text
guard: 6/6 passed
no-match precision: 1.000
unsafe retrieval count: 0
stale retrieval count: 0
deleted retrieval count: 0
superseded retrieval count: 0
```

The cross-lingual / no-tag recall probe remains recovered:

```text
semanticRecall probe: 6/6 passed
```

## What This Guards

This slice adds a separate semantic recall guard fixture file:

```text
evals/memory-reader-semantic-recall-guard-cases.json
```

It covers three classes:

1. **False-positive no-match guard** — untagged surface words like `scan`, `worst case`, `retired`, and `did something wrong` must not retrieve care memories when the meaning is ordinary engineering/math work.
2. **Lifecycle guard** — semantic recall must not retrieve stale memory even when the user text semantically matches.
3. **Reranking guard** — when multiple semantic candidates match, the highest-relevance / highest-weight memory must rank first.

## RED Evidence

Before the guard was tightened, the new test failed:

```text
semantic recall guard failures: 3/6
```

The failing class was false-positive no-match retrieval from broad semantic patterns.

## GREEN Evidence

After tightening semantic recall gates and keeping relevance-first scoring:

```text
node --test ../scripts/memory-reader-benchmark-runner.test.mjs
# tests 9
# pass 9
```

Guard benchmark:

```text
6/6 passed
no-match precision: 1.000
```

## Reranking Evidence

The user requirement was that the most weighted content should appear first. The guard cases assert this explicitly.

```text
reader_semantic_guard_rerank_01
  expected first: reader_semantic_guard_rerank_01_target
  observed: reader_semantic_guard_rerank_01_target, reader_semantic_guard_rerank_01_single_worth, reader_semantic_guard_rerank_01_single_role
reader_semantic_guard_rerank_02
  expected first: reader_semantic_guard_rerank_02_target
  observed: reader_semantic_guard_rerank_02_target, reader_semantic_guard_rerank_02_illness
```

The current ranking policy remains simple and auditable:

```text
score = relevance * 100 + riskBoost + confidence * 10 + min(occurrences, 5)
```

This means directly relevant multi-tag semantic memories outrank weaker single-tag matches, and safety notes / avoid-response moves still receive risk-sensitive boosts.

## False-Positive Guard Cases

```text
reader_semantic_guard_no_match_01
reader_semantic_guard_no_match_02
reader_semantic_guard_no_match_03
```

These cases passed as no-match under semantic recall.

## Lifecycle Guard Cases

```text
reader_semantic_guard_lifecycle_01
```

This verifies semantic recall still goes through existing eligibility filters instead of bypassing stale/inactive protections.

## Implementation Boundary

This remains a gated spike path, not production embeddings:

- no vector DB;
- no external embedding model;
- no stored vectors;
- no graph memory;
- `semanticRecall` remains default-off.

## Next Step

Recommended next slice:

```text
Semantic Recall Lifecycle Stress V0
```

Acceptance bar:

- add deleted / superseded / low-confidence / missing-evidence semantic-match cases;
- keep guard benchmark green;
- keep cross-lingual no-tag probe green under semantic recall;
- keep committed benchmark green in normal and semantic modes.
