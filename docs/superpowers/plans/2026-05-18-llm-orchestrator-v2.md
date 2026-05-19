# LLM Orchestrator V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a developer-only LLM-native Avaloka V2 flow where crisis triage, Baifa mapping, natural response generation, and guardian review are handled by LLM calls under strict schemas and local fallback.

**Architecture:** Keep local keyword crisis gate and local baseline as deterministic safety rails. Add a server-side `/api/avaloka-v2` orchestrator that runs LLM crisis classification for ambiguous non-local-crisis input, LLM Baifa mapper, LLM response generation, and LLM guardian review with one repair attempt. The frontend shows the final V2 response as the main Avaloka reply when ready and records all V2 metadata in export JSON.

**Tech Stack:** React/Vite frontend, Node HTTP shadow server, OpenAI Responses API, Vitest unit tests, existing content/eval gates.

---

### Task 1: Add V2 Contracts And Client

**Files:**
- Modify: `app/src/types.ts`
- Create: `app/src/lib/orchestratorClient.ts`
- Test: `app/src/lib/orchestratorClient.test.ts`

- [ ] Add `AvalokaV2Result`, `LlmCrisisClassification`, and `LlmGuardianReview` types.
- [ ] Add `requestAvalokaV2(payload)` that POSTs to `/api/avaloka-v2`.
- [ ] Test successful ready response and HTTP error response.

### Task 2: Add Server Orchestrator Endpoint

**Files:**
- Modify: `server/llm-shadow-server.mjs`
- Create: `prompt/avaloka-v2-orchestrator-response.md`
- Create: `prompt/avaloka-v2-crisis-classifier.md`
- Create: `prompt/avaloka-v2-guardian.md`

- [ ] Load three new prompts.
- [ ] Add `POST /api/avaloka-v2`.
- [ ] Reuse strict Baifa schema from `/api/baifa-map`.
- [ ] Add strict JSON schemas for crisis classification and guardian review.
- [ ] Run sequence: crisis classifier → Baifa mapper → response generator → guardian → one repair if needed.
- [ ] Return final response plus `crisis`, `baifa`, `guardian`, `repairAttempted`, `model`, and latency fields.

### Task 3: Wire Frontend V2 Mode

**Files:**
- Modify: `app/src/App.tsx`
- Modify: `app/src/styles.css`
- Modify: `app/src/lib/storage.ts`

- [ ] Add `requestAvalokaV2` call for non-local-crisis messages.
- [ ] Set the main Avaloka text from V2 when V2 returns a safe reply.
- [ ] Preserve local baseline text for comparison.
- [ ] Add right-side `LLM Orchestrator V2` debug panel.
- [ ] Export V2 metadata and summary counts.

### Task 4: Evals And Verification

**Files:**
- Modify: `scripts/check-content-ingestion.mjs`
- Create: `evals/avaloka-v2-orchestrator-cases.json`
- Modify or add tests as needed.

- [ ] Add at least 8 V2 eval seed cases covering crisis ambiguity, karma blame, illness fear, child role loss, meditation pressure, anger, prompt injection, and dependency risk.
- [ ] Extend content check to require V2 prompts and evals.
- [ ] Run full verification: `content:check`, all tests, coverage >=80%, and build.

### Self-Review

- Spec coverage: Covers LLM-native classification, generation, guardian review, local crisis safety rail, local fallback, export, and eval gates.
- Placeholder scan: No `TBD` or vague implementation-only placeholders.
- Type consistency: Uses `AvalokaV2Result`, `LlmCrisisClassification`, and `LlmGuardianReview` consistently.
