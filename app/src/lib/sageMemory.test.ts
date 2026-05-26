import { describe, expect, it } from "vitest";
import {
  createEmptyCareCard,
  guardMemoryCandidate,
  readCareFactsFromCard,
  selectCareFacts,
  upsertCareMemory,
} from "./sageMemory";

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

  it("reads illness and self-blame care facts from current turn tags", () => {
    const card = {
      version: "care_card_v1" as const,
      createdAt: "2026-05-26T10:00:00.000Z",
      updatedAt: "2026-05-26T10:05:00.000Z",
      memories: [
        {
          id: "safety-self-blame",
          kind: "safety_note" as const,
          text: "Do not validate punishment, karmic debt, or blame framing.",
          confidence: 0.82,
          evidenceIds: ["feedback-1"],
          tags: ["self_blame", "illness_fear"],
          createdAt: "2026-05-26T10:00:00.000Z",
          updatedAt: "2026-05-26T10:00:00.000Z",
          lastSeenAt: "2026-05-26T10:00:00.000Z",
          occurrences: 1,
        },
        {
          id: "avoid-self-blame",
          kind: "avoid_response_move" as const,
          text: "Avoid long doctrine when the user is asking whether pain is deserved.",
          confidence: 0.9,
          evidenceIds: ["feedback-2"],
          tags: ["self_blame"],
          createdAt: "2026-05-26T10:01:00.000Z",
          updatedAt: "2026-05-26T10:01:00.000Z",
          lastSeenAt: "2026-05-26T10:01:00.000Z",
          occurrences: 2,
        },
        {
          id: "tone-short",
          kind: "tone_preference" as const,
          text: "User prefers short body-grounded responses.",
          confidence: 0.96,
          evidenceIds: ["feedback-3"],
          tags: ["tone", "body_grounding"],
          createdAt: "2026-05-26T10:02:00.000Z",
          updatedAt: "2026-05-26T10:02:00.000Z",
          lastSeenAt: "2026-05-26T10:02:00.000Z",
          occurrences: 3,
        },
      ],
    };

    const facts = readCareFactsFromCard(
      card,
      {
        scenarioId: "dukkha:reject_punishment_frame",
        dukkhaTypes: ["story_added_suffering"],
        dukkhaPatterns: ["ignorance"],
        responseMoves: ["reject_punishment_frame", "return_from_story_to_step"],
        tags: ["tone"],
      },
      { now: "2026-05-26T10:10:00.000Z", limit: 3 },
    );

    expect(facts.map((fact) => fact.id)).toEqual(["safety-self-blame", "avoid-self-blame", "tone-short"]);
  });

  it("excludes stale and low-confidence care memories", () => {
    const card = {
      version: "care_card_v1" as const,
      createdAt: "2026-05-26T10:00:00.000Z",
      updatedAt: "2026-05-26T10:05:00.000Z",
      memories: [
        {
          id: "fresh",
          kind: "helpful_response_move" as const,
          text: "Ground in the body before reflection.",
          confidence: 0.74,
          evidenceIds: ["feedback-1"],
          tags: ["body_grounding"],
          createdAt: "2026-05-20T10:00:00.000Z",
          updatedAt: "2026-05-20T10:00:00.000Z",
          lastSeenAt: "2026-05-20T10:00:00.000Z",
          occurrences: 1,
        },
        {
          id: "stale",
          kind: "helpful_response_move" as const,
          text: "A very old tone preference should not dominate.",
          confidence: 0.95,
          evidenceIds: ["feedback-2"],
          tags: ["body_grounding"],
          createdAt: "2025-01-01T10:00:00.000Z",
          updatedAt: "2025-01-01T10:00:00.000Z",
          lastSeenAt: "2025-01-01T10:00:00.000Z",
          occurrences: 9,
        },
        {
          id: "low-confidence",
          kind: "tone_preference" as const,
          text: "Low-confidence body grounding note.",
          confidence: 0.49,
          evidenceIds: ["feedback-3"],
          tags: ["body_grounding"],
          createdAt: "2026-05-25T10:00:00.000Z",
          updatedAt: "2026-05-25T10:00:00.000Z",
          lastSeenAt: "2026-05-25T10:00:00.000Z",
          occurrences: 1,
        },
      ],
    };

    const facts = readCareFactsFromCard(
      card,
      { responseMoves: ["return_from_story_to_step"], tags: ["body_grounding"] },
      { now: "2026-05-26T10:10:00.000Z", staleAfterDays: 180 },
    );

    expect(facts.map((fact) => fact.id)).toEqual(["fresh"]);
  });

  it("returns no care facts when the current turn has no matching tags", () => {
    const card = {
      version: "care_card_v1" as const,
      createdAt: "2026-05-26T10:00:00.000Z",
      updatedAt: "2026-05-26T10:05:00.000Z",
      memories: [
        {
          id: "illness",
          kind: "recurring_pain_pattern" as const,
          text: "Illness fear often needs deblaming first.",
          confidence: 0.8,
          evidenceIds: ["feedback-1"],
          tags: ["illness_fear", "self_blame"],
          createdAt: "2026-05-26T10:00:00.000Z",
          updatedAt: "2026-05-26T10:00:00.000Z",
          lastSeenAt: "2026-05-26T10:00:00.000Z",
          occurrences: 1,
        },
      ],
    };

    const facts = readCareFactsFromCard(
      card,
      { scenarioId: "dukkha:role_not_whole_self", responseMoves: ["protect_self_worth"] },
      { now: "2026-05-26T10:10:00.000Z" },
    );

    expect(facts).toEqual([]);
  });
});
