import { useChat } from '@ai-sdk/react';
import {
  createTheme,
  MantineProvider,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { isToolUIPart } from 'ai';
import { useMemo, useState } from 'react';
import { PromptInput, Tool, type ToolPart } from '../index';
import { createDemoTransport } from '../stories/demo-transport';

const meta = { title: 'Tool', component: Tool } satisfies Meta<typeof Tool>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: () => (
    <Tool defaultOpened>
      <Tool.Header type="tool-web-search" state="output-available" />
      <Tool.Content>
        <Tool.Input input={{ query: 'Mantine components', limit: 5 }} />
        <Tool.Output output={{ matches: 0, cached: false }} />
      </Tool.Content>
    </Tool>
  ),
};
const states: ToolPart['state'][] = [
  'input-streaming',
  'input-available',
  'approval-requested',
  'approval-responded',
  'output-available',
  'output-error',
  'output-denied',
];
export const AllStates: Story = {
  render: () => (
    <Stack>
      {states.map((state) => (
        <Tool key={state}>
          <Tool.Header
            type="dynamic-tool"
            toolName="application-defined-search-with-a-long-name"
            state={state}
          />
          <Tool.Content>
            <Tool.Input input={{ query: 'An application-owned input' }} />
            {state === 'output-error' && (
              <Tool.Output errorText="Search service is unavailable" />
            )}
            {state === 'output-available' && <Tool.Output output={false} />}
          </Tool.Content>
        </Tool>
      ))}
    </Stack>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Tool: Tool.extend({
            styles: {
              root: {
                borderRadius: 20,
                borderColor: 'var(--mantine-color-grape-5)',
              },
              header: { color: 'var(--mantine-color-grape-6)' },
              body: { padding: 24 },
            },
          }),
        },
      })}
    >
      <Tool defaultOpened>
        <Tool.Header
          type="dynamic-tool"
          toolName="lookup"
          title="Knowledge lookup"
          state="output-available"
          statusBadgeProps={{ color: 'grape', children: 'Ready' }}
        />
        <Tool.Content>
          <Tool.Input label="Search request" input={{ query: 'Mantine' }} />
          <Tool.Output
            label="Summary"
            output={
              <Text>
                A custom React result can include links, Markdown, or
                application controls.
              </Text>
            }
          />
        </Tool.Content>
      </Tool>
    </MantineProvider>
  ),
};
function ChatDemo() {
  const [mode, setMode] = useState<'static' | 'dynamic'>('static');
  const transport = useMemo(() => createDemoTransport({ tool: mode }), [mode]);
  const chat = useChat({ transport });
  const busy = chat.status === 'streaming' || chat.status === 'submitted';
  return (
    <Stack>
      <Select
        label="Tool kind"
        value={mode}
        data={['static', 'dynamic']}
        disabled={busy}
        onChange={(value) =>
          setMode(value === 'dynamic' ? 'dynamic' : 'static')
        }
      />
      <Text size="sm" c="dimmed">
        Send a search query or /tool-error. Real AI SDK chunks move the tool
        through Pending, Running, and Completed or Error.
      </Text>
      {chat.messages.flatMap((message) =>
        message.parts.filter(isToolUIPart).map((part) => (
          <Tool key={`${message.id}-${part.toolCallId}`} defaultOpened>
            {part.type === 'dynamic-tool' ? (
              <Tool.Header
                type={part.type}
                toolName={part.toolName}
                state={part.state}
              />
            ) : (
              <Tool.Header type={part.type} state={part.state} />
            )}
            <Tool.Content>
              <Tool.Input input={part.input} />
              <Tool.Output output={part.output} errorText={part.errorText} />
            </Tool.Content>
          </Tool>
        )),
      )}
      {chat.error && (
        <Text role="alert" c="red">
          {chat.error.message}
        </Text>
      )}
      <PromptInput onSubmit={({ text }) => chat.sendMessage({ text })}>
        <PromptInput.Textarea aria-label="Tool prompt" />
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
