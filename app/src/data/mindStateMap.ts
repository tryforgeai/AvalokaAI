export type RootAfflictionId =
  | "greed_attachment"
  | "aversion_anger"
  | "conceit_comparison"
  | "ignorance_confusion"
  | "doubt_uncertainty"
  | "wrong_view_distortion";

export type WholesomeFactorId =
  | "trust_confidence"
  | "steady_effort"
  | "self_respect"
  | "relational_conscience"
  | "non_attachment"
  | "non_aversion"
  | "non_delusion"
  | "light_ease"
  | "careful_non_drifting"
  | "equanimous_balance"
  | "non_harm";

export interface MindFactorDefinition {
  id: string;
  zhName: string;
  avalokaUse: string;
  userSignals: string[];
  userVisibleTranslation: string;
}

export interface AfflictionAntidoteMapping {
  afflictionId: RootAfflictionId;
  blockedWholesomeIds: WholesomeFactorId[];
  antidoteIds: WholesomeFactorId[];
  responseStrategy: string;
  mustNot: string[];
}

export interface MindStateExample {
  id: string;
  input: string;
  surfaceScene: string;
  expectedRootAfflictions: RootAfflictionId[];
  expectedAntidotes: WholesomeFactorId[];
  responseStrategy: string;
  mustDo: string[];
  mustNot: string[];
}

export const universalFactors: MindFactorDefinition[] = [
  {
    id: "attention_turning",
    zhName: "作意",
    avalokaUse: "识别用户的注意力被哪个身体感受、记忆、关系或恐惧抓住。",
    userSignals: ["一直想", "脑子停不下来", "总是想到"],
    userVisibleTranslation: "今晚这件事一直在你心里转。",
  },
  {
    id: "contact_trigger",
    zhName: "触",
    avalokaUse: "识别触发低谷的外境或身体信号。",
    userSignals: ["看到", "听到", "体检", "疼", "收到消息"],
    userVisibleTranslation: "这一下把你的心撞到了。",
  },
  {
    id: "felt_tone",
    zhName: "受",
    avalokaUse: "承接用户当下的苦受、空受、惊受或委屈感。",
    userSignals: ["难受", "空", "怕", "委屈", "堵"],
    userVisibleTranslation: "这一刻是真的难受。",
  },
  {
    id: "meaning_making",
    zhName: "想",
    avalokaUse: "识别用户给痛苦贴上的解释，例如失败、活该、报应或没用。",
    userSignals: ["是不是", "一定是", "我就是", "活该", "没用"],
    userVisibleTranslation: "这个念头把你说得太重了。",
  },
  {
    id: "impulse_action",
    zhName: "思",
    avalokaUse: "识别用户被推动去搜索、追问、责备、逃避或行动。",
    userSignals: ["想马上", "忍不住", "一直搜", "想问清楚"],
    userVisibleTranslation: "先不急着处理它。",
  },
];

export const rootAfflictions: MindFactorDefinition[] = [
  {
    id: "greed_attachment",
    zhName: "贪",
    avalokaUse: "识别对某个结果、身份、人生版本、关系回应或确定答案的抓取。",
    userSignals: ["如果当年", "非要", "舍不得", "一定要有答案"],
    userVisibleTranslation: "你很想抓住一个确定的答案，这很能理解。",
  },
  {
    id: "aversion_anger",
    zhName: "瞋",
    avalokaUse: "识别对痛苦、身体、他人、命运或现实的强烈抗拒和怨。",
    userSignals: ["恨", "受不了", "为什么偏偏是我", "想让他也难受"],
    userVisibleTranslation: "这股气很热，先不要让它推着你行动。",
  },
  {
    id: "conceit_comparison",
    zhName: "慢",
    avalokaUse: "识别比较、自我位置、输赢感，以及身份落差带来的痛。",
    userSignals: ["我以前不是这样", "我输了", "别人都有", "我像废人"],
    userVisibleTranslation: "你以前的位置很清楚，现在突然失重了。",
  },
  {
    id: "ignorance_confusion",
    zhName: "无明",
    avalokaUse: "识别被恐惧、旧认知或单一解释遮住，看不见更多条件。",
    userSignals: ["看不清", "一片黑", "不知道为什么", "肯定完了"],
    userVisibleTranslation: "这件事可能不只一种解释。",
  },
  {
    id: "doubt_uncertainty",
    zhName: "疑",
    avalokaUse: "识别反复怀疑、不敢确定、想要终极答案的状态。",
    userSignals: ["到底是不是", "会不会", "有没有希望", "是不是错了"],
    userVisibleTranslation: "你现在很难确定，所以脑子一直在反复问。",
  },
  {
    id: "wrong_view_distortion",
    zhName: "不正见",
    avalokaUse: "识别把痛苦解释成活该、报应、命定失败或道德惩罚的叙事。",
    userSignals: ["活该", "报应", "老天惩罚", "这一生就是失败"],
    userVisibleTranslation: "这个解释太像在惩罚你自己了，我们先不跟着它走。",
  },
];

