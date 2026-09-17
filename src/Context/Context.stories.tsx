import { useChat } from '@ai-sdk/react';
import {
  Button,
  createTheme,
  Group,
  MantineProvider,
  NumberInput,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Context, ContextTrigger } from '../index';
import {
  type ContextDemoMetadata,
  contextDemoProviders,
  contextDemoUsage,
} from '../stories/context-data';
import { createDemoTransport } from '../stories/demo-transport';

const meta = {
  title: 'Context',
  component: Context,
  args: { usedTokens: 15000, maxTokens: 32000 },
} satisfies Meta<typeof Context>;
export default meta;
type Story = StoryObj<typeof meta>;
function Details() {
  return (
    <Context.Content>
      <Context.ContentHeader />
      <Context.ContentBody>
        <Context.InputUsage />
        <Context.OutputUsage />
        <Context.ReasoningUsage />
        <Context.CacheUsage />
      </Context.ContentBody>
      <Context.ContentFooter />
    </Context.Content>
  );
}
export const Basic: Story = {
  render: (args) => (
    <Stack>
      <Text size="sm" c="dimmed">
        Fictional demo rates. Reasoning and cache are subsets of output and
        input, respectively.
      </Text>
      <Context
        {...args}
        usage={contextDemoUsage}
        modelId="demo/assistant"
        providers={contextDemoProviders}
      >
        <Context.Trigger />
        <Details />
      </Context>
    </Stack>
  ),
};
export const Themed: Story = {
  render: (args) => (
    <MantineProvider
      theme={createTheme({
        components: {
          Context: Context.extend({
            defaultProps: { radius: 'lg', width: 320 },
            styles: {
              dropdown: { borderColor: 'var(--mantine-color-grape-5)' },
              footer: { padding: 20 },
              value: { fontWeight: 600 },
            },
          }),
          ContextTrigger: ContextTrigger.extend({
            defaultProps: { color: 'grape', variant: 'light', radius: 'xl' },
          }),
        },
      })}
    >
      <Context
        {...args}
        usage={contextDemoUsage}
        costUSD={{
          totalUSD: 0.042,
          inputUSD: 0.018,
          outputUSD: 0.024,
          reasoningUSD: 0.008,
          cacheReadUSD: 0.001,
          cacheWriteUSD: 0.003,
        }}
      >
        <Context.Trigger>Usage details</Context.Trigger>
        <Details />
      </Context>
    </MantineProvider>
  ),
};
function CapacityDemo() {
  const [used, setUsed] = useState<string | number>(150);
  const [max, setMax] = useState<string | number>(100);
  const [opened, setOpened] = useState(false);
  return (
    <Stack>
      <Group grow>
        <NumberInput label="Used tokens" value={used} onChange={setUsed} />
        <NumberInput label="Maximum tokens" value={max} onChange={setMax} />
      </Group>
      <Button onClick={() => setOpened((value) => !value)}>
        Toggle details
      </Button>
      <Context
        usedTokens={Number(used)}
        maxTokens={Number(max)}
        opened={opened}
        onChange={setOpened}
      >
        <Context.Trigger />
        <Details />
      </Context>
      <Text size="sm" c="dimmed">
        Unknown or non-positive capacity displays a dash. Over-capacity
        percentages remain visible while the meter stays within its bounds.
        Missing cost stays unknown.
      </Text>
    </Stack>
  );
}
export const Capacity: Story = { render: () => <CapacityDemo /> };
function ChatDemo() {
  const [transport] = useState(() =>
    createDemoTransport<ContextDemoMetadata>({
      metadata: {
        usage: contextDemoUsage,
        modelId: 'demo/assistant',
        maxTokens: 32000,
      },
    }),
  );
  const chat = useChat({ transport });
  const busy = chat.status === 'submitted' || chat.status === 'streaming';
  return (
    <Stack>
      <Text size="sm" c="dimmed">
        The transport sends usage metadata on completion. The counts and rates
        are fictional; the message lifecycle uses real AI SDK useChat.
      </Text>
      <Group>
        <Button
          disabled={busy}
          onClick={() =>
            void chat.sendMessage({ text: 'Explain context usage' })
          }
        >
          Generate answer
        </Button>
        <Button
          variant="default"
          disabled={!busy}
          onClick={() => void chat.stop()}
        >
          Stop
        </Button>
      </Group>
      {chat.messages
        .filter((message) => message.role === 'assistant')
        .map((message) => (
          <Stack key={message.id} gap="xs">
            <Text>
              {message.parts
                .filter((part) => part.type === 'text')
                .map((part) => part.text)
                .join('')}
            </Text>
            {message.metadata ? (
              <Context
                usedTokens={message.metadata.usage.totalTokens ?? 0}
                maxTokens={message.metadata.maxTokens}
                usage={message.metadata.usage}
                modelId={message.metadata.modelId}
                providers={contextDemoProviders}
              >
                <Context.Trigger />
                <Details />
              </Context>
            ) : (
              <Text size="xs" c="dimmed">
                Usage has not been reported.
              </Text>
            )}
          </Stack>
        ))}
      {chat.error && <Text role="alert">{chat.error.message}</Text>}
    </Stack>
  );
}
export const WithAISDK: Story = { render: () => <ChatDemo /> };
