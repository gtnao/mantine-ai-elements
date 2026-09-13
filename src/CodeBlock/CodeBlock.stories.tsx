import { Alert, createTheme, MantineProvider, Stack } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CodeBlock } from '../index';

const meta = {
  title: 'CodeBlock',
  component: CodeBlock,
  args: {
    code: 'const greeting = "Hello, world!";\n\nconsole.log(greeting);',
    language: 'typescript',
  },
} satisfies Meta<typeof CodeBlock>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: (args) => (
    <CodeBlock {...args} showLineNumbers>
      <CodeBlock.Header>
        <CodeBlock.Title>
          <CodeBlock.Filename>greeting.ts</CodeBlock.Filename>
        </CodeBlock.Title>
        <CodeBlock.Actions>
          <CodeBlock.CopyButton />
        </CodeBlock.Actions>
      </CodeBlock.Header>
    </CodeBlock>
  ),
};
export const LanguageSelection: Story = {
  render: () => {
    const [language, setLanguage] = useState<string | null>('typescript');
    const [error, setError] = useState('');
    return (
      <Stack>
        {error && <Alert color="red">{error}</Alert>}
        <CodeBlock
          code={
            language === 'python'
              ? 'print("Hello, world!")'
              : 'console.log("Hello, world!");'
          }
          language={language ?? 'text'}
        >
          <CodeBlock.Header>
            <CodeBlock.Title>Greeting</CodeBlock.Title>
            <CodeBlock.Actions>
              <CodeBlock.LanguageSelector
                w={130}
                value={language}
                onChange={setLanguage}
                data={[
                  { value: 'typescript', label: 'TypeScript' },
                  { value: 'python', label: 'Python' },
                ]}
              />
              <CodeBlock.CopyButton
                onError={(error) => setError(error.message)}
              />
            </CodeBlock.Actions>
          </CodeBlock.Header>
        </CodeBlock>
      </Stack>
    );
  },
};
export const Themed: Story = {
  render: (args) => (
    <MantineProvider
      theme={createTheme({
        components: {
          CodeBlock: CodeBlock.extend({
            styles: {
              root: { borderRadius: 20 },
              header: { background: 'var(--mantine-color-grape-light)' },
              pre: { fontSize: 16 },
            },
          }),
          CodeBlockCopyButton: CodeBlock.CopyButton.extend({
            defaultProps: { color: 'grape', variant: 'light' },
          }),
        },
      })}
    >
      <CodeBlock {...args}>
        <CodeBlock.Header>
          <CodeBlock.Filename>custom.ts</CodeBlock.Filename>
          <CodeBlock.CopyButton />
        </CodeBlock.Header>
      </CodeBlock>
    </MantineProvider>
  ),
};
export const StandaloneContent: Story = {
  render: (args) => (
    <CodeBlock.Container language={args.language}>
      <CodeBlock.Header>
        <CodeBlock.Filename>Custom composition</CodeBlock.Filename>
        <CodeBlock.CopyButton code={args.code} />
      </CodeBlock.Header>
      <CodeBlock.Content code={args.code} language={args.language} />
    </CodeBlock.Container>
  ),
};
