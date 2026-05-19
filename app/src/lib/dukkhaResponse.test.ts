import { describe, expect, it } from "vitest";
import { responseVariants } from "../data/responseVariants";
import { buildDukkhaResponse } from "./dukkhaResponse";

describe("buildDukkhaResponse", () => {
  it("uses a depersonalizing response for why-me punishment stories", () => {
    const response = buildDukkhaResponse({
      dukkhaTypes: ["story_added_suffering"],
      patterns: ["ignorance"],
      responseMoves: ["reject_punishment_frame", "depersonalize_pain", "protect_from_self_blame"],
    });

    const text = response?.join("\n") || "";

    expect(text).toContain("多背一层自责");
    expect(text).toContain("不需要再责怪自己");
    expect(text).not.toMatch(/罪名|我的罪|报应|业障/);
  });

  it("returns undefined when there is no meaningful dukkha signal", () => {
    expect(
      buildDukkhaResponse({
        dukkhaTypes: [],
        patterns: [],
        responseMoves: ["return_to_now"],
      }),
    ).toBeUndefined();
  });

  it("uses a role-not-whole-self response for usefulness collapse", () => {
    const response = buildDukkhaResponse({
      dukkhaTypes: ["suffering_of_change", "story_added_suffering"],
      patterns: ["aversion", "ignorance"],
      responseMoves: ["role_not_whole_self", "protect_self_worth", "return_to_now"],
    });

    expect(response?.join("\n")).toMatch(/不等于你整个人就没有价值|不代表你也空/);
  });

  it("uses a remove-practice-pressure response when calm becomes a task", () => {
    const response = buildDukkhaResponse({
      dukkhaTypes: ["story_added_suffering"],
      patterns: ["aversion", "ignorance"],
      responseMoves: ["remove_practice_pressure", "enough_for_now", "return_to_now"],
    });

    expect(response?.join("\n")).toContain("不用证明自己做得对");
  });

  it("can produce different response shapes instead of always using three parts", () => {
    const lineCounts = Object.values(responseVariants)
      .flatMap((variants) => variants || [])
      .map((variant) => variant.length);

    expect(new Set(lineCounts).size).toBeGreaterThan(1);
    expect(lineCounts).toContain(2);
  });
});
