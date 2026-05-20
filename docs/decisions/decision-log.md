# Avaloka AI Decision Log

Status: Active source of truth

If active documents conflict, follow the newest accepted decision here, then update affected docs.

## 2026-05-19 — Treat `docs/kb/` As Avaloka's Internal Learning Base

Status: Accepted

### Context

Avaloka's internal philosophy, Baifa mind-state mapping, dukkha mapping, Compassion OS, Five Mindfulness Guardian, and secular Buddhism notes are stored under `docs/kb/`. Without an explicit binding rule, future agents or prompt changes could ignore this material and rely on chat memory, ad hoc assumptions, or generic model knowledge.

### Decision

`docs/kb/` is Avaloka's internal learning base. Runtime-facing knowledge must be promoted through derived KB notes, `prompt/registry.json` `knowledgeSources`, prompt files, eval cases, and content checks.

### Rationale

Avaloka should not "remember" project philosophy from prior conversations. The repo must make the learning source visible and testable so agents, prompts, and evals keep using the same internal philosophy.

### Consequences

- `docs/kb/README.md` is the KB entry point.
- Active prompts should declare KB dependencies through `knowledgeSources`.
- `npm run content:check` validates registered knowledge-source paths.
- New wisdom sources must follow `docs/engineering/content-ingestion-test-gate.md`.
- User-facing responses still remain plain, non-doctrinal, and safety-bound.

### Affected Docs

- `docs/kb/README.md`
- `prompt/registry.json`
- `AGENTS.md`
- `README.md`
- `README.zh.md`
- `docs/engineering/content-ingestion-test-gate.md`
- `scripts/check-content-ingestion.mjs`

## 2026-05-19 — Separate User Mode And Developer Mode In The V1 MVP

Status: Accepted

### Context

The V1 local MVP now uses LLM Orchestrator V2, Baifa Mapper, Compassion OS, Guardian, local baseline responses, feedback logging, and export data. Showing all of that diagnostic machinery in the main interface made the product feel like an AI control panel instead of a quiet private emotional support space.

### Decision

Avaloka V1 has two local UI modes:

- default user mode at `http://127.0.0.1:5173/`
- developer mode at `http://127.0.0.1:5173/?dev=1`

Default user mode shows the chat, lightweight feedback, local privacy note, and export/clear controls. Developer mode may show Internal Debug, Local Baseline, LLM Orchestrator V2, Compassion OS, and Baifa Mapper panels.

### Rationale

The validated user need is to feel privately met during low moments. Internal analysis, labels, latency, model state, and hidden routing metadata are useful for builders but should not contaminate the emotional experience.

### Consequences

- `DESIGN.md` is now active UI guidance.
- User-facing UI should stay low-pressure, non-clinical, non-religious, and free of implementation terms.
- Debug and evaluation surfaces should remain explicit developer-mode features.
- Future UI changes should preserve this separation unless a later decision log entry supersedes it.

### Affected Docs

- `DESIGN.md`
- `README.md`
- `README.zh.md`
- `AGENTS.md`
- `docs/product/version-roadmap.md`
- `docs/experiments/v1-alpha-readiness-checklist.md`

## 2026-05-16 — V0 First Validation Passed And V1 May Start

Status: Accepted

### Context

Avaloka completed a first 7-day free validation round with 5 target users. The Day 8 validation report shows that the V0 pass criteria were met:

- 5 users recruited
- 4/5 users used Avaloka for at least 4 days
- 3/5 users opened Avaloka during real low moments without prompting
- 3/5 users wanted to continue after Day 7
- 2/5 users were willing to recommend Avaloka to a similar person
- 0 serious safety or positioning incidents

### Decision

Mark V0 as passed and move the active roadmap version to V1.

V1 may start, but it must remain narrow: a minimal local chat MVP focused on short, body-grounded, non-judgmental emotional settling for the validated low-moment use case.

### Rationale

V0 produced real usage pull from a subset of target users. The strongest signal was not demand for advice, religious explanation, or a broad chatbot; it was demand for a short, steady, embodied response when the user does not want to burden family or explain herself.

### Consequences

- V1 should optimize for shorter responses, body-grounded settling, safer onboarding, and stronger eval gates.
- V1 should not expand into payment, full RAG, account systems, community, medical or therapy positioning, or broad emotional chatbot scope.
- V0 failure patterns must become eval cases: generic advice, chicken-soup reassurance, and asking users to explain too much during low moments.

### Affected Docs

- `docs/product/version-roadmap.md`
- `docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md`
- `docs/experiments/failure-log.md`

## 2026-05-13 — Establish Agent-First Project Governance

Status: Accepted

### Context

Avaloka had many early drafts, old system design files, and scattered planning notes. Some old docs still described a Buddhist AI, RAG-first architecture, broad emotional scope, and payment validation.

