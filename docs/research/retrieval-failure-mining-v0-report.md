# Retrieval Failure Mining V0 Report

Date: 2026-08-01 19:34 PDT
Status: Active R1 research artifact

## Verdict

No current deterministic Memory Reader failure was found in the committed benchmark. Continue mining harder cases before adding embeddings or graph memory.

## Benchmark Command

```bash
npm run eval:memory:reader
```

## Aggregate Metrics

```text
total: 48
passed: 48
failed: 0
recall@3: 1.000
recall@5: 1.000
mrr: 0.896
ndcg@5: 0.999
no-match precision: 1.000
unsafe retrieval count: 0
stale retrieval count: 0
deleted retrieval count: 0
superseded retrieval count: 0
```

## Failure Taxonomy

- none: 48

## Group Summary

- adversarial_paraphrase: 2/2 passed, 0 failed
- avoid_response_move: 2/2 passed, 0 failed
- exact_tag_alias: 8/8 passed, 0 failed
- hard_negative: 6/6 passed, 0 failed
- hard_negative_surface_overlap: 2/2 passed, 0 failed
- no_match: 5/5 passed, 0 failed
- safety_priority: 3/3 passed, 0 failed
- semantic_paraphrase: 8/8 passed, 0 failed
- stale_memory: 3/3 passed, 0 failed
- superseded_deleted: 3/3 passed, 0 failed
- temporal_conflict: 2/2 passed, 0 failed
- tone_preference: 2/2 passed, 0 failed
- user_control_lifecycle: 2/2 passed, 0 failed

## Pressure Signals

No pressure signals found in the committed benchmark.

## Failure Cases

No failed cases in the committed benchmark.

## Recommendations

- Keep the committed benchmark as the green regression gate.
- Use the separate cross-lingual / no-tag probe to evaluate measured recall gaps without breaking the committed gate.
- Do not add production embeddings or graph memory yet; first run a bounded embedding recall spike against the measured probe failures.
