import {
  ActionIcon,
  Button,
  createTheme,
  Group,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  OpenIn,
  OpenInChatGPT,
  OpenInTrigger,
  PromptInput,
  PromptInputProvider,
  usePromptInputController,
} from '../index';

const meta = {
  title: 'OpenIn',
  component: OpenIn,
  args: { query: 'Explain React memoization with an example.' },
} satisfies Meta<typeof OpenIn>;
export default meta;
type Story = StoryObj<typeof meta>;
function Links() {
  return (
    <>
      <OpenIn.ChatGPT />
      <OpenIn.Claude />
      <OpenIn.Cursor />
      <OpenIn.T3 />
      <OpenIn.Scira />
      <OpenIn.v0 />
    </>
  );
}
export const Basic: Story = {
  render: (args) => (
    <OpenIn {...args}>
      <OpenIn.Trigger />
      <OpenIn.Content>
        <OpenIn.Label>Continue with</OpenIn.Label>
        <Links />
      </OpenIn.Content>
    </OpenIn>
  ),
};
export const Themed: Story = {
  render: (args) => (
    <MantineProvider
      theme={createTheme({
        components: {
          OpenIn: OpenIn.extend({
            defaultProps: { width: 300, radius: 'lg' },
            styles: {
              dropdown: { borderColor: 'var(--mantine-color-grape-5)' },
              itemLabel: { fontSize: 14 },
            },
          }),
          OpenInTrigger: OpenInTrigger.extend({
            defaultProps: { color: 'grape', variant: 'light', radius: 'xl' },
          }),
          OpenInChatGPT: OpenInChatGPT.extend({
            styles: { itemLabel: { fontWeight: 700 } },
          }),
        },
      })}
    >
      <OpenIn {...args}>
        <OpenIn.Trigger>Choose an assistant</OpenIn.Trigger>
        <OpenIn.Content>
          <Links />
          <OpenIn.Separator />
          <OpenIn.Item
            component="a"
            href="https://example.com/assistant"
            target="_blank"
            rel="noreferrer"
          >
            Open a custom assistant with an application-defined destination
          </OpenIn.Item>
        </OpenIn.Content>
      </OpenIn>
    </MantineProvider>
  ),
};
function DraftMenu() {
  const { textInput } = usePromptInputController();
  return (
    <OpenIn query={textInput.value}>
      <OpenIn.Trigger size="compact-sm" />
      <OpenIn.Content>
        <Links />
      </OpenIn.Content>
    </OpenIn>
  );
}
function DraftDemo() {
  const [submitted, setSubmitted] = useState('');
  return (
    <PromptInputProvider initialInput="Explain React memoization with an example.">
      <Stack>
        <Text size="sm" c="dimmed">
          The menu uses the current shared PromptInput draft. Links open the
          selected service; only text is included.
        </Text>
        <PromptInput onSubmit={({ text }) => setSubmitted(text)}>
          <PromptInput.Textarea aria-label="Draft query" />
          <PromptInput.Footer>
            <DraftMenu />
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput>
        {submitted && <Text size="sm">Local demo submission: {submitted}</Text>}
      </Stack>
    </PromptInputProvider>
  );
}
export const WithPromptInput: Story = { render: () => <DraftDemo /> };
export const CustomTarget: Story = {
  render: (args) => (
    <Group>
      <OpenIn {...args}>
        <OpenIn.Target>
          <ActionIcon variant="default" aria-label="Choose chat service">
            ↗
          </ActionIcon>
        </OpenIn.Target>
        <OpenIn.Content>
          <OpenIn.ChatGPT disabled />
          <OpenIn.Claude />
          <OpenIn.Cursor />
          <OpenIn.Separator />
          <OpenIn.Item disabled>Unavailable action</OpenIn.Item>
        </OpenIn.Content>
      </OpenIn>
      <Button variant="default">Next control</Button>
    </Group>
  ),
};
