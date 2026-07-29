import { describe, expect, it } from "vitest";
import type { RetrievedCareFact } from "../types";
import { evaluateMemoryClaimGrounding } from "./memoryClaimGrounding";

const toneFact: RetrievedCareFact = {
  memoryId: "tone-short-body",
  kind: "tone_preference",
  text: "User prefers short body-grounded responses over long analysis.",
  confidence: 0.92,
  tags: ["tone", "body_grounding"],
};

const illnessFact: RetrievedCareFact = {
  memoryId: "illness-fear-grounding",
  kind: "helpful_response_move",
  text: "When illness fear appears, validate fear and return to one body-grounding step before reflection.",
  confidence: 0.86,
  tags: ["illness_fear", "body_grounding"],
};

describe("memory claim grounding", () => {
  it("marks explicit memory claims as supported when retrieved facts contain matching evidence", () => {
    const result = evaluateMemoryClaimGrounding({
      answerText: "我记得你偏好短一点、身体落地的回应，所以我们先回到脚和呼吸。",
      retrievedCareFacts: [toneFact],
    });

    expect(result.version).toBe("memory_claim_grounding_v0");
    expect(result.verdict).toBe("pass");
    expect(result.claims).toHaveLength(1);
    expect(result.claims[0]).toMatchObject({
      status: "supported",
      supportingMemoryIds: ["tone-short-body"],
      reason: "matched_retrieved_fact",
    });
    expect(result.claims[0].claimTextHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("marks explicit memory claims as unsupported when no retrieved fact supports them", () => {
    const result = evaluateMemoryClaimGrounding({
      answerText: "我记得你之前说复查让你很害怕，所以我会一直保证你没事。",
      retrievedCareFacts: [toneFact],
    });

    expect(result.verdict).toBe("warn");
    expect(result.claims).toHaveLength(1);
    expect(result.claims[0]).toMatchObject({
      status: "unsupported",
      supportingMemoryIds: [],
      reason: "no_retrieved_fact_support",
    });
  });

  it("abstains on generic support that does not make a memory claim", () => {
    const result = evaluateMemoryClaimGrounding({
      answerText: "这听起来很重。我们先慢慢呼一口气。",
      retrievedCareFacts: [illnessFact],
    });

    expect(result.verdict).toBe("pass");
    expect(result.claims).toEqual([]);
  });

  it("does not leak raw answer text or raw retrieved memory text into grounding output", () => {
    const result = evaluateMemoryClaimGrounding({
      answerText: "我记得你偏好短一点、身体落地的回应。",
      retrievedCareFacts: [toneFact],
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("我记得你偏好");
    expect(serialized).not.toContain("User prefers short body-grounded responses");
    expect(serialized).not.toContain("text");
  });
});
