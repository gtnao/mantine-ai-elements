# Checkpoint

Mark a point in a conversation and attach an application-owned restore action. Checkpoint preserves AI Elements' icon, trigger, and trailing separator composition using Mantine Button, Tooltip, and Divider.

```tsx
import { Checkpoint } from 'mantine-ai-elements';

<Checkpoint>
  <Checkpoint.Icon />
  <Checkpoint.Trigger
    tooltip="Discard messages after this point"
    disabled={status === 'submitted' || status === 'streaming'}
    onClick={() => setMessages((current) => {
      const index = current.findIndex((message) => message.id === checkpointId);
      return index < 0 ? current : current.slice(0, index + 1);
    })}
  >
    Restore checkpoint
  </Checkpoint.Trigger>
</Checkpoint>
```

`setMessages` is the real `useChat` helper. The application chooses a stable message ID and retains messages through that ID, inclusive. Disable restoration while a response is in progress; stop the response first if the user wants to restore during generation. A missing checkpoint ID leaves the current history intact.

This changes local chat history. Persistence, branch storage, confirmation before discarding messages, tool side effects, and workspace restoration belong to your application. The component does not keep snapshots or run an undo operation. The **With use chat** story uses a deterministic AI SDK transport without an API key and demonstrates continuing, stopping, restoring, and continuing again.

## API and Mantine customization

- `Checkpoint` is a div with `root` and `line` Styles API selectors. It appends a Mantine Divider after its children. `dividerProps` customizes that divider.
- `Checkpoint.Icon` defaults to a decorative bookmark. `size` accepts a Mantine CSS size (default `16`). `children` replaces the bookmark with a whole custom icon. Its `root` selector and ref address a stable span wrapper; SVG-specific attributes and the default SVG ref go in `svgProps`.
- `Checkpoint.Trigger` accepts native Mantine Button props, all Button Styles API selectors, a button ref, `disabled`, and `loading`. It always uses `type="button"` and defaults to `variant="subtle"`, `size="compact-sm"`, and `color="gray"`. Its label wraps on narrow screens.
- `tooltip` accepts React content. `tooltipProps` customizes Mantine Tooltip placement, delays, appearance, and events. Hover and keyboard focus are enabled by default, with `position="bottom-start"`. Native disabled buttons are not focusable.

Use `Checkpoint.extend`, `CheckpointIcon.extend`, and `CheckpointTrigger.extend` under the corresponding Mantine theme component names. Native Button and Divider theme defaults also apply. `onClick` owns the restore operation; use application state to provide pending and error feedback for asynchronous persistence.

Named exports `CheckpointIcon` and `CheckpointTrigger` are available alongside the compound API. Use named child exports when composing from a React Server Component.