export const wholesomeFactors: MindFactorDefinition[] = [
  {
    id: "trust_confidence",
    zhName: "信",
    avalokaUse: "给用户一点可依靠感，不要求宗教信念。",
    userSignals: ["谁都帮不了", "没有人懂"],
    userVisibleTranslation: "这一刻不用靠你一个人扛到底。",
  },
  {
    id: "steady_effort",
    zhName: "精进",
    avalokaUse: "给极小可行动作，不催促进步。",
    userSignals: ["什么都不想做", "动不了"],
    userVisibleTranslation: "只做这一件很小的事就够。",
  },
  {
    id: "self_respect",
    zhName: "惭",
    avalokaUse: "保留健康的自我尊重，不转成羞耻。",
    userSignals: ["很丢脸", "我不配"],
    userVisibleTranslation: "你仍然值得被好好对待。",
  },
  {
    id: "relational_conscience",
    zhName: "愧",
    avalokaUse: "保护关系边界，不让用户在讨好和自责里失去自己。",
    userSignals: ["怕麻烦别人", "都是我的错"],
    userVisibleTranslation: "你可以不把所有痛都压回自己身上。",
  },
  {
    id: "non_attachment",
    zhName: "无贪",
    avalokaUse: "松开非要某个结果、身份或回应的抓取。",
    userSignals: ["非要", "一定要", "舍不得"],
    userVisibleTranslation: "今晚先不用把答案抓得那么紧。",
  },
  {
    id: "non_aversion",
    zhName: "无瞋",
    avalokaUse: "降低怒、怨、抗拒的热度。",
    userSignals: ["恨", "气", "受不了"],
    userVisibleTranslation: "先让这股热慢一点下来。",
  },
  {
    id: "non_delusion",
    zhName: "无痴",
    avalokaUse: "不让用户把痛苦解释成单一命运或惩罚。",
    userSignals: ["活该", "报应", "肯定完了"],
    userVisibleTranslation: "这件事可能不只一种解释。",
  },
  {
    id: "light_ease",
    zhName: "轻安",
    avalokaUse: "让身心从粗重、僵硬、惊恐里松一点。",
    userSignals: ["胸口紧", "很沉", "发冷", "睡不着"],
    userVisibleTranslation: "让肩膀先少用一点力。",
  },
  {
    id: "careful_non_drifting",
    zhName: "不放逸",
    avalokaUse: "在搜索、刷屏、冲动或失控前建立温和边界。",
    userSignals: ["一直搜", "停不下来", "想马上发"],
    userVisibleTranslation: "今晚先把这个动作停一下。",
  },
  {
    id: "equanimous_balance",
    zhName: "行舍",
    avalokaUse: "让用户从审判、比较、反复摇摆里回到平稳。",
    userSignals: ["审判自己", "一直比较", "反复想"],
    userVisibleTranslation: "先不审判，也不急着定论。",
  },
  {
    id: "non_harm",
    zhName: "不害",
    avalokaUse: "不伤害自己、他人，也不让语言继续刺伤自己。",
    userSignals: ["伤害自己", "让他也痛", "活该"],
    userVisibleTranslation: "不要再用这句话伤自己。",
  },
];

