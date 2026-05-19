import { describe, expect, it } from "vitest";
import { isCrisisMessage } from "./crisisGate";
import { mapDukkha } from "./dukkhaMapper";
import { buildDukkhaResponse } from "./dukkhaResponse";
import { buildGuardedResponse } from "./guardedResponse";
import { selectScenario } from "./responseSelector";

const smokeCases = [
  {
    input: "为什么是我？我是不是做错了什么才会这样？",
    expectedMoves: ["reject_punishment_frame", "conditions_not_blame", "depersonalize_pain"],
  },
  {
    input: "我是不是这辈子就这样了？是不是我自己活该？",
    expectedMoves: ["reject_punishment_frame", "soften_permanence_story"],
  },
  {
    input: "没有孩子这件事说明我人生交了白卷，我没法不这么想。",
    expectedMoves: ["soften_craving", "event_vs_meaning"],
  },
  {
    input: "我年轻时选择丁克，现在是不是老天在惩罚我？",
    expectedMoves: ["reject_punishment_frame", "depersonalize_pain"],
  },
  {
    input: "今天照镜子突然觉得自己老了很多，心里很难受。",
    expectedMoves: ["soften_aversion", "soften_permanence_story"],
  },
  {
    input: "我最近记性变差，老是忘东西，我很怕自己真的老了。",
    expectedMoves: ["soften_aversion"],
  },
  {
    input: "孩子都走了，我好像已经不是一个有用的人了。",
    expectedMoves: ["role_not_whole_self", "protect_self_worth"],
  },
  {
    input: "孩子离家以后，家里安静得可怕，我不知道自己还有什么位置。",
    expectedMoves: ["role_not_whole_self", "honor_past_utility"],
  },
  {
    input: "我越想让自己平静越烦，我是不是连冥想都不会？",
    expectedMoves: ["remove_practice_pressure", "enough_for_now"],
  },
  {
    input: "我想让自己安静下来，可越努力越乱，我是不是做不好？",
    expectedMoves: ["remove_practice_pressure", "sensory_anchor"],
  },
  {
    input: "我知道这只是小事，可我胸口很紧，觉得像要完了。",
    expectedMoves: ["name_body_alarm", "first_arrow_second_arrow"],
  },
  {
    input: "体检报告有个指标不正常，我一直在想最坏的结果。",
    expectedMoves: ["medical_boundary", "separate_event_from_story"],
  },
  {
    input: "半夜身体突然痛，我一直上网搜，越搜越怕。",
    expectedMoves: ["medical_boundary", "separate_event_from_story"],
  },
  {
    input: "我为这个家付出几十年，现在孩子走了，我是不是白活了？",
    expectedMoves: ["role_not_whole_self", "honor_past_utility", "no_forced_letting_go"],
  },
  {
    input: "退休以后我不知道自己是谁，感觉努力一辈子都没意义。",
    expectedMoves: ["event_vs_meaning", "separate_event_from_story"],
  },
  {
    input: "我不想麻烦孩子，可我今晚真的觉得自己和世界断开了。",
    expectedMoves: ["restore_small_connection", "encourage_human_support"],
  },
  {
    input: "我是不是因为以前太自私，现在生病是在还债？",
    expectedMoves: ["reject_punishment_frame", "depersonalize_pain"],
  },
  {
    input: "我没有人可以说，房子里安静得让我害怕。",
    expectedMoves: ["restore_small_connection"],
  },
  {
    input: "我怕自己老了以后没人照顾，一想到这里就睡不着。",
    expectedMoves: ["soften_aversion"],
  },
  {
    input: "我现在只是很难受，你不要跟我讲佛法和大道理。",
    expectedMoves: ["sensory_anchor"],
  },
];

describe("Avaloka smoke coverage", () => {
  it("settles 20 low-moment examples without crisis false positives or guardian fallback", () => {
    for (const testCase of smokeCases) {
      const crisis = isCrisisMessage(testCase.input);
      const dukkha = mapDukkha(testCase.input);
      const dukkhaResponse = buildDukkhaResponse(dukkha);
      const scenario = selectScenario(testCase.input);
      const responseLines = dukkhaResponse || scenario.response;
      const guarded = buildGuardedResponse(responseLines, { crisis });

      expect(crisis, testCase.input).toBe(false);
      expect(dukkha.responseMoves, testCase.input).toEqual(expect.arrayContaining(testCase.expectedMoves));
      expect(guarded.guardianFallback, testCase.input).toBe(false);
      expect(guarded.text.trim().length, testCase.input).toBeGreaterThan(20);
      expect(guarded.text, testCase.input).not.toMatch(/业障|报应|前世|放下就好|想太多|太敏感/);
    }
  });
});
