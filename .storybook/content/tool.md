# Tool

Compose a tool call from the AI SDK's input, output, state, and name. The component displays a tool; execution, approval, retry, and persistence remain application responsibilities.

```tsx
import { Tool } from 'mantine-ai-elements';

<Tool defaultOpened>
  <Tool.Header type="tool-web-search" state="output-available" />
  <Tool.Content>
    <Tool.Input input={{ query: 'Mantine', limit: 5 }} />
    <Tool.Output output={{ matches: 0, cached: false }} />
  </Tool.Content>
</Tool>
```

Import the library stylesheet once with Mantine styles. `ToolHeader`, `ToolContent`, `ToolInput`, `ToolOutput`, and `ToolStatusBadge` are also available as named exports.

## AI SDK parts

`ToolPart` is the union of the installed AI SDK's `ToolUIPart` and `DynamicToolUIPart`. Narrow `message.parts` with `isToolUIPart` from `ai`. Use the part's `toolCallId` for a stable key within its message.

```tsx
<Tool defaultOpened>
  {part.type === 'dynamic-tool' ? (
    <Tool.Header type={part.type} toolName={part.toolName} state={part.state} />
  ) : (
    <Tool.Header type={part.type} state={part.state} />
  )}
  <Tool.Content>
    <Tool.Input input={part.input} />
    <Tool.Output output={part.output} errorText={part.errorText} />
  </Tool.Content>
</Tool>
```

Static names remove the `tool-` prefix and preserve remaining hyphens. Dynamic tools require `toolName`. `title` overrides either derived name. Approval metadata, raw invalid input, and preliminary-output indicators can be rendered as custom content when relevant to your application.

| AI SDK state | Default badge |
| --- | --- |
| `input-streaming` | Pending |
| `input-available` | Running |
| `approval-requested` | Awaiting Approval |
| `approval-responded` | Responded |
| `output-available` | Completed |
| `output-error` | Error |
| `output-denied` | Denied |

Labels and icons accompany colors. `Tool.StatusBadge` accepts the normal Mantine Badge props plus `state`; `children`, `color`, and `leftSection` customize its content. `Tool.Header` forwards these options through `statusBadgeProps`. `getStatusBadge(state)` returns the default badge for custom compositions. A tool state describes the AI SDK part; stopping a chat does not automatically change that part to an error. Applications can add stopped/cancelled feedback separately.

The Storybook transport uses real `tool-input-start`, `tool-input-delta`, `tool-input-available`, and result/error chunks through `useChat`, for both static and dynamic tools. It requires no API key.

## Disclosure and Mantine customization

`Tool` accepts Box/div props, a div ref, and `opened`, `defaultOpened`, `onChange(opened)`, and `disabled`. It starts closed unless requested otherwise. Like the upstream implementation, state badges do not automatically open a completed tool; set `defaultOpened` or control `opened` in your application.

The root Styles API selectors are `root`, `header`, `name`, `chevron`, `content`, and `body`. Configure `Tool.extend(...)` in `theme.components` or pass `classNames`, `styles`, `unstyled`, and other Mantine styling props directly. `body` owns the interior padding and vertical spacing; `content` belongs to Collapse so animation dimensions remain independent of padding.

`Tool.Header` is a Mantine UnstyledButton with a button ref and connected disclosure attributes. The `type` prop identifies the tool; its HTML type is always `button`. Native disabled behavior and a cancellable `onClick` are preserved. `children` replaces the header's complete content. Keep one header/content pair in each Tool; root `id` sets their shared ID prefix.

`Tool.Content` forwards Collapse props and its div ref. Its `expanded` value and disclosure IDs are managed by Tool. Use `transitionDuration`, `keepMounted`, and `keepMountedMode` as in Mantine. Collapse honors the Mantine `respectReducedMotion` theme setting; the chevron respects the browser preference.

`Tool.Input` and `Tool.Output` can also be used outside a Tool. Each has its own factory, theme key, div ref, Box/div props, and `root` / `label` Styles API selectors. Output additionally exposes `error`. `ToolStatusBadge` forwards its own theme and Styles API to all public Badge slots while retaining the native Badge theme.

## Input and output rendering

Input is formatted as JSON in [CodeBlock](./code-block.md). During partial input, `undefined` displays an empty code block. Set `label` (default “Parameters”), provide `children` for a custom rendering, or use `codeBlockProps` to customize the underlying block.

Output objects, numbers, booleans, and null are formatted as JSON; strings are shown as code text. `0`, `false`, `null`, and an empty string remain visible results. Only absent output, error, and children render nothing. A React element passed as `output`, or custom `children`, renders directly. Use this for Markdown, tables, files, or application controls.

`errorText` renders a separate alert, alongside any partial output. `label` defaults to “Result”; `errorLabel` defaults to “Error”. Both accept React content. `codeBlockProps` controls the default block except its data-derived `code`.

Dynamic values that cannot be JSON-serialized display “[Unable to serialize value as JSON]” instead of crashing the surrounding interface. Provide custom children/output elements to represent cyclic objects or non-JSON application values. The fallback is display behavior, not a serialization format for transport.

## AI Elements mapping

All upstream exports and all seven states are represented. Mantine disclosure props replace Radix `open` / `defaultOpen` / `onOpenChange`, and normal button props replace `asChild`. Formatting reuses the package's CodeBlock. Falsy results are preserved rather than silently discarded by the upstream truthiness check. No shadcn or Tailwind setup is required.
