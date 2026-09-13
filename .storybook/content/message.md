# Message

Compose user and assistant messages with Mantine styling, streaming Markdown, actions, and alternative response branches. The application owns history, generation, reactions, and persistence.

```tsx
import { Message } from 'mantine-ai-elements';

{messages.map((message) => (
  <Message key={message.id} from={message.role}>
    <Message.Content>
      <Message.Response
        isAnimating={status === 'streaming' && message.id === messages.at(-1)?.id}
      >
        {message.parts.filter((part) => part.type === 'text').map((part) => part.text).join('')}
      </Message.Response>
    </Message.Content>
    <Message.Actions>
      <Message.Action label="Regenerate response" tooltip="Try again" onClick={() => regenerate()}>
        R
      </Message.Action>
    </Message.Actions>
  </Message>
))}
```

Use messages, status, and regenerate from AI SDK `useChat`. A working API-key-free example is available in Storybook. Render reasoning, files, and tools separately from text parts.

## Message composition

`from` accepts AI SDK's `user`, `assistant`, and `system` roles. User messages align to the end and receive a subtle background. Root `ref` points to the message div. Root Styles API selectors are `root`, `content`, `actions`, and `toolbar`; override them through `Message.extend`, `classNames`, or `styles`.

Content, Actions, and Toolbar also work standalone. Toolbar arranges branch navigation and actions on a wrapping row. Action accepts Mantine ActionIcon props, `label`, `tooltip`, and `tooltipProps`. It defaults to a button with `type="button"`; an explicit `aria-label` takes precedence over label and tooltip. Theme actions with `MessageAction`.

All compound children also have named exports: `MessageContent`, `MessageActions`, `MessageAction`, `MessageToolbar`, and `MessageResponse`.

## Streaming Markdown

MessageResponse uses Streamdown's parser and its code, CJK, math, and Mermaid plugin model. It repairs incomplete Markdown during streaming and renders GFM tables, task lists, strikethrough, code fences, links, images, and math. Math follows the upstream default: use `$$...$$`; use a configured math plugin to enable single-dollar inline math.

The package includes the required KaTeX dependency and stylesheet import. No Tailwind configuration, shadcn component installation, or external font CDN is required. Mermaid loads when a diagram is rendered. Shiki language data loads on demand. Your bundler must support dependency CSS imports, as Vite and Next.js do.

Response has its own `root` Styles API and `MessageResponse` theme key. Its controls use Mantine Button, ActionIcon, Menu, Modal, Table, and Anchor. Code blocks reuse [CodeBlock](./code-block.md), including light/dark colors and configurable syntax highlighting. Fullscreen views use Mantine Modal focus management and Escape handling.

Useful props inherited from Streamdown include:

- `mode`, `isAnimating`, `parseIncompleteMarkdown`, `animated`, `caret`, and animation callbacks.
- `components`, `plugins`, `shikiTheme`, `mermaid`, and `translations`.
- `controls`, `lineNumbers`, `codeBlockMaxHeight`, and `tableMaxHeight`.
- Markdown parsing/sanitization options such as `allowedElements`, `disallowedElements`, `allowedTags`, `skipHtml`, `urlTransform`, `remarkPlugins`, and `rehypePlugins`.

`components` overrides individual renderers. Supplying `plugins` replaces the defaults, matching AI Elements; provide each plugin you want to retain. Renderer and control changes take effect even when the text is unchanged. Reduced-motion preferences disable streaming animations.

Code fence metadata supports `startLine=10` and `noLineNumbers`. Custom language renderers in `plugins.renderers` receive source, language, metadata, and incomplete status.

## Response controls

```tsx
<Message.Response
  controls={{
    code: { copy: true, download: { filename: 'example.ts' } },
    table: { copy: true, download: { filename: 'results' }, fullscreen: true },
    mermaid: { copy: true, download: true, fullscreen: true, panZoom: true },
    image: { download: true },
  }}
>
  {text}
</Message.Response>
```

Pass `controls={false}` to hide all controls, or disable individual operations. Generation disables copy/download/fullscreen actions. Code and diagram copy settings accept `onCopy`/`onError` callbacks. Table copy supports CSV, TSV, and Markdown; downloads support CSV and Markdown. Diagram downloads support SVG, PNG, and Mermaid source (`.mmd`). Diagram zoom buttons, reset, and pointer dragging operate on the displayed view.

Image downloads use fetch and therefore respect the source server's cross-origin policy. Download errors are shown inline. Failed image loads show the image alternative text. Mermaid failures expose retry and source, or your `mermaid.errorComponent`; a previous valid diagram can remain visible while streaming incomplete syntax.

## Links and generated content

`linkSafety={{ enabled: true }}` opens a Mantine confirmation modal with copy-link and open-link actions. An optional `onLinkCheck(url)` can approve a link automatically; `renderModal` replaces the modal. Page-fragment links stay in the current page.

Default Markdown sanitization is retained. Mermaid defaults to strict mode. Custom renderers, parser plugins, and Mermaid configurations are application code: review them before rendering untrusted output, especially if you relax sanitization or Mermaid's security level.

## Response branches

```tsx
<Message.Branch branch={branch} onBranchChange={setBranch}>
  <Message.Branch.Content>
    {versions.map((version) => (
      <Message.Content key={version.id}>
        <Message.Response>{version.text}</Message.Response>
      </Message.Content>
    ))}
  </Message.Branch.Content>
  <Message.Toolbar>
    <Message.Branch.Selector>
      <Message.Branch.Previous />
      <Message.Branch.Page />
      <Message.Branch.Next />
    </Message.Branch.Selector>
  </Message.Toolbar>
</Message.Branch>
```

Use one Branch.Content per Branch, with stable child keys. Omit `branch` and use `defaultBranch` for uncontrolled state. Indices are zero-based; previous/next wrap around. Inactive branches stay mounted, preserving local state. Out-of-range values are clamped for display, and navigation is hidden with fewer than two branches. The application remains responsible for changing actual AI SDK history when appropriate.

Branch uses the `MessageBranch` theme key and selectors `root`, `panel`, `selector`, and `page`. Navigation accepts Mantine ActionIcon props, including labels and cancellable `onClick`; theme keys are `MessageBranchPrevious` and `MessageBranchNext`. Page accepts `formatLabel(current, total)` for localization; current is one-based, or zero when empty.

Named `MessageBranch`, `MessageBranchContent`, `MessageBranchSelector`, `MessageBranchPrevious`, `MessageBranchNext`, and `MessageBranchPage` exports are available.

## Intentional differences from AI Elements

- Mantine props, themes, refs, and Styles API replace shadcn/Tailwind styling conventions.
- `branch` adds controlled state while preserving `defaultBranch` and `onBranchChange`.
- Response controls use translated text labels and Mantine components. Streamdown's Tailwind `prefix` and default-control `icons` props are omitted; customize Mantine themes or replace a renderer with `components` instead.
- Fullscreen and link confirmation use Mantine Modal. Static Markdown remains accessible during highlighting and diagram loading.
- Actions do not implement copy, regenerate, or reactions automatically. Connect callbacks to the currently selected response and your application state.
