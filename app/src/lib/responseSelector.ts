import { defaultScenario, responseLibrary } from "../data/responseLibrary";
import type { ResponseScenario } from "../types";

export function selectScenario(input: string): ResponseScenario {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return defaultScenario;

  let bestMatch = defaultScenario;
  let bestScore = 0;

  for (const scenario of responseLibrary) {
    const score = scenario.keywords.reduce((total, keyword) => {
      return normalized.includes(keyword.toLowerCase()) ? total + 1 : total;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = scenario;
    }
  }

  return bestMatch;
}
