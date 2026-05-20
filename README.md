# Avaloka AI

[中文版本](README.zh.md)

Avaloka AI is currently focused on becoming a private emotional support companion.

The first version serves one narrow use case:

> When a target user is alone at night or in a low moment, facing loneliness, illness fear, aging, death anxiety, childlessness/DINK regret, or meaning collapse, Avaloka meets her with private, steady, compassionate, practical wisdom and helps her return to one clear next step.

## Current Stage

V1 local MVP preparation after V0 validation.

We are not testing payment yet. We are not building a full RAG system, a Buddhist encyclopedia, a therapy substitute, a medical product, a crisis intervention service, or a generic emotional chatbot.

## Long-Term Vision

Avaloka AI aims to become a private, trustworthy compassionate-wisdom companion for vulnerable emotional moments: loneliness, illness, aging, death anxiety, childlessness regret, and meaning collapse.

The product should feel emotionally present, practical, and safe. It should not sound like religious recitation, generic advice, diagnosis, treatment, or moral judgment.

## Current Version

The active version is V1: a local chat MVP for low-moment emotional settling.

Current local app modes:

- User mode: `http://127.0.0.1:5173/` shows the quiet chat surface, lightweight feedback, local privacy note, and export/clear controls.
- Developer mode: `http://127.0.0.1:5173/?dev=1` additionally shows Internal Debug, Local Baseline, LLM Orchestrator V2, Compassion OS, and Baifa Mapper panels.

Run the local app from `app/`:

```bash
npm run dev
npm run dev:shadow
```

Version authority:

- [Product Vision](docs/product/product-vision.md)
- [Version Roadmap](docs/product/version-roadmap.md)
- [Decision Log](docs/decisions/decision-log.md)
- [Design Notes](DESIGN.md)

## Product Principles

- Start from one painful, specific user moment.
- Serve emotional settling, not content consumption.
- Use compassion and wisdom without doctrinal language.
- Keep crisis safety ahead of all normal response flows.
- Use the Five Mindfulness Guardian as an invisible output guardrail.
- Treat real user records as sensitive material; only redacted summaries belong in committed docs.
- Improve the system, harness, docs, and tests when agents get stuck.

## Source of Truth

Read these documents before making product, system design, or planning changes:

1. [Product Vision](docs/product/product-vision.md)
2. [Version Roadmap](docs/product/version-roadmap.md)
3. [Decision Log](docs/decisions/decision-log.md)
4. [Design Notes](DESIGN.md)
5. [V1 Alpha Readiness Checklist](docs/experiments/v1-alpha-readiness-checklist.md)
6. [7-Day User Validation Plan](docs/business/2026-05-12-avaloka-ai-7-day-user-validation-zh.md)
7. [Business Plan Revision](docs/business/2026-05-12-avaloka-ai-business-plan-revision-zh.md)
8. [MVP Design Spec](docs/superpowers/specs/2026-05-06-avaloka-ai-mvp-design-zh.md)
9. [MVP Execution Plan](docs/superpowers/plans/2026-05-06-avaloka-ai-mvp-zh.md)
10. [System Modules Explained](docs/superpowers/plans/2026-05-06-avaloka-ai-system-modules-explained-zh.md)
11. [Plan-to-Module Map](docs/superpowers/plans/2026-05-06-avaloka-ai-plan-module-map-zh.md)
12. [CEO Review and Feasibility Gaps](docs/superpowers/reviews/2026-05-12-avaloka-ai-ceo-review-zh.md)
13. [Harness Engineering Setup](docs/engineering/harness-engineering-setup.md)
14. [AI Production Safety Harness](docs/engineering/ai-production-safety-harness.md)
15. [Harness Engineering for Avaloka](docs/engineering/2026-05-13-harness-engineering-for-avaloka-zh.md)
16. [7-Day Free Validation Runbook](docs/experiments/validation-runbook.md)
17. [User Feedback Log Template](docs/experiments/user-feedback-log-template.md)
18. [Failure Log](docs/experiments/failure-log.md)
19. [V0 20 Scenario Responses](docs/product/2026-05-14-v0-20-scenario-responses-zh.md)
20. [V1 Response Library](docs/product/2026-05-16-v1-response-library-zh.md)
21. [V0 Day 8 Validation Report](docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md)
22. [V0 Target Personas](docs/product/2026-05-14-v0-target-personas-zh.md)
23. [V0 Test User Candidate Profiles](docs/experiments/2026-05-14-v0-test-user-candidates-zh.md)
24. [V0 Real User Insights, Redacted](docs/experiments/2026-05-14-v0-real-user-insights-redacted-zh.md)
25. [Response Quality Checklist](docs/product/quality-checklist.md)
26. [Document Gardening Checklist](docs/maintenance/doc-gardening-checklist.md)

## Safety Boundary

Avaloka should never present itself as a therapist, doctor, crisis responder, spiritual authority, or replacement for human care.

All normal responses must pass the crisis safety gate and the Five Mindfulness Guardian. User-facing language should be compassionate, clear, practical, and non-doctrinal. The system must avoid religious recitation, guilt, karma-blame, diagnosis, treatment claims, or medical advice.

## Archived Material

Superseded plans, including the old Buddhist AI direction, RAG-first scope, broad workplace/relationship emotional chatbot scope, and Mac Mini development roadmap, have been moved to:

[archive/2026-05-13-superseded-docs](archive/2026-05-13-superseded-docs)

Archived material is historical reference only. It is not the current plan.
