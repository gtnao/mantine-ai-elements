import {
  Button,
  createTheme,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Snippet } from './Snippet';
import { SnippetCopyButton } from './SnippetCopyButton';
import { SnippetInput } from './SnippetParts';

const meta = {
  title: 'Snippet',
  component: Snippet,
  args: { code: 'pnpm add mantine-ai-elements' },
} satisfies Meta<typeof Snippet>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: () => (
    <Snippet code="pnpm add mantine-ai-elements">
      <Snippet.Addon>
        <Snippet.Text aria-hidden>$</Snippet.Text>
      </Snippet.Addon>
      <Snippet.Input aria-label="Install command" />
      <Snippet.Addon align="inline-end">
        <Snippet.CopyButton />
      </Snippet.Addon>
    </Snippet>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Snippet: Snippet.extend({
            defaultProps: { radius: 'lg' },
            styles: { root: { borderColor: 'var(--mantine-color-grape-5)' } },
          }),
          SnippetCopyButton: SnippetCopyButton.extend({
            defaultProps: { color: 'grape', variant: 'light' },
          }),
          SnippetInput: SnippetInput.extend({
            styles: { input: { fontWeight: 500 } },
          }),
        },
      })}
    >
      <Snippet code="pnpm add mantine-ai-elements @mantine/core @mantine/hooks ai @ai-sdk/react">
        <Snippet.Addon align="block-start">
          <Snippet.Text>Install the library and peer dependencies</Snippet.Text>
        </Snippet.Addon>
        <Snippet.Addon>
          <Snippet.Text aria-hidden>$</Snippet.Text>
        </Snippet.Addon>
        <Snippet.Input aria-label="Full install command" />
        <Snippet.Addon align="inline-end">
          <Snippet.CopyButton />
        </Snippet.Addon>
        <Snippet.Addon align="block-end">
          <Snippet.Text size="xs">
            Copy the command or select part of the read-only text.
          </Snippet.Text>
        </Snippet.Addon>
      </Snippet>
    </MantineProvider>
  ),
};
function CopyExample() {
  const [code, setCode] = useState('pnpm add mantine-ai-elements');
  const [notice, setNotice] = useState('Ready.');
  return (
    <Stack>
      <Snippet code={code}>
        <Snippet.Input aria-label="Command" />
        <Snippet.Addon align="inline-end">
          <Snippet.CopyButton
            onCopy={() => setNotice('Copied to clipboard.')}
            onError={(error) => setNotice(error.message)}
          />
        </Snippet.Addon>
      </Snippet>
      <Button
        variant="default"
        onClick={() =>
          setCode((value) =>
            value.startsWith('pnpm')
              ? 'npm install mantine-ai-elements'
              : 'pnpm add mantine-ai-elements',
          )
        }
      >
        Change command
      </Button>
      <Text role="status">{notice}</Text>
    </Stack>
  );
}
export const Clipboard: Story = { render: () => <CopyExample /> };
