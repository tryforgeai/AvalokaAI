# Cross-Lingual / No-Tag Recall Gap Probe V0

Date: 2026-08-01 19:40 PDT
Status: Active R1 research artifact

## Verdict

The probe found a measured recall gap for the deterministic Memory Reader when user input provides no explicit tags, no response-move aliases, and no scenario aliases.

Probe result:

```text
total: 6
passed: 1
failed: 5
recall@3: 0.167
recall@5: 0.167
mrr: 0.167
ndcg@5: 0.167
no-match precision: 1.000
unsafe retrieval count: 0
stale retrieval count: 0
deleted retrieval count: 0
superseded retrieval count: 0
```

Failure taxonomy:

```text
missing_tag_or_alias: 5
none: 1
```

This is the first R1 measurement in this sequence that shows deterministic reader recall pressure.

## Scope

Probe fixture file:

```text
evals/memory-reader-cross-lingual-no-tag-probe-cases.json
```

The probe is intentionally separate from the committed 48-case benchmark gate:

```text
evals/memory-reader-retrieval-cases.json
```

Reason: these cases are designed to expose a recall gap and currently fail. Keeping them separate preserves the green canonical benchmark while recording the failure evidence needed for the next architecture decision.

## Probe Constraints

Every probe case has:

- `readerContext.tags: []`;
- no `scenarioId`;
- no effective `responseMoves`;
- at least one positive relevance target;
- active target memories with normal confidence/evidence/status.

This isolates the missing signal class: no explicit retrieval tag or deterministic alias.

## Passing Case

- `reader_probe_cross_no_tag_01` (cross_lingual_no_tag): activeTags=illness_fear; retrieved=reader_probe_cross_no_tag_01_target

Interpretation: existing Chinese illness-fear text rules derive `illness_fear` for this phrasing.

## Failed Cases

- `reader_probe_cross_no_tag_02` (cross_lingual_no_tag): missing_tag_or_alias; retrieved=none; activeTags=none
- `reader_probe_cross_no_tag_03` (cross_lingual_no_tag): missing_tag_or_alias; retrieved=none; activeTags=none
- `reader_probe_implicit_no_tag_01` (implicit_no_tag): missing_tag_or_alias; retrieved=none; activeTags=none
- `reader_probe_implicit_no_tag_02` (implicit_no_tag): missing_tag_or_alias; retrieved=none; activeTags=none
- `reader_probe_implicit_no_tag_03` (implicit_no_tag): missing_tag_or_alias; retrieved=none; activeTags=none

Common trace evidence:

```text
activeTags: []
selectedMemoryIds: []
rejected reason: no_tag_overlap
failureReason: missing_tag_or_alias
```

## Interpretation

The deterministic reader is strong when a tag, scenario alias, response-move alias, or known text rule is present. It does not infer these untagged meanings:

- English lab-result / scan anxiety as `illness_fear`;
- English deserved-pain framing as `self_blame`;
- Chinese retirement / no-position language as `role_loss`;
- English stopped-being-needed language as `role_loss` / `self_worth`.

This is a measured recall gap, not a ranking problem and not a lifecycle/safety leak.

## Architecture Consequence

Do not immediately ship embeddings, vector DB, reranking, or graph memory.

The evidence does justify a bounded next slice:

```text
Embedding Recall Spike V0
```

The spike should test whether a small semantic recall layer can recover these 5 missed probe cases without harming the committed benchmark or violating lifecycle controls.

## Acceptance Bar for a Future Embedding Recall Spike

A spike is only useful if it proves all of the following:

- committed benchmark stays green at `48/48`;
- probe recall improves materially from `1/6`;
- no unsafe, stale, deleted, or superseded retrieval leaks are introduced;
- retrieved memories remain explainable enough for developer traces;
- semantic recall is gated behind deterministic lifecycle/status filtering;
- no user-facing raw memory text or private detail leaks are introduced.

## Commands

Probe command:

```bash
node ../scripts/run-memory-reader-benchmark.mjs --cases evals/memory-reader-cross-lingual-no-tag-probe-cases.json --json
```

Expected current status:

```text
PROBE_EXIT=1
```

The non-zero exit is expected for this probe because it records current deterministic recall failures.
