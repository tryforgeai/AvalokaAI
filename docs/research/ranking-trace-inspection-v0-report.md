# Ranking Trace Inspection V0 Report

Date: 2026-08-01 18:12 PDT
Status: Active R1 research artifact

## Verdict

Low-rank-quality passed cases are explainable from deterministic trace evidence. Inspect these root causes before adding a reranker, embeddings, or graph memory.

## Command

```bash
npm run eval:memory:reader:ranking
```

## Summary

```text
total cases: 40
inspected low-rank cases: 4
ndcg threshold: 0.950
```

## Root-Cause Classes

- duplicate_tag_inflates_score: 2 (reader_exact_03, reader_semantic_03)
- risk_kind_boost_overrides_fixture_relevance: 2 (reader_semantic_01, reader_semantic_02)

## Findings

### reader_exact_03

- group: exact_tag_alias
- ndcg@5: 0.797
- class: duplicate_tag_inflates_score
- retrieved order: reader_exact_03_secondary, reader_exact_03_target
- top selected: reader_exact_03_secondary (tone_preference, grade=1, score=209.200, matched=tone|tone, reasons=tag_overlap)
- best expected: reader_exact_03_target (tone_preference, grade=2, score=110.800, matched=tone, reasons=tag_overlap)
- score gap: 98.400

### reader_semantic_01

- group: semantic_paraphrase
- ndcg@5: 0.797
- class: risk_kind_boost_overrides_fixture_relevance
- retrieved order: reader_semantic_01_secondary, reader_semantic_01_target
- top selected: reader_semantic_01_secondary (avoid_response_move, grade=1, score=229.400, matched=illness_fear, reasons=tag_overlap|risk_kind_boost)
- best expected: reader_semantic_01_target (helpful_response_move, grade=2, score=110.600, matched=illness_fear, reasons=tag_overlap)
- score gap: 118.800

### reader_semantic_02

- group: semantic_paraphrase
- ndcg@5: 0.797
- class: risk_kind_boost_overrides_fixture_relevance
- retrieved order: reader_semantic_02_secondary, reader_semantic_02_target
- top selected: reader_semantic_02_secondary (avoid_response_move, grade=1, score=229.400, matched=self_blame, reasons=tag_overlap|risk_kind_boost)
- best expected: reader_semantic_02_target (helpful_response_move, grade=2, score=110.600, matched=self_blame, reasons=tag_overlap)
- score gap: 118.800

### reader_semantic_03

- group: semantic_paraphrase
- ndcg@5: 0.797
- class: duplicate_tag_inflates_score
- retrieved order: reader_semantic_03_secondary, reader_semantic_03_target
- top selected: reader_semantic_03_secondary (avoid_response_move, grade=1, score=209.400, matched=tone|tone, reasons=tag_overlap)
- best expected: reader_semantic_03_target (helpful_response_move, grade=2, score=110.600, matched=tone, reasons=tag_overlap)
- score gap: 98.800


## Recommendations

- Do not add reranking, embeddings, or graph memory yet; the current pressure is explainable by deterministic trace features.
- Normalize duplicate memory tags or fixture tags before changing the scoring model.
- Decide whether risk-kind boost is intended to outrank fixture relevance; if yes, update fixture relevance grades before changing code.
