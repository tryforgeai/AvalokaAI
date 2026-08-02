import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeRetrievalFailures, formatFailureMiningReport } from "./retrieval-failure-miner.mjs";

function summary(overrides = {}) {
  return {
    total: 3,
    passed: 2,
    failed: 1,
    passRate: 2 / 3,
    aggregates: {
      recallAt3: 0.67,
      recallAt5: 0.67,
      mrr: 0.5,
      ndcgAt5: 0.72,
      noMatchPrecision: 1,
      unsafeRetrievalCount: 0,
      staleRetrievalCount: 0,
      deletedRetrievalCount: 0,
      supersededRetrievalCount: 0,
      p50LatencyMs: 1.2,
      p95LatencyMs: 2.4,
    },
    failureTaxonomy: {
      none: 2,
      missing_tag_or_alias: 1,
      semantic_paraphrase_miss: 0,
      hard_negative_false_hit: 0,
      correct_candidate_ranked_low: 0,
      no_match_false_positive: 0,
      stale_or_inactive_leak: 0,
      safety_priority_failure: 0,
      fixture_or_contract_error: 0,
    },
    results: [
      {
        id: "pass_case",
        group: "exact_tag_alias",
        verdict: "passed",
        failureReason: "none",
        checks: [],
        metrics: { recallAt5: 1, ndcgAt5: 1, unsafeRetrievalCount: 0 },
        observed: { retrievedIds: ["target"] },
      },
      {
        id: "miss_case",
        group: "semantic_paraphrase",
        verdict: "failed",
        failureReason: "missing_tag_or_alias",
        checks: ["missing expected memory \"target\""],
        metrics: { recallAt5: 0, ndcgAt5: 0, unsafeRetrievalCount: 0 },
        observed: { retrievedIds: [] },
      },
      {
        id: "rank_case",
        group: "safety_priority",
        verdict: "passed",
        failureReason: "none",
        checks: [],
        metrics: { recallAt5: 1, ndcgAt5: 0.62, unsafeRetrievalCount: 0 },
        observed: { retrievedIds: ["weak", "target"] },
      },
    ],
    ...overrides,
  };
}

describe("analyzeRetrievalFailures", () => {
  it("surfaces failed cases, pressure signals, group counts, and conservative recommendations", () => {
    const analysis = analyzeRetrievalFailures(summary());

    assert.equal(analysis.status, "investigate");
    assert.equal(analysis.failureCases.length, 1);
    assert.equal(analysis.failureCases[0].id, "miss_case");
    assert.deepEqual(analysis.failureTaxonomy.missing_tag_or_alias.caseIds, ["miss_case"]);
    assert.equal(analysis.groupSummary.semantic_paraphrase.failed, 1);
    assert(analysis.pressureSignals.some((signal) => signal.kind === "recall_below_target"));
    assert(analysis.pressureSignals.some((signal) => signal.kind === "rank_quality_below_target"));
    assert(analysis.recommendations.some((item) => item.includes("Do not add embeddings or graph memory yet")));
  });

  it("treats a perfect benchmark as watchful pass instead of a reason to add retrieval architecture", () => {
    const analysis = analyzeRetrievalFailures(
      summary({
        total: 2,
        passed: 2,
        failed: 0,
        passRate: 1,
        aggregates: {
          recallAt3: 1,
          recallAt5: 1,
          mrr: 0.95,
          ndcgAt5: 1,
          noMatchPrecision: 1,
          unsafeRetrievalCount: 0,
          staleRetrievalCount: 0,
          deletedRetrievalCount: 0,
          supersededRetrievalCount: 0,
          p50LatencyMs: 0.8,
          p95LatencyMs: 1.6,
        },
        failureTaxonomy: { none: 2 },
        results: [
          { id: "a", group: "exact", verdict: "passed", failureReason: "none", checks: [], metrics: { recallAt5: 1, ndcgAt5: 1, unsafeRetrievalCount: 0 }, observed: { retrievedIds: ["a"] } },
          { id: "b", group: "no_match", verdict: "passed", failureReason: "none", checks: [], metrics: { noMatchCorrect: true, recallAt5: 1, ndcgAt5: 1, unsafeRetrievalCount: 0 }, observed: { retrievedIds: [] } },
        ],
      }),
    );

    assert.equal(analysis.status, "pass_watch");
    assert.deepEqual(analysis.pressureSignals, []);
    assert(analysis.recommendations.some((item) => item.includes("Mine harder cases")));
  });
});

describe("formatFailureMiningReport", () => {
  it("prints a markdown report with benchmark metrics, taxonomy, and next-step recommendation", () => {
    const report = formatFailureMiningReport(analyzeRetrievalFailures(summary()), {
      date: "2026-08-01",
      benchmarkCommand: "npm run eval:memory:reader -- --json",
    });

    assert(report.includes("# Retrieval Failure Mining V0 Report"));
    assert(report.includes("recall@5: 0.670"));
    assert(report.includes("missing_tag_or_alias"));
    assert(report.includes("miss_case"));
    assert(report.includes("Do not add embeddings or graph memory yet"));
  });
});
