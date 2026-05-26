import type { ChatMessage, FeedbackEntry } from "../types";

const messagesKey = "avaloka:v1:messages";
const feedbackKey = "avaloka:v1:feedback";
const consentKey = "avaloka:v1:consent";

function readJson<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value, null, 2));
}

export function hasConsent(): boolean {
  return window.localStorage.getItem(consentKey) === "yes";
}

export function saveConsent(): void {
  window.localStorage.setItem(consentKey, "yes");
}

export function loadMessages(): ChatMessage[] {
  return readJson<ChatMessage[]>(messagesKey, []);
}

export function saveMessages(messages: ChatMessage[]): void {
  writeJson(messagesKey, messages);
}

export function loadFeedback(): FeedbackEntry[] {
  return readJson<FeedbackEntry[]>(feedbackKey, []);
}

export function saveFeedback(entries: FeedbackEntry[]): void {
  writeJson(feedbackKey, entries);
}

function buildTurns(messages: ChatMessage[], feedback: FeedbackEntry[]) {
  const feedbackByMessageId = new Map(feedback.map((entry) => [entry.messageId, entry]));
  const turns = [];

  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];
    const nextMessage = messages[index + 1];

    if (message?.role !== "user" || nextMessage?.role !== "avaloka") continue;

    turns.push({
      userMessageId: message.id,
      avalokaMessageId: nextMessage.id,
      createdAt: nextMessage.createdAt,
      userText: message.text,
      avalokaText: nextMessage.text,
      scenarioId: nextMessage.scenarioId,
      crisis: Boolean(nextMessage.crisis),
      guardianFallback: Boolean(nextMessage.guardianFallback),
      preceptsSeverity: nextMessage.preceptsSeverity,
      preceptsViolations: nextMessage.preceptsViolations || [],
      dukkhaTypes: nextMessage.dukkhaTypes || [],
      dukkhaPatterns: nextMessage.dukkhaPatterns || [],
      responseMoves: nextMessage.responseMoves || [],
      responseSource: nextMessage.responseSource || "local",
      localBaselineText: nextMessage.localBaselineText,
      orchestratorV2: nextMessage.orchestratorV2,
      compassionPlan: nextMessage.orchestratorV2?.compassionPlan,
      sageMemory: nextMessage.sageMemory,
      openaiPrimary: nextMessage.openaiPrimary,
      shadow: nextMessage.shadow,
      baifa: nextMessage.baifa,
      feedback: feedbackByMessageId.get(nextMessage.id) || null,
    });
  }

  return turns;
}

function countBy(items: string[]): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item] = (counts[item] || 0) + 1;
    return counts;
  }, {});
}

function buildSummary(messages: ChatMessage[], feedback: FeedbackEntry[], turns: ReturnType<typeof buildTurns>) {
  const scoredFeedback = feedback.filter((entry) => Number.isFinite(entry.settlingScore));
  const totalScore = scoredFeedback.reduce((total, entry) => total + entry.settlingScore, 0);
  const averageSettlingScore = scoredFeedback.length > 0 ? Number((totalScore / scoredFeedback.length).toFixed(2)) : null;

  return {
    turnCount: turns.length,
    messageCount: messages.length,
    feedbackCount: feedback.length,
    realLowMomentCount: feedback.filter((entry) => entry.realLowMoment === "yes").length,
    openedUnpromptedCount: feedback.filter((entry) => entry.openedUnprompted === "yes").length,
    wantsTomorrowYesCount: feedback.filter((entry) => entry.wantsTomorrow === "yes").length,
    guardianFallbackCount: turns.filter((turn) => turn.guardianFallback).length,
    crisisCount: turns.filter((turn) => turn.crisis).length,
    averageSettlingScore,
    dukkhaTypeCounts: countBy(turns.flatMap((turn) => turn.dukkhaTypes)),
    dukkhaPatternCounts: countBy(turns.flatMap((turn) => turn.dukkhaPatterns)),
    responseMoveCounts: countBy(turns.flatMap((turn) => turn.responseMoves)),
    scenarioCounts: countBy(turns.map((turn) => turn.scenarioId || "none")),
    shadowReadyCount: turns.filter((turn) => turn.shadow?.status === "ready").length,
    shadowErrorCount: turns.filter((turn) => turn.shadow?.status === "error").length,
    shadowGuardianFallbackCount: turns.filter((turn) => turn.shadow?.guardianFallback).length,
    baifaReadyCount: turns.filter((turn) => turn.baifa?.status === "ready").length,
    baifaErrorCount: turns.filter((turn) => turn.baifa?.status === "error").length,
    openaiPrimaryReadyCount: turns.filter((turn) => turn.openaiPrimary?.status === "ready").length,
    openaiPrimaryFallbackCount: turns.filter((turn) => turn.responseSource === "local_guardian_fallback").length,
    orchestratorV2ReadyCount: turns.filter((turn) => turn.orchestratorV2?.status === "ready").length,
    orchestratorV2ErrorCount: turns.filter((turn) => turn.orchestratorV2?.status === "error").length,
    orchestratorV2RepairCount: turns.filter((turn) => turn.orchestratorV2?.repairAttempted).length,
    compassionReadyCount: turns.filter((turn) => turn.compassionPlan?.status === "ready").length,
    compassionErrorCount: turns.filter((turn) => turn.compassionPlan?.status === "error").length,
    compassionMoveCounts: countBy(turns.flatMap((turn) => turn.compassionPlan?.moves.map((move) => move.id) || [])),
    sageMemoryReadyCount: turns.filter((turn) => turn.sageMemory?.status === "ready").length,
    sageMemoryErrorCount: turns.filter((turn) => turn.sageMemory?.status === "error").length,
    sageMemoryCandidateCount: turns.reduce((total, turn) => total + (turn.sageMemory?.candidates.length || 0), 0),
    sageMemoryKindCounts: countBy(turns.flatMap((turn) => turn.sageMemory?.candidates.map((candidate) => candidate.kind) || [])),
    sageMemoryGuardianCounts: countBy(turns.flatMap((turn) => turn.sageMemory?.guardian.map((result) => result.status) || [])),
  };
}

export function exportAvalokaData(): string {
  const messages = loadMessages();
  const feedback = loadFeedback();
  const turns = buildTurns(messages, feedback);

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      summary: buildSummary(messages, feedback, turns),
      turns,
      messages,
      feedback,
    },
    null,
    2,
  );
}

export function clearAvalokaData(): void {
  window.localStorage.removeItem(messagesKey);
  window.localStorage.removeItem(feedbackKey);
}
