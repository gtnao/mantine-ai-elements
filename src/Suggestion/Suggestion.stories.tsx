import { useChat } from '@ai-sdk/react';
import {
  Alert,
  createTheme,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Conversation, Message, PromptInput, Shimmer } from '../index';
import { createDemoTransport } from '../stories/demo-transport';
import { Suggestion, Suggestions } from './Suggestion';

const choices = [
  'Explain streaming responses',
  'Help me plan a project',
  'Show **Markdown** formatting',
  'Compare two approaches',
  'Summarize the conversation',
];
const meta = {
  title: 'Suggestion',
  component: Suggestion,
  args: { suggestion: choices[0] },
} satisfies Meta<typeof Suggestion>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: () => {
    const [selected, setSelected] = useState('');
    return (
      <Stack>
        <Suggestions viewportProps={{ 'aria-label': 'Suggested prompts' }}>
          {choices.map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={setSelected}
            />
          ))}
        </Suggestions>
        <Text role="status">
          {selected ? `Selected: ${selected}` : 'Choose a suggestion'}
        </Text>
      </Stack>
    );
  },
};
export const PopulateDraft: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [sent, setSent] = useState('');
    return (
      <Stack>
        <Suggestions>
          {choices.map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={setValue}
            />
          ))}
        </Suggestions>
        <PromptInput
          onSubmit={({ text }) => {
            setSent(text);
            setValue('');
          }}
        >
          <PromptInput.Textarea
            aria-label="Draft"
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
          <PromptInput.Footer>
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput>
        <Text role="status">
          {sent ? `Sent: ${sent}` : 'Edit the draft before sending'}
        </Text>
      </Stack>
    );
  },
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Suggestion: Suggestion.extend({
            defaultProps: { variant: 'light', color: 'grape', radius: 'sm' },
            styles: { label: { fontWeight: 700 } },
          }),
          Suggestions: Suggestions.extend({
            styles: {
              root: {
                border: '1px solid var(--mantine-color-grape-light)',
                padding: 12,
                borderRadius: 12,
              },
            },
          }),
        },
      })}
    >
      <Suggestions>
        <Suggestion suggestion="Explore alternatives" leftSection="+" />
        <Suggestion suggestion="Continue" />
      </Suggestions>
    </MantineProvider>
  ),
};
export const WithAISDK: Story = {
  render: () => {
    const [transport] = useState(createDemoTransport);
    const { messages, sendMessage, status, stop, error } = useChat({
      transport,
    });
    const busy = status === 'submitted' || status === 'streaming';
    return (
      <Stack>
        <Conversation h={360}>
          <Conversation.Content>
            {messages.length === 0 && (
              <Conversation.EmptyState
                title="Start a conversation"
                description="Choose a suggestion or write a message."
              />
            )}
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <Message.Content>
                  <Message.Response
                    isAnimating={
                      status === 'streaming' &&
                      message.id === messages.at(-1)?.id
                    }
                  >
                    {message.parts
                      .filter((part) => part.type === 'text')
                      .map((part) => part.text)
                      .join('')}
                  </Message.Response>
                </Message.Content>
              </Message>
            ))}
            {status === 'submitted' && (
              <Shimmer role="status">Preparing a response…</Shimmer>
            )}
          </Conversation.Content>
          <Conversation.ScrollButton />
        </Conversation>
        {error && <Alert color="red">{error.message}</Alert>}
        <Suggestions>
          {choices.map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              disabled={busy}
              onClick={(text) => {
                void sendMessage({ text });
              }}
            />
          ))}
        </Suggestions>
        <PromptInput
          onSubmit={({ text, files }) => sendMessage({ text, files })}
        >
          <PromptInput.Textarea
            aria-label="Message"
            placeholder="Write a message, or try /error"
          />
          <PromptInput.Footer>
            <PromptInput.Submit status={status} onStop={() => stop()} />
          </PromptInput.Footer>
        </PromptInput>
      </Stack>
    );
  },
};
