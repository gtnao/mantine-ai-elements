# Reasoning

Display reasoning text provided by your application, with a disclosure, streaming indicator, elapsed time, and Markdown. Import the package stylesheet once alongside Mantine styles.

```tsx
import { Reasoning } from 'mantine-ai-elements';

<Reasoning isStreaming={isStreaming}>
  <Reasoning.Trigger />
  <Reasoning.Content>{reasoningText}</Reasoning.Content>
</Reasoning>
```

## AI SDK

Render each `reasoning` part of a `useChat` message separately. The installed AI SDK exposes optional `part.state` values `streaming` and `done`. Gate streaming on the chat status too, so stopping or failing a request ends the indicator even if its last part remains marked streaming.

```tsx
message.parts.map((part, index) =>
  part.type === 'reasoning' ? (
    <Reasoning
      key={part.id ?? index}
      isStreaming={status === 'streaming' && part.state === 'streaming'}
    >
      <Reasoning.Trigger />
      <Reasoning.Content>{part.text}</Reasoning.Content>
    </Reasoning>
  ) : null
);
```

Your provider and server must supply reasoning parts; the component does not generate reasoning or choose a model. The Storybook example uses a deterministic transport with real `reasoning-start`, `reasoning-delta`, and `reasoning-end` chunks and requires no API key.

## State and timing

- `opened`, `defaultOpened`, and `onChange(opened)` follow Mantine's controlled/uncontrolled convention. Idle panels start closed; streaming panels start open unless `defaultOpened={false}`.
- Starting a stream opens the panel unless automatic opening was explicitly disabled. Manually closing it during that stream is respected. A subsequent stream may open it again.
- After streaming ends, an open panel automatically closes after one second, once per mounted Reasoning. It can then be reopened for reading. Historical panels that never streamed do not auto-close. Restarting a stream or unmounting cancels a pending close timer.
- `duration` supplies an application-measured duration in seconds. Otherwise the component measures mounted streaming time and rounds up to whole seconds. A new stream clears the previous measured duration. This is elapsed UI time, not provider billing or historical server timing.
- `duration={0}` preserves AI Elements' “Thinking...” convention. An unknown idle duration displays “Thought for a few seconds”.
- `disabled` disables the default trigger; controlled state and streaming effects remain active.

Controlled users receive change requests and remain responsible for updating `opened`.

## Composition and customization

`Reasoning.Trigger` and `Reasoning.Content` also have named exports `ReasoningTrigger` and `ReasoningContent`. `useReasoning()` returns `{ isStreaming, isOpen, setIsOpen, duration }` for custom children and must run inside the root.

The root forwards Mantine Box and div props and its div ref. Its Styles API selectors are `root`, `trigger`, `content`, and `chevron`. Use `Reasoning.extend(...)` in `theme.components` for shared defaults and styles. The trigger is a Mantine UnstyledButton with button props/ref, disabled support, and a cancellable `onClick`. Its type is always `button`, so it can be placed inside a form. `getThinkingMessage(isStreaming, duration)` replaces the status label; `children` replaces the complete trigger content.

The trigger and content provide connected disclosure IDs, `aria-expanded`, and a labelled region. Keep one trigger/content pair per root. The root `id` sets their shared ID prefix; child disclosure IDs and ARIA relationships are managed by Reasoning.

Content forwards Mantine Collapse props and its div ref. Its `children` is Markdown text. `responseProps` customizes [Message.Response](./message.md), including renderers, plugins, translations, and streaming behavior. Collapse owns `expanded`; the Reasoning state controls it. Set `transitionDuration`, `keepMounted`, or `keepMountedMode` using normal Mantine props. Mantine's `respectReducedMotion` theme setting controls Collapse motion; the chevron and Shimmer also respect reduced motion.

## AI Elements mapping

All four upstream exports are represented. Mantine's `opened` / `defaultOpened` / `onChange` replace Radix's `open` / `defaultOpen` / `onOpenChange`. Use normal button props and children instead of `asChild`. Unlike the upstream continuous auto-open effect, manual closing remains effective while streaming. Markdown uses the shared Mantine Message renderer with code, math, Mermaid, and CJK support. No shadcn or Tailwind setup is needed.
