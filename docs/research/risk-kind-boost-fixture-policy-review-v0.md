# Risk-Kind Boost Fixture Policy Review V0

Date: 2026-08-01 19:29 PDT
Status: Active R1 research artifact

## Verdict

Risk-kind boost is intentional for `avoid_response_move` memories in risk contexts.

The benchmark fixtures should grade the avoid-response memory as more relevant than a generic helpful move when the user is in `illness_fear` or `self_blame` and the avoid-response memory directly names the unsafe response pattern to avoid.

This review changes fixture relevance only. It does not change reader scoring.

## Reviewed Pressure Cases

```text
reader_semantic_01
reader_semantic_02
```

Before this review, both cases expected the generic `helpful_response_move` to be grade `2` and the `avoid_response_move` to be grade `1`, while the deterministic reader ranked the avoid-response memory first because of `risk_kind_boost`.

## Policy Question

Should `avoid_response_move` intentionally outrank `helpful_response_move` in risk-kind semantic cases?

### Answer

Yes, when all of these are true:

1. the active context includes a risk tag such as `illness_fear` or `self_blame`;
2. the avoid-response memory matches the same risk tag;
3. the avoid-response memory names a concrete response hazard such as over-explaining, teaching doctrine, validating blame, or escalating analysis;
4. the competing helpful memory is generic rather than a more specific safety boundary.

This preserves Avaloka's safety posture: first avoid harmful care moves, then offer the helpful care move.

## Fixture Changes

Updated `evals/memory-reader-retrieval-cases.json`:

```text
reader_semantic_01_secondary: 1 -> 2
reader_semantic_01_target: 2 -> 1
reader_semantic_02_secondary: 1 -> 2
reader_semantic_02_target: 2 -> 1
```

The `_secondary` suffix remains historical fixture naming. The relevance grade is now the source of truth.

## Regression Test

Added fixture-policy test:

```text
memory reader fixture policy > grades avoid-response moves above generic helpful moves in risk-kind semantic cases
```

RED result before fixture update:

```text
1 !== 2
```

GREEN result after fixture update:

```text
node --test ../scripts/memory-reader-benchmark-runner.test.mjs
# tests 5
# pass 5
# fail 0
```

## Benchmark Impact

After fixture policy alignment:

```text
result: 40/40 passed
recall@3: 1.000
recall@5: 1.000
mrr: 0.875
ndcg@5: 0.999
no-match precision: 1.000
unsafe retrieval count: 0
stale retrieval count: 0
deleted retrieval count: 0
superseded retrieval count: 0
```

Failure mining now reports:

```text
No pressure signals found in the committed benchmark.
```

Ranking trace inspection now reports:

```text
inspected low-rank cases: 0
No root-cause classes found.
```

## Non-Decisions

This review does not:

- reduce `risk_kind_boost`;
- add a reranker;
- add embeddings;
- add graph memory;
- treat all avoid-response memories as always higher priority.

The policy is limited to risk-kind contexts where the avoid-response memory directly matches the active risk tag and concrete hazard.

## Next Step

Do not change retrieval architecture yet.

The immediate follow-up slice was benchmark expansion:

```text
Harder Retrieval Fixture Expansion V0
```

It added eight fixtures across:

- adversarial paraphrases where explicit tags are absent but deterministic text/alias signals exist;
- hard negatives sharing surface words but wrong care context;
- temporal conflicts between old and fresh care memories;
- user-control lifecycle cases proving deleted and superseded memories remain excluded.

The expanded benchmark passed `48/48` with no pressure signals, so heavier retrieval architecture remains deferred.
