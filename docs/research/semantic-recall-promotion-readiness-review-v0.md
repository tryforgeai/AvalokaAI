# Semantic Recall Promotion Readiness Review V0

Date: 2026-08-03 11:31 PDT
Status: Active R1 research artifact

## Verdict

Semantic recall is **not ready for production promotion**.

It is ready to remain as a **default-off, gated research spike** and to justify one next bounded experiment:

```text
Semantic Candidate Lane Spike V0
```

That next experiment may compare a small candidate-lane semantic matcher against the existing semantic tag expansion, but it must remain local/eval-only and must not introduce production vector DB, graph memory, stored user vectors, or user-facing semantic recall.

## Evidence Reviewed

| Slice | Result | Interpretation |
|---|---:|---|
| Cross-Lingual / No-Tag Recall Gap Probe V0 | baseline `1/6` | Measured deterministic recall gap exists when user text has no explicit tags or aliases. |
| Embedding Recall Spike V0 | semanticRecall `6/6` | Gated semantic expansion can recover the measured no-tag recall gap. |
| Committed benchmark with semanticRecall | `48/48` | Existing canonical cases remain green when the spike is enabled. |
| Semantic Recall False-Positive Guard V0 | `6/6` | No-match precision and highest-weight-first ranking are protected by explicit fixtures. |
| Semantic Recall Lifecycle Stress V0 | `4/4` | Low-confidence, superseded, deleted, and missing-evidence semantic matches remain blocked. |

Current consolidated safety metrics:

```text
committed semantic benchmark: 48/48
cross-lingual/no-tag semantic probe: 6/6
semantic false-positive/reranking guard: 6/6
semantic lifecycle stress: 4/4
no-match precision in semantic guard/stress: 1.000
unsafe retrieval count: 0
stale retrieval count: 0
deleted retrieval count: 0
superseded retrieval count: 0
```

## Promotion Decision

### Production Promotion

Decision: **Reject for now.**

Reasons:

1. The implementation is still a local, hand-authored semantic tag expansion spike, not a general semantic retrieval layer.
2. Fixture coverage is promising but still small: `6` recall probe cases, `6` false-positive/reranking cases, and `4` lifecycle stress cases.
3. There is no long-session eval proving that semantic recall improves response quality without creepiness or over-personalization.
4. There is no user-facing export/delete policy for semantic-derived retrieval metadata beyond the current redacted developer trace.
5. There is no evidence yet that a production embedding system can preserve delete, pause, clear, supersede, and audit invariants.

### Default-Off Gated Spike

Decision: **Keep.**

`semanticRecall` remains valuable as a controlled research switch because it recovers a measured recall gap while current guards stay green.

Required boundary remains:

```text
semanticRecall default-off
no vector DB
no graph memory
no stored user vectors
no user-facing semantic retrieval
redacted trace only
```

### Next Experiment

Decision: **Proceed only with a bounded eval-only candidate-lane spike.**

The next slice should be:

```text
Semantic Candidate Lane Spike V0
```

Purpose:

- compare a small semantic candidate lane against current hand-authored semantic tag expansion;
- keep the committed benchmark, no-tag probe, false-positive/reranking guard, and lifecycle stress benchmarks green;
- record whether the candidate lane improves coverage or merely adds risk.

Non-goals:

- no production embedding service;
- no persistent vector store;
- no graph database;
- no user-facing retrieval change;
- no hidden user profile or dossier.

## Go / No-Go Matrix

| Question | Current Answer | Decision |
|---|---|---|
| Is there measured deterministic recall failure? | Yes: baseline no-tag probe `1/6`. | Justifies a spike. |
| Does semantic recall recover the measured gap? | Yes: semantic probe `6/6`. | Keep default-off spike. |
| Does it avoid known false positives? | Current guard `6/6`. | Promising, not enough for prod. |
| Does it preserve ranking / highest-weight-first? | Guard verifies grade-2 targets first. | Promising, keep transparent scoring. |
| Does it preserve lifecycle gates? | Lifecycle stress `4/4`. | Promising, not enough for prod. |
| Does it improve user-visible response quality? | Not yet measured. | Blocks production promotion. |
| Are privacy/export/delete semantics complete for semantic metadata? | Not yet. | Blocks production promotion. |
| Is a vector DB justified now? | No. | Reject. |
| Is Graph Memory justified now? | No. | Reject. |

## Required Gates Before Any Future Promotion

Semantic recall cannot be promoted until all of these are true:

1. **Fixture scale** — broader hard-negative, no-match, multilingual, temporal, lifecycle, and user-control cases pass.
2. **Quality impact** — response evals show memory injection improves personalization without creepiness.
3. **Trace explainability** — each semantic selection has an auditable, redacted reason path.
4. **Lifecycle consistency** — delete, supersede, pause, clear, and export behave identically for deterministic and semantic retrieval paths.
5. **Privacy boundary** — user mode never exposes semantic tags, scores, evidence IDs, raw traces, or hidden policy vocabulary.
6. **Rollback** — the semantic path can be disabled without corrupting local memory state.
7. **No dossier** — semantic retrieval does not create broad inferred user profiles or relationship graphs.

## Recommendation

Do not promote semantic recall.

Continue with:

```text
Semantic Candidate Lane Spike V0
```

Acceptance bar for that next slice:

- add a separate eval-only candidate-lane fixture/runner path;
- compare it against current semantic tag expansion;
- keep committed benchmark `48/48`;
- keep cross-lingual/no-tag semantic probe `6/6`;
- keep false-positive/reranking guard `6/6`;
- keep lifecycle stress `4/4`;
- prove no user-facing UI or stored memory state changes;
- document whether the candidate lane is better enough to justify further work.
