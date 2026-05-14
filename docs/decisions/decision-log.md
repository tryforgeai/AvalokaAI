# Avaloka AI Decision Log

Status: Active source of truth

If active documents conflict, follow the newest accepted decision here, then update affected docs.

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

