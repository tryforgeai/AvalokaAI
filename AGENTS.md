# AGENTS.md

This repository is the system of record for Avaloka AI.

Agents should not rely on old chat context, memory, or archived drafts unless explicitly asked. Start here, then follow the links.

## Current Product Direction

Avaloka AI is now a research-first AI companion lab.

The project uses a compassionate-wisdom companion scenario as a high-difficulty testbed for:

- long-term agent memory
- SAGE-style writer/reader graph-memory systems
- LLM orchestration
- safety and guardian gates
- Baifa/dukkha/Compassion OS emotional state understanding
- prompt registry and eval-driven AI behavior
- agentic coding workflows

It is not currently operated as a commercial MVP, payment experiment, therapy product, medical product, crisis intervention service, religious chatbot, or generic emotional chatbot.

The previous low-moment emotional settling product direction remains the test scenario and historical validation context, but the active project purpose is foundational AI research and implementation practice for future projects.

## Version Authority

- Final vision: `docs/product/product-vision.md`
- Current active version: `docs/product/version-roadmap.md`
- Decision history: `docs/decisions/decision-log.md`
- Research plan: `docs/research/sage-memory-research-plan.md`
- UI design guidance: `DESIGN.md`
- Internal learning base: `docs/kb/README.md`
- If documents conflict, follow the newest accepted decision in `docs/decisions/decision-log.md`.

## Required Reading

Read these before making product, system design, or planning changes:

1. `README.md`
2. `docs/product/product-vision.md`
3. `docs/product/version-roadmap.md`
4. `docs/decisions/decision-log.md`
5. `docs/research/sage-memory-research-plan.md`
6. `docs/engineering/avaloka-memory-engine-v1.md`
7. `docs/engineering/avaloka-memory-engine-v1.zh.md`
8. `DESIGN.md`
9. `docs/kb/README.md`
10. `docs/experiments/v1-alpha-readiness-checklist.md`
11. `docs/business/2026-05-12-avaloka-ai-7-day-user-validation-zh.md`
12. `docs/business/2026-05-12-avaloka-ai-business-plan-revision-zh.md`
13. `docs/superpowers/specs/2026-05-06-avaloka-ai-mvp-design-zh.md`
14. `docs/superpowers/plans/2026-05-06-avaloka-ai-mvp-zh.md`
15. `docs/superpowers/plans/2026-05-06-avaloka-ai-system-modules-explained-zh.md`
16. `docs/superpowers/plans/2026-05-06-avaloka-ai-plan-module-map-zh.md`
17. `docs/engineering/harness-engineering-setup.md`
18. `docs/engineering/ai-production-safety-harness.md`
19. `docs/engineering/2026-05-13-harness-engineering-for-avaloka-zh.md`
20. `docs/engineering/agentic-coding-workflow-for-avaloka.md`
21. `docs/experiments/validation-runbook.md`
22. `docs/experiments/user-feedback-log-template.md`
23. `docs/experiments/failure-log.md`
24. `docs/product/2026-05-14-v0-20-scenario-responses-zh.md`
25. `docs/product/2026-05-16-v1-response-library-zh.md`
26. `docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md`
27. `docs/product/2026-05-14-v0-target-personas-zh.md`
28. `docs/experiments/2026-05-14-v0-test-user-candidates-zh.md`
29. `docs/experiments/2026-05-14-v0-real-user-insights-redacted-zh.md`
30. `docs/product/quality-checklist.md`
31. `docs/maintenance/doc-gardening-checklist.md`

## Operating Rules

- Treat `docs/` as the source of truth.
- Treat `archive/` as historical reference only.
- Follow `docs/engineering/agentic-coding-workflow-for-avaloka.md` for non-trivial agentic development work.
- Follow `docs/research/sage-memory-research-plan.md` before changing SAGE, graph memory, long-term memory, or research milestones.
- Follow `DESIGN.md` before changing the default user interface, developer diagnostics, or visual tone.
- Follow `docs/kb/README.md` and `docs/engineering/content-ingestion-test-gate.md` before adding or promoting any wisdom, scripture, commentary, podcast, or internal philosophy material.
- Follow version authority before changing roadmap, scope, or architecture.
- If a plan conflicts with the current research direction, update the plan before implementation.
- Do not reintroduce the old “Buddhist AI / RAG-first / broad workplace-relationship-emotion” scope.
- Do not make payment, account, community, or broad product growth work the active milestone.
- Current milestone is R1: SAGE Memory Research Prototype.
- V0/V1 user validation material is historical evidence and test-scenario context, not the current business roadmap.
- Personas and candidate-user profiles are recruitment hypotheses and research fixtures, not current commercial evidence.
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
5. Run full verification before reporting completion:
   - `cd app && npm run content:check`
   - `cd app && npm test`
   - `cd app && npm run coverage`
   - `cd app && npm run build`
6. Coverage must not be below 80% for statements, branches, functions, or lines for the configured unit-test surface (`app/src/data` and `app/src/lib`). UI changes still require browser/manual QA when relevant. If coverage fails, add meaningful tests or explicitly report the blocker; do not claim the change is complete.
7. If an agent gets stuck, improve the repo docs, harness, tests, or guardrails rather than patching around missing context.
