import { describe, expect, it } from "vitest";
import { isDeveloperMode } from "./uiMode";

describe("isDeveloperMode", () => {
  it("enables developer panels only from an explicit URL flag", () => {
    expect(isDeveloperMode("?dev=1")).toBe(true);
    expect(isDeveloperMode("?mode=dev")).toBe(true);
    expect(isDeveloperMode("")).toBe(false);
    expect(isDeveloperMode("?dev=0")).toBe(false);
  });
});
