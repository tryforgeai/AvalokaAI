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
| Current stage | User discovery + 7-day free validation |
| Final vision | Private compassionate-wisdom companionship for vulnerable emotional moments |
| Current version | V0 |
| Next version | V1 local MVP after validation |
| Target user | 45-60 year-old overseas Chinese women facing loneliness, illness fear, aging, death anxiety, childlessness/DINK regret, or meaning collapse |
| First use case | Late-night or low-moment private emotional settling |
| Non-goals | No Buddhist encyclopedia, no therapy/medical/crisis product, no payment test in V0, no full RAG first |
| Success criteria | 5 users, 3/5 use 4+ days, 2/5 real low-moment unprompted opens, 2/5 want continued free use, 0 serious safety failures |

## Agent Workflow

For each meaningful change:

1. Read `AGENTS.md`.
2. Read the relevant active docs.
3. Check product vision, version roadmap, and decision log.
4. Update source-of-truth docs when decisions change.
5. Add decision-log entries for meaningful direction changes.
6. Add or update checklists/tests when behavior changes.
7. Run verification.
8. Archive stale docs instead of leaving conflicting plans active.

## Do Not Do

- Do not rely on chat memory as source of truth.
- Do not keep conflicting plans active.
- Do not skip validation criteria.
- Do not implement full MVP features before V0 validates user pull.
- Do not revive archived Buddhist AI / RAG-first / broad emotional chatbot direction.

