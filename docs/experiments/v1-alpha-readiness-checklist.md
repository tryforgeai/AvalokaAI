# Avaloka V1 Alpha Readiness Checklist

Status: Historical checklist, paused by R1 research direction  
Owner: Main builder / Codex-assisted development  
Purpose: Decide whether the local V1 MVP is ready for a small Alpha test with 3-5 trusted users.

Note: On 2026-05-26, Avaloka was repositioned as a research-first AI companion lab. This checklist remains useful as historical QA and local demo context, but it no longer defines the active project milestone. The active milestone is R1: SAGE Memory Research Prototype in `docs/product/version-roadmap.md`.

## 1. Readiness Decision

V1 Alpha is ready only when every **Required** item below is complete.

Decision states:

- `Not Ready`: any Required item is incomplete.
- `Ready For Internal QA`: app works locally, but tester-facing materials or data export are incomplete.
- `Ready For 3-5 User Alpha`: all Required items are complete and latest verification passes.
- `Pause`: any serious safety, privacy, crisis, medical, or positioning risk appears.

Current recommended state:

```text
Ready For 3-5 User Alpha - schedule-shortcut mode
```

Reason: local MVP, safety gates, content gate, smoke tests, tester instructions, and fake export review exist. Some lower-priority operational items are intentionally deferred for schedule.

## 2. Product Scope Gate

- [x] V1 use case is still narrow: low-moment emotional settling.
- [x] App does not position itself as therapy, medical advice, crisis intervention, or religious authority.
- [x] App does not include payment, accounts, community, full RAG, or large corpus work.
- [x] User-facing language remains non-doctrinal and plain.
- [x] Tester instruction sheet clearly explains when to use and when not to use Avaloka.

Required before Alpha: all checked.

## 3. User Experience Gate

- [x] Local chat MVP opens successfully at `http://127.0.0.1:5173/`.
- [x] Consent/boundary screen appears before use.
- [x] User can send a low-moment message.
- [x] Avaloka returns short, grounded responses.
- [x] Feedback form appears after an Avaloka response.
- [x] User can save feedback.
- [x] User can export local data.
- [x] User can clear local data.
- [x] Default user mode hides Internal Debug and developer diagnostics.
- [x] Developer mode is available at `http://127.0.0.1:5173/?dev=1` for Internal Debug, Local Baseline, LLM Orchestrator V2, Compassion OS, and Baifa Mapper panels.
- [x] User mode and developer mode follow `DESIGN.md`.

Required before Alpha: all checked. Real-user observation should use default user mode unless explicitly debugging.

## 4. Safety Gate

- [x] Crisis safety gate exists.
- [x] Precepts Guardian exists.
- [x] Five Mindfulness/Five Precepts output rules are documented.
- [x] Guardian fallback prevents unsafe non-crisis responses.
- [x] App avoids karma-blame, sin-blame, religious certainty, and punishment framing.
- [x] App avoids medical diagnosis or treatment claims.
- [x] App does not encourage exclusive dependency on Avaloka.
- [~] Crisis copy includes clear local emergency guidance for the tester's country or a neutral instruction to contact local emergency services. Deferred for schedule; current copy still tells users to contact trusted people, emergency services, doctors, or crisis hotlines.

Required before Alpha: all checked.

## 5. Wisdom Runtime Gate

- [x] Dukkha mapper exists.
- [x] Baifa/mind-state mapper exists as project knowledge.
- [x] Podcast Episode 2-13 notes are in `docs/kb/secular-buddhism/`.
- [x] Wisdom eval cases exist in `evals/wisdom-response-cases.json`.
- [x] Content ingestion gate exists.
- [x] Runtime has initial response moves for self-blame, craving, aversion, role loss, practice pressure, and event/story separation.
- [x] Decide which additional 8-12 response moves should be promoted from docs/evals into runtime for Alpha.
- [x] Promoted moves are documented in `docs/engineering/v1-alpha-runtime-response-moves.md`.

Required before Alpha: not all podcast moves need runtime promotion. Alpha only requires the selected high-priority moves and tests.

## 6. Data And Privacy Gate

- [x] Data is localStorage only.
- [x] Export is JSON.
- [x] Clear local data exists.
- [x] Raw identities are not required by the app.
- [x] Export format is reviewed against Day 8 analysis needs with one fake session.
- [x] Tester instructions say not to enter names, addresses, phone numbers, or identifying details.
- [~] Alpha data collection plan says where exported JSON will be stored and how it will be anonymized. Deferred for schedule; tester instructions already warn against entering identifying details.

Required before Alpha: all checked.

## 7. Evaluation Gate

- [x] `evals/precepts-cases.json` exists.
- [x] `evals/dukkha-cases.json` exists.
- [x] `evals/wisdom-response-cases.json` exists.
- [x] 20-case smoke test exists in app tests.
- [x] Content ingestion check exists.
- [x] Tests cover at least one regression for role-loss usefulness collapse.
- [x] Tests cover at least one regression for practice pressure.
- [~] Run a 50-100 input QA set before external Alpha. Deferred for schedule; 20-case smoke test remains the minimum gate.
- [x] Add discovered failure examples to tests or evals.

Required before Alpha: 20-case smoke test is enough for internal QA; 50-100 input QA recommended before broader Alpha.

## 8. Engineering Verification Gate

Required commands:

```bash
cd app
npm run content:check
npm test
npm run coverage
npm run build
```

Latest known verification:

- [x] `npm run content:check` passes.
- [x] `npm test` passes.
- [x] `npm run coverage` passes above the configured 80% threshold.
- [x] `npm run build` passes.

Required before Alpha: rerun all three immediately before sharing with testers.

## 9. Alpha Tester Materials

Create these before tester handoff:

- [x] `docs/experiments/v1-alpha-tester-instructions.zh.md`
- [x] `docs/experiments/v1-alpha-feedback-review-template.zh.md`
- [x] A short list of suggested test moments, not scripted prompts.
- [x] Clear “do not use Avaloka for crisis, medical decisions, or emergencies” language.
- [x] Clear “this is local MVP testing; responses may be wrong” language.

Required before Alpha: tester instructions.

## 10. Go / No-Go Checklist

Go only if:

- [x] Product scope gate passes.
- [x] UX gate passes.
- [x] Safety gate passes with schedule-deferred crisis copy enhancement.
- [x] Data/privacy gate passes with schedule-deferred storage/anonymization plan.
- [x] Engineering verification passes on the same day as tester handoff.
- [x] Tester instructions are written.
- [x] At least one internal dry run export has been reviewed.

No-Go if:

- Any crisis wording is ambiguous or weak.
- Any response confirms karma-blame, punishment, sin, or deserved suffering.
- Any response gives medical diagnosis or treatment advice.
- Any response tells user to only rely on Avaloka.
- Export contains unnecessary personal identifiers.
- Tests or build fail.

## 11. Next Recommended Tasks

1. Tune V2 prompts so user-facing replies are shorter, more naturally segmented, and less wall-of-text.
2. Run 10-20 realistic low-moment inputs in default user mode and developer mode.
3. Review exported `summary`, `turns`, `orchestratorV2`, `compassionPlan`, and `baifa` after the first real tester session.
4. Add failures to smoke tests, V2 golden evals, or prompt evals.
5. Keep UI largely frozen unless real tester behavior shows friction.
