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

export function exportAvalokaData(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      messages: loadMessages(),
      feedback: loadFeedback(),
    },
    null,
    2,
  );
}

export function clearAvalokaData(): void {
  window.localStorage.removeItem(messagesKey);
  window.localStorage.removeItem(feedbackKey);
}
