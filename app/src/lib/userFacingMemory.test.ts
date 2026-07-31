import { describe, expect, it } from "vitest";
import { toUserFacingCareNotes, exportUserFacingCareNotes } from "./userFacingMemory";
import type { CareCard } from "../types";

const careCard: CareCard = {
  version: "care_card_v1",
  createdAt: "2026-07-29T10:00:00.000Z",
  updatedAt: "2026-07-29T10:30:00.000Z",
  memories: [
    {
      id: "memory-helpful-1",
      kind: "helpful_response_move",
      text: "Short body-grounded replies help when illness fear appears.",
      confidence: 0.92,
      evidenceIds: ["turn-private-1"],
      tags: ["illness_fear", "body_grounding"],
      createdAt: "2026-07-29T10:00:00.000Z",
      updatedAt: "2026-07-29T10:30:00.000Z",
      lastSeenAt: "2026-07-29T10:30:00.000Z",
      occurrences: 3,
      status: "active",
    },
    {
      id: "memory-avoid-1",
      kind: "avoid_response_move",
      text: "Avoid punishment or debt framing around illness fear.",
      confidence: 0.88,
      evidenceIds: ["turn-private-2"],
      tags: ["self_blame", "illness_fear"],
      createdAt: "2026-07-28T10:00:00.000Z",
      updatedAt: "2026-07-28T10:30:00.000Z",
      lastSeenAt: "2026-07-28T10:30:00.000Z",
      occurrences: 2,
      status: "active",
    },
    {
      id: "memory-superseded-1",
      kind: "tone_preference",
      text: "Old long explanation preference.",
      confidence: 0.7,
      evidenceIds: ["turn-private-3"],
      tags: ["tone"],
      createdAt: "2026-07-01T10:00:00.000Z",
      updatedAt: "2026-07-01T10:30:00.000Z",
      lastSeenAt: "2026-07-01T10:30:00.000Z",
      occurrences: 1,
      status: "superseded",
      supersededBy: "memory-new-tone",
      supersededAt: "2026-07-29T10:30:00.000Z",
    },
  ],
  lifecycleReviewQueue: [
    {
      id: "review-memory-helpful-1-allow",
      candidateId: "candidate-private-1",
      memoryId: "memory-helpful-1",
      status: "allowed",
      action: "allow",
      createdAt: "2026-07-29T10:00:00.000Z",
      updatedAt: "2026-07-29T10:00:00.000Z",
      memoryKind: "helpful_response_move",
      memoryText: "Short body-grounded replies help when illness fear appears.",
      reasons: ["care_relevant"],
      evidenceCount: 1,
      tags: ["illness_fear"],
    },
  ],
};

describe("toUserFacingCareNotes", () => {
  it("projects active care memories into user-safe notes without internal artifacts", () => {
    const notes = toUserFacingCareNotes(careCard);

    expect(notes).toEqual([
      {
        displayText: "Short body-grounded replies help when illness fear appears.",
        category: "what_helps",
        heading: "What seems to help",
        lastUpdatedLabel: "Updated 2026-07-29",
      },
      {
        displayText: "Avoid punishment or debt framing around illness fear.",
        category: "what_to_avoid",
        heading: "What Avaloka should avoid",
        lastUpdatedLabel: "Updated 2026-07-28",
      },
    ]);

    const serialized = JSON.stringify(notes);
    expect(serialized).not.toContain("memory-helpful-1");
    expect(serialized).not.toContain("candidate-private-1");
    expect(serialized).not.toContain("turn-private-1");
    expect(serialized).not.toContain("confidence");
    expect(serialized).not.toContain("tags");
    expect(serialized).not.toContain("lifecycleReviewQueue");
    expect(serialized).not.toContain("memory_claim_grounding_v0");
    expect(serialized).not.toContain("retrieval_trace_v1");
    expect(serialized).not.toContain("guardian");
  });

  it("exports a readable user-safe memory summary instead of raw diagnostic JSON", () => {
    const exported = exportUserFacingCareNotes(careCard, "on");

    expect(exported).toContain("Avaloka remembered care notes");
    expect(exported).toContain("Memory status: on");
    expect(exported).toContain("What seems to help");
    expect(exported).toContain("Short body-grounded replies help when illness fear appears.");
    expect(exported).not.toContain("memory-helpful-1");
    expect(exported).not.toContain("turn-private-1");
    expect(exported).not.toContain("confidence");
    expect(exported).not.toContain("lifecycleReviewQueue");
  });
});
