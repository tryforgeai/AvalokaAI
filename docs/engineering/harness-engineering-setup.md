# Avaloka AI Harness Engineering Setup

Status: Active source of truth

## Purpose

Avaloka uses an agent-first operating model:

> Humans define direction, judgment, safety boundaries, and acceptance criteria. Agents execute against repository-visible docs, checklists, runbooks, and feedback records.

## Source Of Truth

- `README.md` is the human entry point.
- `AGENTS.md` is the agent entry point.
- `docs/` contains active source-of-truth documents.
- `archive/` contains historical reference only.

## Version Authority

1. Latest accepted decision in `docs/decisions/decision-log.md`
2. Current active version in `docs/product/version-roadmap.md`
3. Final vision in `docs/product/product-vision.md`
4. Specific runbooks, specs, and plans
5. Archived docs only when explicitly requested

## Current Project Definition

| Field | Value |
|---|---|
| Project | Avaloka AI |
| Current stage | Research-first local prototype |
| Final vision | Foundational AI research project for long-term compassionate companion agents |
| Current version | R1: SAGE Memory Research Prototype |
| Next version | R2 graph-memory prototype only after R1 proves local extraction, rejection, retrieval, response, and privacy evals |
| Primary scenario | Long-term compassionate companion memory for emotionally vulnerable low moments |
| First research use case | Local SAGE Lite pipeline with Memory Writer, Memory Guardian, Care Card / graph-memory store, Memory Reader, response injection, and evals |
| Non-goals | No commercial launch, payment test, account system, community, broad growth work, full RAG over large wisdom corpora, graph neural reader, GRPO, fine-tuning, medical/therapy/crisis positioning, or religious chatbot |
| Success criteria | Local SAGE Lite can extract, reject, store, retrieve, and inject sparse evidence-backed memory; Memory Guardian blocks unsafe/private/speculative candidates; response evals improve personalization without creepiness; existing crisis, guardian, prompt-injection, and response-quality gates still pass |

## Agent Workflow

For each meaningful change:

1. Read `AGENTS.md`.
2. Read the relevant active docs.
3. Check product vision, version roadmap, and decision log.
4. Update source-of-truth docs when decisions change.
5. Add decision-log entries for meaningful direction changes.
6. Apply `docs/engineering/ai-production-safety-harness.md` before user-facing AI behavior is used with testers.
7. Add or update checklists/tests when behavior changes.
8. Run verification.
9. Archive stale docs instead of leaving conflicting plans active.

## Do Not Do

- Do not rely on chat memory as source of truth.
- Do not keep conflicting plans active.
- Do not skip research, safety, eval, or coverage gates.
- Do not treat V0/V1 validation artifacts as the active roadmap.
- Do not prioritize commercial MVP, payment, account, community, or growth work during R1.
- Do not revive archived Buddhist AI / RAG-first / broad emotional chatbot direction.
