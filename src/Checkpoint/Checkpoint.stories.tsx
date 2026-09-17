import { useChat } from '@ai-sdk/react';
import {
  Button,
  createTheme,
  Group,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { UIMessage } from 'ai';
import { useState } from 'react';
import { Checkpoint, CheckpointTrigger } from '../index';
import { createDemoTransport } from '../stories/demo-transport';

const meta = { title: 'Checkpoint', component: Checkpoint } satisfies Meta<
  typeof Checkpoint
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: () => (
    <Checkpoint>
      <Checkpoint.Icon />
      <Checkpoint.Trigger tooltip="Return to this point in the chat">
        Restore checkpoint
      </Checkpoint.Trigger>
    </Checkpoint>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          CheckpointTrigger: CheckpointTrigger.extend({
            defaultProps: { color: 'grape', variant: 'light', radius: 'xl' },
          }),
        },
      })}
    >
      <Checkpoint dividerProps={{ variant: 'dashed', color: 'grape' }}>
        <Checkpoint.Icon size={22}>
          <span aria-hidden="true">↶</span>
        </Checkpoint.Icon>
        <Checkpoint.Trigger
          tooltip="Restore the saved conversation"
          tooltipProps={{ withArrow: true }}
        >
          Restore the conversation before the detailed implementation discussion
        </Checkpoint.Trigger>
      </Checkpoint>
    </MantineProvider>
  ),
};
const transport = createDemoTransport();
const initialMessages: UIMessage[] = [
  {
    id: 'question',
    role: 'user',
    parts: [{ type: 'text', text: 'Help me design a chat interface.' }],
  },
  {
    id: 'checkpoint',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: 'Start with a conversation area and a prompt input.',
      },
    ],
  },
];
function RestoreChat() {
  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    error,
    clearError,
  } = useChat({ transport, messages: initialMessages });
  const [restored, setRestored] = useState(false);
  const busy = status === 'submitted' || status === 'streaming';
  return (
    <Stack maw={640}>
      <Text size="sm" c="dimmed">
        This checkpoint restores local chat history only. It does not undo tool
        actions or workspace changes.
      </Text>
      {messages.map((message) => (
        <Stack key={message.id} gap="xs">
          <Text fw={600}>{message.role === 'user' ? 'You' : 'Assistant'}</Text>
          <Text>
            {message.parts
              .filter((part) => part.type === 'text')
              .map((part) => part.text)
              .join('\n')}
          </Text>
          {message.id === 'checkpoint' && (
            <Checkpoint>
              <Checkpoint.Icon />
              <Checkpoint.Trigger
                disabled={busy || messages.at(-1)?.id === 'checkpoint'}
                tooltip="Discard chat messages after this point"
                onClick={() => {
                  clearError();
                  setMessages((current) => {
                    const index = current.findIndex(
                      (item) => item.id === 'checkpoint',
                    );
                    return index < 0 ? current : current.slice(0, index + 1);
                  });
                  setRestored(true);
                }}
              >
                Restore checkpoint
              </Checkpoint.Trigger>
            </Checkpoint>
          )}
        </Stack>
      ))}
      {error && <Text role="alert">{error.message}</Text>}
      <Group>
        <Button
          disabled={busy}
          onClick={() => {
            setRestored(false);
            void sendMessage({ text: 'Explain the next implementation step.' });
          }}
        >
          Continue chat
        </Button>
        {busy && (
          <Button variant="default" onClick={() => void stop()}>
            Stop
          </Button>
        )}
      </Group>
      <Text role="status">
        {busy
          ? 'Generating…'
          : restored
            ? 'Chat restored. Continue to start a new branch.'
            : `${messages.length} messages`}
      </Text>
    </Stack>
  );
}
export const WithUseChat: Story = { render: () => <RestoreChat /> };
