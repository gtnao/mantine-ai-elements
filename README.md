# Mantine AI Elements

Composable AI SDK components built with Mantine, inspired by [AI Elements](https://elements.ai-sdk.dev/).

Build chat interfaces with Mantine components, theme overrides, and AI SDK hooks. `PromptInput` provides composable text and file input, shared draft state, input tools, and send/stop controls. This is an independent project, not an official Mantine or Vercel package.

## Installation

Install the package and its peer dependencies:

```sh
pnpm add mantine-ai-elements @mantine/core@^9.6.1 @mantine/hooks@^9.6.1 react@^19.3.0 react-dom@^19.3.0 ai@^7.0.99 @ai-sdk/react@^4.0.102
```

For testing changes from a local checkout, see [Contributing](https://github.com/gtnao/mantine-ai-elements/blob/main/CONTRIBUTING.md#testing-a-local-package).

Keep Mantine Core and Hooks on the same version. `@ai-sdk/react` is used by your application to provide `useChat`; the library itself only references AI SDK types. The package provides ESM, TypeScript declarations, and prebuilt CSS.

## Usage

Import styles once at the application entry point and use your existing `MantineProvider`:

```tsx
import '@mantine/core/styles.css';
import 'mantine-ai-elements/styles.css';
```

```tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { PromptInput } from 'mantine-ai-elements';

export function ChatInput() {
  const { sendMessage, status, stop } = useChat();

  return (
    <PromptInput onSubmit={({ text, files }) => sendMessage({ text, files })}>
      <PromptInput.Body>
        <PromptInput.Textarea aria-label="Message" placeholder="Type a message…" />
      </PromptInput.Body>
      <PromptInput.Footer>
        <PromptInput.Tools>{/* Add Mantine buttons or menus here. */}</PromptInput.Tools>
        <PromptInput.Submit status={status} onStop={() => stop()} />
      </PromptInput.Footer>
    </PromptInput>
  );
}
```

Configure your application's AI SDK transport/backend as usual. The library does not choose a model, endpoint, authentication method, or error UI.

For CSS layers, use both packages' `styles.layer.css` instead of `styles.css` and declare their order in your application CSS:

```css
@layer mantine, mantine-ai-elements;
```

Do not import both variants. Unlayered application CSS can override the layered component styles.

## Components and behavior

| Component | Purpose |
| --- | --- |
| `Image` / `AIImage` | AI SDK-generated images or URLs with Mantine styling and fallbacks |
| `Attachments`, `Attachment` | File and source previews, layouts, removal, and hover details |
| `Suggestion`, `Suggestions` | Scrollable prompt suggestions for draft entry or immediate sending |
| `Shimmer` | Animated text with Mantine theme and reduced-motion support |
| `Message` | Role styling, streaming Markdown, actions, and alternative response branches |
| `CodeBlock` | Lazy syntax highlighting, line numbers, copy feedback, and language selection |
| `Conversation` | Message log with scroll following, history navigation, empty state, and Markdown export |
| `InlineCitation` | Inline references with a Mantine popover and source carousel |
| `Context` | Context capacity, AI SDK token breakdown, and estimated cost |
| `Sources` | Expandable source URL references with customizable Mantine links |
| `Question` | Single/multiple choices, freeform answers, controlled drafts, and async submission |
| `Confirmation` | AI SDK approval requests, outcomes, shared pending state, and retryable responses |
| `Tool` | Static and dynamic AI SDK tool states, inputs, results, and errors |
| `Reasoning` | Streaming reasoning disclosure with Markdown, elapsed time, and automatic folding |
| `ModelSelector` | Searchable model dialog with keyboard navigation, provider logos, and application-owned selection |
| `PromptInput` | Text/file form, validation, screenshot capture, shared Provider, reference search, and submission guards |
| `PromptInput.Textarea` | Mantine Textarea props, autosize, Enter/Shift+Enter and IME handling |
| `PromptInput.Body` | Input content region |
| `PromptInput.Footer` | Toolbar and submit layout |
| `PromptInput.Tools` | Custom actions using ordinary Mantine components |
| `PromptInput.Submit` | `status`, `onStop`, `submitLabel`, `stopLabel`, and Mantine ActionIcon props |

Named exports (`PromptInputTextarea`, `PromptInputSubmit`, etc.) refer to the same implementations. Compound access should be used inside a client component in Next.js. Named exports can also be imported directly by server components when their props are serializable.

- Enter submits; Shift+Enter inserts a new line; IME confirmation does not submit.
- Blank text is ignored unless files are attached. The original text is preserved and `files` contains ready-to-send AI SDK file parts.
- Non-controlled inputs reset immediately when submission begins, matching AI Elements' local-input approach. A draft typed during the pending callback is preserved. Failed callbacks do not restore the previous text.
- With `value`/`onChange`, the application owns the text and its reset policy. Use this mode to retain text on failure.
- A pending callback prevents duplicate submissions. `submitted` and `streaming` states prevent Enter from submitting again.
- In those states, the submit button stops generation when `onStop` is supplied; otherwise it is disabled. A loading indicator does not disable an available stop action.
- `onSubmitError` receives exceptions/rejections from your callback. Errors reported by AI SDK through `useChat().error` are handled by the application.
- Textarea uses `name="message"` for the payload. Use one message textarea and one submit control per form. Avoid nesting forms.

See the [PromptInput guide](.storybook/content/prompt-input.md) for attachments, Provider state, reference search, input tools, and the Mantine Select mapping.

## Mantine customization

The root exposes `root`, `header`, `body`, `footer`, and `tools` Styles API selectors. Textarea and Submit forward the underlying Mantine components' Styles API and refs.

```tsx
import { createTheme } from '@mantine/core';
import { PromptInput } from 'mantine-ai-elements';

const theme = createTheme({
  components: {
    PromptInput: PromptInput.extend({
      styles: { root: { borderRadius: 24 }, footer: { padding: 8 } },
    }),
    PromptInputSubmit: PromptInput.Submit.extend({
      defaultProps: { color: 'grape', radius: 'xl' },
    }),
  },
});
```

The theme keys for the input and submit button are `PromptInputTextarea` and `PromptInputSubmit`. Section styling is owned by the root's Styles API.

## Documentation

Guides cover [getting started](.storybook/content/getting-started.md), [PromptInput](.storybook/content/prompt-input.md), [Conversation](.storybook/content/conversation.md), [CodeBlock](.storybook/content/code-block.md), [Message](.storybook/content/message.md), [Shimmer](.storybook/content/shimmer.md), [Suggestions](.storybook/content/suggestion.md), [Attachments](.storybook/content/attachments.md), [Image](.storybook/content/image.md), [ModelSelector](.storybook/content/model-selector.md), [Reasoning](.storybook/content/reasoning.md), [Tool](.storybook/content/tool.md), [Confirmation](.storybook/content/confirmation.md), [Question](.storybook/content/question.md), [Sources](.storybook/content/sources.md), [Context](.storybook/content/context.md), [InlineCitation](.storybook/content/inline-citation.md), and [Mantine customization](.storybook/content/customization.md).

The GitHub Pages workflow publishes these guides with live examples to [the documentation site](https://gtnao.github.io/mantine-ai-elements/). It also provides [llms.txt](https://gtnao.github.io/mantine-ai-elements/llms.txt), individual Markdown pages, and a combined `llms-full.txt` from the same source.

See [CHANGELOG.md](CHANGELOG.md) for changes and [RELEASING.md](RELEASING.md) for the release process.

## Contributing

Run `pnpm install` and `pnpm dev` to explore the components in Storybook at http://localhost:6006. The examples include streaming, cancellation, and error handling without an API key.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and verification instructions.

## License

[Apache-2.0](LICENSE). Components are adapted from [AI Elements](https://github.com/vercel/ai-elements); see [NOTICE](NOTICE) for attribution.
