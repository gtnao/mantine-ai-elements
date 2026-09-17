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
import {
  Message,
  Question,
  type QuestionResponse,
  type QuestionValue,
} from '../index';
import { createDemoTransport } from '../stories/demo-transport';

const meta = { title: 'Question', component: Question } satisfies Meta<
  typeof Question
>;
export default meta;
type Story = StoryObj<typeof meta>;
function Fields() {
  return (
    <>
      <Question.Prompt>What should the project include?</Question.Prompt>
      <Question.Description>
        Choose features and add details, or answer with text only.
      </Question.Description>
      <Question.Options aria-label="Project features">
        <Question.Option value="search">Search</Question.Option>
        <Question.Option value="database">Database</Question.Option>
        <Question.Option value="payments" disabled>
          Payments (unavailable)
        </Question.Option>
        <Question.Option value="custom">
          An application-defined feature with a deliberately long descriptive
          label
        </Question.Option>
      </Question.Options>
      <Question.Input
        aria-label="Additional requirements"
        placeholder="Add context…"
      />
      <Question.Actions>
        <Question.Submit>Answer</Question.Submit>
      </Question.Actions>
    </>
  );
}
function BasicDemo() {
  const [response, setResponse] = useState<QuestionResponse>();
  return response ? (
    <Stack>
      <Text role="status">
        Answered:{' '}
        {[response.selectedValues.join(', '), response.text]
          .filter(Boolean)
          .join(' — ')}
      </Text>
      <Button onClick={() => setResponse(undefined)} variant="subtle">
        Ask again
      </Button>
    </Stack>
  ) : (
    <Question selectionMode="multiple" onSubmit={setResponse}>
      <Fields />
    </Question>
  );
}
export const Basic: Story = { render: () => <BasicDemo /> };
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Question: Question.extend({
            styles: {
              root: {
                borderRadius: 20,
                borderColor: 'var(--mantine-color-grape-5)',
              },
              prompt: { color: 'var(--mantine-color-grape-6)' },
            },
          }),
          QuestionOption: Question.Option.extend({
            defaultProps: { color: 'grape', radius: 'xl' },
          }),
          QuestionInput: Question.Input.extend({
            defaultProps: { radius: 'md' },
          }),
        },
      })}
    >
      <BasicDemo />
    </MantineProvider>
  ),
};
function ControlledDemo() {
  const [value, setValue] = useState<QuestionValue>({
    selectedValues: ['search'],
    text: '',
  });
  return (
    <Stack>
      <Button
        variant="subtle"
        onClick={() =>
          setValue({ selectedValues: [], text: 'Text set outside the form' })
        }
      >
        Set an external draft
      </Button>
      <Question
        value={value}
        onValueChange={setValue}
        onSubmit={({ selectedValues, text }) =>
          setValue({ selectedValues, text: text ?? '' })
        }
      >
        <Fields />
      </Question>
      <Text role="status">Draft: {JSON.stringify(value)}</Text>
    </Stack>
  );
}
export const Controlled: Story = { render: () => <ControlledDemo /> };
function ChatDemo() {
  const [transport] = useState(createDemoTransport);
  const chat = useChat({ transport });
  return (
    <Stack>
      <Text size="sm" c="dimmed">
        The application sends the structured response as a text message through
        real useChat. The question keeps its draft; the application controls
        pending state.
      </Text>
      <Question
        selectionMode="multiple"
        pending={chat.status === 'streaming' || chat.status === 'submitted'}
        onSubmit={(response) =>
          chat.sendMessage({ text: JSON.stringify(response) })
        }
      >
        <Fields />
      </Question>
      {chat.messages.map((message) => (
        <Message key={message.id} from={message.role}>
          <Message.Response>
            {message.parts
              .filter((part) => part.type === 'text')
              .map((part) => part.text)
              .join('')}
          </Message.Response>
        </Message>
      ))}
      {chat.error && (
        <Text role="alert" c="red">
          {chat.error.message}
        </Text>
      )}
    </Stack>
  );
}
export const WithAISDK: Story = { render: () => <ChatDemo /> };
