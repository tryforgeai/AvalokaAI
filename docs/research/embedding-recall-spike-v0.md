# Embedding Recall Spike V0

Date: 2026-08-01 19:55 PDT
Status: Active R1 research artifact

## Verdict

Embedding Recall Spike V0 is complete as a bounded, gated spike.

The spike improved the separate cross-lingual / no-tag probe from:

```text
baseline: 1/6 passed
```

to:

```text
semanticRecall spike: 6/6 passed
```

The committed benchmark remains green under both normal deterministic mode and semantic-recall mode.

## Important Boundary

This is not a production embedding system and does not introduce a vector DB, external model, stored vectors, or graph memory.

The implementation is an embedding-shaped semantic recall spike: a gated local semantic tag expansion path that simulates the recall role an embedding layer would play, while keeping retrieval auditable and cheap.

The option is off by default:

```ts
semanticRecall?: boolean
```

CLI flag:

```bash
node ../scripts/run-memory-reader-benchmark.mjs --semantic-recall
```

## Changed Behavior

When `semanticRecall` is enabled, the reader may derive extra recall tags from untagged user text before scoring.

Recovered semantic classes:

- English lab-result / scan anxiety -> `illness_fear`;
- deserved-pain / did-something-wrong framing -> `self_blame`;
- retirement / stopped-being-needed / no-position language -> `role_loss`;
- stopped-mattering / worth language -> `self_worth`.

Selected candidates that came from this path carry trace reason:

```text
semantic_recall
```

## Results

### Baseline Probe

```text
total: 6
passed: 1
failed: 5
recall@3: 0.167
recall@5: 0.167
mrr: 0.167
ndcg@5: 0.167
missing_tag_or_alias: 5
```

### Spike Probe

```text
total: 6
passed: 6
failed: 0
recall@3: 1.000
recall@5: 1.000
mrr: 1.000
ndcg@5: 1.000
missing_tag_or_alias: 0
unsafe retrieval count: 0
stale retrieval count: 0
deleted retrieval count: 0
superseded retrieval count: 0
```

Semantic recall selected cases:

```text
reader_probe_cross_no_tag_02
reader_probe_cross_no_tag_03
reader_probe_implicit_no_tag_01
reader_probe_implicit_no_tag_02
reader_probe_implicit_no_tag_03
```

## Regression Guard

Added test:

```text
memory reader fixture policy > can run a gated semantic recall spike against cross-lingual no-tag probe fixtures
```

RED result before implementation:

```text
expected semantic recall spike to recover most probe cases, got 1/6
```

GREEN result:

```text
node --test ../scripts/memory-reader-benchmark-runner.test.mjs
# tests 8
# pass 8
```

## Safety / Lifecycle Guard

The spike does not bypass existing eligibility filters:

- low confidence remains rejected;
- inactive/superseded memories remain rejected;
- missing evidence remains rejected;
- stale memories remain rejected;
- deleted and superseded retrieval counts remain measured by benchmark metrics.

The committed benchmark with semantic recall enabled remains:

```text
committed_semantic_recall=48/48 unsafe=0 stale=0 deleted=0 superseded=0
```

## Interpretation

This spike proves that semantic expansion can recover the measured no-tag recall gap without breaking the current committed benchmark.

It does not prove that a production embedding system is safe. Before shipping any production semantic recall layer, the next work should add adversarial false-positive fixtures and lifecycle stress cases with semantic recall enabled.

## Next Step

The recommended follow-up slice was completed:

```text
Semantic Recall False-Positive Guard V0
```

It added a separate guard benchmark for false-positive no-match cases, lifecycle filtering, and highest-weight-first reranking.

Results:

```text
guard benchmark: 6/6 passed
no-match precision: 1.000
cross-lingual no-tag probe with semanticRecall: 6/6 passed
```

Production semantic retrieval is still not promoted. The next risk is broader lifecycle stress across deleted, superseded, low-confidence, and missing-evidence semantic matches.
