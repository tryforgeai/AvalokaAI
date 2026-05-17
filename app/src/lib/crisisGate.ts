const crisisPatterns = [
  "想死",
  "自杀",
  "自残",
  "不想活",
  "活着太累",
  "撑不下去",
  "想消失",
  "结束自己",
  "走了算了",
  "伤害自己",
  "伤害别人",
  "控制不住",
  "不想再这样",
];

export function isCrisisMessage(input: string): boolean {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return false;
  return crisisPatterns.some((pattern) => normalized.includes(pattern));
}
