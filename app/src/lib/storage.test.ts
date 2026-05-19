import { beforeEach, describe, expect, it } from "vitest";
import { exportAvalokaData, saveFeedback, saveMessages } from "./storage";
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
        responseSource: "openai_primary_dev",
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
    expect(exported.turns[1]).toMatchObject({
      responseSource: "openai_primary_dev",
      localBaselineText: "我不会把生病解释成“还债”或惩罚。",
      openaiPrimary: {
        candidateText: "不，我不会把生病说成“还债”或惩罚。",
        preceptsSeverity: "pass",
      },
      orchestratorV2: {
        candidateText: "这不是还债。先别用惩罚解释自己的痛。",
        responseSource: "llm_orchestrator_v2",
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
      orchestratorV2ReadyCount: 1,
      orchestratorV2ErrorCount: 0,
      orchestratorV2RepairCount: 0,
    });
    expect(exported.summary.responseMoveCounts).toMatchObject({
      role_not_whole_self: 1,
      protect_self_worth: 1,
      reject_punishment_frame: 1,
      conditions_not_blame: 1,
    });
  });
});
