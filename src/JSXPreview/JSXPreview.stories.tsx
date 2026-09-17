import {
  Badge,
  Button,
  createTheme,
  Group,
  MantineProvider,
  Paper,
  Stack,
  Switch,
  Text,
  Textarea,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { JSXPreviewChatExample } from '../stories/jsx-preview-chat';
import { JSXPreview, JSXPreviewContent, JSXPreviewError } from './JSXPreview';

const components = { Badge, Paper, Stack, Text, Group, Button };
const source =
  '<Paper withBorder p="md"><Stack gap="xs"><Badge>{status}</Badge><Text fw={600}>{title}</Text><Text>This preview uses the current Mantine theme.</Text></Stack></Paper>';
const bindings = { status: 'Ready', title: 'Quarterly report' };
const meta = {
  title: 'Components/JSXPreview',
  component: JSXPreview,
  args: { jsx: source },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof JSXPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <JSXPreview
      trusted
      jsx={source}
      components={components}
      bindings={bindings}
    >
      <JSXPreview.Content loading="Loading renderer…" />
      <JSXPreview.Error />
    </JSXPreview>
  ),
};

export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        primaryColor: 'grape',
        components: {
          JSXPreview: JSXPreview.extend({
            defaultProps: { p: 'md' },
            styles: {
              root: {
                border: '1px dashed var(--mantine-color-grape-5)',
                borderRadius: 12,
              },
            },
          }),
          JSXPreviewContent: JSXPreviewContent.extend({
            styles: { root: { maxWidth: 560 } },
          }),
          JSXPreviewError: JSXPreviewError.extend({
            defaultProps: { color: 'orange', radius: 'md' },
          }),
        },
      })}
    >
      <JSXPreview
        trusted
        jsx={source}
        components={components}
        bindings={{
          ...bindings,
          title:
            'A report title that stays readable when the viewport becomes narrow',
        }}
      >
        <JSXPreview.Content />
        <JSXPreview.Error title="Preview unavailable" />
      </JSXPreview>
    </MantineProvider>
  ),
};

function Editor() {
  const [jsx, setJsx] = useState(source);
  const [trusted, setTrusted] = useState(false);
  const [streaming, setStreaming] = useState(false);
  return (
    <Stack>
      <Textarea
        label="Trusted JSX source"
        description="This editor runs JSX in the host application when enabled. Use only source you trust."
        value={jsx}
        onChange={(event) => setJsx(event.currentTarget.value)}
        autosize
        minRows={4}
      />
      <Group>
        <Switch
          label="Enable trusted preview"
          checked={trusted}
          onChange={(event) => setTrusted(event.currentTarget.checked)}
        />
        <Switch
          label="Treat input as streaming"
          checked={streaming}
          onChange={(event) => setStreaming(event.currentTarget.checked)}
        />
        <Button variant="default" onClick={() => setJsx(source)}>
          Reset source
        </Button>
      </Group>
      <JSXPreview
        trusted={trusted}
        jsx={jsx}
        isStreaming={streaming}
        components={components}
        bindings={bindings}
      >
        <JSXPreview.Content
          loading="Loading renderer…"
          untrustedFallback={
            <Text c="dimmed">Preview execution is disabled.</Text>
          }
        />
        <JSXPreview.Error title="Preview failed" />
      </JSXPreview>
    </Stack>
  );
}
export const Interactive: Story = { render: () => <Editor /> };
export const WithUseChat: Story = { render: () => <JSXPreviewChatExample /> };
