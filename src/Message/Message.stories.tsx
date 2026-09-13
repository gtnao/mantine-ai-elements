import { useChat } from '@ai-sdk/react';
import {
  Alert,
  Button,
  createTheme,
  MantineProvider,
  Stack,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Conversation, PromptInput } from '../index';
import { createDemoTransport } from '../stories/demo-transport';
import { Message } from './Message';

const meta = {
  title: 'Message',
  component: Message,
  args: { from: 'assistant' },
} satisfies Meta<typeof Message>;
export default meta;
type Story = StoryObj<typeof meta>;
const markdown =
  '# A useful response\n\n**日本語** and **English** can stream together. ~~Outdated~~ text is marked.\n\n| Feature | Supported |\n| --- | --- |\n| Streaming | Yes |\n| Mantine | Yes |\n\n$$E = mc^2$$\n\n```typescript\nconst answer = 42;\nconsole.log(answer);\n```\n\n```mermaid\ngraph LR\n  Input --> Model\n  Model --> Response\n```\n\n[Read more](https://example.com)';
export const Basic: Story = {
  render: () => (
    <Stack>
      <Message from="user">
        <Message.Content>Can you explain this?</Message.Content>
      </Message>
      <Message from="assistant">
        <Message.Content>
          <Message.Response>{markdown}</Message.Response>
        </Message.Content>
        <Message.Actions>
          <Message.Action label="Like response" tooltip="Like">
            +
          </Message.Action>
        </Message.Actions>
      </Message>
    </Stack>
  ),
};
export const Branches: Story = {
  render: () => (
    <Message from="assistant">
      <Message.Branch>
        <Message.Branch.Content>
          <Message.Content key="a">A concise answer.</Message.Content>
          <Message.Content key="b">
            An alternative answer with more detail.
          </Message.Content>
        </Message.Branch.Content>
        <Message.Toolbar>
          <Message.Branch.Selector>
            <Message.Branch.Previous />
            <Message.Branch.Page />
            <Message.Branch.Next />
          </Message.Branch.Selector>
        </Message.Toolbar>
      </Message.Branch>
    </Message>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Message: Message.extend({
            styles: {
              content: {
                borderRadius: 24,
                padding: 20,
                background: 'var(--mantine-color-grape-light)',
              },
            },
          }),
          MessageResponse: Message.Response.extend({
            defaultProps: { fz: 'lg' },
          }),
          MessageAction: Message.Action.extend({
            defaultProps: { color: 'grape', variant: 'light' },
          }),
        },
      })}
    >
      <Message from="user">
        <Message.Content>
          <Message.Response>
            **Custom** Mantine typography and colors.
          </Message.Response>
        </Message.Content>
        <Message.Actions>
          <Message.Action label="Copy example">C</Message.Action>
        </Message.Actions>
      </Message>
    </MantineProvider>
  ),
};
export const WithAISDK: Story = {
  render: () => {
    const [transport] = useState(createDemoTransport);
    const { messages, sendMessage, status, stop, error, regenerate } = useChat({
      transport,
    });
    return (
      <Stack>
        <Conversation h={400}>
          <Conversation.Content>
            {messages.length ? (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <Message.Content>
                    {message.parts.map((part, index) =>
                      part.type === 'text' ? (
                        <Message.Response
                          /* biome-ignore lint/suspicious/noArrayIndexKey: AI SDK text parts retain their ordered positions while streaming. */
                          key={`${message.id}-${index}`}
                          isAnimating={
                            message.role === 'assistant' &&
                            message.id === messages.at(-1)?.id &&
                            status === 'streaming'
                          }
                        >
                          {part.text}
                        </Message.Response>
                      ) : null,
                    )}
                  </Message.Content>
                </Message>
              ))
            ) : (
              <Conversation.EmptyState />
            )}
          </Conversation.Content>
          <Conversation.ScrollButton />
        </Conversation>
        {error && <Alert color="red">{error.message}</Alert>}
        <PromptInput
          onSubmit={({ text, files }) => sendMessage({ text, files })}
        >
          <PromptInput.Textarea
            aria-label="Message"
            placeholder="Try a Markdown list or code fence"
          />
          <PromptInput.Footer>
            <Button
              variant="subtle"
              onClick={() => regenerate()}
              disabled={
                !messages.length ||
                status === 'streaming' ||
                status === 'submitted'
              }
            >
              Regenerate
            </Button>
            <PromptInput.Submit status={status} onStop={() => stop()} />
          </PromptInput.Footer>
        </PromptInput>
      </Stack>
    );
  },
};
