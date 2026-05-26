import { describe, expect, it, vi } from "vitest";
import { requestSageMemoryWriter } from "./sageMemoryClient";

describe("requestSageMemoryWriter", () => {
  it("returns a ready SAGE memory writer result", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => ({
      ok: true,
      json: async () => ({
        status: "ready",
        model: "gpt-5.2",
        latencyMs: 840,
        candidates: [
          {
            id: "memory-1",
            kind: "helpful_response_move",
            text: "User settles when the response rejects punishment framing first.",
            confidence: 0.88,
            evidenceIds: ["user-1", "avaloka-1"],
            tags: ["self_blame"],
          },
        ],
        guardian: [{ candidateId: "memory-1", status: "allow", reasons: [] }],
      }),
    }) as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestSageMemoryWriter({
      turn: {
        userMessageId: "user-1",
        avalokaMessageId: "avaloka-1",
        userText: "我是不是因为以前太自私，现在生病是在还债？",
        avalokaText: "我不会把你的痛苦解释成惩罚。",
      },
      feedback: {
        id: "feedback-1",
        messageId: "avaloka-1",
        createdAt: "2026-05-26T12:00:00.000Z",
        realLowMoment: "no",
        openedUnprompted: "yes",
        settlingScore: 5,
        mostHelpfulLine: "不解释成惩罚",
        failedLine: "",
        wantsTomorrow: "yes",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/sage-memory-writer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.any(String),
    });
    const requestInit = fetchMock.mock.calls[0]?.[1];
    expect(requestInit).toBeDefined();
    if (!requestInit) throw new Error("Expected SAGE writer request init.");
    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      turn: {
        userMessageId: "user-1",
        avalokaMessageId: "avaloka-1",
      },
      feedback: {
        id: "feedback-1",
        settlingScore: 5,
      },
    });
    expect(result).toMatchObject({
      status: "ready",
      model: "gpt-5.2",
      latencyMs: 840,
      candidates: [
        {
          id: "memory-1",
          kind: "helpful_response_move",
          confidence: 0.88,
        },
      ],
      guardian: [{ candidateId: "memory-1", status: "allow", reasons: [] }],
    });
  });

  it("returns an error result when the writer endpoint fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => ({ error: "SAGE writer unavailable." }),
      })),
    );

    const result = await requestSageMemoryWriter({
      turn: {
        userMessageId: "user-1",
        avalokaMessageId: "avaloka-1",
        userText: "我现在很乱。",
        avalokaText: "先把脚踩在地上。",
      },
    });

    expect(result.status).toBe("error");
    expect(result.error).toBe("SAGE writer unavailable.");
    expect(result.candidates).toEqual([]);
    expect(result.guardian).toEqual([]);
  });

  it("returns an error result when the browser cannot reach the writer endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Failed to fetch");
      }),
    );

    const result = await requestSageMemoryWriter({
      turn: {
        userMessageId: "user-1",
        avalokaMessageId: "avaloka-1",
        userText: "我现在很乱。",
        avalokaText: "先把脚踩在地上。",
      },
    });

    expect(result.status).toBe("error");
    expect(result.error).toBe("Failed to fetch");
    expect(result.candidates).toEqual([]);
    expect(result.guardian).toEqual([]);
  });
});
