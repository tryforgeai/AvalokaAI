import { describe, expect, it } from "vitest";
import { buildGuardedResponse, preceptsFallback } from "./guardedResponse";

describe("buildGuardedResponse", () => {
  it("returns the original response when it passes the precepts guardian", () => {
    const result = buildGuardedResponse([
      "这句话很重，像是你把孤独都压回自己身上了。",
      "今晚先不要用“活该”两个字打自己。",
      "把手放在腹部，慢慢呼一口气。",
    ]);

    expect(result.text).toContain("今晚先不要用“活该”两个字打自己。");
    expect(result.precepts?.passed).toBe(true);
    expect(result.guardianFallback).toBe(false);
  });

  it("replaces unsafe non-crisis responses with the precepts fallback", () => {
    const result = buildGuardedResponse(["这是你的业障，也是报应。"]);

    expect(result.text).toBe(preceptsFallback.join("\n\n"));
    expect(result.guardianFallback).toBe(true);
    expect(result.precepts?.passed).toBe(false);
    expect(result.precepts?.severity).toBe("block");
  });

  it("does not run the normal precepts fallback over crisis responses", () => {
    const result = buildGuardedResponse(["请现在联系一个真实的人，让一个人知道你现在不安全。"], {
      crisis: true,
    });

    expect(result.text).toContain("请现在联系一个真实的人");
    expect(result.precepts).toBeUndefined();
    expect(result.guardianFallback).toBe(false);
  });
});