### Decision

Use an agent-first documentation system:

- `README.md` as the human entry point
- `AGENTS.md` as the agent entry point
- `docs/` as active source of truth
- `archive/` as historical reference
- runbooks, feedback logs, quality checklists, and document gardening as operating tools

### Rationale

Agents can only reliably execute what is visible in the repository. The project needs a stable source of truth so future agents do not revive old directions.

### Consequences

Old direction files were archived. Active docs now describe Avaloka as a private emotional settling companion, not a Buddhist AI or therapy product.

### Affected Docs

- `README.md`
- `AGENTS.md`
- `docs/engineering/2026-05-13-harness-engineering-for-avaloka-zh.md`
- `docs/maintenance/2026-05-13-doc-gardening-checklist-zh.md`
- `archive/2026-05-13-superseded-docs/`

## 2026-05-13 — Make First Validation Free, Not Paid

Status: Accepted

### Context

Early user interviews suggested willingness to pay, but payment signals were not yet behaviorally validated and could be distorted by relationship, support, or imagined value.

### Decision

The first validation round is free. The Day 7 question asks whether users want to continue using Avaloka for free in the next test round, not whether they will pay.

### Rationale

The first risk is retention and real low-moment usage, not monetization. Payment should be tested only after continued-use pull is visible.

### Consequences

The business plan and validation runbook prioritize real usage, retention, continued-free-use desire, and safety trust.

### Affected Docs

- `docs/business/2026-05-12-avaloka-ai-7-day-user-validation-zh.md`
- `docs/business/2026-05-12-avaloka-ai-business-plan-revision-zh.md`
- `docs/experiments/2026-05-13-7-day-validation-runbook-zh.md`

## 2026-05-13 — Move From Buddhist-Language Product To Compassionate-Wisdom Companion

Status: Accepted

### Context

The target user wants compassionate and wise responses but does not want doctrine recitation, jargon, karma-blame, or a chatbot that sounds like it is teaching Buddhism.

### Decision

Avaloka user-facing language should be compassionate, clear, practical, and non-doctrinal. Wisdom and Five Mindfulness principles may guide the hidden system, but the product should not speak in religious performance.

### Rationale

The user need is emotional settling and personal reflection, not more content or religious explanation.

### Consequences

The old “Buddhist AI / Buddhist encyclopedia / RAG-first over religious texts” direction is superseded.

### Affected Docs

- `AGENTS.md`
- `README.md`
- `docs/product/product-vision.md`
- `docs/product/version-roadmap.md`
- `docs/product/2026-05-13-response-quality-checklist-zh.md`
- `archive/2026-05-13-superseded-docs/`

## 2026-05-14 — Add Version Governance As First-Class Project Structure

Status: Accepted

### Context

The project had a clear first-version target, but final vision, current active version, future versions, and decision history were not explicitly separated.

### Decision

Add:

- `docs/product/product-vision.md`
- `docs/product/version-roadmap.md`
- `docs/decisions/decision-log.md`

## 2026-05-14 — Add AI Production Safety Harness

Status: Accepted

### Context

Avaloka will eventually generate emotionally sensitive AI responses. A similar class of AI product failures can leak prompts, expose hidden rules, overstep medical or crisis boundaries, or repeat unsafe outputs because failures are not captured as eval data.

### Decision

Add `docs/engineering/ai-production-safety-harness.md` and `docs/experiments/failure-log.md` as active source-of-truth documents.

The harness requires:

- prompt and production logic separation
- no disclosure of hidden prompts, guardrails, scoring rules, chain-of-thought, or logs
- crisis, prompt-injection, response-quality, Five Mindfulness, hallucination, and boundary eval gates
- privacy redaction
- rollback policy
- failure-log-to-eval workflow

### Rationale

Avaloka should be treated as an AI production system before it becomes a production app. Its emotional safety risk makes verification more important than generation speed.

### Consequences

Before any user-facing AI behavior is used with testers, V0 must pass the minimum safety checklist in the AI production safety harness. Future prompt changes must be versioned, evaluated, and have rollback targets.

### Affected Docs

- `AGENTS.md`
- `README.md`
- `docs/product/version-roadmap.md`
- `docs/engineering/harness-engineering-setup.md`
- `docs/engineering/ai-production-safety-harness.md`
- `docs/experiments/failure-log.md`

and make them part of the source-of-truth hierarchy.

### Rationale

Future agents need to distinguish final vision, current active work, future possibilities, and superseded decisions.

### Consequences

`README.md` and `AGENTS.md` must point to these files. Future major direction changes should add decision-log entries.

### Affected Docs

- `README.md`
- `AGENTS.md`
- `docs/product/product-vision.md`
- `docs/product/version-roadmap.md`
- `docs/decisions/decision-log.md`
