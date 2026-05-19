import { describe, expect, it } from "vitest";
import dukkhaCases from "../../../evals/dukkha-cases.json";
import { mapDukkha } from "./dukkhaMapper";

describe("mapDukkha", () => {
  it("matches the shared dukkha eval cases", () => {
    for (const testCase of dukkhaCases) {
      const result = mapDukkha(testCase.user_input);

      expect(result.dukkhaTypes, testCase.id).toEqual(expect.arrayContaining(testCase.expected_dukkha_types));
      expect(result.patterns, testCase.id).toEqual(expect.arrayContaining(testCase.expected_patterns));
      expect(result.responseMoves, testCase.id).toEqual(expect.arrayContaining(testCase.expected_response_moves));
    }
  });

  it("returns a low-intensity default for empty input", () => {
    expect(mapDukkha("")).toEqual({
      dukkhaTypes: [],
      patterns: [],
      responseMoves: ["return_to_now"],
    });
  });

  it("maps role loss and usefulness collapse after children leave", () => {
    const result = mapDukkha("孩子都走了，我好像已经不是一个有用的人了。");

    expect(result.dukkhaTypes).toEqual(expect.arrayContaining(["suffering_of_change", "story_added_suffering"]));
    expect(result.patterns).toEqual(expect.arrayContaining(["aversion", "ignorance"]));
    expect(result.responseMoves).toEqual(expect.arrayContaining(["role_not_whole_self", "protect_self_worth"]));
  });

  it("maps pressure to become calm as practice pressure", () => {
    const result = mapDukkha("我越想让自己平静越烦，我是不是连冥想都不会？");

    expect(result.dukkhaTypes).toEqual(expect.arrayContaining(["story_added_suffering"]));
    expect(result.patterns).toEqual(expect.arrayContaining(["aversion", "ignorance"]));
    expect(result.responseMoves).toEqual(expect.arrayContaining(["remove_practice_pressure", "enough_for_now"]));
  });
});
