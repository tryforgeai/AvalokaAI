# Avaloka V1 Design Notes

Status: Active UI guidance

## Product Feeling

Avaloka should feel like a quiet private room in a difficult moment: warm, steady, plain, and low-pressure. It should not feel like a dashboard, clinic intake form, religious lesson, or AI debugging console.

## Interface Modes

- User mode is the default. It shows chat, a light feedback prompt, and local data controls.
- Developer mode is explicit: add `?dev=1` or `?mode=dev` to the URL. It can show Baifa, Compassion OS, Guardian, latency, local baseline, and export debug details.
- Internal reasoning, routing, guardrails, and model labels must not appear in default user mode.

## Visual Priorities

1. The chat is the primary surface.
2. Feedback is secondary and should feel optional.
3. Export and clear controls are utility actions.
4. Developer diagnostics are tertiary and hidden by default.

## Copy Principles

- Use ordinary, compassionate Chinese.
- Avoid religious display language, clinical framing, and implementation terms in user mode.
- Error and loading states should be calm and useful, without exposing system internals.

## Component Guidance

- Use warm low-contrast dark surfaces, but keep text readable for older users.
- Use the lamp accent sparingly for orientation, not decoration.
- Crisis states need clear visual separation and direct safety language.
- Destructive actions should remain visually distinct and should receive confirmation before real-user testing.

