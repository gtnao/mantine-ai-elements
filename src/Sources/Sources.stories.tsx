import { useChat } from '@ai-sdk/react';
import {
  Button,
  createTheme,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Message, Source, Sources } from '../index';
import { createDemoTransport } from '../stories/demo-transport';

const meta = { title: 'Sources', component: Sources } satisfies Meta<
  typeof Sources
>;
export default meta;
type Story = StoryObj<typeof meta>;
function Links() {
  return (
    <>
      <Source href="https://example.com/reference" title="Reference guide" />
      <Source
        href="https://example.com/details"
        title="An application-defined source title with a deliberately long and detailed description"
      />
      <Source href="https://example.com/untitled" />
    </>
  );
}
export const Basic: Story = {
  render: () => (
    <Sources>
      <Sources.Trigger count={3} />
      <Sources.Content>
        <Links />
      </Sources.Content>
    </Sources>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Sources: Sources.extend({
            styles: {
              root: {
                border: '1px solid var(--mantine-color-grape-5)',
                borderRadius: 16,
                padding: 16,
              },
              trigger: { color: 'var(--mantine-color-grape-6)' },
            },
          }),
          Source: Source.extend({
            defaultProps: { c: 'grape', underline: 'always' },
          }),
        },
      })}
    >
      <Sources defaultOpened>
        <Sources.Trigger count={3}>References consulted</Sources.Trigger>
        <Sources.Content>
          <Links />
        </Sources.Content>
      </Sources>
    </MantineProvider>
  ),
};
function ChatDemo() {
  const [transport] = useState(() => createDemoTransport({ sources: true }));
  const chat = useChat({ transport });
  const busy = chat.status === 'streaming' || chat.status === 'submitted';
  return (
    <Stack>
      <Text size="sm" c="dimmed">
        Source URL parts arrive through real useChat before the answer
        completes.
      </Text>
      <Button
        disabled={busy}
        onClick={() => void chat.sendMessage({ text: 'Find references' })}
      >
        Find references
      </Button>
      {chat.messages
        .filter((message) => message.role === 'assistant')
        .map((message) => {
          const sources = message.parts.filter(
            (part) => part.type === 'source-url',
          );
          return (
            <Message key={message.id} from={message.role}>
              <Message.Content>
                <Sources>
                  <Sources.Trigger count={sources.length} />
                  <Sources.Content>
                    {sources.map((source) => (
                      <Source
                        key={source.sourceId}
                        href={source.url}
                        title={source.title}
                      />
                    ))}
                  </Sources.Content>
                </Sources>
                <Message.Response>
                  {message.parts
                    .filter((part) => part.type === 'text')
                    .map((part) => part.text)
                    .join('')}
                </Message.Response>
              </Message.Content>
            </Message>
          );
        })}
      {chat.error && <Text role="alert">{chat.error.message}</Text>}
    </Stack>
  );
}
export const WithAISDK: Story = { render: () => <ChatDemo /> };
