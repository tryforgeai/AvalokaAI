# Retrieval Failure Mining V0 Report

Date: 2026-08-01 18:05 PDT
Status: Active R1 research artifact

## Verdict

Retrieval pressure was found. Investigate the listed cases before changing retrieval architecture.

## Benchmark Command

```bash
npm run eval:memory:reader
```

## Aggregate Metrics

```text
total: 40
passed: 40
failed: 0
recall@3: 1.000
recall@5: 1.000
mrr: 0.875
ndcg@5: 0.979
no-match precision: 1.000
unsafe retrieval count: 0
stale retrieval count: 0
deleted retrieval count: 0
superseded retrieval count: 0
```

## Failure Taxonomy

- none: 40

## Group Summary

- avoid_response_move: 2/2 passed, 0 failed
- exact_tag_alias: 8/8 passed, 0 failed
- hard_negative: 6/6 passed, 0 failed
- no_match: 5/5 passed, 0 failed
- safety_priority: 3/3 passed, 0 failed
- semantic_paraphrase: 8/8 passed, 0 failed
- stale_memory: 3/3 passed, 0 failed
- superseded_deleted: 3/3 passed, 0 failed
- tone_preference: 2/2 passed, 0 failed

## Pressure Signals

- passed_cases_with_low_rank_quality: observed=4.000, cases=reader_exact_03, reader_semantic_01, reader_semantic_02, reader_semantic_03

## Failure Cases

No failed cases in the committed benchmark.

## Recommendations

- Do not add embeddings or graph memory yet; first classify the concrete retrieval failures and add targeted fixtures.
- Inspect ranking traces before adding a reranker; current candidates may only need deterministic scoring adjustments.
