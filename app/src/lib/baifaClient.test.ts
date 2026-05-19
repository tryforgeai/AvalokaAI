import { afterEach, describe, expect, it, vi } from "vitest";
import { requestBaifaMap } from "./baifaClient";

describe("requestBaifaMap", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a ready Baifa mapping from the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          baifa: {
            primaryMindStates: [
              {
                baifaCategory: "烦恼心所",
                mindState: "不正见",
                confidence: 0.86,
                evidence: "用户把生病解释成还债。",
              },
            ],
            wholesomeAntidotes: ["无痴", "不害", "行舍"],
            recommendedResponseMoves: ["reject_punishment_frame", "protect_from_self_blame"],
            doNotDo: ["不要确认还债/报应框架"],
          },
          model: "gpt-5.2",
        }),
      })),
    );

    const result = await requestBaifaMap({
      userText: "我是不是因为以前太自私，现在生病是在还债？",
      dukkhaTypes: ["story_added_suffering"],
      dukkhaPatterns: ["ignorance"],
      responseMoves: ["reject_punishment_frame"],
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/baifa-map",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result).toMatchObject({
      status: "ready",
      model: "gpt-5.2",
      baifa: {
        primaryMindStates: [
          {
            mindState: "不正见",
            confidence: 0.86,
          },
        ],
        recommendedResponseMoves: ["reject_punishment_frame", "protect_from_self_blame"],
      },
    });
  });

  it("returns an error result when Baifa mapping fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => ({ error: "OpenAI key missing" }),
      })),
    );

    const result = await requestBaifaMap({
      userText: "我很乱。",
    });

    expect(result).toMatchObject({
      status: "error",
      error: "OpenAI key missing",
    });
  });
});
