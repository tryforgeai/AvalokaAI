import { describe, expect, it } from "vitest";
import { applyAvalokaV2Result, createInitialLlmDebugState, DEFAULT_AUTO_LLM_ENDPOINTS } from "./llmPipeline";
import type { ChatMessage } from "../types";

describe("default LLM pipeline", () => {
  it("uses only the V2 orchestrator as the automatic LLM endpoint", () => {
    expect(DEFAULT_AUTO_LLM_ENDPOINTS).toEqual(["/api/avaloka-v2"]);
  });

  it("initializes non-crisis debug state without scheduling old shadow mode", () => {
    expect(createInitialLlmDebugState(false)).toEqual({
      orchestratorV2: { status: "loading" },
      baifa: { status: "loading" },
    });
  });

  it("skips Baifa debug state for local crisis messages", () => {
    expect(createInitialLlmDebugState(true)).toEqual({
      orchestratorV2: { status: "loading" },
      baifa: { status: "skipped", error: "Crisis messages do not run Baifa mapper." },
    });
  });

  it("keeps the local text when V2 is not ready", () => {
    const message: ChatMessage = {
      id: "avaloka-1",
      role: "avaloka",
      text: "local baseline",
      createdAt: "2026-05-19T00:00:00.000Z",
      responseSource: "local",
      orchestratorV2: { status: "loading" },
    };

    const next = applyAvalokaV2Result(message, {
      status: "error",
      error: "Shadow server unavailable.",
    });

    expect(next.text).toBe("local baseline");
    expect(next.responseSource).toBe("local");
    expect(next.orchestratorV2).toEqual({
      status: "error",
      error: "Shadow server unavailable.",
    });
  });

  it("derives the Baifa debug panel from the V2 orchestrator result", () => {
    const message: ChatMessage = {
      id: "avaloka-1",
      role: "avaloka",
      text: "local baseline",
      createdAt: "2026-05-19T00:00:00.000Z",
      responseSource: "local",
      orchestratorV2: { status: "loading" },
      baifa: { status: "loading" },
    };

    const next = applyAvalokaV2Result(message, {
      status: "ready",
      candidateText: "v2 response",
      responseSource: "llm_orchestrator_v2",
      model: "gpt-5.2",
      latencyMs: 1200,
      baifa: {
        primaryMindStates: [
          {
            baifaCategory: "烦恼心所",
            mindState: "疑",
            confidence: 0.86,
            evidence: "反复怀疑自己是否有罪。",
          },
        ],
        wholesomeAntidotes: ["信"],
        recommendedResponseMoves: ["protect_from_self_blame"],
        doNotDo: ["karma_blame"],
      },
    });

    expect(next.text).toBe("v2 response");
    expect(next.responseSource).toBe("llm_orchestrator_v2");
    expect(next.baifa).toEqual({
      status: "ready",
      model: "gpt-5.2",
      latencyMs: 1200,
      baifa: {
        primaryMindStates: [
          {
            baifaCategory: "烦恼心所",
            mindState: "疑",
            confidence: 0.86,
            evidence: "反复怀疑自己是否有罪。",
          },
        ],
        wholesomeAntidotes: ["信"],
        recommendedResponseMoves: ["protect_from_self_blame"],
        doNotDo: ["karma_blame"],
      },
    });
    expect(next.shadow).toBeUndefined();
  });

  it("attaches redacted memory claim grounding diagnostics without changing visible V2 text", () => {
    const message: ChatMessage = {
      id: "avaloka-1",
      role: "avaloka",
      text: "local baseline",
      createdAt: "2026-05-19T00:00:00.000Z",
      responseSource: "local",
      orchestratorV2: { status: "loading" },
    };

    const next = applyAvalokaV2Result(message, {
      status: "ready",
      candidateText: "我记得你偏好短一点、身体落地的回应，所以我们先回到脚和呼吸。",
      responseSource: "llm_orchestrator_v2",
      retrievedCareFacts: [
        {
          memoryId: "tone-short-body",
          kind: "tone_preference",
          text: "User prefers short body-grounded responses over long analysis.",
          confidence: 0.92,
          tags: ["tone", "body_grounding"],
        },
      ],
    });

    expect(next.text).toBe("我记得你偏好短一点、身体落地的回应，所以我们先回到脚和呼吸。");
    expect(next.orchestratorV2?.memoryClaimGrounding).toMatchObject({
      version: "memory_claim_grounding_v0",
      verdict: "pass",
      claims: [
        {
          status: "supported",
          supportingMemoryIds: ["tone-short-body"],
          reason: "matched_retrieved_fact",
        },
      ],
    });

    const serialized = JSON.stringify(next.orchestratorV2?.memoryClaimGrounding);
    expect(serialized).not.toContain("我记得你偏好");
    expect(serialized).not.toContain("User prefers short body-grounded responses");
  });

  it("falls back to the local baseline when V2 contains unsupported memory claims", () => {
    const message: ChatMessage = {
      id: "avaloka-1",
      role: "avaloka",
      text: "local baseline",
      createdAt: "2026-05-19T00:00:00.000Z",
      responseSource: "local",
      orchestratorV2: { status: "loading" },
    };

    const next = applyAvalokaV2Result(message, {
      status: "ready",
      candidateText: "我记得你之前说复查让你很害怕。",
      responseSource: "llm_orchestrator_v2",
      retrievedCareFacts: [],
    });

    expect(next.text).toBe("local baseline");
    expect(next.responseSource).toBe("local_claim_grounding_fallback");
    expect(next.orchestratorV2?.memoryClaimGrounding).toMatchObject({
      verdict: "warn",
      claims: [{ status: "unsupported", supportingMemoryIds: [] }],
    });
    expect(next.orchestratorV2?.candidateText).toBe("我记得你之前说复查让你很害怕。");
  });

  it("uses V2 text when the candidate has no memory claims", () => {
    const message: ChatMessage = {
      id: "avaloka-1",
      role: "avaloka",
      text: "local baseline",
      createdAt: "2026-05-19T00:00:00.000Z",
      responseSource: "local",
      orchestratorV2: { status: "loading" },
    };

    const next = applyAvalokaV2Result(message, {
      status: "ready",
      candidateText: "我们先把脚踩在地上，慢慢呼一口气。",
      responseSource: "llm_orchestrator_v2",
      retrievedCareFacts: [],
    });

    expect(next.text).toBe("我们先把脚踩在地上，慢慢呼一口气。");
    expect(next.responseSource).toBe("llm_orchestrator_v2");
    expect(next.orchestratorV2?.memoryClaimGrounding).toMatchObject({
      verdict: "pass",
      claims: [],
    });
  });
});
