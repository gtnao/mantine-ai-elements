import { useChat } from '@ai-sdk/react';
import {
  Alert,
  Badge,
  Button,
  createTheme,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PromptInput } from '../index';
import { createDemoTransport } from '../stories/demo-transport';

const meta = { title: 'PromptInput', component: PromptInput } satisfies Meta<
  typeof PromptInput
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { onSubmit: () => {} },
  render: () => {
    const [last, setLast] = useState('');
    return (
      <Stack>
        <PromptInput onSubmit={({ text }) => setLast(text)}>
          <PromptInput.Body>
            <PromptInput.Textarea
              aria-label="Message"
              placeholder="Type a message…"
            />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Tools>
              <Text size="xs" c="dimmed">
                Shift + Enter for a new line
              </Text>
            </PromptInput.Tools>
            <PromptInput.Submit submitLabel="Send" />
          </PromptInput.Footer>
        </PromptInput>
        <Text size="sm">Submitted: {last || '—'}</Text>
      </Stack>
    );
  },
};

export const WithAISDK: Story = {
  args: { onSubmit: () => {} },
  render: () => {
    const [transport] = useState(createDemoTransport);
    const { messages, sendMessage, status, stop, error, clearError } = useChat({
      transport,
    });
    return (
      <Stack>
        <Badge variant="light">{status}</Badge>
        {messages.map((message) => (
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
        ))}
        {error && (
          <Alert color="red" title="Send failed">
            {error.message}
            <Button variant="subtle" onClick={clearError}>
              Dismiss
            </Button>
          </Alert>
        )}
        <PromptInput
          onSubmit={({ text, files }) => sendMessage({ text, files })}
        >
          <PromptInput.Body>
            <PromptInput.Textarea
              aria-label="Message"
              placeholder="Type a message…"
            />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Tools>
              <Text size="xs" c="dimmed">
                Send /error to try an error
              </Text>
            </PromptInput.Tools>
            <PromptInput.Submit
              status={status}
              onStop={() => stop()}
              submitLabel="Send"
              stopLabel="Stop generating"
            />
          </PromptInput.Footer>
        </PromptInput>
      </Stack>
    );
  },
};

export const ThemedAndControlled: Story = {
  args: { onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState('An editable initial draft');
    const theme = createTheme({
      primaryColor: 'grape',
      components: {
        PromptInput: PromptInput.extend({
          styles: { root: { borderRadius: 24 }, footer: { padding: 8 } },
        }),
        PromptInputSubmit: PromptInput.Submit.extend({
          defaultProps: { variant: 'light', radius: 'xl' },
        }),
      },
    });
    return (
      <MantineProvider theme={theme}>
        <PromptInput onSubmit={() => setValue('')}>
          <PromptInput.Body>
            <PromptInput.Textarea
              aria-label="Message"
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
            />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Tools>
              <Button
                variant="subtle"
                onClick={() => setValue('Please summarize this text')}
              >
                Insert example
              </Button>
            </PromptInput.Tools>
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput>
      </MantineProvider>
    );
  },
};
