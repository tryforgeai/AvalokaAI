import { afterEach, describe, expect, it, vi } from "vitest";
import { requestLlmShadow } from "./shadowClient";

describe("requestLlmShadow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a ready shadow result from the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          candidateText: "先不讲道理。",
          model: "gpt-5.2",
          guardianFallback: false,
          preceptsSeverity: "pass",
          preceptsViolations: [],
        }),
      })),
    );

    const result = await requestLlmShadow({
      userText: "我很乱。",
      localText: "先不讲道理。",
      responseMoves: ["sensory_anchor"],
    });

    expect(result).toMatchObject({
      status: "ready",
      candidateText: "先不讲道理。",
      model: "gpt-5.2",
      guardianFallback: false,
      preceptsSeverity: "pass",
    });
  });

  it("returns an error shadow result when the API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => ({ error: "OpenAI key missing" }),
      })),
    );

    const result = await requestLlmShadow({
      userText: "我很乱。",
      localText: "先不讲道理。",
    });

    expect(result).toMatchObject({
      status: "error",
      error: "OpenAI key missing",
    });
  });
});

