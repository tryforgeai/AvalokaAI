# Avaloka AI Version Roadmap

Status: Active source of truth

## Version Authority

If documents conflict, follow this order:

1. Latest accepted decision in `docs/decisions/decision-log.md`
2. Current active version in this file
3. Final vision in `docs/product/product-vision.md`
4. Research plans, engineering docs, runbooks, specs, and eval plans
5. Archived documents only when explicitly requested

## Current Active Version

| Field | Value |
|---|---|
| Version | R1 |
| Name | SAGE Memory Research Prototype |
| Stage | Research-first local prototype |
| Goal | Turn SAGE-style long-term memory into a runnable Avaloka experiment |
| Primary scenario | Long-term compassionate companion memory for emotionally vulnerable low moments |
| Primary artifact | Local SAGE Lite pipeline with Memory Writer, Memory Guardian, Graph/Care Memory Store, Memory Reader, response injection, and evals |
| Research plan | `docs/research/sage-memory-research-plan.md` |
| Memory design | `docs/engineering/avaloka-memory-engine-v1.md` / `docs/engineering/avaloka-memory-engine-v1.zh.md` |
| Active execution plan | `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md` |

### R1 Entry Context

R1 starts because the founder changed Avaloka's purpose from commercial MVP validation to foundational AI research and implementation practice.

The prior V0/V1 work remains useful because it supplies:

- a hard emotional companion test scenario
- validated examples of low-moment user pain
- a local app and LLM orchestration surface
- existing safety gates, Baifa Mapper, Compassion OS, Guardian, and eval patterns
- real response failures that can become memory and retrieval test cases

### R1 In Scope

- SAGE-style architecture research
- SAGE Lite implementation plan
- Memory Writer candidate extraction
- Memory Guardian rejection rules
- Care Card and graph-memory schema experiments
- deterministic Memory Reader prototype
- formal Memory Reader retrieval baseline with Recall@k, MRR, NDCG@k, no-match, privacy, stale-memory, and latency measures
- Retrieval Failure Mining V0 over the deterministic Memory Reader benchmark before heavier graph/vector/reranker retrieval work
- versioned, redacted retrieval traces for developer diagnosis
- optional LLM Memory Writer shadow test
- response injection with 3-5 care facts
- claim-level evidence grounding in shadow mode before reversible enforcement
- fallback enforcement for unsupported personal-memory claims before any safer rewrite policy
- extraction, rejection, retrieval, response, and privacy evals
- developer-mode diagnostics for memory experiments
- developer-mode durable Memory Lifecycle Review Queue V0 for allowed/rejected/superseded/deleted decisions
- user-facing local memory controls for sanitized care notes, pause/resume, user-safe export, and memory-only clear
- local-first data storage and export/clear support
- preserving current safety and response-quality gates

### R1 Out Of Scope

- payment test
- commercial launch
- account system
- community
- broad user acquisition
- full RAG over large wisdom corpora
- production graph database unless simple JSON/SQLite proves insufficient
- graph neural network reader
- GRPO training loop
- fine-tuning
- production privacy policy or compliance program
- medical, therapy, or crisis-service positioning

### R1 Success Criteria

R1 passes if:

- a local SAGE Lite pipeline can extract, reject, store, retrieve, and inject memory candidates in developer mode
- every saved memory is sparse, evidence-backed, exportable, and clearable
- Memory Guardian rejects private, medical, crisis, revenge, karma-blame, and speculative memory candidates
- retrieval can select relevant care facts for a future turn
- the deterministic reader has a reproducible gold-set baseline and returns zero private, deleted, superseded, or stale memories
- retrieval failure mining can report failed cases, pressure signals, group pass/fail counts, and conservative next-step recommendations before heavier retrieval architecture is proposed
- personal-memory and health/safety claims can be checked against permitted evidence without treating ordinary compassion as a factual claim
- unsupported personal-memory claims cannot reach user-visible output without fallback or an approved rewrite policy
- memory lifecycle decisions are reviewable in developer exports/diagnostics before any user-facing memory surface
- response evals show memory improves personalization without creepiness
- existing crisis, guardian, prompt-injection, and response-quality gates still pass
- no user-facing UI exposes hidden memory logic, scores, prompts, or private logs
- ordinary users can inspect, pause, export, and clear remembered care notes without exposing developer diagnostics

## Previous Active Product Versions

These versions are historical product-validation context, not the current roadmap.

| Version | Stage | Result | Notes |
|---|---|---|---|
| V0 | User discovery + 7-day free validation | Passed first validation round | Report: `docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md` |
| V1 | Local MVP preparation after V0 validation | Paused as commercial product track | Local app remains the research demo surface |

### V0 Result Summary

- 5/5 users recruited
- 4/5 users used Avaloka for at least 4 days
- 3/5 users opened Avaloka during real low moments without prompting
- 3/5 users wanted to continue after Day 7
- 2/5 users were willing to recommend Avaloka to a similar person
- 0 serious safety or positioning incidents

### V1 Artifacts Kept For Research

- local chat UI with user/developer modes
- LLM Orchestrator V2
- Baifa Mapper
- Compassion OS
- Guardian checks
- V1 response library
- feedback export format
- prompt registry
- eval gates

## Future Research Versions

| Version | Hypothesis | Do Not Start Until |
|---|---|---|
| R2 | Graph Memory Prototype improves retrieval over flat Care Card memory | R1 proves extraction/rejection/retrieval/response evals locally |
| R3 | Reader/Writer feedback loop improves memory sparsity and usefulness | R2 has enough memory failure cases |
| R4 | Learned or model-assisted reader improves multi-hop retrieval | Deterministic reader limits are clearly measured |
| R5 | Transferable memory/safety harness can support other AI projects | Avaloka memory harness is stable and documented |

## Deferred Product Ideas

These are not active commitments:

- paid subscription
- mobile app
- voice companion
- guided audio
- community
- multi-user accounts
- AI-to-human referral network
- launch or growth funnel

## Deferred Research Ideas

These are not active commitments until earlier phases justify them:

- full SAGE paper reproduction
- graph neural network retrieval
- GRPO or RL training
- fine-tuning
- production graph database
- full RAG over large wisdom corpora
- large-scale private user memory
