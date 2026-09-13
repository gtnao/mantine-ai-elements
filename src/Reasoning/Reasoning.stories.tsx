import { useChat } from '@ai-sdk/react';
import { createTheme, MantineProvider, Stack, Text } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Message, PromptInput, Reasoning } from '../index';
import { createDemoTransport } from '../stories/demo-transport';

const meta = { title: 'Reasoning', component: Reasoning } satisfies Meta<
  typeof Reasoning
>;
export default meta;
type Story = StoryObj<typeof meta>;
const explanation = `I compared the **constraints** before choosing an approach.

1. Keep the application in control of the transport.
2. Display the reasoning part independently from the final answer.
3. Preserve a reader's decision to collapse a long explanation.

The same Markdown renderer supports equations such as $$a^2 + b^2 = c^2$$, tables, and code.

\`\`\`ts
const reasoning = message.parts.filter(part => part.type === 'reasoning');
\`\`\``;
export const Basic: Story = {
  render: () => (
    <Reasoning duration={4}>
      <Reasoning.Trigger />
      <Reasoning.Content>{explanation}</Reasoning.Content>
    </Reasoning>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Reasoning: Reasoning.extend({
            styles: {
              root: {
                border: '1px solid var(--mantine-color-grape-5)',
                borderRadius: 12,
                padding: 16,
              },
              trigger: { color: 'var(--mantine-color-grape-6)' },
            },
          }),
        },
      })}
    >
      <Reasoning defaultOpened duration={4}>
        <Reasoning.Trigger
          getThinkingMessage={(streaming, duration) =>
            streaming
              ? 'Reviewing the request…'
              : `Review completed in ${duration}s`
          }
        />
        <Reasoning.Content
          responseProps={{ styles: { root: { fontSize: 14 } } }}
        >
          {explanation}
        </Reasoning.Content>
      </Reasoning>
    </MantineProvider>
  ),
};
function ChatDemo() {
  const [transport] = useState(() => createDemoTransport({ reasoning: true }));
  const chat = useChat({ transport });
  return (
    <Stack>
      <Text size="sm" c="dimmed">
        Reasoning and answer chunks stream through useChat. Stop during
        reasoning, or send /error to exercise a transport failure.
      </Text>
      {chat.messages.map((message) => (
        <Message key={message.id} from={message.role}>
          <Message.Content>
            {message.parts.map((part, index) =>
              part.type === 'reasoning' ? (
                <Reasoning
                  key={part.id ?? index}
                  isStreaming={
                    chat.status === 'streaming' && part.state === 'streaming'
                  }
                >
                  <Reasoning.Trigger />
                  <Reasoning.Content>{part.text}</Reasoning.Content>
                </Reasoning>
              ) : part.type === 'text' ? (
                <Message.Response
                  // biome-ignore lint/suspicious/noArrayIndexKey: AI SDK appends parts; text parts have no ID and retain their position during streaming.
                  key={`text-${index}`}
                  isAnimating={
                    chat.status === 'streaming' && part.state === 'streaming'
                  }
                >
                  {part.text}
                </Message.Response>
              ) : null,
            )}
          </Message.Content>
        </Message>
      ))}
      {chat.error && (
        <Text role="alert" c="red">
          {chat.error.message}
        </Text>
      )}
      <PromptInput onSubmit={({ text }) => chat.sendMessage({ text })}>
        <PromptInput.Textarea
          aria-label="Message"
          placeholder="Ask a question"
        />
        <PromptInput.Footer>
          <PromptInput.Submit
            status={chat.status}
            onStop={() => void chat.stop()}
          />
        </PromptInput.Footer>
      </PromptInput>
    </Stack>
  );
}
export const WithAISDK: Story = { render: () => <ChatDemo /> };
