import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeRankingTracePressure, formatRankingTraceInspectionReport } from "./ranking-trace-inspector.mjs";

function candidate(overrides) {
  return {
    memoryId: "target",
    kind: "helpful_response_move",
    status: "active",
    tags: ["illness_fear"],
    matchedTags: ["illness_fear"],
    score: 110,
    decision: "selected",
    reasons: ["tag_overlap"],
    ...overrides,
  };
}

function result(overrides) {
  return {
    id: "case_with_pressure",
    group: "semantic_paraphrase",
    verdict: "passed",
    failureReason: "none",
    checks: [],
    metrics: { recallAt5: 1, ndcgAt5: 0.797, unsafeRetrievalCount: 0 },
    observed: {
      retrievedIds: ["secondary", "target"],
      expectedRelevance: { target: 2, secondary: 1 },
    },
    trace: {
      selectedMemoryIds: ["secondary", "target"],
      candidates: [
        candidate({ memoryId: "target", score: 110, matchedTags: ["illness_fear"], reasons: ["tag_overlap"] }),
        candidate({
          memoryId: "secondary",
          kind: "avoid_response_move",
          score: 230,
          matchedTags: ["illness_fear"],
          reasons: ["tag_overlap", "risk_kind_boost"],
        }),
      ],
    },
    ...overrides,
  };
}

function summary(overrides = {}) {
  return {
    total: 2,
    passed: 2,
    failed: 0,
    aggregates: { ndcgAt5: 0.9, recallAt5: 1, unsafeRetrievalCount: 0 },
    results: [
      result(),
      result({
        id: "duplicate_tag_pressure",
        group: "exact_tag_alias",
        observed: { retrievedIds: ["secondary", "target"], expectedRelevance: { target: 2, secondary: 1 } },
        trace: {
          selectedMemoryIds: ["secondary", "target"],
          candidates: [
            candidate({ memoryId: "target", score: 111, matchedTags: ["tone"], tags: ["tone"] }),
            candidate({ memoryId: "secondary", score: 209, matchedTags: ["tone", "tone"], tags: ["tone", "tone"] }),
          ],
        },
      }),
    ],
    ...overrides,
  };
}

describe("analyzeRankingTracePressure", () => {
  it("classifies low-NDCG passing cases by trace evidence instead of proposing rerankers", () => {
    const analysis = analyzeRankingTracePressure(summary());

    assert.equal(analysis.version, "ranking_trace_inspection_v0");
    assert.equal(analysis.findings.length, 2);
    assert.equal(analysis.findings[0].caseId, "case_with_pressure");
    assert.equal(analysis.findings[0].classification, "risk_kind_boost_overrides_fixture_relevance");
    assert.equal(analysis.findings[0].topSelectedMemoryId, "secondary");
    assert.equal(analysis.findings[0].bestExpectedMemoryId, "target");
    assert.equal(analysis.findings[1].classification, "duplicate_tag_inflates_score");
    assert(analysis.recommendations.some((item) => item.includes("Do not add reranking, embeddings, or graph memory")));
  });

  it("returns a clean status when no passing cases have low rank quality", () => {
    const analysis = analyzeRankingTracePressure(
      summary({
        aggregates: { ndcgAt5: 1, recallAt5: 1, unsafeRetrievalCount: 0 },
        results: [result({ metrics: { recallAt5: 1, ndcgAt5: 1 }, observed: { retrievedIds: ["target"], expectedRelevance: { target: 2 } } })],
      }),
    );

    assert.equal(analysis.status, "pass_watch");
    assert.deepEqual(analysis.findings, []);
  });
});

describe("formatRankingTraceInspectionReport", () => {
  it("prints a markdown inspection report with root-cause classes and next actions", () => {
    const report = formatRankingTraceInspectionReport(analyzeRankingTracePressure(summary()), {
      date: "2026-08-01 18:12 PDT",
      command: "npm run eval:memory:reader:ranking",
    });

    assert(report.includes("# Ranking Trace Inspection V0 Report"));
    assert(report.includes("risk_kind_boost_overrides_fixture_relevance"));
    assert(report.includes("duplicate_tag_inflates_score"));
    assert(report.includes("Do not add reranking, embeddings, or graph memory"));
  });
});
