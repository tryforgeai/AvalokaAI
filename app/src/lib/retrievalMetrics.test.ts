import { describe, expect, it } from "vitest";
import {
  computeRetrievalEvalResult,
  dcgAtK,
  ndcgAtK,
  precisionAtK,
  recallAtK,
  reciprocalRank,
  validateRelevanceGrades,
} from "./retrievalMetrics";

describe("retrieval metrics", () => {
  it("scores a hand-calculated perfect graded ranking", () => {
    const relevance = { memory_a: 2, memory_b: 1, memory_c: 2 } as const;
    const retrieved = ["memory_a", "memory_c", "memory_b"];

    expect(precisionAtK(retrieved, relevance, 3)).toBe(1);
    expect(recallAtK(retrieved, relevance, 3)).toBe(1);
    expect(reciprocalRank(retrieved, relevance)).toBe(1);
    expect(dcgAtK(retrieved, relevance, 3)).toBeCloseTo(5.392789260714372, 12);
    expect(ndcgAtK(retrieved, relevance, 3)).toBe(1);
  });

  it("scores relevant results at ranks 1, 2, and 5", () => {
    const relevance = { relevant: 2 } as const;

    expect(reciprocalRank(["relevant"], relevance)).toBe(1);
    expect(reciprocalRank(["miss", "relevant"], relevance)).toBe(0.5);
    expect(reciprocalRank(["a", "b", "c", "d", "relevant"], relevance)).toBe(0.2);
    expect(recallAtK(["a", "b", "c", "d", "relevant"], relevance, 3)).toBe(0);
    expect(recallAtK(["a", "b", "c", "d", "relevant"], relevance, 5)).toBe(1);
  });

  it("penalizes multiple graded results in the wrong order", () => {
    const relevance = { best: 2, useful: 1, other_best: 2 } as const;
    const retrieved = ["useful", "best", "other_best"];

    expect(dcgAtK(retrieved, relevance, 3)).toBeCloseTo(4.392789260714372, 12);
    expect(ndcgAtK(retrieved, relevance, 3)).toBeCloseTo(0.8145672023038535, 12);
  });

  it("treats an empty expected set and empty retrieved set as a correct no-match", () => {
    const result = computeRetrievalEvalResult({
      retrievedIds: [],
      relevance: {},
      k: 5,
      latencyMs: 7,
    });

    expect(result).toMatchObject({
      precisionAtK: 0,
      recallAtK: 1,
      reciprocalRank: 0,
      ndcgAtK: 1,
      noMatchCorrect: true,
      unsafeRetrievalCount: 0,
      staleRetrievalCount: 0,
      deletedRetrievalCount: 0,
      supersededRetrievalCount: 0,
      latencyMs: 7,
    });
    expect(Object.values(result).some((value) => Number.isNaN(value))).toBe(false);
  });

  it("treats a retrieved false positive in a no-match case as incorrect", () => {
    const result = computeRetrievalEvalResult({
      retrievedIds: ["irrelevant"],
      relevance: {},
      k: 5,
      forbiddenMemoryIds: ["irrelevant"],
      latencyMs: 3,
    });

    expect(result.noMatchCorrect).toBe(false);
    expect(result.precisionAtK).toBe(0);
    expect(result.recallAtK).toBe(0);
    expect(result.ndcgAtK).toBe(0);
    expect(result.unsafeRetrievalCount).toBe(1);
  });

  it("deduplicates retrieved ids before scoring", () => {
    const relevance = { relevant: 2, second: 1 } as const;
    const retrieved = ["relevant", "relevant", "second"];

    expect(precisionAtK(retrieved, relevance, 3)).toBe(1);
    expect(recallAtK(retrieved, relevance, 3)).toBe(1);
    expect(dcgAtK(retrieved, relevance, 3)).toBeCloseTo(3.6309297535714573, 12);
  });

  it("returns safe zero-or-one values for empty and invalid k inputs", () => {
    const relevance = { relevant: 2 } as const;

    expect(precisionAtK(["relevant"], relevance, 0)).toBe(0);
    expect(recallAtK(["relevant"], relevance, 0)).toBe(0);
    expect(dcgAtK(["relevant"], relevance, 0)).toBe(0);
    expect(ndcgAtK(["relevant"], relevance, 0)).toBe(0);
    expect(precisionAtK([], {}, 5)).toBe(0);
    expect(recallAtK([], {}, 5)).toBe(1);
    expect(ndcgAtK([], {}, 5)).toBe(1);
  });

  it("rejects relevance grades outside 0, 1, and 2", () => {
    expect(validateRelevanceGrades({ good: 2, weak: 1, irrelevant: 0 })).toEqual([]);
    expect(validateRelevanceGrades({ too_low: -1, too_high: 3, fractional: 1.5 })).toEqual([
      "too_low",
      "too_high",
      "fractional",
    ]);
  });

  it("counts stale, deleted, and superseded retrieved ids", () => {
    const result = computeRetrievalEvalResult({
      retrievedIds: ["stale", "deleted", "superseded", "allowed"],
      relevance: { allowed: 2 },
      k: 5,
      staleMemoryIds: ["stale"],
      deletedMemoryIds: ["deleted"],
      supersededMemoryIds: ["superseded"],
      latencyMs: 9,
    });

    expect(result.staleRetrievalCount).toBe(1);
    expect(result.deletedRetrievalCount).toBe(1);
    expect(result.supersededRetrievalCount).toBe(1);
    expect(result.unsafeRetrievalCount).toBe(3);
  });
});
