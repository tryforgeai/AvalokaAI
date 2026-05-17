import { describe, expect, it } from "vitest";
import {
  afflictionAntidoteMap,
  mindStateExamples,
  rootAfflictions,
  wholesomeFactors,
} from "./mindStateMap";

describe("mindStateMap", () => {
  it("covers the six root afflictions used by the Baifa mapper", () => {
    expect(rootAfflictions.map((item) => item.id)).toEqual([
      "greed_attachment",
      "aversion_anger",
      "conceit_comparison",
      "ignorance_confusion",
      "doubt_uncertainty",
      "wrong_view_distortion",
    ]);
  });

  it("covers the eleven wholesome factors available as Avaloka response resources", () => {
    expect(wholesomeFactors).toHaveLength(11);
  });

  it("maps self-punishing wrong view to non-harm and clear seeing", () => {
    const wrongView = afflictionAntidoteMap.find((item) => item.afflictionId === "wrong_view_distortion");

    expect(wrongView?.antidoteIds).toEqual(expect.arrayContaining(["non_harm", "non_delusion", "equanimous_balance"]));
    expect(wrongView?.mustNot).toContain("confirm_karma_blame");
  });

  it("keeps example mappings evaluable with required fields", () => {
    const dinkRegret = mindStateExamples.find((item) => item.id === "baifa_example_childlessness_regret");

    expect(dinkRegret?.expectedRootAfflictions).toEqual(expect.arrayContaining(["doubt_uncertainty", "wrong_view_distortion"]));
    expect(dinkRegret?.mustDo).toContain("do_not_confirm_punishment_story");
    expect(dinkRegret?.responseStrategy).toContain("不确认");
  });
});
