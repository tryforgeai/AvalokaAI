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
  guardianFallback?: boolean;
  preceptsSeverity?: "pass" | "warn" | "revise" | "block";
  preceptsViolations?: string[];
  dukkhaTypes?: string[];
  dukkhaPatterns?: string[];
  responseMoves?: string[];
  responseSource?: ResponseSource;
  localBaselineText?: string;
  openaiPrimary?: LlmShadowResult;
  orchestratorV2?: AvalokaV2Result;
  shadow?: LlmShadowResult;
  baifa?: BaifaMapResult;
}

export type ResponseSource = "local" | "openai_primary_dev" | "local_guardian_fallback" | "llm_orchestrator_v2";

export interface LlmShadowResult {
  status: "idle" | "loading" | "ready" | "skipped" | "error";
  candidateText?: string;
  model?: string;
  latencyMs?: number;
  guardianFallback?: boolean;
  preceptsSeverity?: "pass" | "warn" | "revise" | "block";
  preceptsViolations?: string[];
  error?: string;
}

export interface BaifaMindState {
  baifaCategory: "遍行心所" | "别境心所" | "善心所" | "烦恼心所" | "随烦恼心所" | "不定心所" | "无记/不善不恶" | string;
  mindState: string;
  confidence: number;
  evidence: string;
}

export interface BaifaMap {
  primaryMindStates: BaifaMindState[];
  wholesomeAntidotes: string[];
  recommendedResponseMoves: string[];
  doNotDo: string[];
}

export interface BaifaMapResult {
  status: "idle" | "loading" | "ready" | "skipped" | "error";
  baifa?: BaifaMap;
  model?: string;
  latencyMs?: number;
  error?: string;
}

export interface LlmCrisisClassification {
  status: "safe" | "ambiguous" | "crisis";
  confidence: number;
  reason: string;
}

export interface LlmGuardianReview {
  passed: boolean;
  severity: "pass" | "warn" | "revise" | "block";
  violations: string[];
  notes: string;
}

export interface AvalokaV2Result {
  status: "idle" | "loading" | "ready" | "skipped" | "error";
  candidateText?: string;
  responseSource?: ResponseSource;
  model?: string;
  latencyMs?: number;
  crisis?: LlmCrisisClassification;
  baifa?: BaifaMap;
  guardian?: LlmGuardianReview;
  repairAttempted?: boolean;
  error?: string;
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
