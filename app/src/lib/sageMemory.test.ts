import { describe, expect, it } from "vitest";
import { createEmptyCareCard, guardMemoryCandidate, selectCareFacts, upsertCareMemory } from "./sageMemory";

describe("SAGE Lite memory core", () => {
  it("rejects candidates without source evidence", () => {
    const result = guardMemoryCandidate({
      id: "candidate_no_evidence",
      kind: "tone_preference",
      text: "User prefers shorter responses.",
      confidence: 0.8,
      evidenceIds: [],
    });

    expect(result.status).toBe("reject");
    expect(result.reasons).toContain("missing_evidence");
  });

  it("rejects unsafe or invasive memory candidates", () => {
    const result = guardMemoryCandidate({
      id: "candidate_medical_claim",
      kind: "safety_note",
      text: "User may have breast cancer because she is karmically guilty.",
      confidence: 0.9,
      evidenceIds: ["turn-1"],
    });

    expect(result.status).toBe("reject");
    expect(result.reasons).toContain("medical_or_spiritual_claim");
  });

  it("allows sparse care-relevant memory candidates", () => {
    const result = guardMemoryCandidate({
      id: "candidate_short_body_grounding",
      kind: "tone_preference",
      text: "User prefers short body-grounded responses over long analysis.",
      confidence: 0.76,
      evidenceIds: ["feedback-1"],
    });

    expect(result.status).toBe("allow");
    expect(result.memory?.text).toBe("User prefers short body-grounded responses over long analysis.");
  });

  it("selects at most the most relevant care facts for prompt injection", () => {
    const facts = selectCareFacts(
      [
        {
          id: "fact_illness",
          kind: "recurring_pain_pattern",
          text: "When illness fear appears, avoid punishment or debt framing.",
          confidence: 0.9,
          evidenceIds: ["turn-1"],
          tags: ["illness_fear", "self_blame"],
        },
        {
          id: "fact_short",
          kind: "tone_preference",
          text: "User prefers short body-grounded responses.",
          confidence: 0.8,
          evidenceIds: ["feedback-1"],
          tags: ["tone"],
        },
        {
          id: "fact_aging",
          kind: "recurring_pain_pattern",
          text: "Aging fear often needs body grounding before reflection.",
          confidence: 0.85,
          evidenceIds: ["turn-2"],
          tags: ["aging"],
        },
        {
          id: "fact_low_confidence",
          kind: "avoid_response_move",
          text: "Avoid long philosophical analysis.",
          confidence: 0.3,
          evidenceIds: ["feedback-2"],
          tags: ["tone"],
        },
      ],
      ["illness_fear", "tone"],
      2,
    );

    expect(facts.map((fact) => fact.id)).toEqual(["fact_illness", "fact_short"]);
  });

  it("stores an allowed memory candidate as a care memory", () => {
    const card = createEmptyCareCard("2026-05-26T10:00:00.000Z");
    const updated = upsertCareMemory(
      card,
      {
        id: "memory-1",
        kind: "tone_preference",
        text: " User prefers short body-grounded responses. ",
        confidence: 0.76,
        evidenceIds: ["feedback-1"],
        tags: ["tone", "body_grounding"],
      },
      "2026-05-26T10:01:00.000Z",
    );

    expect(updated.memories).toHaveLength(1);
    expect(updated.memories[0]).toMatchObject({
      id: "memory-1",
      kind: "tone_preference",
      text: "User prefers short body-grounded responses.",
      confidence: 0.76,
      evidenceIds: ["feedback-1"],
      tags: ["tone", "body_grounding"],
      createdAt: "2026-05-26T10:01:00.000Z",
      updatedAt: "2026-05-26T10:01:00.000Z",
      lastSeenAt: "2026-05-26T10:01:00.000Z",
      occurrences: 1,
    });
    expect(updated.updatedAt).toBe("2026-05-26T10:01:00.000Z");
  });

  it("merges duplicate care memories by kind and normalized text", () => {
    const first = upsertCareMemory(
      createEmptyCareCard("2026-05-26T10:00:00.000Z"),
      {
        id: "memory-1",
        kind: "avoid_response_move",
        text: "Avoid confirming punishment or debt framing.",
        confidence: 0.72,
        evidenceIds: ["feedback-1"],
        tags: ["self_blame"],
      },
      "2026-05-26T10:01:00.000Z",
    );

    const updated = upsertCareMemory(
      first,
      {
        id: "memory-2",
        kind: "avoid_response_move",
        text: " avoid  confirming punishment or debt framing. ",
        confidence: 0.91,
        evidenceIds: ["feedback-2", "turn-2"],
        tags: ["illness_fear"],
      },
      "2026-05-26T10:05:00.000Z",
    );

    expect(updated.memories).toHaveLength(1);
    expect(updated.memories[0]).toMatchObject({
      id: "memory-1",
      kind: "avoid_response_move",
      text: "Avoid confirming punishment or debt framing.",
      confidence: 0.91,
      evidenceIds: ["feedback-1", "feedback-2", "turn-2"],
      tags: ["self_blame", "illness_fear"],
      createdAt: "2026-05-26T10:01:00.000Z",
      updatedAt: "2026-05-26T10:05:00.000Z",
      lastSeenAt: "2026-05-26T10:05:00.000Z",
      occurrences: 2,
    });
  });
});
