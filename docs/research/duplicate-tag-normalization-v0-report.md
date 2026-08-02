# Duplicate Tag Normalization V0 Report

Date: 2026-08-01 18:39 PDT
Status: Active R1 research artifact

## Verdict

Duplicate Tag Normalization V0 is complete.

The deterministic Memory Reader now deduplicates each memory's tags before computing matched tag overlap and score. Duplicate tags remain harmless data noise instead of ranking evidence.

## Root Cause

Ranking Trace Inspection V0 found two low-rank-quality passing cases caused by duplicate tag score inflation:

```text
reader_exact_03
reader_semantic_03
```

Before the fix, a weaker secondary memory with duplicate tags could receive two tag-overlap units:

```text
matched=tone|tone
score ~= 209
```

A stronger target memory with one `tone` tag received one tag-overlap unit:

```text
matched=tone
score ~= 110
```

This made duplicate data look like stronger relevance.

## Change

`readCareFactsFromCardWithTrace(...)` now applies per-memory tag normalization before scoring:

```text
memory.tags -> unique(memory.tags)
```

The normalized tags are used for:

- matched tag overlap;
- relevance count;
- score calculation;
- redacted retrieval trace `tags`;
- redacted retrieval trace `matchedTags`.

The stored memory object is not rewritten by the reader. This keeps the fix local to retrieval/scoring and trace output.

## TDD Evidence

A failing regression test was added before the implementation:

```text
SAGE Lite memory core > does not let duplicate memory tags inflate reader score
```

RED result:

```text
expected [ 'duplicate-tone-secondary', 'target-tone' ] to deeply equal [ 'target-tone', 'duplicate-tone-secondary' ]
```

GREEN result:

```text
src/lib/sageMemory.test.ts: 16 tests passed
```

The test also verifies the redacted trace no longer reports duplicate matched tags for the secondary memory:

```text
matchedTags: ["tone"]
score: 109.2
```

## Benchmark Impact

Reader benchmark after the fix:

```text
result: 40/40 passed
recall@3: 1.000
recall@5: 1.000
mrr: 0.875
ndcg@5: 0.989
no-match precision: 1.000
unsafe retrieval count: 0
stale retrieval count: 0
deleted retrieval count: 0
superseded retrieval count: 0
```

Ranking pressure after the fix:

```text
inspected low-rank cases: 2
risk_kind_boost_overrides_fixture_relevance: 2
```

Resolved pressure class:

```text
duplicate_tag_inflates_score: 2 -> 0
```

Resolved cases:

```text
reader_exact_03
reader_semantic_03
```

Remaining pressure cases:

```text
reader_semantic_01
reader_semantic_02
```

These are risk-kind boost / fixture relevance policy cases, not duplicate-tag bugs.

## Recommendation

Do not add reranking, embeddings, vector DB, or graph memory for this issue.

The next slice should be:

```text
Risk-Kind Boost Fixture Policy Review V0
```

That review should decide whether `avoid_response_move` should intentionally outrank `helpful_response_move` in `illness_fear` and `self_blame` risk contexts. If yes, update fixture relevance. If no, write a RED test and adjust deterministic scoring.
