import type { CareCard, CareMemory, SageMemoryCandidateKind } from "../types";

export type UserFacingCareNoteCategory =
  | "what_helps"
  | "what_to_avoid"
  | "tone_preference"
  | "safety_boundary"
  | "recurring_theme";

export interface UserFacingCareNoteV0 {
  displayText: string;
  category: UserFacingCareNoteCategory;
  heading: string;
  lastUpdatedLabel: string;
}

const categoryByKind: Record<SageMemoryCandidateKind, UserFacingCareNoteCategory> = {
  helpful_response_move: "what_helps",
  avoid_response_move: "what_to_avoid",
  tone_preference: "tone_preference",
  safety_note: "safety_boundary",
  recurring_pain_pattern: "recurring_theme",
  context_category: "recurring_theme",
};

const headingByCategory: Record<UserFacingCareNoteCategory, string> = {
  what_helps: "What seems to help",
  what_to_avoid: "What Avaloka should avoid",
  tone_preference: "Tone and length",
  safety_boundary: "Safety boundaries",
  recurring_theme: "Recurring themes",
};

export type UserFacingMemoryStatus = "on" | "paused";

export function toUserFacingCareNotes(careCard: CareCard): UserFacingCareNoteV0[] {
  return careCard.memories.filter(isActiveMemory).map(toUserFacingCareNote);
}

export function exportUserFacingCareNotes(careCard: CareCard, status: UserFacingMemoryStatus): string {
  const notes = toUserFacingCareNotes(careCard);
  const lines = [
    "# Avaloka remembered care notes",
    "",
    `Memory status: ${status}`,
    "",
    "These notes are a user-safe summary of local care preferences. They do not include internal IDs, scores, evidence, tags, or developer review data.",
  ];

  if (notes.length === 0) {
    lines.push("", "No remembered care notes are saved right now.");
    return lines.join("\n");
  }

  for (const note of notes) {
    lines.push("", `## ${note.heading}`, "", `- ${note.displayText}`, `  - ${note.lastUpdatedLabel}`);
  }

  return lines.join("\n");
}

function toUserFacingCareNote(memory: CareMemory): UserFacingCareNoteV0 {
  const category = categoryByKind[memory.kind];
  return {
    displayText: memory.text,
    category,
    heading: headingByCategory[category],
    lastUpdatedLabel: formatLastUpdatedLabel(memory.updatedAt),
  };
}

function isActiveMemory(memory: CareMemory): boolean {
  return (memory.status || "active") === "active";
}

function formatLastUpdatedLabel(updatedAt: string): string {
  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) return "Updated recently";
  return `Updated ${parsed.toISOString().slice(0, 10)}`;
}
