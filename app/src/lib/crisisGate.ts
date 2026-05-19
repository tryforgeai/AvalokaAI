const hardCrisisPatterns = [
  /想死/,
  /自杀/,
  /自残/,
  /割腕/,
  /跳楼/,
  /不想活/,
  /结束自己/,
  /伤害自己/,
  /杀了?(自己|我自己|他|她|他们|她们|别人)/,
  /弄死(自己|我自己|他|她|他们|她们|别人)/,
  /打死(他|她|他们|她们|别人)/,
];

export function isCrisisMessage(input: string): boolean {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return false;
  return hardCrisisPatterns.some((pattern) => pattern.test(normalized));
}
