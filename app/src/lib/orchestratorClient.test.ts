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
});
