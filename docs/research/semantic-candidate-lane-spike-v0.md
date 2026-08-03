# Semantic Candidate Lane Spike V0

Date: 2026-08-03 11:51 PDT
Status: Active R1 research artifact

## Verdict

Semantic Candidate Lane Spike V0 is complete as an **eval-only, default-off research spike**.

It is not production retrieval, not a vector DB, and not stored user vectors.

The candidate lane improves the separate candidate-lane probe from:

```text
current semanticRecall: 2/4 passed
```

to:

```text
semanticRecall + semanticCandidateLane: 4/4 passed
```

The existing gates remain green:

```text
committed benchmark with semanticRecall + semanticCandidateLane: 48/48
cross-lingual/no-tag probe with semanticRecall + semanticCandidateLane: 6/6
false-positive/reranking guard with semanticRecall + semanticCandidateLane: 6/6
lifecycle stress with semanticRecall + semanticCandidateLane: 4/4
```

Safety counters stay zero:

```text
unsafe=0
stale=0
deleted=0
superseded=0
```

## Scope

New eval-only fixture file:

```text
evals/memory-reader-semantic-candidate-lane-cases.json
```

New CLI flag:

```bash
node ../scripts/run-memory-reader-benchmark.mjs --semantic-recall --semantic-candidate-lane
```

New reader option:

```ts
semanticCandidateLane?: boolean
```

New trace reason:

```text
semantic_candidate_lane
```

## What The Candidate Lane Adds

This is still a local, auditable pattern lane. It adds a separate candidate-lane tag derivation path for phrasing the existing semantic recall spike did not cover:

- diagnosis / specialist / catastrophic-result language -> `illness_fear`;
- moved-out-of-useful-role / disposable language -> `role_loss` and `self_worth`.

It also includes blocker rules so incident-analysis and code-review uses of `diagnosis` remain no-match.

## RED Evidence

Before implementation, the new regression test failed:

```text
semantic candidate lane failures: 2/4
```

Measured comparison:

```text
current semanticRecall: 2/4
semanticCandidateLane: 4/4
```

The failures were the two candidate-lane recall cases. The no-match and lifecycle cases already passed, which confirmed the fixture was measuring added recall rather than a broad safety regression.

## GREEN Evidence

After adding the gated candidate lane:

```text
node --test ../scripts/memory-reader-benchmark-runner.test.mjs
# tests 11
# pass 11
```

Candidate-lane benchmark:

```text
4/4 passed
no-match precision: 1.000
unsafe retrieval count: 0
stale retrieval count: 0
deleted retrieval count: 0
superseded retrieval count: 0
```

## Case Results

```text
reader_semantic_candidate_lane_01 (semantic_candidate_lane_recall)
  verdict: passed
  retrieved: reader_semantic_candidate_lane_01_target
  candidate-lane trace: reader_semantic_candidate_lane_01_target:semantic_candidate_lane
reader_semantic_candidate_lane_02 (semantic_candidate_lane_recall)
  verdict: passed
  retrieved: reader_semantic_candidate_lane_02_target
  candidate-lane trace: reader_semantic_candidate_lane_02_target:semantic_candidate_lane
reader_semantic_candidate_lane_no_match_01 (semantic_candidate_lane_false_positive)
  verdict: passed
  retrieved: none
  candidate-lane trace: none
reader_semantic_candidate_lane_lifecycle_01 (semantic_candidate_lane_lifecycle)
  verdict: passed
  retrieved: none
  candidate-lane trace: reader_semantic_candidate_lane_lifecycle_01_deleted:semantic_candidate_lane|inactive_or_superseded
```

## Interpretation

The candidate lane is useful enough to keep as an eval-only spike because it recovers two additional no-tag phrasings without breaking the committed benchmark, recall probe, false-positive/reranking guard, or lifecycle stress gates.

It is **not** enough to promote semantic recall. The current lane is still hand-authored and small. It should be used to guide fixture design and compare future embedding-shaped experiments, not as a production architecture.

## Boundaries

- `semanticCandidateLane` is default-off.
- It is only exercised by tests and explicit CLI flags.
- It creates no stored vectors.
- It adds no vector DB.
- It adds no graph memory.
- It changes no user-facing UI.
- It does not write memory state.
- It must not create a hidden user profile or dossier.

## Next Step

Recommended next slice:

```text
Semantic Candidate Lane Hard-Negative Expansion V0
```

Acceptance bar:

- expand candidate-lane no-match and hard-negative cases before adding any embedding dependency;
- include multilingual, coding/incident-analysis, medical-adjacent, role-workplace, and worth-language hard negatives;
- keep candidate lane `4/4`, cross-lingual/no-tag probe `6/6`, false-positive/reranking guard `6/6`, lifecycle stress `4/4`, and committed benchmark `48/48` green;
- document whether the lane is still precision-safe after harder negative coverage.
