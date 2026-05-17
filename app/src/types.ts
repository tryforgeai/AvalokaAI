export type ScenarioCategory =
  | "loneliness"
  | "body_fear"
  | "aging"
  | "death_grief"
  | "childlessness"
  | "meaning"
  | "self_blame"
  | "boundary";

export interface ResponseScenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  keywords: string[];
  response: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "avaloka";
  text: string;
  scenarioId?: string;
  createdAt: string;
  crisis?: boolean;
}

export interface FeedbackEntry {
  id: string;
  messageId: string;
  createdAt: string;
  realLowMoment: "yes" | "no" | "unsure";
  openedUnprompted: "yes" | "no" | "unsure";
  settlingScore: number;
  mostHelpfulLine: string;
  failedLine: string;
  wantsTomorrow: "yes" | "no" | "unsure";
}
