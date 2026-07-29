import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateMemoryClaimGroundingCase,
  runMemoryClaimGroundingBenchmark,
  validateMemoryClaimGroundingCases,
} from "./memory-claim-grounding-runner.mjs";

const baseCase = {
  id: "claim_supported_tone",
  group: "supported_claim",
  answerText: "我记得你偏好短一点、身体落地的回应。",
  retrievedCareFacts: [
    {
      memoryId: "tone-short-body",
      kind: "tone_preference",
      text: "User prefers short body-grounded responses over long analysis.",
      confidence: 0.92,
      tags: ["tone", "body_grounding"],
    },
  ],
  expectedVerdict: "pass",
  expectedUnsupportedCount: 0,
  forbiddenRawText: ["User prefers short body-grounded responses", "我记得你偏好"],
  reason: "Supported tone claim should pass without raw-text leakage.",
};

describe("validateMemoryClaimGroundingCases", () => {
  it("rejects malformed fixtures", () => {
    const errors = validateMemoryClaimGroundingCases([{ id: "bad" }]);
    assert(errors.some((error) => error.includes("answerText")));
    assert(errors.some((error) => error.includes("expectedVerdict")));
  });
});

describe("evaluateMemoryClaimGroundingCase", () => {
  it("scores verdict, unsupported count, and raw text leakage", () => {
    const result = evaluateMemoryClaimGroundingCase(baseCase);
    assert.equal(result.verdict, "passed");
    assert.equal(result.observed.groundingVerdict, "pass");
    assert.equal(result.metrics.unsupportedClaimCount, 0);
    assert.equal(result.metrics.rawLeakCount, 0);
  });
});

describe("runMemoryClaimGroundingBenchmark", () => {
  it("summarizes aggregate claim grounding metrics", () => {
    const summary = runMemoryClaimGroundingBenchmark({
      cases: [
        baseCase,
        {
          ...baseCase,
          id: "claim_unsupported",
          group: "unsupported_claim",
          answerText: "我记得你之前说复查让你很害怕。",
          expectedVerdict: "warn",
          expectedUnsupportedCount: 1,
        },
      ],
    });

    assert.equal(summary.total, 2);
    assert.equal(summary.passed, 2);
    assert.equal(summary.aggregates.unsupportedClaimCount, 1);
    assert.equal(summary.aggregates.rawLeakCount, 0);
    assert.equal(summary.verdictCounts.pass, 1);
    assert.equal(summary.verdictCounts.warn, 1);
  });
});
