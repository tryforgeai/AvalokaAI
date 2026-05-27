import { describe, expect, it } from "vitest";
import { buildMemoryInspectorReport } from "./memoryInspector";
import type { CareCard, ChatMessage } from "../types";

describe("buildMemoryInspectorReport", () => {
  it("summarizes care card memories, writer output, and latest retrieval for developer inspection", () => {
    const careCard: CareCard = {
      version: "care_card_v1",
      createdAt: "2026-05-26T10:00:00.000Z",
      updatedAt: "2026-05-26T10:10:00.000Z",
      memories: [
        {
          id: "avoid-debt-frame",
          kind: "avoid_response_move",
          text: "Avoid punishment/debt framing when illness fear appears.",
          confidence: 0.88,
          evidenceIds: ["feedback-1"],
          tags: ["self_blame", "illness_fear"],
          createdAt: "2026-05-26T10:00:00.000Z",
          updatedAt: "2026-05-26T10:10:00.000Z",
          lastSeenAt: "2026-05-26T10:10:00.000Z",
          occurrences: 2,
        },
        {
          id: "tone-short-body",
          kind: "tone_preference",
          text: "User prefers short body-grounded responses.",
          confidence: 0.82,
          evidenceIds: ["feedback-2"],
          tags: ["tone", "body_grounding"],
          createdAt: "2026-05-26T10:05:00.000Z",
          updatedAt: "2026-05-26T10:05:00.000Z",
          lastSeenAt: "2026-05-26T10:05:00.000Z",
          occurrences: 1,
        },
      ],
    };
    const messages: ChatMessage[] = [
      {
        id: "avaloka-1",
        role: "avaloka",
        text: "这不是惩罚。",
        createdAt: "2026-05-26T10:20:00.000Z",
        sageMemory: {
          status: "ready",
          model: "gpt-5.2",
          latencyMs: 1234,
          candidates: [
            {
              id: "avoid-debt-frame",
              kind: "avoid_response_move",
              text: "Avoid punishment/debt framing when illness fear appears.",
              confidence: 0.88,
              evidenceIds: ["feedback-1"],
              tags: ["self_blame", "illness_fear"],
            },
          ],
          guardian: [{ candidateId: "avoid-debt-frame", status: "allow", reasons: [] }],
        },
        orchestratorV2: {
          status: "ready",
          retrievedCareFacts: [
            {
              memoryId: "avoid-debt-frame",
              kind: "avoid_response_move",
              text: "Avoid punishment/debt framing when illness fear appears.",
              confidence: 0.88,
              tags: ["self_blame", "illness_fear"],
            },
          ],
        },
      },
    ];

    const report = buildMemoryInspectorReport({ careCard, messages });

    expect(report.summary).toMatchObject({
      careMemoryCount: 2,
      writerReadyCount: 1,
      writerCandidateCount: 1,
      latestRetrievedCareFactCount: 1,
    });
    expect(report.kindCounts).toMatchObject({
      avoid_response_move: 1,
      tone_preference: 1,
    });
    expect(report.tagCounts).toMatchObject({
      self_blame: 1,
      illness_fear: 1,
      tone: 1,
      body_grounding: 1,
    });
    expect(report.memories[0]).toMatchObject({
      id: "avoid-debt-frame",
      source: "care_card",
      occurrences: 2,
      evidenceCount: 1,
    });
    expect(report.latestWriter).toMatchObject({
      status: "ready",
      model: "gpt-5.2",
      candidateIds: ["avoid-debt-frame"],
      guardianStatusCounts: { allow: 1 },
    });
    expect(report.latestRetrievedCareFacts).toEqual(["avoid-debt-frame"]);
    expect(report.evalCommands).toEqual(["npm run eval:sage", "npm run eval:sage:writer", "npm run eval:memory"]);
  });
});
