import { describe, expect, it } from "vitest";
import { buildPrimaryDevResponse } from "./primaryResponse";

describe("buildPrimaryDevResponse", () => {
  it("uses a safe OpenAI candidate as the user-visible response and keeps local baseline", () => {
    const result = buildPrimaryDevResponse({
      localText: "我不会把你的痛苦解释成惩罚。",
      openaiCandidateText:
        "不，我不会把你的痛苦说成“报应”。你已经很难受了，先别急着给自己定罪。把脚踩稳，慢慢呼一口气。",
      openaiModel: "gpt-5.2",
      openaiLatencyMs: 1234,
    });

    expect(result.text).toContain("不，我不会把你的痛苦说成");
    expect(result.responseSource).toBe("openai_primary_dev");
    expect(result.localBaselineText).toBe("我不会把你的痛苦解释成惩罚。");
    expect(result.openaiPrimary).toMatchObject({
      status: "ready",
      model: "gpt-5.2",
      guardianFallback: false,
      preceptsSeverity: "pass",
    });
  });

  it("falls back to the local baseline when the OpenAI candidate violates guardian rules", () => {
    const result = buildPrimaryDevResponse({
      localText: "我不会把你的痛苦解释成惩罚。",
      openaiCandidateText: "这是你的业障和报应。",
      openaiModel: "gpt-5.2",
    });

    expect(result.text).toBe("我不会把你的痛苦解释成惩罚。");
    expect(result.responseSource).toBe("local_guardian_fallback");
    expect(result.openaiPrimary?.guardianFallback).toBe(true);
    expect(result.openaiPrimary?.preceptsSeverity).toBe("block");
  });
});
