# Semantic Recall Lifecycle Stress V0

Date: 2026-08-03 10:32 PDT
Status: Active R1 research artifact

## Verdict

Semantic Recall Lifecycle Stress V0 is complete.

The lifecycle stress benchmark passes with semantic recall enabled:

```text
lifecycle stress: 4/4 passed
no-match precision: 1.000
unsafe retrieval count: 0
stale retrieval count: 0
deleted retrieval count: 0
superseded retrieval count: 0
```

The existing semantic guard and recall probe remain green:

```text
semantic false-positive/reranking guard: 6/6 passed
cross-lingual/no-tag semantic probe: 6/6 passed
```

## What This Stress Slice Adds

New fixture file:

```text
evals/memory-reader-semantic-recall-lifecycle-stress-cases.json
```

It covers semantic matches blocked by:

- low confidence;
- superseded status;
- delete lifecycle event;
- missing evidence.

## RED Evidence

Before implementation, the new test failed:

```text
semantic recall lifecycle stress failures: 4/4
```

The first failure exposed that the benchmark validator could not express a missing-evidence forbidden memory, and the deleted-memory fixture exposed that the reader did not yet treat delete lifecycle events as an eligibility blocker when the deleted memory remained in the care card.

## GREEN Evidence

After the minimal fixes:

```text
node --test ../scripts/memory-reader-benchmark-runner.test.mjs
# tests 10
# pass 10
```

Lifecycle stress benchmark:

```text
4/4 passed
```

## Case Results

```text
reader_semantic_lifecycle_low_confidence_01
  verdict: passed
  retrieved: none
  candidate reasons: semantic_recall|low_confidence
reader_semantic_lifecycle_superseded_01
  verdict: passed
  retrieved: none
  candidate reasons: semantic_recall|inactive_or_superseded
reader_semantic_lifecycle_deleted_01
  verdict: passed
  retrieved: none
  candidate reasons: semantic_recall|risk_kind_boost|inactive_or_superseded
reader_semantic_lifecycle_missing_evidence_01
  verdict: passed
  retrieved: none
  candidate reasons: semantic_recall|risk_kind_boost|missing_evidence
```

All stress cases retrieve nothing, which is the expected behavior. Semantic recall still annotates candidate relevance in trace, but existing eligibility gates block the memory before user-visible retrieval.

## Implementation Notes

- `readCareFactsFromCardWithTrace` now treats memory IDs with `delete` lifecycle events as ineligible.
- The benchmark validator now permits missing-evidence memories only when they are intentionally listed as forbidden test targets.
- Missing-evidence production memories remain rejected by the reader via `missing_evidence`.
- `semanticRecall` remains default-off and non-production.

## Current Boundary

This still does not promote semantic recall to production retrieval. It proves a stronger spike boundary:

```text
recall probe green
false-positive guard green
reranking guard green
lifecycle stress green
committed benchmark green
```

## Next Step

The recommended follow-up slice was completed:

```text
Semantic Recall Promotion Readiness Review V0
```

The review decision is conservative:

```text
production promotion: rejected for now
semanticRecall: keep default-off gated research spike
next allowed work: eval-only Semantic Candidate Lane Spike V0
```

The blocking conditions remain privacy, lifecycle/export/delete semantics, redacted trace explainability, response-quality impact, and proof that semantic retrieval does not create hidden user profiles or dossiers.
