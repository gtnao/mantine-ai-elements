# Task

Display a collapsible group of task details and file references. Task follows AI Elements' five-part composition with Mantine styling and native keyboard interaction.

```tsx
import { Task } from 'mantine-ai-elements';

<Task defaultOpened>
  <Task.Trigger title="Found project files" />
  <Task.Content>
    <Task.Item>Searching the component directory</Task.Item>
    <Task.Item>
      Read <Task.ItemFile component="span">src/index.ts</Task.ItemFile>
    </Task.Item>
  </Task.Content>
</Task>
```

Task is a presentation component. Your application supplies task titles, items, statuses, and progress. It does not execute tasks, count completions, or schedule progressive reveals. Add a Mantine Badge or Progress when your data includes that information.

## API and customization

- `Task` accepts Box props and `opened`, `defaultOpened` (true), `onChange`, and `disabled`. Its ref addresses the root div.
- `Task.Trigger` requires `title`. The default button displays a search icon, title, and rotating chevron. `icon` replaces the search icon; `children` replaces all default trigger content. Use Mantine `component` or `renderRoot` to replace the whole root, forwarding the supplied props and ref and preserving button semantics. Do not put a second button inside `children`. Cancel toggling with `event.preventDefault()` in `onClick`.
- `Task.Content` accepts Mantine Collapse props except `expanded`, which is controlled by Task. Its ref addresses the collapsible div. Multiple panels receive unique IDs and are labelled by the trigger. Override `aria-label` or `aria-labelledby` for content composed without a trigger.
- `Task.Item` is a polymorphic Mantine Text component, defaulting to a small dimmed div. Text props and its `root` Styles API selector are available.
- `Task.ItemFile` is a polymorphic Mantine Paper component with compact inline styling. It defaults to a div, with `withBorder` and `radius="sm"`. Its children are entirely application-owned, so you can add a file icon. Use `component="span"` when placing it inside a paragraph or span.

Named exports `TaskTrigger`, `TaskContent`, `TaskItem`, and `TaskItemFile` are available for React Server Component composition.

Task owns the `root`, `trigger`, `icon`, `title`, `chevron`, `content`, and `body` Styles API selectors. `body` addresses the indented content with its leading border. Customize these through `Task.extend()` in `theme.components.Task` or root `styles`/`classNames`/`attributes` props. Item and ItemFile have independent component themes named `TaskItem` and `TaskItemFile`. Native Mantine Text and Paper defaults also apply.

The trigger is a native non-submitting button by default, supports Enter and Space, and reflects `aria-expanded`. Long titles wrap; the content border and padding follow the writing direction. The custom chevron transition respects reduced motion, and content transitions use Mantine Collapse.

## Streaming structured tasks with AI SDK

The **With use object** story uses the current `useObject` hook from `@ai-sdk/react` with a schema and a custom fetch implementation. The fetch returns a deterministic streaming JSON response, so the real SDK parses partial objects without an API key or backend. It also demonstrates stopping, retrying, clearing, HTTP failures, and final schema validation failures.

`object` is a deeply partial value while streaming. Check for absent tasks, items, text, and filenames when rendering. Choose stable application identifiers for complete task and item records. `isLoading` controls request buttons; `stop()` keeps the partial object, and `clear()` removes it. The example stops the request on unmount and its fetch implementation clears timers and abort listeners.

Final schema validation failures arrive through `onFinish({ object, error })`; do not assume they populate the hook's request `error`. The example stores that validation error separately. When using `jsonSchema` directly, supply a runtime `validate` function if you need final data validation; its type parameter alone does not validate a response.

For a real service, replace the demo fetch with your endpoint. `useObject` expects JSON streamed as text matching your schema, not the `useChat` message stream protocol. Task itself does not depend on either hook and can render persisted or manually supplied data as well.
