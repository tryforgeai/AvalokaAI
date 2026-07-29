import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateMemoryReaderCase,
  runMemoryReaderBenchmark,
  validateMemoryReaderCases,
} from "./memory-reader-benchmark-runner.mjs";

const now = "2026-07-26T00:00:00.000Z";
const recent = "2026-07-20T00:00:00.000Z";
const old = "2025-01-01T00:00:00.000Z";

function memory(overrides) {
  return {
    id: "target",
    kind: "helpful_response_move",
    text: "Use a steady grounding step for illness fear.",
    confidence: 0.86,
    evidenceIds: ["evidence-target"],
    tags: ["illness_fear"],
    createdAt: recent,
    updatedAt: recent,
    lastSeenAt: recent,
    occurrences: 2,
    status: "active",
    ...overrides,
  };
}

function testCase(overrides) {
  return {
    id: "reader_benchmark_case",
    group: "exact_tag_alias",
    description: "Reader should retrieve the illness-fear target.",
    careCard: {
      version: "care_card_v1",
      createdAt: recent,
      updatedAt: recent,
      memories: [
        memory({ id: "target", tags: ["illness_fear"], confidence: 0.86 }),
        memory({ id: "distractor", tags: ["role_loss"], confidence: 0.95 }),
      ],
    },
    readerContext: { userText: "复查结果还没出来，我怕自己真的完了。", tags: ["illness_fear"] },
    relevance: { target: 2 },
    expectedNoMatch: false,
    forbiddenMemoryIds: [],
    now,
    ...overrides,
  };
}

describe("validateMemoryReaderCases", () => {
  it("rejects malformed cases before benchmark scoring", () => {
    const errors = validateMemoryReaderCases([
      testCase({ id: "", relevance: { missing: 3 }, forbiddenMemoryIds: ["active-forbidden"] }),
    ]);

    assert(errors.some((error) => error.includes("must include id")));
    assert(errors.some((error) => error.includes("invalid relevance grade")));
    assert(errors.some((error) => error.includes("points to missing memory")));
    assert(errors.some((error) => error.includes("forbids missing memory")));
  });
});

describe("evaluateMemoryReaderCase", () => {
  it("scores retrieved memory ids, order, no-match, forbidden counts, and latency", () => {
    const result = evaluateMemoryReaderCase(testCase());

    assert.equal(result.id, "reader_benchmark_case");
    assert.equal(result.verdict, "passed");
    assert.deepEqual(result.observed.retrievedIds, ["target"]);
    assert.equal(result.metrics.recallAt3, 1);
    assert.equal(result.metrics.recallAt5, 1);
    assert.equal(result.metrics.reciprocalRank, 1);
    assert.equal(result.metrics.ndcgAt5, 1);
    assert.equal(result.metrics.noMatchCorrect, false);
    assert.equal(result.metrics.unsafeRetrievalCount, 0);
    assert(Number.isFinite(result.metrics.latencyMs));
    assert.equal(result.trace.version, "retrieval_trace_v1");
    assert.deepEqual(result.trace.selectedMemoryIds, ["target"]);
    assert.equal(result.trace.candidates[0].memoryId, "target");
    assert(!JSON.stringify(result.trace).includes("Use a steady grounding step"));
  });

  it("fails when the reader retrieves a forbidden stale memory", () => {
    const result = evaluateMemoryReaderCase(
      testCase({
        careCard: {
          version: "care_card_v1",
          createdAt: recent,
          updatedAt: recent,
          memories: [memory({ id: "stale", lastSeenAt: old, confidence: 0.95 })],
        },
        relevance: {},
        forbiddenMemoryIds: ["stale"],
      }),
      {
        reader: () => [memory({ id: "stale", lastSeenAt: old, confidence: 0.95 })],
      },
    );

    assert.equal(result.verdict, "failed");
    assert.equal(result.failureReason, "stale_or_inactive_leak");
    assert(result.checks.some((check) => check.includes("forbidden memory")));
    assert.equal(result.metrics.staleRetrievalCount, 1);
  });
});

describe("runMemoryReaderBenchmark", () => {
  it("summarizes aggregate metrics and failure taxonomy", () => {
    const summary = runMemoryReaderBenchmark({
      cases: [
        testCase({ id: "pass_case" }),
        testCase({
          id: "no_match_case",
          group: "no_match",
          readerContext: { userText: "今天只是想安静一下。", tags: [] },
          relevance: {},
          expectedNoMatch: true,
        }),
      ],
    });

    assert.equal(summary.total, 2);
    assert.equal(summary.passed, 2);
    assert.equal(summary.failed, 0);
    assert.equal(summary.aggregates.recallAt5, 1);
    assert.equal(summary.aggregates.mrr, 0.5);
    assert.equal(summary.aggregates.noMatchPrecision, 1);
    assert.equal(summary.failureTaxonomy.none, 2);
    assert(Number.isFinite(summary.aggregates.p50LatencyMs));
    assert(Number.isFinite(summary.aggregates.p95LatencyMs));
  });
});
