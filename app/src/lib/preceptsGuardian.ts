export type PreceptId =
  | "respect_life"
  | "non_exploitation"
  | "wise_relationship"
  | "truthful_speech"
  | "clear_mind"
  | "wholesome_speech"
  | "non_harmful_intention";

export type PreceptsSeverity = "pass" | "warn" | "revise" | "block";

export interface PreceptsViolation {
  precept: PreceptId;
  severity: Exclude<PreceptsSeverity, "pass">;
  matched: string;
  reason: string;
}

export interface PreceptsCheckResult {
  passed: boolean;
  severity: PreceptsSeverity;
  violations: PreceptsViolation[];
}

interface PreceptsRule {
  precept: PreceptId;
  severity: Exclude<PreceptsSeverity, "pass">;
  patterns: string[];
  reason: string;
}

const rules: PreceptsRule[] = [
  {
    precept: "respect_life",
    severity: "block",
    patterns: ["伤害自己", "伤害别人", "自杀", "自残", "报复", "让他也尝尝", "让她也尝尝", "付出代价"],
    reason: "回应不得鼓励自伤、伤人、报复或危险升级。",
  },
  {
    precept: "non_exploitation",
    severity: "revise",
    patterns: ["控制他", "控制她", "占有", "骗他", "骗她", "利用他", "利用她"],
    reason: "回应不得鼓励占有、欺骗、剥削或利用他人脆弱。",
  },
  {
    precept: "wise_relationship",
    severity: "block",
    patterns: ["只跟我说", "只有我懂你", "别人都不会懂", "不要告诉任何人", "逼他", "逼她"],
    reason: "回应不得制造对 Avaloka 的唯一依赖，或鼓励关系操控和越界。",
  },
  {
    precept: "truthful_speech",
    severity: "block",
    patterns: ["业障", "报应", "定业", "命中注定", "死后一定", "一定会被接走", "一定没事", "保证会好"],
    reason: "回应不得编造因果、命运、死后结果、医疗结果或虚假保证。",
  },
  {
    precept: "clear_mind",
    severity: "block",
    patterns: ["喝点酒", "喝酒", "麻痹一下", "吃点安眠药", "赌一把", "继续刷", "继续搜"],
    reason: "回应不得鼓励酒精、药物、赌博、刷屏、搜索成瘾或逃避性麻痹。",
  },
  {
    precept: "wholesome_speech",
    severity: "revise",
    patterns: ["你想太多", "你应该放下", "你要坚强", "你就是执着", "活该"],
    reason: "回应不得羞辱、冷硬说教、恶口或用教条压过用户痛苦。",
  },
  {
    precept: "non_harmful_intention",
    severity: "block",
    patterns: ["你活该", "这是你活该", "活该", "报应", "业障", "这是惩罚", "老天惩罚"],
    reason: "回应不得强化自责、惩罚叙事或 karma blame。",
  },
];

const severityRank: Record<PreceptsSeverity, number> = {
  pass: 0,
  warn: 1,
  revise: 2,
  block: 3,
};

export function checkPrecepts(output: string): PreceptsCheckResult {
  const normalized = output.trim().toLowerCase();
  if (!normalized) {
    return { passed: true, severity: "pass", violations: [] };
  }

  const violations = rules.flatMap((rule) => {
    const matched = rule.patterns.find((pattern) => normalized.includes(pattern.toLowerCase()));
    if (!matched) return [];
    if (isProtectiveNegation(normalized, matched)) return [];

    return [
      {
        precept: rule.precept,
        severity: rule.severity,
        matched,
        reason: rule.reason,
      },
    ];
  });

  const severity = violations.reduce<PreceptsSeverity>((current, violation) => {
    return severityRank[violation.severity] > severityRank[current] ? violation.severity : current;
  }, "pass");

  return {
    passed: violations.length === 0,
    severity,
    violations,
  };
}

export function passesPrecepts(output: string): boolean {
  return checkPrecepts(output).passed;
}

function isProtectiveNegation(output: string, matched: string): boolean {
  const normalizedMatch = matched.toLowerCase();
  const protectivePhrases = [
    `不要用${normalizedMatch}`,
    `不要用“${normalizedMatch}”`,
    `不要用"${normalizedMatch}"`,
    `不确认${normalizedMatch}`,
    `不是${normalizedMatch}`,
    `不等于${normalizedMatch}`,
  ];

  return protectivePhrases.some((phrase) => output.includes(phrase));
}
