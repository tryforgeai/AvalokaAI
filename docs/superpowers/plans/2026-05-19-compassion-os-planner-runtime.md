# Compassion OS Planner Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an OpenAI-driven multi-label Compassion OS Planner to Avaloka V2 runtime, debug UI, exports, and content gates.

**Architecture:** The planner is a new LLM JSON step between crisis/Baifa classification and response generation. Code validates the allowed move vocabulary and schema, but OpenAI chooses 1-4 moves per user turn. The response generator and guardian receive the planner output as internal guidance.

**Tech Stack:** React + TypeScript, Vite/Vitest, Node HTTP server, OpenAI Responses API JSON schema mode.

---

### Task 1: Types And Client Parsing

**Files:**
- Modify: `app/src/types.ts`
- Modify: `app/src/lib/orchestratorClient.ts`
- Test: `app/src/lib/orchestratorClient.test.ts`

- [ ] Add `CompassionMove`, `CompassionPlan`, and `CompassionPlanResult` types.
- [ ] Extend `AvalokaV2Result` with `compassionPlan?: CompassionPlanResult`.
- [ ] Update `requestAvalokaV2` to pass through `result.compassionPlan`.
- [ ] Add a test asserting a ready V2 response includes a compassion plan with multiple moves.

### Task 2: Export Persistence

**Files:**
- Modify: `app/src/lib/storage.ts`
- Test: `app/src/lib/storage.test.ts`

- [ ] Include `compassionPlan` in exported paired turns.
- [ ] Add summary counts for `compassionMoveCounts`, `compassionReadyCount`, and `compassionErrorCount`.
- [ ] Add storage test assertions for per-turn plan and summary counts.

### Task 3: Planner Prompt And Content Gate

**Files:**
- Create: `prompt/avalokiteshvara-compassion-planner-v1.md`
- Modify: `scripts/check-content-ingestion.mjs`

- [ ] Write the planner prompt with the 8 Alpha moves, JSON-only contract, and no-roleplay rule.
- [ ] Content gate must require the prompt exists and includes all 8 moves.
- [ ] Content gate must require the shadow server references the planner prompt.

### Task 4: Server Orchestration

**Files:**
- Modify: `server/llm-shadow-server.mjs`

- [ ] Load the planner prompt.
- [ ] Add `compassionMoveIds` and `compassionPlanSchema`.
- [ ] Add `buildCompassionPlanInput`.
- [ ] Add `callCompassionPlanner`.
- [ ] Call planner before response generation for both crisis and non-crisis paths.
- [ ] Pass `compassionPlan` into response and guardian inputs.
- [ ] Return `compassionPlan` from `/api/avaloka-v2`.
- [ ] Add health metadata for planner prompt.

### Task 5: Response And Guardian Prompt Integration

**Files:**
- Modify: `prompt/avaloka-v2-orchestrator-response.md`
- Modify: `prompt/avaloka-v2-guardian.md`

- [ ] Response prompt must use the Compassion OS plan internally without exposing labels.
- [ ] Guardian prompt must check role-play, move alignment, karma-blame, spiritual bypass, and crisis safety.

### Task 6: Web Demo Debug Panel

**Files:**
- Modify: `app/src/App.tsx`
- Modify: `app/src/styles.css`

- [ ] Add a developer-only `Compassion OS` debug card under LLM Orchestrator V2.
- [ ] Show status, model, latency, moves with confidence, stance, avoid list, and error.
- [ ] Keep user-facing chat unchanged.

### Task 7: Verification

**Commands:**
- `cd app && npm run content:check`
- `cd app && npm test`
- `cd app && npm run coverage`
- `cd app && npm run build`

- [ ] All commands pass.
- [ ] Coverage remains at or above 80%.

