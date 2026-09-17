# Snippet

Display a short command in a read-only Mantine Input with optional prefix, supplementary content, and a copy action. Use CodeBlock for multiline code and syntax highlighting.

```tsx
import { Snippet } from 'mantine-ai-elements';

<Snippet code="pnpm add mantine-ai-elements">
  <Snippet.Addon>
    <Snippet.Text aria-hidden>$</Snippet.Text>
  </Snippet.Addon>
  <Snippet.Input aria-label="Install command" />
  <Snippet.Addon align="inline-end">
    <Snippet.CopyButton onError={(error) => showError(error.message)} />
  </Snippet.Addon>
</Snippet>
```

`showError` is an application callback. Copying requires a browser with Clipboard API access, normally in a secure context. The library reports unavailable or rejected clipboard operations through `onError` and permits retrying.

## Composition

| Export / compound name | API |
| --- | --- |
| `Snippet` | Required `code: string`; native Paper props and `disabled` for the entire group |
| `SnippetAddon` / `.Addon` | Box props; `align="inline-start"` (default), `inline-end`, `block-start`, or `block-end` |
| `SnippetText` / `.Text` | Polymorphic Text, rendered as a small dimmed span by default |
| `SnippetInput` / `.Input` | Mantine Input props and native input attributes, excluding `value`, `defaultValue`, and `readOnly` |
| `SnippetCopyButton` / `.CopyButton` | ActionIcon/button props; `onCopy`, `onError`, `timeout`, `copyLabel`, and `copiedLabel` |

The input value comes from the nearest Snippet and is always read-only. Provide an `aria-label` or an associated label. Addons at block positions occupy their own rows; inline addons sit alongside the input. Clicking non-interactive addon content focuses the input. An addon `onClick` can cancel this behavior with `event.preventDefault()`. Links and controls retain their own interaction.

Input and CopyButton can render independently and use an empty code string without a parent, matching the upstream default context. Normally compose them within Snippet. Prefixes and addon text are excluded from copied content.

CopyButton defaults to a 32px subtle gray action with a copy icon. After success, it displays a check mark and `copiedLabel="Copied"` for `timeout={2000}` milliseconds. `copyLabel` defaults to `Copy`. `aria-label` and `title` can override the corresponding native attributes, and children replace the icon. Pending and already-confirmed copies do not start duplicate clipboard requests. Changing `code` clears confirmation; a pending copy of older content does not mark the new value as copied. Unmounting prevents late callbacks and clears feedback timers.

`onCopy` fires after the browser completes the clipboard write. `onError` receives an Error for unavailable or rejected writes. Native `onClick` is preserved; calling `preventDefault()` cancels copying. Disabled/loading copy buttons do not run the action.

## Mantine customization

Use `Snippet.extend`, `SnippetAddon.extend`, `SnippetText.extend`, `SnippetInput.extend`, and `SnippetCopyButton.extend` in MantineProvider. Each part also accepts `classNames`, `styles`, `vars`, and `attributes`.

Root, Addon, and Text expose `root`. Input exposes native `wrapper`, `input`, `section`, and `bottomSection` slots and input CSS variables. CopyButton exposes native `root`, `icon`, and `loader` slots and ActionIcon variables. Native Mantine defaults remain available, including Input wrapper context, Paper radius, and ActionIcon colors. Input refs point to the actual input; `rootRef` points to its wrapper.

```tsx
<Snippet code={command} radius="lg">
  <Snippet.Input
    aria-label="Command"
    styles={{ input: { fontWeight: 500 } }}
  />
  <Snippet.Addon align="inline-end">
    <Snippet.CopyButton color="grape" variant="light" />
  </Snippet.Addon>
</Snippet>
```

## AI Elements mapping

All five upstream exports are provided. Mantine Paper/Input/ActionIcon and normal CSS replace shadcn InputGroup primitives. Four addon alignments and read-only selection are retained. Native Mantine sizes and variants replace shadcn-specific button sizes. Copy callbacks, custom children, and the two-second confirmation remain, with additional pending/stale/unmount guards and localizable feedback. This utility accepts strings and does not require an AI SDK hook.
