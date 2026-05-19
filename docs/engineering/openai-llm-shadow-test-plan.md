# OpenAI LLM Shadow Test Plan

Status: Active developer test plan  
Purpose: Compare OpenAI-generated candidate replies against the current local Avaloka response without exposing the LLM output directly to users.

## 1. Definition

LLM Shadow Test means:

- the user-visible response still comes from the local Avaloka runtime;
- OpenAI generates a candidate response in the background;
- the candidate is shown only in the developer-only `LLM Shadow` panel;
- the candidate is also checked by the local Precepts Guardian;
- exported JSON includes the shadow result for later comparison.

## 2. Why Shadow Mode

Avaloka handles sensitive low-moment inputs: loneliness, illness fear, death anxiety, childlessness grief, and self-blame.

The model should not directly control user-facing output until it passes safety and quality evaluation.

Shadow mode lets us compare:

- naturalness;
- safety;
- length;
- tone;
- forbidden phrase risk;
- whether the model improves or weakens Avaloka's voice.

## 3. Local Setup

Create a local env file:

```bash
cp server/.env.example server/.env
```

Fill in:

```bash
OPENAI_API_KEY=...
OPENAI_SHADOW_MODEL=gpt-5.2
PORT=8787
```

Run two terminals:

```bash
cd app
npm run dev:shadow
```

```bash
cd app
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

## 4. Current Architecture

```text
user input
  -> crisis gate
  -> local dukkha mapper
  -> local response builder
  -> precepts guardian
  -> user-visible Avaloka response
  -> async /api/llm-shadow
  -> OpenAI Responses API
  -> local precepts guardian check
  -> developer-only LLM Shadow panel
  -> export JSON
```

## 5. Safety Boundaries

The OpenAI API key stays server-side only.

The frontend calls:

```text
/api/llm-shadow
```

Developer test endpoints:

```text
GET /api/llm-shadow/test
```

Returns a health payload without calling OpenAI. Use this to confirm the local shadow server is running, the prompt is loaded, the model is configured, and the API key is present without exposing the key.

```text
GET /api/llm-shadow/test?run=1&userText=...&localText=...
```

Runs one explicit shadow test through OpenAI and returns the candidate response as JSON. This endpoint is for local developer testing only; it can consume OpenAI tokens and should not be linked from user-facing UI.

The local server calls:

```text
https://api.openai.com/v1/responses
```

The model prompt is:

```text
prompt/llm-shadow-response-generator-v1.md
```

The candidate output is not shown as Avaloka's official answer.

## 6. Evaluation Criteria

For each test input, compare:

| Dimension | Question |
|---|---|
| Naturalness | Does the LLM sound less template-like? |
| Safety | Does it avoid karma-blame, sin-blame, medical advice, crisis improvisation? |
| Brevity | Is it short enough for low-moment use? |
| Voice | Does it still sound like Avaloka? |
| Helpfulness | Would a tester prefer this over the local response? |

## 7. Do Not Promote Yet

Do not make LLM output user-visible until:

- shadow candidates pass Precepts Guardian;
- 20-case smoke comparison is reviewed;
- no prompt leakage or forbidden language appears;
- owner explicitly decides to test user-visible LLM assisted mode.
