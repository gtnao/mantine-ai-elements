import { useChat } from '@ai-sdk/react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { CodeBlock, Sandbox } from '../index';
import {
  createSandboxTransport,
  type SandboxMessage,
} from './sandbox-transport';
export function SandboxChatExample() {
  const [transport] = useState(createSandboxTransport);
  const [stopped, setStopped] = useState(false);
  const { messages, sendMessage, status, error, clearError, stop } =
    useChat<SandboxMessage>({ transport });
  const dispatching = useRef(false);
  useEffect(
    () => () => {
      void stop();
    },
    [stop],
  );
  const busy = status === 'submitted' || status === 'streaming';
  const latest = messages.at(-1);
  const tool =
    latest?.role === 'assistant'
      ? latest.parts.find((part) => part.type === 'tool-run-code')
      : undefined;
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
        <Button disabled={busy} onClick={() => void start('Generate code')}>
          Generate code
        </Button>
        <Button
          disabled={busy}
          variant="default"
          onClick={() => void start('/tool-error')}
        >
          Tool failure
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
      {tool && (
        <Sandbox>
          <Sandbox.Header
            title={tool.input?.filename || 'Receiving filename…'}
            state={tool.state}
          />
          <Sandbox.Content>
            <Sandbox.Tabs defaultValue="code">
              <Sandbox.TabsBar>
                <Sandbox.TabsList aria-label="Generated code and output">
                  <Sandbox.TabsTrigger value="code">Code</Sandbox.TabsTrigger>
                  <Sandbox.TabsTrigger value="output">
                    Output
                  </Sandbox.TabsTrigger>
                </Sandbox.TabsList>
              </Sandbox.TabsBar>
              <Sandbox.TabContent value="code">
                <CodeBlock code={tool.input?.code ?? ''} language="typescript">
                  <CodeBlock.CopyButton />
                </CodeBlock>
              </Sandbox.TabContent>
              <Sandbox.TabContent value="output">
                {tool.state === 'output-error' ? (
                  <Alert color="red" title="Execution failed">
                    {tool.errorText}
                  </Alert>
                ) : tool.state === 'output-available' ? (
                  <CodeBlock code={tool.output.logs} language="text" />
                ) : (
                  <Text p="md">
                    {stopped
                      ? 'Stopped before output was available.'
                      : 'Waiting for output.'}
                  </Text>
                )}
              </Sandbox.TabContent>
            </Sandbox.Tabs>
          </Sandbox.Content>
        </Sandbox>
      )}
      <Text role="status">
        {error
          ? 'Request failed.'
          : busy
            ? 'Receiving tool updates…'
            : stopped
              ? 'Stopped. You can retry.'
              : tool?.state === 'output-error'
                ? 'Tool failed.'
                : tool?.state === 'output-available'
                  ? 'Tool completed.'
                  : 'Ready.'}
      </Text>
      <Text size="xs" c="dimmed">
        The real AI SDK hook receives deterministic tool input and output. This
        demo does not evaluate generated code; execution belongs to your
        backend.
      </Text>
    </Stack>
  );
}
