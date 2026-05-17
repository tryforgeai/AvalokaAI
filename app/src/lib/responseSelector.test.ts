import { describe, expect, it } from "vitest";
import { responseLibrary } from "../data/responseLibrary";
import { isCrisisMessage } from "./crisisGate";
import { selectScenario } from "./responseSelector";

describe("selectScenario", () => {
  it("keeps the V1 app library in sync with the 31 documented scenarios", () => {
    expect(responseLibrary).toHaveLength(31);
  });

  it("routes mirror-aging language to C1 instead of childlessness regret", () => {
    expect(selectScenario("今天照镜子突然觉得自己老了很多，心里很难受。").id).toBe("C1");
  });

  it("routes memory-aging language to C2", () => {
    expect(selectScenario("我最近记性变差，老是忘东西，我很怕自己真的老了。").id).toBe("C2");
  });

  it("routes menopause and body-change language to C3", () => {
    expect(selectScenario("更年期以后身体变得很陌生，我有点不认识自己了。").id).toBe("C3");
  });

  it("routes childlessness regret to E4 without stealing generic aging inputs", () => {
    expect(selectScenario("我觉得当年选择不要孩子是不是我自己的错，现在才这么孤单。").id).toBe("E4");
  });

  it("routes vague future meaning fear to F4", () => {
    expect(selectScenario("我突然觉得下半辈子是不是都这样了，心里很空。").id).toBe("F4");
  });
});

describe("isCrisisMessage", () => {
  it("catches ambiguous danger language", () => {
    expect(isCrisisMessage("我撑不下去了，想消失。")).toBe(true);
  });
});
