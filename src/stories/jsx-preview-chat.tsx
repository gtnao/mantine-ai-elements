import { useChat } from '@ai-sdk/react';
import { Alert, Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { CodeBlock, JSXPreview } from '../index';
import { createJSXPreviewTransport } from './jsx-preview-transport';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <Button onClick={() => setCount(count + 1)}>Preview count: {count}</Button>
  );
}
const components = { Badge, Paper, Stack, Text, Counter };
const bindings = { title: 'A Mantine report' };

export function JSXPreviewChatExample() {
  const [transport] = useState(createJSXPreviewTransport);
  const [stopped, setStopped] = useState(false);
  const { messages, sendMessage, status, error, clearError, stop } = useChat({
    transport,
  });
  const dispatching = useRef(false);
  useEffect(
    () => () => {
      void stop();
    },
    [stop],
  );
  const busy = status === 'submitted' || status === 'streaming';
  const latest = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant');
  const jsx =
    latest?.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('') ?? '';
  async function start(text: string) {
    if (busy || dispatching.current) return;
    dispatching.current = true;
    setStopped(false);
    clearError();
    try {
      await sendMessage({ text });
    } finally {
      dispatching.current = false;
    }
  }
  return (
    <Stack>
      <Group>
        <Button disabled={busy} onClick={() => void start('Generate preview')}>
          Generate preview
        </Button>
        <Button
          disabled={busy}
          variant="default"
          onClick={() => void start('/invalid')}
        >
          Invalid JSX
        </Button>
        <Button
          disabled={busy}
          variant="default"
          onClick={() => void start('/error')}
        >
          Request failure
        </Button>
        {busy && (
          <Button
            variant="default"
            onClick={() => {
              setStopped(true);
              void stop();
            }}
          >
            Stop response
          </Button>
        )}
      </Group>
      {error && (
        <Alert color="red" title="Request failed">
          {error.message}
        </Alert>
      )}
      <JSXPreview
        trusted
        jsx={jsx}
        isStreaming={busy || stopped}
        components={components}
        bindings={bindings}
      >
        <JSXPreview.Content loading="Loading preview…" />
        <JSXPreview.Error title="Preview failed" />
      </JSXPreview>
      <Text role="status">
        {error
          ? 'Request failed.'
          : busy
            ? 'Receiving JSX…'
            : stopped
              ? 'Stopped. You can retry.'
              : latest
                ? 'Response complete.'
                : 'Ready.'}
      </Text>
      <CodeBlock code={jsx} language="jsx">
        <CodeBlock.CopyButton />
      </CodeBlock>
      <Text size="xs" c="dimmed">
        The real AI SDK hook streams fixed application-owned JSX. Only this
        known fixture is trusted. Do not enable host execution for arbitrary
        model output. Stopping keeps best-effort completion enabled for the
        partial response.
      </Text>
    </Stack>
  );
}
