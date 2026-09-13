# Queue

Display queued messages, todos, and file previews with independent collapsible sections. The composition follows AI Elements, using Mantine Paper, ScrollArea, Collapse, Text, Flex, Image, and ActionIcon.

```tsx
import { Group } from '@mantine/core';
import { Queue } from 'mantine-ai-elements';

<Queue>
  <Queue.Section>
    <Queue.SectionTrigger>
      <Queue.SectionLabel count={todos.length} label="Tasks" />
    </Queue.SectionTrigger>
    <Queue.SectionContent>
      <Queue.List listProps={{ 'aria-label': 'Tasks' }}>
        {todos.map((todo) => (
          <Queue.Item key={todo.id}>
            <Group gap="xs" wrap="nowrap">
              <Queue.ItemIndicator completed={todo.status === 'completed'} />
              <Queue.ItemContent completed={todo.status === 'completed'}>
                {todo.title}
              </Queue.ItemContent>
              <Queue.ItemActions>
                <Queue.ItemAction
                  aria-label={`Remove ${todo.title}`}
                  onClick={() => removeTodo(todo.id)}
                >
                  ×
                </Queue.ItemAction>
              </Queue.ItemActions>
            </Group>
          </Queue.Item>
        ))}
      </Queue.List>
    </Queue.SectionContent>
  </Queue.Section>
</Queue>
```

Queue presents your data. Scheduling, ordering, sending, retry policy, and persistence remain application responsibilities. It does not automatically send the next item, infer completion, or mutate a queue.

## AI SDK and PromptInput

The **With use chat** example uses the real `useChat` hook and a deterministic transport. PromptInput submissions become queued drafts; their file parts already contain data URLs, so clearing the input does not invalidate a queued attachment. You can add another draft during a response, remove waiting drafts, stop the active reply, and simulate a failed request.

A resolved `sendMessage` promise alone does not prove a successful response: AI SDK reports transport errors through its error state and callback. The example removes a draft only after `onFinish` reports neither an error nor an abort. Failed or stopped attempts retain it. A synchronous ref prevents duplicate dispatch before React updates the buttons. Retrying uses `messageId` to replace the previous user message and its partial reply rather than append duplicate attempts. This truncates chat history after that message, so adapt that policy when your application supports independent conversation branches.

The demo keeps drafts in memory and waits for a complete reply before removing them. If your application considers server acceptance sufficient, implement that policy explicitly. Persisting drafts and retaining file data across reloads belong to the application.

## Components and types

All children have named exports (`QueueItem`, `QueueList`, `QueueSectionTrigger`, and so on) as well as the compound names below. `QueueSection` also exposes `.Trigger`, `.Label`, and `.Content`. Use named children in React Server Components.

| Component | API and behavior |
| --- | --- |
| `Queue` | Mantine Paper props; defaults to a bordered card with `radius="lg"`, `shadow="xs"`, and compact padding. |
| `Queue.Section` | `opened`, `defaultOpened` (true), `onChange`, and `disabled`. Sections open independently. |
| `Queue.SectionTrigger` | Native button props and UnstyledButton styling. Always `type="button"`; cancel toggling with `event.preventDefault()`. |
| `Queue.SectionLabel` | Required `label`, optional `count` and `icon`. A zero count is displayed. `children` replaces count/label content. The chevron reflects the section state. |
| `Queue.SectionContent` | Mantine Collapse props except `expanded`, which comes from the section. Each region has a unique ID and is labelled by its section trigger. Override `aria-label`/`aria-labelledby` when composing content without a trigger. |
| `Queue.List` | ScrollArea props, `mah` (160 by default), `h`, `viewportRef`, `viewportProps`, and `listProps` for the semantic `ul` and its ref. Scrollbar defaults are vertical with space reserved when present. |
| `Queue.Item` | A styled `li`; place it in Queue.List or your own `ul`/`ol`. |
| `Queue.ItemIndicator` | `completed`; an accessible image named “Pending” or “Completed”. Override its accessible label or use `aria-hidden` if another element supplies the status. |
| `Queue.ItemContent` | Mantine Text props, a span, `completed`, and a default one-line clamp. Override `lineClamp` to show more text. |
| `Queue.ItemDescription` | Mantine Text props, a div, `completed`, and small indented text. Completed content and descriptions use strikethrough. |
| `Queue.ItemActions` | Mantine Flex props for action layout. |
| `Queue.ItemAction` | Mantine ActionIcon props and all its Styles API selectors. Supply an accessible label. Defaults to a subtle gray button; `size`, `variant`, `disabled`, and `loading` are customizable. |
| `Queue.ItemAttachment` | Mantine Flex props with wrapping and spacing. |
| `Queue.ItemImage` | Native image attributes and Mantine Image props, including `fallbackSrc`. Defaults to 32×32 and empty alt text; describe meaningful previews with `alt`. |
| `Queue.ItemFile` | A filename chip with an optional replacement `icon`. The visible filename truncates; the full child text remains in the DOM. |

Exported data interfaces follow AI Elements: `QueueMessagePart` has `type` and optional `text`, `url`, `filename`, and `mediaType`; `QueueMessage` has `id` and `parts`; `QueueTodo` has `id`, `title`, optional `description`, and optional `status: 'pending' | 'completed'`. These are convenience types, not a scheduler or an AI SDK message replacement.

## Mantine styling and accessibility

Use each component's `.extend()` with its full name in `theme.components`. Root and item primitives expose `root`; ItemAction exposes the native ActionIcon selectors; ItemFile exposes `root`, `icon`, and `label`. QueueSection owns `root`, `trigger`, `content`, and `body`. QueueSectionLabel owns `root`, `chevron`, and `label`.

QueueList exposes `root` for its height-constrained wrapper, `scrollArea` for the inner Mantine ScrollArea root, `list` for the `ul`, and native `viewport`, `scrollbar`, `thumb`, `corner`, and `content` selectors. The component ref addresses the outer wrapper, while `viewportRef` addresses the scrollable viewport. Native ScrollArea props are forwarded to the inner ScrollArea. `className`/`style` and `mah`/`h` address the outer wrapper. Use `viewportProps={{ tabIndex: 0, role: 'region', 'aria-label': 'Queued tasks' }}` when the list itself should be keyboard-scrollable.

On devices with a fine pointer, item actions appear on hover or when focus is anywhere in the item. Touch devices show them continuously. Outside a QueueItem they remain visible. Keep action labels meaningful, and use Mantine Tooltip when additional instructions help. Long labels wrap, directional spacing respects RTL, and custom transitions respect reduced motion.
