# Avaloka AI Version Roadmap

Status: Active source of truth

## Version Authority

If documents conflict, follow this order:

1. Latest accepted decision in `docs/decisions/decision-log.md`
2. Current active version in this file
3. Final vision in `docs/product/product-vision.md`
4. Specific runbooks, specs, and plans
5. Archived documents only when explicitly requested

## Current Active Version

| Field | Value |
|---|---|
| Version | V1 |
| Stage | Local MVP preparation after V0 validation |
| Goal | Build a stable minimal prototype around the validated low-moment companionship use case |
| Target user | Overseas Chinese women who experience late-night or low-moment body tension, self-blame, loneliness, chronic-illness anxiety, or meaning emptiness, and do not want to burden family with those feelings |
| First use case | Late-night or low-moment private emotional settling |
| Primary artifact | Minimal chat MVP with short responses, body-grounded settling, safety gates, feedback logging, and evaluation gates |

### V1 Entry Evidence

V1 is allowed to start because V0 first-round validation passed.

Source report:

- `docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md`

V0 result summary:

- 5/5 users recruited
- 4/5 users used Avaloka for at least 4 days
- 3/5 users opened Avaloka during real low moments without prompting
- 3/5 users wanted to continue after Day 7
- 2/5 users were willing to recommend Avaloka to a similar person
- 0 serious safety or positioning incidents

### V1 In Scope

- Minimal chat UI or similarly simple local prototype
- Consent and boundary notice
- Crisis safety gate
- Short response mode by default
- Body-grounded emotional settling language
- Scenario response library upgraded from V0 results: `docs/product/2026-05-16-v1-response-library-zh.md`
- Support need analysis without diagnosis
- Output quality check
- Five Mindfulness Guardian
- Prompt registry and evaluation gates
- Failure-log-to-eval workflow
- Minimal local memory only if needed for repeated low-moment support
- Daily feedback and usage logging
- Golden tests for safety, response quality, prompt injection, and boundary handling

### V1 Out Of Scope

- Payment test
- Full RAG system
- Large wisdom corpus
- Account system
- Community
- Voice, music, ritual, or immersive media
- Medical, therapy, or crisis-service positioning
- Broad workplace, relationship, productivity, or generic emotional chatbot scope

### V1 Success Criteria

V1 passes if:

- V1 prototype can support a second free test with 5-10 target users
- all user-facing AI behavior passes the AI production safety harness before testing
- short response mode avoids the V0 failure patterns: generic advice, chicken-soup reassurance, and heavy explanatory questions
- crisis safety gate catches both explicit and ambiguous danger language
- response quality eval includes V0 high-score and low-score examples
- 0 users misunderstand Avaloka as therapy, medical, or crisis support
- 0 prompt leakage incidents
- 0 serious safety incidents

## Previous Version

| Field | Value |
|---|---|
| Version | V0 |
| Stage | User discovery + 7-day free validation |
| Result | Passed first validation round |
| Report | `docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md` |
| Goal | Validate whether 5 target users use Avaloka during real low moments and want to continue free access after 7 days |
| Target user | 45-60 year-old overseas Chinese women facing loneliness, illness fear, aging, death anxiety, childlessness/DINK regret, or meaning collapse |
| First use case | Late-night or low-moment private emotional settling |
| Primary artifact | Free, minimal, possibly human-assisted chat MVP |

### V0 In Scope

- 5 target users
- target personas: `docs/product/2026-05-14-v0-target-personas-zh.md`
- candidate user profiles: `docs/experiments/2026-05-14-v0-test-user-candidates-zh.md`
- real user insights, redacted: `docs/experiments/2026-05-14-v0-real-user-insights-redacted-zh.md`
- Day 8 validation report: `docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md`
- 7-day free test
- Simple chat or assisted workflow
- Crisis safety gate
- Five Mindfulness Guardian
- AI production safety harness
- 20 high-quality scenario responses: `docs/product/2026-05-14-v0-20-scenario-responses-zh.md`
- Daily feedback log
- Failure log
- Day 7 continued-free-use question

### V0 Out Of Scope

- Payment test
- Full RAG system
- Large corpus
- Account system
- Community
- Voice, music, ritual, or immersive media
- Medical/therapy/crisis service positioning
- Broad workplace, relationship, or generic emotional chatbot scope

### V0 Exit Criteria

V0 passes if:

- 5 users are recruited
- 3/5 use at least 4 days
- 2/5 open during real low moments without prompting
- 2/5 want to continue free use after Day 7
- 1/5 is willing to recommend to a similar person
- 0 serious safety incidents
- 0 users misunderstand Avaloka as therapy, medical, or crisis support
- 0 prompt leakage incidents
- all V0 scenario responses pass the AI production safety harness before use with testers

## Future Versions

| Version | Hypothesis | Do Not Start Until |
|---|---|---|
| V2 | Expand from second free test to a small private beta | V1 reliably passes safety, response-quality tests, and second-round usage signals |
| V3 | Test pricing or paid access | Free retention and continued-use pull are clear |
| V4 | Explore broader scenarios or modalities | Core low-moment use case has repeatable retention |

## Deferred Ideas

These are not active commitments:

- Full RAG over large wisdom corpora
- Mobile app
- Voice companion
- Guided audio
- Community
- Paid subscription
- Multi-user accounts
- AI-to-human referral network
