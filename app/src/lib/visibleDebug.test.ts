import { describe, expect, it } from "vitest";
import { getVisibleBaifaResult } from "./visibleDebug";
import type { ChatMessage } from "../types";

describe("getVisibleBaifaResult", () => {
  it("returns undefined when there is no latest message", () => {
    expect(getVisibleBaifaResult()).toBeUndefined();
  });

  it("returns the stored Baifa result for non-crisis messages", () => {
    const message: ChatMessage = {
      id: "avaloka-2",
      role: "avaloka",
      text: "先稳住。",
      createdAt: "2026-05-18T21:22:00.000Z",
      crisis: false,
      baifa: {
        status: "ready",
        model: "gpt-5.2",
      },
    };

    expect(getVisibleBaifaResult(message)).toBe(message.baifa);
  });

  it("forces Baifa mapper to skipped for crisis messages even if stale ready data exists", () => {
    const message: ChatMessage = {
      id: "avaloka-1",
      role: "avaloka",
      text: "我在。",
      createdAt: "2026-05-18T21:20:00.000Z",
      crisis: true,
      baifa: {
        status: "ready",
        model: "gpt-5.2",
        baifa: {
          primaryMindStates: [
            {
              baifaCategory: "烦恼心所",
              mindState: "疑",
              confidence: 0.56,
              evidence: "stale debug data",
            },
          ],
          wholesomeAntidotes: ["信"],
          recommendedResponseMoves: ["return_to_now"],
          doNotDo: [],
        },
      },
    };

    expect(getVisibleBaifaResult(message)).toEqual({
      status: "skipped",
      error: "Crisis messages do not run Baifa mapper.",
    });
  });
});
