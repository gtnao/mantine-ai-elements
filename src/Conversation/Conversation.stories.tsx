import { useChat } from '@ai-sdk/react';
import {
  Alert,
  Button,
  createTheme,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { UIMessage } from 'ai';
import { useState } from 'react';
import { Conversation, PromptInput } from '../index';
import { createDemoTransport } from '../stories/demo-transport';

const meta = {
  title: 'Conversation',
  component: Conversation,
  args: { children: null },
} satisfies Meta<typeof Conversation>;
export default meta;
type Story = StoryObj<typeof meta>;
const initialMessages: UIMessage[] = Array.from({ length: 20 }, (_, index) => ({
  id: String(index),
  role: index % 2 ? 'assistant' : 'user',
  parts: [
    {
      type: 'text',
      text: `Message ${index + 1}: A conversation can keep growing while you read earlier messages.`,
    },
  ],
}));

export const Basic: Story = {
  render: () => {
    const [messages, setMessages] = useState(initialMessages);
    return (
      <Stack>
        <Button
          onClick={() =>
            setMessages((current) => [
              ...current,
              {
                id: String(current.length),
                role: 'assistant',
                parts: [
                  { type: 'text', text: `New message ${current.length + 1}` },
                ],
              },
            ])
          }
        >
          Add message
        </Button>
        <Conversation h={320} aria-label="Conversation">
          <Conversation.Content>
            {messages.map((message) => (
              <Text key={message.id}>
                {message.parts
                  .map((part) => (part.type === 'text' ? part.text : ''))
                  .join('')}
              </Text>
            ))}
          </Conversation.Content>
          <Conversation.ScrollButton />
          <Conversation.Download messages={messages} />
        </Conversation>
      </Stack>
    );
  },
};

export const Empty: Story = {
  render: () => (
    <Conversation h={300}>
      <Conversation.Content>
        <Conversation.EmptyState />
      </Conversation.Content>
    </Conversation>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Conversation: Conversation.extend({
            styles: {
              root: {
                border: '1px solid var(--mantine-color-grape-5)',
                borderRadius: 16,
              },
              content: { gap: 8 },
            },
          }),
          ConversationEmptyState: Conversation.EmptyState.extend({
            defaultProps: { c: 'grape' },
          }),
        },
      })}
    >
      <Conversation h={300}>
        <Conversation.Content>
          <Conversation.EmptyState
            title="Explore a topic"
            description="Ask a question to get started."
            icon={<Text size="xl">✦</Text>}
          />
        </Conversation.Content>
      </Conversation>
    </MantineProvider>
  ),
};
export const WithAISDK: Story = {
  render: () => {
    const [transport] = useState(createDemoTransport);
    const { messages, sendMessage, status, stop, error } = useChat({
      transport,
    });
    return (
      <Stack>
        <Conversation h={320} aria-label="Chat messages">
          <Conversation.Content>
            {messages.length ? (
              messages.map((message) => (
                <div key={message.id}>
                  <Text size="xs" c="dimmed">
                    {message.role}
                  </Text>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>
                    {message.parts
                      .map((part) => (part.type === 'text' ? part.text : ''))
                      .join('')}
                  </Text>
                </div>
              ))
            ) : (
              <Conversation.EmptyState />
            )}
          </Conversation.Content>
          <Conversation.ScrollButton />
          <Conversation.Download messages={messages} />
        </Conversation>
        {error && <Alert color="red">{error.message}</Alert>}
        <PromptInput
          onSubmit={({ text, files }) => sendMessage({ text, files })}
        >
          <PromptInput.Textarea aria-label="Message" />
          <PromptInput.Footer>
            <Text size="xs">Try /error to test a failed response.</Text>
            <PromptInput.Submit status={status} onStop={() => stop()} />
          </PromptInput.Footer>
        </PromptInput>
      </Stack>
    );
  },
};
