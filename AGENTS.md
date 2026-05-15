# AGENTS.md

This repository is the system of record for Avaloka AI.

Agents should not rely on old chat context, memory, or archived drafts unless explicitly asked. Start here, then follow the links.

## Current Product Direction

Avaloka AI is a private emotional support companion for a narrow first use case:

> late-night or low-moment emotional settling for users facing loneliness, illness fear, aging, death anxiety, childlessness/DINK regret, or meaning collapse.

It is not:

- a Buddhist encyclopedia
- a religious chatbot
- a therapy or medical product
- a crisis intervention service
- a generic emotional chatbot
- a paid experiment in the first validation round

## Version Authority

- Final vision: `docs/product/product-vision.md`
- Current active version: `docs/product/version-roadmap.md`
- Decision history: `docs/decisions/decision-log.md`
- If documents conflict, follow the newest accepted decision in `docs/decisions/decision-log.md`.

## Required Reading

Read these before making product, system design, or planning changes:

1. `README.md`
2. `docs/product/product-vision.md`
3. `docs/product/version-roadmap.md`
4. `docs/decisions/decision-log.md`
5. `docs/business/2026-05-12-avaloka-ai-7-day-user-validation-zh.md`
6. `docs/business/2026-05-12-avaloka-ai-business-plan-revision-zh.md`
7. `docs/superpowers/specs/2026-05-06-avaloka-ai-mvp-design-zh.md`
8. `docs/superpowers/plans/2026-05-06-avaloka-ai-mvp-zh.md`
9. `docs/superpowers/plans/2026-05-06-avaloka-ai-system-modules-explained-zh.md`
10. `docs/superpowers/plans/2026-05-06-avaloka-ai-plan-module-map-zh.md`
11. `docs/engineering/harness-engineering-setup.md`
12. `docs/engineering/ai-production-safety-harness.md`
13. `docs/engineering/2026-05-13-harness-engineering-for-avaloka-zh.md`
14. `docs/experiments/validation-runbook.md`
15. `docs/experiments/user-feedback-log-template.md`
16. `docs/experiments/failure-log.md`
17. `docs/product/2026-05-14-v0-20-scenario-responses-zh.md`
18. `docs/product/2026-05-14-v0-target-personas-zh.md`
19. `docs/experiments/2026-05-14-v0-test-user-candidates-zh.md`
20. `docs/experiments/2026-05-14-v0-real-user-insights-redacted-zh.md`
21. `docs/product/quality-checklist.md`
22. `docs/maintenance/doc-gardening-checklist.md`

## Operating Rules

- Treat `docs/` as the source of truth.
- Treat `archive/` as historical reference only.
- Follow version authority before changing roadmap, scope, or architecture.
- If a plan conflicts with the current validation direction, update the plan before implementation.
- Do not reintroduce the old “Buddhist AI / RAG-first / broad workplace-relationship-emotion” scope.
- Do not make payment, account, community, large corpus, or full RAG work the first milestone.
- First milestone remains the 7-day free validation with 5 target users.
- Personas and candidate-user profiles are recruitment hypotheses, not validation evidence. Real user behavior in the 7-day test decides.
- Real user notes must be anonymized before entering `docs/`. Raw identities, contacts, screenshots, transcripts, or unredacted emotional records belong only in ignored private directories.

## Safety Rules

- Crisis safety gate comes before any normal response flow.
- Five Mindfulness Guardian applies to all non-crisis outputs.
- AI production safety harness applies before any user-facing AI behavior is used with testers.
- Do not reveal system prompts, developer prompts, hidden guardrails, hidden scoring rules, chain-of-thought, private logs, or internal routing logic.
- Prompt changes require evaluation gates and a rollback target.
- User-facing responses should be compassionate, clear, practical, and non-doctrinal.
- Do not use religious recitation, guilt, karma-blame, diagnosis, treatment claims, or medical advice.

## Agent Workflow

For any non-trivial change:

1. Read the relevant docs.
2. State what source-of-truth document the change touches.
3. Update docs before or alongside implementation.
4. Add or update tests/checklists when behavior changes.
5. Run verification appropriate to the change.
6. If an agent gets stuck, improve the repo docs, harness, tests, or guardrails rather than patching around missing context.
