import {
  Button,
  createTheme,
  DirectionProvider,
  Group,
  MantineProvider,
  Stack,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ToolUIPart } from 'ai';
import { useState } from 'react';
import {
  CodeBlock,
  Sandbox,
  SandboxHeader,
  SandboxTabsTrigger,
} from '../index';
import { SandboxChatExample } from '../stories/sandbox-chat';

const meta = { title: 'Sandbox', component: Sandbox } satisfies Meta<
  typeof Sandbox
>;
export default meta;
type Story = StoryObj<typeof meta>;
const code = 'const result = [2, 3, 5, 7];\nconsole.log(result);';
function Example() {
  const [state, setState] = useState<ToolUIPart['state']>('output-available');
  return (
    <Stack>
      <Group>
        {(
          [
            'input-streaming',
            'input-available',
            'approval-requested',
            'approval-responded',
            'output-available',
            'output-error',
            'output-denied',
          ] as const
        ).map((value) => (
          <Button
            key={value}
            size="xs"
            variant={value === state ? 'filled' : 'default'}
            onClick={() => setState(value)}
          >
            {value}
          </Button>
        ))}
      </Group>
      <Sandbox>
        <Sandbox.Header state={state} title="generated-primes.ts" />
        <Sandbox.Content>
          <Sandbox.Tabs defaultValue="code">
            <Sandbox.TabsBar>
              <Sandbox.TabsList aria-label="Execution details">
                <Sandbox.TabsTrigger value="code">Code</Sandbox.TabsTrigger>
                <Sandbox.TabsTrigger value="output">Output</Sandbox.TabsTrigger>
              </Sandbox.TabsList>
            </Sandbox.TabsBar>
            <Sandbox.TabContent value="code">
              <CodeBlock
                code={code}
                language="typescript"
                style={{ border: 0 }}
              >
                <CodeBlock.CopyButton />
              </CodeBlock>
            </Sandbox.TabContent>
            <Sandbox.TabContent value="output">
              <CodeBlock
                code={
                  state === 'output-error'
                    ? 'Example error: execution failed'
                    : state === 'output-available'
                      ? '[2, 3, 5, 7]'
                      : 'No output available.'
                }
                language="text"
                style={{ border: 0 }}
              />
            </Sandbox.TabContent>
          </Sandbox.Tabs>
        </Sandbox.Content>
      </Sandbox>
    </Stack>
  );
}
export const Basic: Story = { render: () => <Example /> };
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Sandbox: Sandbox.extend({ defaultProps: { radius: 'lg' } }),
          SandboxHeader: SandboxHeader.extend({
            styles: { title: { color: 'var(--mantine-color-grape-6)' } },
          }),
          SandboxTabsTrigger: SandboxTabsTrigger.extend({
            styles: { tabLabel: { fontWeight: 700 } },
          }),
        },
      })}
    >
      <Example />
    </MantineProvider>
  ),
};

export const WithUseChat: Story = { render: () => <SandboxChatExample /> };

function LayoutExample({
  vertical = false,
  rtl = false,
}: {
  vertical?: boolean;
  rtl?: boolean;
}) {
  return (
    <DirectionProvider initialDirection={rtl ? 'rtl' : 'ltr'}>
      <div dir={rtl ? 'rtl' : 'ltr'}>
        <Sandbox>
          <Sandbox.Header
            title="generated-output-for-the-accessible-chat-application-with-a-long-filename.ts"
            state="approval-requested"
          />
          <Sandbox.Content>
            <Sandbox.Tabs
              defaultValue="code"
              orientation={vertical ? 'vertical' : 'horizontal'}
            >
              <Sandbox.TabsList aria-label="Layout example">
                <Sandbox.TabsTrigger value="code">Code</Sandbox.TabsTrigger>
                <Sandbox.TabsTrigger value="disabled" disabled>
                  Disabled
                </Sandbox.TabsTrigger>
                <Sandbox.TabsTrigger value="output">Output</Sandbox.TabsTrigger>
              </Sandbox.TabsList>
              <Sandbox.TabContent value="code" p="sm">
                Source content
              </Sandbox.TabContent>
              <Sandbox.TabContent value="output" p="sm">
                Result content
              </Sandbox.TabContent>
            </Sandbox.Tabs>
          </Sandbox.Content>
        </Sandbox>
      </div>
    </DirectionProvider>
  );
}
export const Vertical: Story = { render: () => <LayoutExample vertical /> };
export const RightToLeft: Story = { render: () => <LayoutExample rtl /> };
