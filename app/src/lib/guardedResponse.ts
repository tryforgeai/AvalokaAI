import { checkPrecepts, type PreceptsCheckResult } from "./preceptsGuardian";

export const preceptsFallback = [
  "我听见这很重。今晚先不解释，也不下结论。",
  "请把脚踩在地上，慢慢呼一口气；如果你担心自己或别人不安全，请立刻联系一个真实的人或当地紧急服务。",
];

export interface GuardedResponse {
  text: string;
  guardianFallback: boolean;
  precepts?: PreceptsCheckResult;
}

export function buildGuardedResponse(
  responseLines: string[],
  options: { crisis?: boolean } = {},
): GuardedResponse {
  const text = responseLines.join("\n\n");
  if (options.crisis) {
    return {
      text,
      guardianFallback: false,
    };
  }

  const precepts = checkPrecepts(text);
  if (!precepts.passed) {
    return {
      text: preceptsFallback.join("\n\n"),
      guardianFallback: true,
      precepts,
    };
  }

  return {
    text,
    guardianFallback: false,
    precepts,
  };
}
