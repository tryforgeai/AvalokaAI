import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAvalokaData,
  deleteCareMemory,
  exportAvalokaData,
  loadCareCard,
  saveFeedback,
  saveMemoryCandidates,
  saveMessages,
  supersedeCareMemory,
} from "./storage";
import type { ChatMessage, FeedbackEntry } from "../types";

describe("exportAvalokaData", () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      clear: () => {
        store = {};
      },
      getItem: (key: string) => store[key] || null,
      removeItem: (key: string) => {
        delete store[key];
      },
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: { localStorage: localStorageMock },
      writable: true,
    });
    window.localStorage.clear();
  });

  it("exports raw records plus paired turns and summary metrics", () => {
    const messages: ChatMessage[] = [
      {
        id: "user-1",
        role: "user",
        text: "孩子都走了，我好像已经不是一个有用的人了。",
        createdAt: "2026-05-18T05:26:28.772Z",
      },
      {
        id: "avaloka-1",
        role: "avaloka",
        text: "一个角色变安静了，不等于你整个人没有价值。",
        scenarioId: "dukkha:role_not_whole_self",
        createdAt: "2026-05-18T05:26:28.773Z",
        crisis: false,
        guardianFallback: false,
        preceptsSeverity: "pass",
        preceptsViolations: [],
        dukkhaTypes: ["suffering_of_change", "story_added_suffering"],
        dukkhaPatterns: ["aversion", "ignorance"],
        responseMoves: ["role_not_whole_self", "protect_self_worth"],
      },
      {
        id: "user-2",
        role: "user",
        text: "我是不是因为以前太自私，现在生病是在还债？",
        createdAt: "2026-05-18T05:26:33.830Z",
      },
      {
        id: "avaloka-2",
        role: "avaloka",
        text: "我不会把你的痛苦解释成惩罚。",
        scenarioId: "dukkha:reject_punishment_frame",
        createdAt: "2026-05-18T05:26:33.831Z",
        crisis: false,
        guardianFallback: false,
        preceptsSeverity: "pass",
        preceptsViolations: [],
        dukkhaTypes: ["story_added_suffering"],
        dukkhaPatterns: ["ignorance"],
        responseMoves: ["reject_punishment_frame", "conditions_not_blame"],
        responseSource: "local_claim_grounding_fallback",
        localBaselineText: "我不会把生病解释成“还债”或惩罚。",
        orchestratorV2: {
          status: "ready",
          candidateText: "这不是还债。先别用惩罚解释自己的痛。",
          responseSource: "llm_orchestrator_v2",
          model: "gpt-5.2",
          latencyMs: 2400,
          crisis: {
            status: "safe",
            confidence: 0.9,
            reason: "No immediate danger.",
          },
          guardian: {
            passed: true,
            severity: "pass",
            violations: [],
            notes: "Safe.",
          },
          compassionPlan: {
            status: "ready",
            moves: [
              {
                id: "give_fearlessness_first",
                confidence: 0.91,
                reason: "User is interpreting pain as punishment.",
              },
              {
                id: "return_from_story_to_step",
                confidence: 0.66,
                reason: "User needs one safe next step.",
              },
            ],
            stance: "gentle_deblaming",
            avoid: ["karma_blame", "doctrine"],
            responseHint: "Reject punishment framing and return to the body.",
            crisisMode: false,
            model: "gpt-5.2",
            latencyMs: 880,
          },
          retrievedCareFacts: [
            {
              memoryId: "memory-1",
              kind: "avoid_response_move",
              text: "Avoid confirming punishment or debt framing.",
              confidence: 0.9,
              tags: ["self_blame"],
            },
          ],
          memoryClaimGrounding: {
            version: "memory_claim_grounding_v0",
            verdict: "warn",
            claims: [
              {
                claimId: "claim_01",
                claimTextHash: "abcd".repeat(16),
                status: "unsupported",
                supportingMemoryIds: [],
                reason: "no_retrieved_fact_support",
              },
            ],
          },
          repairAttempted: false,
        },
        openaiPrimary: {
          status: "ready",
          candidateText: "不，我不会把生病说成“还债”或惩罚。",
          model: "gpt-5.2",
          guardianFallback: false,
          preceptsSeverity: "pass",
          preceptsViolations: [],
        },
        baifa: {
          status: "ready",
          model: "gpt-5.2",
          baifa: {
            primaryMindStates: [
              {
                baifaCategory: "烦恼心所",
                mindState: "不正见",
                confidence: 0.86,
                evidence: "用户把生病解释成还债。",
              },
            ],
            wholesomeAntidotes: ["无痴", "不害"],
            recommendedResponseMoves: ["reject_punishment_frame", "protect_from_self_blame"],
            doNotDo: ["不要确认还债/报应框架"],
          },
        },
        sageMemory: {
          status: "ready",
          model: "gpt-5.2",
          latencyMs: 710,
          candidates: [
            {
              id: "memory-1",
              kind: "avoid_response_move",
              text: "Avoid confirming punishment or debt framing.",
              confidence: 0.9,
              evidenceIds: ["user-2", "avaloka-2"],
              tags: ["self_blame"],
            },
          ],
          guardian: [{ candidateId: "memory-1", status: "allow", reasons: [] }],
        },
      },
    ];
    const feedback: FeedbackEntry[] = [
      {
        id: "feedback-1",
        messageId: "avaloka-1",
        createdAt: "2026-05-18T05:26:30.677Z",
        realLowMoment: "yes",
        openedUnprompted: "yes",
        settlingScore: 4,
        mostHelpfulLine: "不是整个人没有价值",
        failedLine: "",
        wantsTomorrow: "yes",
      },
      {
        id: "feedback-2",
        messageId: "avaloka-2",
        createdAt: "2026-05-18T05:26:34.806Z",
        realLowMoment: "no",
        openedUnprompted: "yes",
        settlingScore: 5,
        mostHelpfulLine: "不解释成惩罚",
        failedLine: "",
        wantsTomorrow: "yes",
      },
    ];

    saveMessages(messages);
    saveFeedback(feedback);

    const exported = JSON.parse(exportAvalokaData());

    expect(exported.messages).toHaveLength(4);
    expect(exported.feedback).toHaveLength(2);
    expect(exported.turns).toHaveLength(2);
    expect(exported.turns[0]).toMatchObject({
      userText: messages[0].text,
      avalokaText: messages[1].text,
      scenarioId: "dukkha:role_not_whole_self",
      responseMoves: ["role_not_whole_self", "protect_self_worth"],
      feedback: feedback[0],
    });
    expect(exported.turns[1].baifa.baifa.primaryMindStates[0]).toMatchObject({
      mindState: "不正见",
      confidence: 0.86,
    });
    expect(exported.turns[1].sageMemory).toMatchObject({
      status: "ready",
      candidates: [{ id: "memory-1", kind: "avoid_response_move" }],
      guardian: [{ candidateId: "memory-1", status: "allow" }],
    });
    expect(exported.turns[1]).toMatchObject({
      responseSource: "local_claim_grounding_fallback",
      localBaselineText: "我不会把生病解释成“还债”或惩罚。",
      openaiPrimary: {
        candidateText: "不，我不会把生病说成“还债”或惩罚。",
        preceptsSeverity: "pass",
      },
      orchestratorV2: {
        candidateText: "这不是还债。先别用惩罚解释自己的痛。",
        responseSource: "llm_orchestrator_v2",
        compassionPlan: {
          moves: [
            { id: "give_fearlessness_first", confidence: 0.91 },
            { id: "return_from_story_to_step", confidence: 0.66 },
          ],
        },
        retrievedCareFacts: [
          {
            memoryId: "memory-1",
            kind: "avoid_response_move",
            text: "Avoid confirming punishment or debt framing.",
            confidence: 0.9,
            tags: ["self_blame"],
          },
        ],
        memoryClaimGrounding: {
          verdict: "warn",
          claims: [{ status: "unsupported", supportingMemoryIds: [] }],
        },
      },
    });
    expect(exported.summary).toMatchObject({
      turnCount: 2,
      messageCount: 4,
      feedbackCount: 2,
      realLowMomentCount: 1,
      openedUnpromptedCount: 2,
      wantsTomorrowYesCount: 2,
      guardianFallbackCount: 0,
      crisisCount: 0,
      averageSettlingScore: 4.5,
      baifaReadyCount: 1,
      baifaErrorCount: 0,
      openaiPrimaryReadyCount: 1,
      openaiPrimaryFallbackCount: 0,
      claimGroundingFallbackCount: 1,
      orchestratorV2ReadyCount: 1,
      orchestratorV2ErrorCount: 0,
      orchestratorV2RepairCount: 0,
      memoryClaimGroundingWarnCount: 1,
      unsupportedMemoryClaimCount: 1,
      compassionReadyCount: 1,
      compassionErrorCount: 0,
      sageMemoryReadyCount: 1,
      sageMemoryErrorCount: 0,
      sageMemoryCandidateCount: 1,
    });
    expect(exported.summary.sageMemoryKindCounts).toMatchObject({
      avoid_response_move: 1,
    });
    expect(exported.summary.sageMemoryGuardianCounts).toMatchObject({
      allow: 1,
    });
    expect(exported.summary.compassionMoveCounts).toMatchObject({
      give_fearlessness_first: 1,
      return_from_story_to_step: 1,
    });
    expect(exported.summary.responseMoveCounts).toMatchObject({
      role_not_whole_self: 1,
      protect_self_worth: 1,
      reject_punishment_frame: 1,
      conditions_not_blame: 1,
    });
  });

  it("persists allowed memory candidates to the care card export", () => {
    saveMemoryCandidates(
      [
        {
          id: "memory-allowed",
          kind: "tone_preference",
          text: "User prefers short body-grounded responses.",
          confidence: 0.82,
          evidenceIds: ["feedback-1"],
          tags: ["tone"],
        },
        {
          id: "memory-rejected",
          kind: "safety_note",
          text: "User may have cancer because of karmic debt.",
          confidence: 0.9,
          evidenceIds: ["feedback-2"],
          tags: ["unsafe"],
        },
      ],
      "2026-05-26T10:00:00.000Z",
    );

    const exported = JSON.parse(exportAvalokaData());

    expect(exported.careCard).toMatchObject({
      version: "care_card_v1",
      memories: [
        {
          id: "memory-allowed",
          kind: "tone_preference",
          text: "User prefers short body-grounded responses.",
          confidence: 0.82,
          evidenceIds: ["feedback-1"],
          tags: ["tone"],
          createdAt: "2026-05-26T10:00:00.000Z",
          updatedAt: "2026-05-26T10:00:00.000Z",
          occurrences: 1,
        },
      ],
    });
    expect(exported.careCard.memories).toHaveLength(1);
    expect(exported.summary).toMatchObject({
      careMemoryCount: 1,
      careMemoryKindCounts: {
        tone_preference: 1,
      },
      memoryLifecycleReviewPendingCount: 0,
      memoryLifecycleReviewAllowedCount: 1,
      memoryLifecycleReviewRejectedCount: 1,
      memoryLifecycleReviewSupersededCount: 0,
      memoryLifecycleReviewDeletedCount: 0,
    });
    expect(exported.memoryLifecycleReviewQueue).toEqual([
      {
        id: "review-memory-allowed-allow",
        candidateId: "memory-allowed",
        memoryId: "memory-allowed",
        status: "allowed",
        action: "allow",
        createdAt: "2026-05-26T10:00:00.000Z",
        updatedAt: "2026-05-26T10:00:00.000Z",
        memoryKind: "tone_preference",
        memoryText: "User prefers short body-grounded responses.",
        reasons: [],
        evidenceCount: 1,
        tags: ["tone"],
      },
      {
        id: "review-memory-rejected-reject",
        candidateId: "memory-rejected",
        status: "rejected",
        action: "reject",
        createdAt: "2026-05-26T10:00:00.000Z",
        updatedAt: "2026-05-26T10:00:00.000Z",
        memoryKind: "safety_note",
        memoryText: "User may have cancer because of karmic debt.",
        reasons: ["medical_or_spiritual_claim"],
        evidenceCount: 1,
        tags: ["unsafe"],
      },
    ]);
  });

  it("clears the care card with local Avaloka data", () => {
    saveMemoryCandidates(
      [
        {
          id: "memory-1",
          kind: "helpful_response_move",
          text: "Body grounding helped before reflection.",
          confidence: 0.7,
          evidenceIds: ["feedback-1"],
          tags: ["body_grounding"],
        },
      ],
      "2026-05-26T10:00:00.000Z",
    );

    clearAvalokaData();

    expect(loadCareCard()).toMatchObject({
      version: "care_card_v1",
      memories: [],
    });
  });

  it("deletes one care memory and records a lifecycle event in export", () => {
    saveMemoryCandidates(
      [
        {
          id: "memory-delete-me",
          kind: "tone_preference",
          text: "User prefers short body-grounded responses.",
          confidence: 0.82,
          evidenceIds: ["feedback-1"],
          tags: ["tone"],
        },
      ],
      "2026-05-26T10:00:00.000Z",
    );

    const updated = deleteCareMemory("memory-delete-me", "2026-05-26T10:05:00.000Z");
    const exported = JSON.parse(exportAvalokaData());

    expect(updated.memories).toHaveLength(0);
    expect(exported.careCard.lifecycleEvents).toEqual([
      {
        type: "delete",
        memoryId: "memory-delete-me",
        createdAt: "2026-05-26T10:05:00.000Z",
        memoryKind: "tone_preference",
        memoryText: "User prefers short body-grounded responses.",
      },
    ]);
    expect(exported.summary).toMatchObject({
      careMemoryCount: 0,
      careMemoryDeletedCount: 1,
      careMemorySupersededCount: 0,
      memoryLifecycleReviewDeletedCount: 1,
    });
    expect(exported.memoryLifecycleReviewQueue.at(-1)).toMatchObject({
      id: "review-memory-delete-me-delete-2026-05-26T10:05:00.000Z",
      memoryId: "memory-delete-me",
      status: "deleted",
      action: "delete",
      createdAt: "2026-05-26T10:05:00.000Z",
      updatedAt: "2026-05-26T10:05:00.000Z",
      memoryKind: "tone_preference",
      reasons: ["developer_deleted"],
    });
  });

  it("supersedes one care memory with a replacement and preserves lifecycle trail", () => {
    saveMemoryCandidates(
      [
        {
          id: "old-tone",
          kind: "tone_preference",
          text: "User prefers longer analytical responses.",
          confidence: 0.72,
          evidenceIds: ["feedback-1"],
          tags: ["tone"],
        },
      ],
      "2026-05-26T10:00:00.000Z",
    );

    const updated = supersedeCareMemory(
      "old-tone",
      {
        id: "new-tone",
        kind: "tone_preference",
        text: "User prefers short body-grounded responses.",
        confidence: 0.86,
        evidenceIds: ["feedback-2"],
        tags: ["tone", "body_grounding"],
      },
      "2026-05-26T10:05:00.000Z",
    );
    const exported = JSON.parse(exportAvalokaData());

    expect(updated.memories.map((memory) => [memory.id, memory.status])).toEqual([
      ["old-tone", "superseded"],
      ["new-tone", "active"],
    ]);
    expect(exported.careCard.memories[0]).toMatchObject({
      id: "old-tone",
      status: "superseded",
      supersededBy: "new-tone",
      supersededAt: "2026-05-26T10:05:00.000Z",
    });
    expect(exported.careCard.lifecycleEvents).toEqual([
      {
        type: "supersede",
        memoryId: "old-tone",
        replacementMemoryId: "new-tone",
        createdAt: "2026-05-26T10:05:00.000Z",
        memoryKind: "tone_preference",
        memoryText: "User prefers longer analytical responses.",
      },
    ]);
    expect(exported.summary).toMatchObject({
      careMemoryCount: 2,
      careMemoryActiveCount: 1,
      careMemorySupersededCount: 1,
      memoryLifecycleReviewAllowedCount: 2,
      memoryLifecycleReviewSupersededCount: 1,
    });
    expect(exported.memoryLifecycleReviewQueue.at(-2)).toMatchObject({
      id: "review-old-tone-supersede-2026-05-26T10:05:00.000Z",
      memoryId: "old-tone",
      replacementMemoryId: "new-tone",
      status: "superseded",
      action: "supersede",
      memoryKind: "tone_preference",
      reasons: ["developer_superseded"],
    });
    expect(exported.memoryLifecycleReviewQueue.at(-1)).toMatchObject({
      id: "review-new-tone-allow",
      candidateId: "new-tone",
      memoryId: "new-tone",
      status: "allowed",
      action: "allow",
    });
  });

  it("does not supersede a care memory when the replacement is rejected by the guardian", () => {
    saveMemoryCandidates(
      [
        {
          id: "old-safety",
          kind: "safety_note",
          text: "Avoid medical certainty and keep the user grounded.",
          confidence: 0.82,
          evidenceIds: ["feedback-1"],
          tags: ["safety"],
        },
      ],
      "2026-05-26T10:00:00.000Z",
    );

    const updated = supersedeCareMemory(
      "old-safety",
      {
        id: "unsafe-replacement",
        kind: "safety_note",
        text: "User may have cancer because of karmic debt.",
        confidence: 0.9,
        evidenceIds: ["feedback-2"],
        tags: ["unsafe"],
      },
      "2026-05-26T10:05:00.000Z",
    );
    const exported = JSON.parse(exportAvalokaData());

    expect(updated.memories).toHaveLength(1);
    expect(updated.memories[0]).toMatchObject({
      id: "old-safety",
      status: "active",
    });
    expect(exported.careCard.lifecycleEvents || []).toEqual([]);
    expect(exported.summary).toMatchObject({
      careMemoryActiveCount: 1,
      careMemorySupersededCount: 0,
    });
  });
});
