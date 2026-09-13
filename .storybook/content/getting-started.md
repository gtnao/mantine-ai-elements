# Getting started

Mantine AI Elements provides composable AI SDK components with Mantine styling and theming. Start with `PromptInput`, a text input with send/stop controls that connects to your own `useChat` instance.

These docs track the repository's main branch. Check the package version and release notes when using a published version.

## Installation

Install from npm:

```sh
pnpm add mantine-ai-elements @mantine/core@^9.6.1 @mantine/hooks@^9.6.1 react@^19.3.0 react-dom@^19.3.0 ai@^7.0.99 @ai-sdk/react@^4.0.102
```

To test changes from a local checkout, follow the [contributor instructions](https://github.com/gtnao/mantine-ai-elements/blob/main/CONTRIBUTING.md#testing-a-local-package).

The supported baseline is React/React DOM 19.3, Mantine Core/Hooks 9.6.1, `ai` 7.0.99, and `@ai-sdk/react` 4.0.102. Keep Mantine Core and Hooks on the same version.

## Styles and provider

Import CSS once at your application entry point:

```tsx
import '@mantine/core/styles.css';
import 'mantine-ai-elements/styles.css';
```

Render your application inside Mantine's `MantineProvider`. No additional provider is required by this library.

```tsx
import { MantineProvider } from '@mantine/core';

export function App() {
  return <MantineProvider>{/* Your application */}</MantineProvider>;
}
```

## Connect to AI SDK

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
        <PromptInput.Tools />
        <PromptInput.Submit status={status} onStop={() => stop()} />
      </PromptInput.Footer>
    </PromptInput>
  );
}
```

Configure the AI SDK transport and backend in your application. The library does not provide an API endpoint or choose an AI model. The live examples below use a deterministic browser transport, so they do not require an API key.

For Next.js, use compound components inside a client component. Individual named exports such as `PromptInputSubmit` also support direct imports from server components with serializable props. The distribution includes the client directive; `transpilePackages` is not required.

## Explore

- [PromptInput API and behavior](./prompt-input.md)
- [Mantine customization](./customization.md)
- [AI SDK documentation](https://ai-sdk.dev/docs/introduction)
- [Mantine documentation](https://mantine.dev/)
