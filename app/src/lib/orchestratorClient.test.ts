import { describe, expect, it, vi } from "vitest";
import { requestAvalokaV2 } from "./orchestratorClient";

describe("requestAvalokaV2", () => {
  it("returns a ready V2 result from the orchestrator endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          status: "ready",
          candidateText: "先别急着审判自己。",
          responseSource: "llm_orchestrator_v2",
          model: "gpt-5.2",
          latencyMs: 1200,
          crisis: { status: "safe", confidence: 0.91, reason: "No immediate danger." },
          compassionPlan: {
            status: "ready",
            moves: [
              {
                id: "give_fearlessness_first",
                confidence: 0.91,
                reason: "User needs fear reduction before insight.",
              },
              {
                id: "not_whole_self",
                confidence: 0.74,
                reason: "User is treating pain as the whole self.",
              },
            ],
            stance: "gentle_deblaming",
            avoid: ["karma_blame", "doctrine"],
            responseHint: "Reject punishment framing and offer one grounding step.",
            crisisMode: false,
            model: "gpt-5.2",
            latencyMs: 900,
          },
          guardian: { passed: true, severity: "pass", violations: [], notes: "Safe." },
          repairAttempted: false,
        }),
      })),
    );

    const result = await requestAvalokaV2({
      userText: "我是不是报应？",
      localText: "我不会把你的痛苦解释成惩罚。",
      localCrisis: false,
    });

    expect(result.status).toBe("ready");
    expect(result.candidateText).toBe("先别急着审判自己。");
    expect(result.crisis?.status).toBe("safe");
    expect(result.compassionPlan?.status).toBe("ready");
    expect(result.compassionPlan?.moves.map((move) => move.id)).toEqual([
      "give_fearlessness_first",
      "not_whole_self",
    ]);
    expect(result.guardian?.passed).toBe(true);
    expect(result.responseSource).toBe("llm_orchestrator_v2");
  });

  it("returns an error result when the orchestrator request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => ({ error: "OPENAI_API_KEY is not set." }),
      })),
    );

    const result = await requestAvalokaV2({
      userText: "我现在很乱。",
      localText: "把脚踩在地上。",
    });

    expect(result.status).toBe("error");
    expect(result.error).toBe("OPENAI_API_KEY is not set.");
  });

  it("returns an error result when the request cannot reach the server", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Failed to fetch");
      }),
    );

    const result = await requestAvalokaV2({
      userText: "我现在很乱。",
      localText: "把脚踩在地上。",
    });

    expect(result.status).toBe("error");
    expect(result.error).toBe("Failed to fetch");
  });
});
