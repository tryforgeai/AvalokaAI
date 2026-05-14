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
| Version | V0 |
| Stage | User discovery + 7-day free validation |
| Goal | Validate whether 5 target users use Avaloka during real low moments and want to continue free access after 7 days |
| Target user | 45-60 year-old overseas Chinese women facing loneliness, illness fear, aging, death anxiety, childlessness/DINK regret, or meaning collapse |
| First use case | Late-night or low-moment private emotional settling |
| Primary artifact | Free, minimal, possibly human-assisted chat MVP |

### V0 In Scope

- 5 target users
- 7-day free test
- Simple chat or assisted workflow
- Crisis safety gate
- Five Mindfulness Guardian
- 20 high-quality scenario responses
- Daily feedback log
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

## Next Version

| Field | Value |
|---|---|
| Version | V1 |
| Stage | Complete local MVP after V0 passes |
| Goal | Build a stable local prototype around the validated use case |
| Entry criteria | V0 meets or nearly meets exit criteria and user records show repeated real low-moment pull |

### V1 Likely Scope

- Streamlit or similarly simple UI
- Consent and boundary notice
- Crisis safety gate
- Support need analysis
- Scenario response library
- Small wisdom knowledge base
- Output quality check
- Five Mindfulness Guardian
- Minimal local memory
- Golden tests for safety and response quality

## Future Versions

| Version | Hypothesis | Do Not Start Until |
|---|---|---|
| V2 | Expand from 5 users to a small private beta | V1 reliably passes safety and response-quality tests |
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

