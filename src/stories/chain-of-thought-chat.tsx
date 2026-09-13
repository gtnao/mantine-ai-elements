import { useChat } from '@ai-sdk/react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { isToolUIPart } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { ChainOfThought } from '../index';
import { createDemoTransport } from './demo-transport';
export function ChainOfThoughtChatExample() {
  const [transport] = useState(() =>
    createDemoTransport({ tool: 'static', sources: true }),
  );
  const [finishedId, setFinishedId] = useState<string>();
  const [stopped, setStopped] = useState(false);
  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    transport,
    onFinish: ({ message, isAbort, isError }) => {
      if (!isAbort && !isError) setFinishedId(message.id);
      if (isAbort) setStopped(true);
    },
  });
  const dispatching = useRef(false);
  useEffect(
    () => () => {
      void stop();
    },
    [stop],
  );
  const busy = status === 'submitted' || status === 'streaming';
  const latest = messages.at(-1);
  const assistant = latest?.role === 'assistant' ? latest : undefined;
  const tool = assistant?.parts.find(isToolUIPart);
  const sources =
    assistant?.parts.filter((part) => part.type === 'source-url') ?? [];
  const toolComplete = tool?.state === 'output-available';
  const toolFailed = tool?.state === 'output-error';
  const replyComplete = !!assistant && finishedId === assistant.id;
  const replyStarted =
    assistant?.parts.some((part) => part.type === 'text') ?? false;
  async function start(text: string) {
    if (busy || dispatching.current) return;
    dispatching.current = true;
    setFinishedId(undefined);
    setStopped(false);
    clearError();
    try {
      await sendMessage({ text });
    } finally {
      dispatching.current = false;
    }
  }
  return (
    <Stack maw={640}>
      <Text size="sm" c="dimmed">
        These are application-owned progress summaries derived from tool parts,
        source URLs, and response completion events.
      </Text>
      <Group>
        <Button
          disabled={busy}
          onClick={() => start('Find component documentation')}
        >
          Run search
        </Button>
        <Button
          disabled={busy}
          variant="default"
          onClick={() => start('/tool-error')}
        >
          Tool failure
        </Button>
        <Button
          disabled={busy}
          variant="default"
          onClick={() => start('/error')}
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
      <ChainOfThought defaultOpened>
        <ChainOfThought.Header>
          Search and response progress
        </ChainOfThought.Header>
        <ChainOfThought.Content>
          <ChainOfThought.Step
            data-testid="search-step"
            label={
              toolFailed
                ? 'Search failed'
                : toolComplete
                  ? 'Search complete'
                  : stopped
                    ? 'Search paused'
                    : 'Run search tool'
            }
            status={
              toolComplete
                ? 'complete'
                : tool && busy && !toolFailed
                  ? 'active'
                  : 'pending'
            }
            description={
              toolFailed
                ? tool.errorText
                : toolComplete
                  ? 'The tool returned a result.'
                  : 'Waiting for the tool to finish.'
            }
          />
          <ChainOfThought.Step
            data-testid="sources-step"
            label="Receive source references"
            status={sources.length ? 'complete' : 'pending'}
            description="Source URLs are reported separately by the transport; they do not imply a search match."
          >
            <ChainOfThought.SearchResults>
              {sources.map((source) => (
                <ChainOfThought.SearchResult
                  key={source.sourceId}
                  component="a"
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.title || source.url}
                </ChainOfThought.SearchResult>
              ))}
            </ChainOfThought.SearchResults>
          </ChainOfThought.Step>
          <ChainOfThought.Step
            data-testid="reply-step"
            label={
              replyComplete
                ? 'Response complete'
                : stopped
                  ? 'Response paused'
                  : 'Write response'
            }
            status={
              replyComplete
                ? 'complete'
                : busy && replyStarted
                  ? 'active'
                  : 'pending'
            }
          >
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {assistant?.parts
                .filter((part) => part.type === 'text')
                .map((part) => part.text)
                .join('')}
            </Text>
          </ChainOfThought.Step>
        </ChainOfThought.Content>
      </ChainOfThought>
      {error && (
        <Alert color="red" title="Request failed">
          {error.message}
        </Alert>
      )}
      <Text role="status">
        {busy
          ? 'Working…'
          : error
            ? 'Request failed.'
            : stopped
              ? 'Stopped. You can start again.'
              : replyComplete
                ? 'Response finished.'
                : 'Ready.'}
      </Text>
    </Stack>
  );
}