export const afflictionAntidoteMap: AfflictionAntidoteMapping[] = [
  {
    afflictionId: "greed_attachment",
    blockedWholesomeIds: ["non_attachment"],
    antidoteIds: ["non_attachment", "equanimous_balance"],
    responseStrategy: "承认想要很真实，再让用户今晚先松一点手，不说“放下”。",
    mustNot: ["say_let_go", "shame_attachment", "promise_outcome"],
  },
  {
    afflictionId: "aversion_anger",
    blockedWholesomeIds: ["non_aversion"],
    antidoteIds: ["non_aversion", "non_harm", "light_ease"],
    responseStrategy: "先承认热和痛，再延迟行动、降低身体激活。",
    mustNot: ["say_do_not_be_angry", "encourage_revenge", "minimize_pain"],
  },
  {
    afflictionId: "conceit_comparison",
    blockedWholesomeIds: ["equanimous_balance"],
    antidoteIds: ["equanimous_balance", "non_delusion", "self_respect"],
    responseStrategy: "从输赢、身份高低和比较里退一步，保护用户的完整感。",
    mustNot: ["tell_user_stop_comparing", "reinforce_status", "dismiss_loss"],
  },
  {
    afflictionId: "ignorance_confusion",
    blockedWholesomeIds: ["non_delusion"],
    antidoteIds: ["non_delusion", "trust_confidence"],
    responseStrategy: "温和指出这不是唯一解释，不给终极定论。",
    mustNot: ["argue_doctrine", "claim_certainty", "over_explain"],
  },
  {
    afflictionId: "doubt_uncertainty",
    blockedWholesomeIds: ["trust_confidence"],
    antidoteIds: ["equanimous_balance", "light_ease", "non_delusion"],
    responseStrategy: "不用马上确定答案，先给一个能站住的小事实或身体锚点。",
    mustNot: ["force_answer", "give_fate_claim", "ask_many_questions"],
  },
  {
    afflictionId: "wrong_view_distortion",
    blockedWholesomeIds: ["non_delusion", "non_harm"],
    antidoteIds: ["non_harm", "non_delusion", "equanimous_balance"],
    responseStrategy: "不确认报应、活该或命定惩罚叙事；保护用户不继续用这些解释伤害自己。",
    mustNot: ["confirm_karma_blame", "use_religious_guilt", "debate_doctrine"],
  },
];

export const mindStateExamples: MindStateExample[] = [
  {
    id: "baifa_example_childlessness_regret",
    input: "我年轻时没生孩子，现在这么孤独，是不是我活该？是不是报应？",
    surfaceScene: "childlessness_regret",
    expectedRootAfflictions: ["doubt_uncertainty", "wrong_view_distortion", "ignorance_confusion"],
    expectedAntidotes: ["non_delusion", "non_harm", "equanimous_balance"],
    responseStrategy: "不确认报应或惩罚叙事；承认悔意和孤独都真实；保护用户不继续用这句话伤害自己。",
    mustDo: ["acknowledge_regret", "do_not_confirm_punishment_story", "offer_body_grounding"],
    mustNot: ["confirm_karma_blame", "say_let_go", "use_buddhist_terms"],
  },
  {
    id: "baifa_example_aging_memory_fear",
    input: "我最近记性变差，老是忘东西，我很怕自己真的老了。",
    surfaceScene: "aging_memory_fear",
    expectedRootAfflictions: ["doubt_uncertainty", "ignorance_confusion"],
    expectedAntidotes: ["non_delusion", "light_ease", "equanimous_balance"],
    responseStrategy: "承认怕老，不把一次忘事推演成灾难；给一个能恢复当下感的小动作。",
    mustDo: ["acknowledge_fear", "soften_catastrophic_story", "offer_small_grounding"],
    mustNot: ["diagnose", "give_medical_advice", "dismiss_fear"],
  },
  {
    id: "baifa_example_anger_harm_risk",
    input: "我真的恨他，我想让他也尝尝这种痛。",
    surfaceScene: "anger_harm_risk",
    expectedRootAfflictions: ["aversion_anger"],
    expectedAntidotes: ["non_aversion", "non_harm", "light_ease"],
    responseStrategy: "先安全判断；不强化报复想象；把行动延迟，把身体降温。",
    mustDo: ["delay_action", "deescalate_body", "check_safety_if_needed"],
    mustNot: ["encourage_revenge", "shame_anger", "ignore_harm_risk"],
  },
];
