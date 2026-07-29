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
  sageMemory?: SageMemoryWriterResult;
  shadow?: LlmShadowResult;
  baifa?: BaifaMapResult;
}

export type ResponseSource =
  | "local"
  | "openai_primary_dev"
  | "local_guardian_fallback"
  | "local_claim_grounding_fallback"
  | "llm_orchestrator_v2";

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

export type CompassionMoveId =
  | "hear_the_cry_first"
  | "give_fearlessness_first"
  | "adapt_to_capacity"
  | "do_not_abandon"
  | "compassion_with_boundary"
  | "not_whole_self"
  | "return_from_story_to_step"
  | "protect_before_practice";

export interface CompassionMove {
  id: CompassionMoveId;
  confidence: number;
  reason: string;
}

export interface CompassionPlanResult {
  status: "idle" | "loading" | "ready" | "skipped" | "error";
  moves: CompassionMove[];
  stance: string;
  avoid: string[];
  responseHint: string;
  crisisMode: boolean;
  model?: string;
  latencyMs?: number;
  error?: string;
}

export interface AvalokaV2Result {
  status: "idle" | "loading" | "ready" | "skipped" | "error";
  candidateText?: string;
  responseSource?: ResponseSource;
  model?: string;
  latencyMs?: number;
  crisis?: LlmCrisisClassification;
  baifa?: BaifaMap;
  compassionPlan?: CompassionPlanResult;
  guardian?: LlmGuardianReview;
  retrievedCareFacts?: RetrievedCareFact[];
  memoryClaimGrounding?: MemoryClaimGroundingResultV0;
  repairAttempted?: boolean;
  error?: string;
}

export type SageMemoryCandidateKind =
  | "recurring_pain_pattern"
  | "helpful_response_move"
  | "avoid_response_move"
  | "tone_preference"
  | "safety_note"
  | "context_category";

export interface MemoryCandidate {
  id: string;
  kind: SageMemoryCandidateKind;
  text: string;
  confidence: number;
  evidenceIds: string[];
  tags?: string[];
}

export interface CareMemory extends MemoryCandidate {
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  occurrences: number;
  status?: "active" | "superseded";
  supersededBy?: string;
  supersededAt?: string;
}

export interface CareMemoryLifecycleEvent {
  type: "delete" | "supersede";
  memoryId: string;
  replacementMemoryId?: string;
  createdAt: string;
  memoryKind: SageMemoryCandidateKind;
  memoryText: string;
}

export interface CareCard {
  version: "care_card_v1";
  createdAt: string;
  updatedAt: string;
  memories: CareMemory[];
  lifecycleEvents?: CareMemoryLifecycleEvent[];
}

export interface RetrievedCareFact {
  memoryId: string;
  kind: SageMemoryCandidateKind;
  text: string;
  confidence: number;
  tags: string[];
}

export type RetrievalRelevanceGrade = 0 | 1 | 2;

export interface RetrievalEvalResult {
  precisionAtK: number;
  recallAtK: number;
  reciprocalRank: number;
  ndcgAtK: number;
  noMatchCorrect: boolean;
  unsafeRetrievalCount: number;
  staleRetrievalCount: number;
  deletedRetrievalCount: number;
  supersededRetrievalCount: number;
  latencyMs: number;
}

export type RetrievalTraceDecision = "selected" | "rejected";

export type RetrievalTraceReason =
  | "tag_overlap"
  | "risk_kind_boost"
  | "low_confidence"
  | "inactive_or_superseded"
  | "missing_evidence"
  | "stale"
  | "no_tag_overlap"
  | "ranked_below_limit";

export interface RetrievalTraceCandidateV1 {
  memoryId: string;
  kind: SageMemoryCandidateKind;
  status: "active" | "superseded";
  tags: string[];
  matchedTags: string[];
  score: number;
  decision: RetrievalTraceDecision;
  reasons: RetrievalTraceReason[];
}

export interface RetrievalTraceRejectedV1 {
  memoryId: string;
  reasons: RetrievalTraceReason[];
}

export interface RetrievalTraceV1 {
  version: "retrieval_trace_v1";
  readerVersion: "deterministic_memory_reader_v0";
  policyVersion: "retrieval_policy_v1";
  inputHash: string;
  activeTags: string[];
  requestedLimit: number;
  minConfidence: number;
  staleAfterDays: number;
  candidates: RetrievalTraceCandidateV1[];
  selectedMemoryIds: string[];
  rejected: RetrievalTraceRejectedV1[];
  latencyMs: number;
}

export type MemoryClaimGroundingStatus = "supported" | "unsupported" | "abstain";

export type MemoryClaimGroundingVerdict = "pass" | "warn";

export type MemoryClaimGroundingReason =
  | "matched_retrieved_fact"
  | "no_retrieved_fact_support"
  | "not_memory_claim";

export interface MemoryClaimGroundingClaimV0 {
  claimId: string;
  claimTextHash: string;
  status: MemoryClaimGroundingStatus;
  supportingMemoryIds: string[];
  reason: MemoryClaimGroundingReason;
}

export interface MemoryClaimGroundingResultV0 {
  version: "memory_claim_grounding_v0";
  verdict: MemoryClaimGroundingVerdict;
  claims: MemoryClaimGroundingClaimV0[];
}

export interface MemoryGuardianResult {
  candidateId: string;
  status: "allow" | "revise" | "reject";
  reasons: string[];
}

export interface SageMemoryWriterResult {
  status: "loading" | "ready" | "error";
  model?: string;
  latencyMs?: number;
  candidates: MemoryCandidate[];
  guardian: MemoryGuardianResult[];
  error?: string;
}

export interface SageMemoryWriterTurn {
  userMessageId: string;
  avalokaMessageId: string;
  userText: string;
  avalokaText: string;
}

export interface SageMemoryWriterRequest {
  turn: SageMemoryWriterTurn;
  feedback?: FeedbackEntry;
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
