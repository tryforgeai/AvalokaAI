# Ranking Trace Inspection V0 Report

Date: 2026-08-01 18:39 PDT
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
inspected low-rank cases: 2
ndcg threshold: 0.950
```

## Root-Cause Classes

- risk_kind_boost_overrides_fixture_relevance: 2 (reader_semantic_01, reader_semantic_02)

## Findings

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


## Recommendations

- Do not add reranking, embeddings, or graph memory yet; the current pressure is explainable by deterministic trace features.
- Decide whether risk-kind boost is intended to outrank fixture relevance; if yes, update fixture relevance grades before changing code.
