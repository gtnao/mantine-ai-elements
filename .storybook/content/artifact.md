# Artifact

Display generated documents, code, images, or other output in a Mantine Paper with a header, actions, and scrollable content. Every part works independently; the application owns generation, closing, copying, downloading, and persistence.

```tsx
import { Artifact } from 'mantine-ai-elements';

{opened && (
  <Artifact>
    <Artifact.Header>
      <div>
        <Artifact.Title>{title}</Artifact.Title>
        <Artifact.Description>Generated document</Artifact.Description>
      </div>
      <Artifact.Actions>
        <Artifact.Action
          label="Copy document"
          tooltip="Copy Markdown"
          icon={<CopyIcon size={16} />}
          disabled={isLoading}
          onClick={copyDocument}
        />
        <Artifact.Close label="Close document" onClick={() => setOpened(false)} />
      </Artifact.Actions>
    </Artifact.Header>
    <Artifact.Content mah={360} tabIndex={0} role="region" aria-label="Document">
      {renderDocument(document)}
    </Artifact.Content>
  </Artifact>
)}
```

`CopyIcon`, state, callbacks, and the content renderer above belong to the application. Handle clipboard failures and release object URLs when implementing downloads. Closing does not implicitly abort a request or delete its output.

## Parts and native APIs

| Export / compound name | Mantine base | Defaults and behavior |
| --- | --- | --- |
| `Artifact` | Paper | Bordered, `radius="lg"`, `shadow="sm"`, vertical layout, clipped outer corners |
| `ArtifactHeader` / `.Header` | Flex | Padded, bordered, muted background; wraps with `gap="sm"` |
| `ArtifactTitle` / `.Title` | Text | Paragraph, `size="sm"`, `fw={500}`; use `component="h2"` for a heading |
| `ArtifactDescription` / `.Description` | Text | Paragraph, small dimmed text |
| `ArtifactActions` / `.Actions` | Flex | Wrapping action group with 4px gap |
| `ArtifactAction` / `.Action` | ActionIcon | 32px subtle gray button; optional `icon`, `label`, `tooltip`, `tooltipProps` |
| `ArtifactClose` / `.Close` | ActionIcon | Same API, default X icon and localizable `label="Close"` |
| `ArtifactContent` / `.Content` | Box | Padded flexible scrolling area; use `h`/`mah` to bound height |

All parts forward native attributes and refs and support Mantine's polymorphic `component` / `renderRoot` APIs. Use `component="a"` and `href` for navigation actions. Native ActionIcon `disabled`, `loading`, sizes, colors, variants, and loader options remain available. Icon elements take precedence over children. Supply an accessible name for icon-only actions: `aria-label` takes precedence over `label`, which falls back to `tooltip`. Tooltips respond to hover and keyboard focus; configure them with `tooltipProps`.

`ArtifactContent` does not impose a role or accessible name. For independently scrollable content, provide `tabIndex={0}`, `role="region"`, and a descriptive `aria-label`, as above. Choose content semantics appropriate to the document.

## Theme and Styles API

Each part has its own Mantine component name and `extend` API. Layout/text parts expose `root`; action and close parts expose ActionIcon's `root`, `icon`, and `loader` selectors and native CSS variables. Native Paper, Text, Flex, ActionIcon, and Tooltip theme defaults also apply. Customize part defaults, `classNames`, `styles`, `vars`, and `attributes` through MantineProvider or individual props.

```tsx
const theme = createTheme({
  components: {
    Artifact: Artifact.extend({ defaultProps: { radius: 'xl' } }),
    ArtifactAction: Artifact.Action.extend({
      defaultProps: { color: 'grape', variant: 'light' },
      styles: { icon: { opacity: 0.9 } },
    }),
  },
});
```

Import `createTheme` from `@mantine/core`. Both compound and named component exports reference the same components. Use named exports when composing client components from a Next.js Server Component.

## AI SDK integration

The **With Use Object** story uses the real AI SDK `useObject` hook with a local chunked JSON response and runtime schema validation. It displays partial report content, supports stopping and retrying, preserves generation while the panel is closed, and enables clipboard/download only after successful validation. Request and clipboard errors remain visible. The example needs no API key; replace its `fetch` and endpoint with your application's transport.

Artifact itself accepts arbitrary React content and does not execute generated code. Compose `CodeBlock`, `Message.Response`, or an application renderer in its content area. For interactive previews, choose a renderer with an appropriate execution boundary.

## AI Elements mapping

All eight upstream parts are provided. `icon` accepts a React element instead of a Lucide component constructor, following Mantine conventions. Actions use native ActionIcon APIs instead of shadcn Button variants; tooltips use Mantine Tooltip. Header/actions wrap on narrow screens. Closing and all action side effects remain application-owned, as in upstream. There is no implicit artifact store or execution engine.
