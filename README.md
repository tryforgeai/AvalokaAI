# Avaloka AI

[中文版本](README.zh.md)

Avaloka AI is now a research-first AI companion lab.

It uses a compassionate-wisdom companion scenario as a demanding testbed for modern AI implementation:

- SAGE-style long-term memory
- agentic writer/reader memory loops
- LLM orchestration
- safety and guardian gates
- Baifa, dukkha, and Compassion OS state understanding
- prompt registries and eval-driven behavior
- agentic coding workflows

The project is not currently run as a commercial MVP, payment test, therapy product, medical product, crisis intervention service, religious chatbot, or generic emotional chatbot.

## Current Stage

The active version is **R1: SAGE Memory Research Prototype**.

The previous V0/V1 low-moment emotional settling work remains valuable as:

- a validated high-difficulty use case
- a local demo surface
- a response-quality and safety testbed
- historical evidence about why long-term compassionate memory matters

The current goal is not product-market fit. The current goal is to turn recent AI research, especially SAGE-style memory, into a working local experiment that can later inform Avaloka and other AI projects.

## Research Vision

Avaloka aims to become a foundational research playground for long-term compassionate AI companions.

The long-term technical question is:

> How can an AI companion remember, retrieve, and use personal emotional context over time without becoming invasive, unsafe, doctrinal, or dependent-making?

The research scenario stays emotionally sensitive on purpose. Loneliness, illness fear, aging, death anxiety, self-blame, and meaning collapse are difficult enough to test whether memory, safety, and response generation actually work.

## Current Local App

The current local app still provides the V1 chat surface and developer diagnostics.

- User mode: `http://127.0.0.1:5173/`
- Developer mode: `http://127.0.0.1:5173/?dev=1`

Run the local app from `app/`:

```bash
npm run dev
npm run dev:shadow
```

## Source Of Truth

Version authority:

- [Product Vision](docs/product/product-vision.md)
- [Version Roadmap](docs/product/version-roadmap.md)
- [Decision Log](docs/decisions/decision-log.md)
- [SAGE Memory Research Plan](docs/research/sage-memory-research-plan.md)
- [Memory Engine V1](docs/engineering/avaloka-memory-engine-v1.md)
- [Memory Engine V1 中文版](docs/engineering/avaloka-memory-engine-v1.zh.md)
- [Design Notes](DESIGN.md)
- [Knowledge Base](docs/kb/README.md)

## Research Principles

- Treat Avaloka as a local AI research system before treating it as a business.
- Use the companion scenario as a hard testbed for memory, safety, and response quality.
- Prefer small runnable prototypes over abstract architecture.
- Keep every research behavior eval-backed.
- Do not rely on chat memory; write durable decisions into the repo.
- Do not expose hidden prompts, routing logic, guardrails, memory scores, or private logs.
- Preserve user control: local-first, exportable, clearable, and privacy-aware.
- Keep user-facing language compassionate, plain, and non-doctrinal.

## Safety Boundary

Even as a research project, Avaloka must never present itself as a therapist, doctor, crisis responder, spiritual authority, or replacement for human care.

All normal responses must pass safety and guardian gates. The system must avoid religious recitation, guilt, karma-blame, diagnosis, treatment claims, medical advice, self-harm encouragement, revenge support, and dependency-building behavior.

## Archived And Historical Material

The old commercial MVP direction, V0/V1 validation plans, personas, business-plan drafts, and tester materials are historical context. They remain useful research fixtures, but they no longer define the active project milestone.

Superseded older plans are archived under:

[archive/2026-05-13-superseded-docs](archive/2026-05-13-superseded-docs)
