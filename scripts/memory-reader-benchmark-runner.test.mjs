import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateMemoryReaderCase,
  loadMemoryReaderCases,
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

describe("memory reader fixture policy", () => {
  it("grades avoid-response moves above generic helpful moves in risk-kind semantic cases", () => {
    const cases = loadMemoryReaderCases();
    const riskKindCases = ["reader_semantic_01", "reader_semantic_02"].map((id) => cases.find((testCase) => testCase.id === id));

    assert(riskKindCases.every(Boolean));
    for (const testCase of riskKindCases) {
      const avoidMemory = testCase.careCard.memories.find((memory) => memory.kind === "avoid_response_move");
      const helpfulMemory = testCase.careCard.memories.find((memory) => memory.kind === "helpful_response_move");

      assert(avoidMemory, `${testCase.id} must include an avoid-response memory`);
      assert(helpfulMemory, `${testCase.id} must include a helpful-response memory`);
      assert.equal(testCase.relevance[avoidMemory.id], 2);
      assert.equal(testCase.relevance[helpfulMemory.id], 1);
    }
  });

  it("includes harder retrieval fixtures across paraphrase, hard-negative, temporal, and user-control classes", () => {
    const cases = loadMemoryReaderCases();
    const caseById = new Map(cases.map((testCase) => [testCase.id, testCase]));
    const requiredGroups = new Set([
      "adversarial_paraphrase",
      "hard_negative_surface_overlap",
      "temporal_conflict",
      "user_control_lifecycle",
    ]);

    assert(cases.length >= 48);
    for (const group of requiredGroups) {
      assert(cases.some((testCase) => testCase.group === group), `missing group ${group}`);
    }
    for (const id of [
      "reader_adv_para_01",
      "reader_adv_para_02",
      "reader_hard_surface_01",
      "reader_hard_surface_02",
      "reader_temporal_01",
      "reader_temporal_02",
      "reader_user_control_01",
      "reader_user_control_02",
    ]) {
      assert(caseById.has(id), `missing fixture ${id}`);
    }
  });

  it("keeps cross-lingual no-tag recall-gap probe fixtures separate from the committed benchmark gate", () => {
    const committedCases = loadMemoryReaderCases();
    const probeCases = loadMemoryReaderCases(new URL("../evals/memory-reader-cross-lingual-no-tag-probe-cases.json", import.meta.url));
    const requiredGroups = new Set(["cross_lingual_no_tag", "implicit_no_tag"]);

    assert.equal(committedCases.some((testCase) => testCase.group === "cross_lingual_no_tag"), false);
    assert(probeCases.length >= 6);
    for (const group of requiredGroups) {
      assert(probeCases.some((testCase) => testCase.group === group), `missing probe group ${group}`);
    }

    for (const testCase of probeCases) {
      assert.deepEqual(testCase.readerContext.tags || [], [], `${testCase.id} must not use explicit tags`);
      assert.deepEqual(testCase.readerContext.responseMoves || [], [], `${testCase.id} must not use response-move aliases`);
      assert.equal(testCase.readerContext.scenarioId || "", "", `${testCase.id} must not use scenario aliases`);
      assert(Object.keys(testCase.relevance || {}).length > 0, `${testCase.id} must define expected recall target`);
    }
  });

  it("can run a gated semantic recall spike against cross-lingual no-tag probe fixtures", () => {
    const probeCases = loadMemoryReaderCases(new URL("../evals/memory-reader-cross-lingual-no-tag-probe-cases.json", import.meta.url));

    const baseline = runMemoryReaderBenchmark({ cases: probeCases });
    const spike = runMemoryReaderBenchmark({ cases: probeCases, readerOptions: { semanticRecall: true } });

    assert.equal(baseline.passed, 1);
    assert(spike.passed >= 5, `expected semantic recall spike to recover most probe cases, got ${spike.passed}/${spike.total}`);
    assert.equal(spike.aggregates.unsafeRetrievalCount, 0);
    assert.equal(spike.aggregates.staleRetrievalCount, 0);
    assert.equal(spike.aggregates.deletedRetrievalCount, 0);
    assert.equal(spike.aggregates.supersededRetrievalCount, 0);
  });

  it("guards semantic recall false positives and keeps highest-relevance candidates ranked first", () => {
    const guardCases = loadMemoryReaderCases(new URL("../evals/memory-reader-semantic-recall-guard-cases.json", import.meta.url));
    const summary = runMemoryReaderBenchmark({ cases: guardCases, readerOptions: { semanticRecall: true } });

    assert.equal(summary.passed, summary.total, `semantic recall guard failures: ${summary.failed}/${summary.total}`);
    assert.equal(summary.aggregates.noMatchPrecision, 1);
    assert.equal(summary.aggregates.unsafeRetrievalCount, 0);
    assert.equal(summary.aggregates.staleRetrievalCount, 0);
    assert.equal(summary.aggregates.deletedRetrievalCount, 0);
    assert.equal(summary.aggregates.supersededRetrievalCount, 0);

    for (const result of summary.results.filter((testCase) => testCase.group === "semantic_recall_reranking")) {
      const expectedFirst = Object.entries(result.observed.expectedRelevance).find(([, grade]) => grade === 2)?.[0];
      assert.equal(result.observed.retrievedIds[0], expectedFirst, `${result.id} should rank the highest-relevance memory first`);
    }
  });

  it("keeps semantic recall behind lifecycle gates for deleted, superseded, low-confidence, and missing-evidence memories", () => {
    const stressCases = loadMemoryReaderCases(new URL("../evals/memory-reader-semantic-recall-lifecycle-stress-cases.json", import.meta.url));
    const summary = runMemoryReaderBenchmark({ cases: stressCases, readerOptions: { semanticRecall: true } });

    assert.equal(summary.passed, summary.total, `semantic recall lifecycle stress failures: ${summary.failed}/${summary.total}`);
    assert.equal(summary.aggregates.noMatchPrecision, 1);
    assert.equal(summary.aggregates.unsafeRetrievalCount, 0);
    assert.equal(summary.aggregates.staleRetrievalCount, 0);
    assert.equal(summary.aggregates.deletedRetrievalCount, 0);
    assert.equal(summary.aggregates.supersededRetrievalCount, 0);

    for (const result of summary.results) {
      assert.deepEqual(result.observed.retrievedIds, [], `${result.id} should not retrieve lifecycle-blocked memories`);
    }
  });
});
