# Harder Retrieval Fixture Expansion V0

Date: 2026-08-01 19:34 PDT
Status: Active R1 research artifact

## Verdict

Harder Retrieval Fixture Expansion V0 is complete.

The Memory Reader benchmark was expanded from 40 to 48 cases across four harder fixture classes without changing reader scoring or retrieval architecture.

## Purpose

After Retrieval Failure Mining V0, Ranking Trace Inspection V0, Duplicate Tag Normalization V0, and Risk-Kind Boost Fixture Policy Review V0, the committed benchmark had no pressure signals.

This expansion checks whether that was only because the benchmark was too easy.

## Added Fixture Classes

### 1. Adversarial paraphrase

Cases:

```text
reader_adv_para_01
reader_adv_para_02
```

Coverage:

- text-derived `illness_fear` without explicit `readerContext.tags`;
- response-move alias derived `self_blame` without explicit `readerContext.tags`;
- semantically close distractors that should not outrank the target.

### 2. Hard negatives with surface overlap

Cases:

```text
reader_hard_surface_01
reader_hard_surface_02
```

Coverage:

- surface words such as `report`, `catastrophizing`, and `blame` should not override active care context;
- wrong-context risk memories should not be retrieved when the active tag points elsewhere.

### 3. Temporal conflicts

Cases:

```text
reader_temporal_01
reader_temporal_02
```

Coverage:

- stale high-confidence memories are forbidden and must not be retrieved;
- fresh lower-confidence matching memories should be selected instead;
- retrieval must preserve stale-memory exclusion under stronger distractors.

### 4. User-control lifecycle

Cases:

```text
reader_user_control_01
reader_user_control_02
```

Coverage:

- deleted matching memories must not be retrieved;
- superseded matching memories must not be retrieved;
- active/current replacements should be retrieved;
- lifecycle controls remain compatible with deterministic scoring.

## Regression Test

Added benchmark fixture coverage test:

```text
memory reader fixture policy > includes harder retrieval fixtures across paraphrase, hard-negative, temporal, and user-control classes
```

RED result before fixture expansion:

```text
assert(cases.length >= 48)
```

GREEN result after fixture expansion:

```text
node --test ../scripts/memory-reader-benchmark-runner.test.mjs
# tests 6
# pass 6
# fail 0
```

## Benchmark Result

After expansion:

```text
result: 48/48 passed
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

Failure mining:

```text
No pressure signals found in the committed benchmark.
```

Ranking inspection:

```text
inspected low-rank cases: 0
No root-cause classes found.
```

## Interpretation

The expanded benchmark still does not justify:

- reranking;
- embeddings;
- vector DB;
- graph memory.

The deterministic Memory Reader remains adequate for the current R1 fixture surface.

## Remaining Limits

This is still V0. It does not prove deterministic retrieval will remain sufficient under all future memory workloads.

Uncovered harder classes remain:

- larger Care Cards with many active memories per tag;
- cross-lingual paraphrase beyond current deterministic aliases;
- indirect user intent without known tags or response-move aliases;
- multi-turn context where the relevant tag is only implied by prior turns;
- mutation sequencing for pause/clear/export/delete across storage and reader layers.

## Next Step

Do not add retrieval architecture yet.

The immediate follow-up slice was:

```text
Cross-Lingual / No-Tag Recall Gap Probe V0
```

That probe added a separate non-gating fixture file and found a measured deterministic recall gap: `1/6` passed, `5/6` failed, all failures classified as `missing_tag_or_alias`.

This justifies a bounded `Embedding Recall Spike V0` as a research spike while keeping the committed 48-case benchmark green.
