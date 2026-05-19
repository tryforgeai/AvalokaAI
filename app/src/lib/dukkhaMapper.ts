import { defaultDukkhaMoves, dukkhaRules, type DukkhaPattern, type DukkhaType, type ResponseMove } from "../data/dukkhaMap";

export interface DukkhaMapping {
  dukkhaTypes: DukkhaType[];
  patterns: DukkhaPattern[];
  responseMoves: ResponseMove[];
}

export function mapDukkha(input: string): DukkhaMapping {
  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return {
      dukkhaTypes: [],
      patterns: [],
      responseMoves: defaultDukkhaMoves,
    };
  }

  const matchedRules = dukkhaRules.filter((rule) => {
    return rule.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
  });

  if (matchedRules.length === 0) {
    return {
      dukkhaTypes: [],
      patterns: [],
      responseMoves: defaultDukkhaMoves,
    };
  }

  return {
    dukkhaTypes: unique(matchedRules.flatMap((rule) => rule.dukkhaTypes)),
    patterns: unique(matchedRules.flatMap((rule) => rule.patterns)),
    responseMoves: unique(matchedRules.flatMap((rule) => rule.responseMoves)),
  };
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
