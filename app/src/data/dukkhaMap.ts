export type DukkhaType = "suffering_of_pain" | "suffering_of_change" | "story_added_suffering";

export type DukkhaPattern = "craving" | "aversion" | "ignorance";

export type ResponseMove =
  | "depersonalize_pain"
  | "conditions_not_blame"
  | "soften_permanence_story"
  | "reject_punishment_frame"
  | "separate_event_from_story"
  | "event_vs_meaning"
  | "soften_craving"
  | "soften_aversion"
  | "name_body_alarm"
  | "first_arrow_second_arrow"
  | "sensory_anchor"
  | "medical_boundary"
  | "role_not_whole_self"
  | "protect_self_worth"
  | "restore_small_connection"
  | "encourage_human_support"
  | "honor_past_utility"
  | "no_forced_letting_go"
  | "remove_practice_pressure"
  | "enough_for_now"
  | "return_to_now"
  | "protect_from_self_blame";

export interface DukkhaRule {
  id: string;
  keywords: string[];
  dukkhaTypes: DukkhaType[];
  patterns: DukkhaPattern[];
  responseMoves: ResponseMove[];
}

export const dukkhaRules: DukkhaRule[] = [
  {
    id: "why_me_punishment_story",
    keywords: ["为什么是我", "做错了什么", "活该", "报应", "惩罚", "还债", "太自私", "老天", "业障"],
    dukkhaTypes: ["story_added_suffering"],
    patterns: ["ignorance"],
    responseMoves: [
      "reject_punishment_frame",
      "conditions_not_blame",
      "depersonalize_pain",
      "protect_from_self_blame",
    ],
  },
  {
    id: "childlessness_counterfactual",
    keywords: ["如果我当年", "生了孩子", "没有孩子", "丁克", "无子"],
    dukkhaTypes: ["suffering_of_change", "story_added_suffering"],
    patterns: ["craving"],
    responseMoves: ["soften_craving", "event_vs_meaning", "return_to_now"],
  },
  {
    id: "aging_aversion",
    keywords: ["不能接受", "老了", "没用", "变老", "衰老", "更年期", "没有价值", "没价值"],
    dukkhaTypes: ["suffering_of_change", "story_added_suffering"],
    patterns: ["aversion", "ignorance"],
    responseMoves: ["soften_aversion", "soften_permanence_story", "separate_event_from_story"],
  },
  {
    id: "body_pain_catastrophe",
    keywords: ["身体", "疼", "痛", "完了", "没人管", "复查", "体检", "病", "胸口", "呼吸", "指标"],
    dukkhaTypes: ["suffering_of_pain", "story_added_suffering"],
    patterns: ["aversion", "ignorance"],
    responseMoves: ["name_body_alarm", "medical_boundary", "separate_event_from_story", "return_to_now"],
  },
  {
    id: "meaning_life_verdict",
    keywords: ["一生", "交了白卷", "没意义", "失败", "什么都没有意义", "白活", "这辈子就这样", "永远", "没救"],
    dukkhaTypes: ["story_added_suffering"],
    patterns: ["ignorance", "aversion"],
    responseMoves: ["event_vs_meaning", "soften_permanence_story", "separate_event_from_story", "return_to_now"],
  },
  {
    id: "role_loss_worth",
    keywords: [
      "孩子都走了",
      "孩子走了",
      "孩子离家",
      "没有什么位置",
      "还有什么位置",
      "不是一个有用的人",
      "有用的人",
      "没有价值",
      "没价值",
      "空巢",
    ],
    dukkhaTypes: ["suffering_of_change", "story_added_suffering"],
    patterns: ["aversion", "ignorance"],
    responseMoves: ["role_not_whole_self", "protect_self_worth", "honor_past_utility", "return_to_now"],
  },
  {
    id: "practice_pressure",
    keywords: ["平静", "越来越烦", "越想越不会", "冥想都不会", "连冥想都不会", "自己太差", "做不好"],
    dukkhaTypes: ["story_added_suffering"],
    patterns: ["aversion", "ignorance"],
    responseMoves: ["remove_practice_pressure", "enough_for_now", "return_to_now"],
  },
  {
    id: "mind_racing_no_lecture",
    keywords: [
      "脑子停不下来",
      "别给我讲道理",
      "不要讲道理",
      "不要跟我讲",
      "不要讲佛法",
      "大道理",
      "越努力越乱",
      "很乱",
      "反复想",
    ],
    dukkhaTypes: ["story_added_suffering"],
    patterns: ["aversion"],
    responseMoves: ["sensory_anchor", "return_to_now"],
  },
  {
    id: "threat_alarm_second_arrow",
    keywords: ["只是小事", "胸口很紧", "像要完了", "反应这么大", "控制不住", "太脆弱"],
    dukkhaTypes: ["suffering_of_pain", "story_added_suffering"],
    patterns: ["aversion", "ignorance"],
    responseMoves: ["name_body_alarm", "first_arrow_second_arrow", "return_to_now"],
  },
  {
    id: "lonely_disconnection",
    keywords: ["世界断开", "没有人可以说", "不想麻烦孩子", "房子里安静", "没人知道", "孤零零"],
    dukkhaTypes: ["story_added_suffering"],
    patterns: ["aversion"],
    responseMoves: ["restore_small_connection", "encourage_human_support", "return_to_now"],
  },
  {
    id: "past_effort_regret",
    keywords: ["付出几十年", "白活", "过去都白费", "浪费了一生", "背了太久", "放不下"],
    dukkhaTypes: ["suffering_of_change", "story_added_suffering"],
    patterns: ["craving", "aversion", "ignorance"],
    responseMoves: ["honor_past_utility", "no_forced_letting_go", "return_to_now"],
  },
];

export const defaultDukkhaMoves: ResponseMove[] = ["return_to_now"];
