# JSXPreview

Render a trusted JSX string with application-provided Mantine components and bindings. The parser loads on demand. Streaming input gets best-effort tag completion and retains the previous successful preview when parsing fails.

```tsx
import { Badge, Paper, Text } from '@mantine/core';
import { JSXPreview } from 'mantine-ai-elements';

const components = { Badge, Paper, Text };
const bindings = { title: 'Quarterly report' };

<JSXPreview
  trusted
  jsx='<Paper withBorder p="md"><Badge>Ready</Badge><Text>{title}</Text></Paper>'
  components={components}
  bindings={bindings}
>
  <JSXPreview.Content loading="Loading preview…" />
  <JSXPreview.Error title="Preview failed" />
</JSXPreview>
```

## Execution contract

`trusted` defaults to false. Until it is true, Content renders `untrustedFallback` and does not mount the parser or evaluate expressions. Set it only for source your application permits to execute in its own environment. The example above uses a fixed application-owned string.

This is an in-process JSX interpreter, not a sandbox or sanitizer. JSX expressions can call functions and reach JavaScript capabilities through objects, even without supplied bindings. The parser's default blocked script tags and event attributes do not establish an isolation boundary. Component maps restrict which custom components are resolved; they are not an execution allowlist. Model-generated text is not automatically trusted. For isolated generated HTML, use WebPreview with an appropriate iframe origin and sandbox policy.

Revoking `trusted` unmounts the preview and clears its remembered source. It cannot undo side effects already performed by JSX or custom components. Application components remain responsible for their own cleanup.

## Parts and state

| Export / compound name | API |
| --- | --- |
| `JSXPreview` | Required `jsx`; optional `isStreaming` (false), `trusted` (false), `components`, `bindings`, and `onError`; Box and native div props |
| `JSXPreviewContent` / `.Content` | Box and native div props; `loading` during lazy loading and `untrustedFallback` while disabled; children are produced by the parser |
| `JSXPreviewError` / `.Error` | Mantine Alert props; children may be a ReactNode or `(error) => ReactNode`; default content is the error message |
| `useJSXPreview` | Root context, including original and processed JSX, streaming/trust state, error, setters, component map and bindings |

Content, Error and the hook require a root. Named exports support composition from Next.js Server Components; component maps and function bindings must be created within a client module. `JSXPreviewRootProps` aliases `JSXPreviewProps`. All public types use the consumer's React types.

While streaming, incomplete trailing tags and expressions are omitted and open tags are closed where possible. Fragments, member names such as `UI.Card`, hyphenated tags and quoted `>` characters are handled. Completion is a best-effort display aid, not a complete JavaScript parser. Expressions are left intact when complete; invalid syntax falls back to the last successful source. Turn off `isStreaming` at completion to validate the original source without completion.

Intermediate errors are suppressed. A final parse failure or client component render error hides the failed output and reports `onError` once for that input. Replacing JSX, components or bindings retries rendering and clears the displayed error. Errors from event handlers or asynchronous work inside injected components remain those components' responsibility. Keep component maps and bindings stable when their values have not changed.

## Mantine customization

The WithUseChat story uses the real AI SDK hook with a deterministic text transport. It streams fixed application-owned JSX into the root, narrows text parts, exposes stop/retry and request failures, and demonstrates invalid final JSX followed by recovery. An injected Counter owns its event handler and React state. The fixture's known source justifies `trusted`; this example is not an endorsement of automatically trusting model output. Stop keeps completion enabled for the partial response, while a finished response is parsed as received.

Root and Content each own a `root` Styles API selector, native div ref, attributes, spacing props and theme defaults under their respective names. Error exposes all native Alert selectors and CSS variables, including `root`, `wrapper`, `body`, `title`, `message`, `icon`, and `closeButton`; use native Alert props for title, icon, color and dismissal behavior.

Injected Mantine components inherit the surrounding provider. No shadcn or Tailwind setup is needed.

## Upstream mapping and limits

All three AI Elements components and its public context hook are provided. Mantine Box and Alert own layout and error presentation. The additional explicit trust gate reflects that previews execute within the host. Render-time parser callbacks are delivered after commit, and client component render failures are caught by an error boundary.

The implementation reuses react-jsx-parser 2.4.1, whose runtime externalizes React. Its expression language supports bindings, calls, expression-bodied arrows, member components and render props; it is not a full JavaScript runtime syntax implementation. In particular, JSX comment expressions currently produce an unsupported-expression error. Parser-specific configuration is not forwarded as DOM attributes or presented as an isolation mechanism.
