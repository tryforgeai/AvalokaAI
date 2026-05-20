# Avaloka Content Ingestion Test Gate

> **Purpose**: Make every new wisdom source become a tested product capability, not just a document.
> **Applies to**: podcasts, sutras, commentaries, talks, notes, and any derived wisdom material added to `docs/kb/`.

## 1. Rule

New content is not considered integrated until it has:

1. A human-readable KB note.
2. At least one eval case.
3. Runtime mapper or response changes when the content affects demo behavior.
4. Automated tests proving the new behavior.
5. Passing verification.
6. A `prompt/registry.json` `knowledgeSources` entry when a prompt depends on it.

In short:

```text
docs + eval + runtime + test + verification = integrated
```

If a source is only research and should not affect the app yet, mark it explicitly in the KB note:

```text
Processing Status: Research only - not promoted to runtime
```

## 2. Required Outputs

For each new source, create or update:

| Asset | Required When | Purpose |
|---|---|---|
| `docs/kb/...` | Always | Human-readable product translation. |
| `docs/kb/README.md` | Always | KB authority, directory roles, and promotion rule. |
| `prompt/registry.json` | When prompt behavior depends on KB | Declares which KB files the prompt must remember. |
| `evals/wisdom-response-cases.json` | Always | Shared test seed for desired behavior and forbidden misuse. |
| `app/src/data/...` | When app behavior changes | Runtime mapper data. |
| `app/src/lib/...` | When app behavior changes | Runtime selection/response logic. |
| `app/src/**/*.test.ts` | When app behavior changes | Automated proof that the content is active. |

## 3. Required Questions

Before promotion, answer these in the KB note or implementation plan:

- What user pain does this source help Avaloka understand?
- What internal pattern or mind-state does it map to?
- What response move does it create or strengthen?
- What must Avaloka never say because of this source?
- Does this change the demo runtime behavior?
- What should `Internal Debug` show for the test input?
- What fallback should happen if the mapper is unsure?

## 4. Runtime Promotion Criteria

Promote a source to runtime only when it changes one of these:

- User input classification.
- Dukkha pattern or mind-state mapping.
- Response move selection.
- Safety/guardian decision.
- Export/debug data.

Do not promote content just because it is interesting. Avaloka V1 should stay narrow.

## 5. Test Requirements

Every runtime promotion needs at least:

- One mapper test that checks the expected internal signal.
- One response test when a new response move is added.
- One eval case in `evals/wisdom-response-cases.json`.

Example:

```text
Input:
孩子都走了，我好像已经不是一个有用的人了。

Expected debug:
dukkhaTypes: suffering_of_change, story_added_suffering
patterns: aversion, ignorance
responseMoves: role_not_whole_self, protect_self_worth
```

## 6. Verification

Run:

```bash
cd app
npm run content:check
npm test
npm run coverage
npm run build
```

If the source is docs-only and intentionally not runtime promoted, the PR/session summary must say that clearly.

## 7. Codex Task Format

Use this prompt for future content ingestion:

```text
Process this wisdom source using Avaloka content ingestion gate:

1. Write the KB note.
2. Extract response moves and forbidden misuse.
3. Add eval cases.
4. If it affects demo behavior, update mapper/runtime.
5. Add automated tests.
6. Run content:check, npm test, and npm run build.
7. Give me user inputs I can test in the demo.
```
