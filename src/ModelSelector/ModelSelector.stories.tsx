import { useChat } from '@ai-sdk/react';
import {
  Button,
  createTheme,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { ModelSelector, PromptInput } from '../index';
import { createDemoTransport } from '../stories/demo-transport';

const meta = {
  title: 'ModelSelector',
  component: ModelSelector,
} satisfies Meta<typeof ModelSelector>;
export default meta;
type Story = StoryObj<typeof meta>;
const models = [
  { value: 'swift', name: 'Swift', provider: 'Local', keywords: ['fast'] },
  {
    value: 'thorough',
    name: 'Thorough',
    provider: 'Local',
    keywords: ['detailed'],
  },
  {
    value: 'custom',
    name: 'An application-defined model with a long display name',
    provider: 'Custom',
    keywords: ['private'],
  },
];
const logo = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" rx="4" fill="#7950f2"/></svg>')}`;
function Options({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <>
      <ModelSelector.Input aria-label="Search models" data-autofocus />
      <ModelSelector.List>
        <ModelSelector.Empty>No models found.</ModelSelector.Empty>
        {['Local', 'Custom'].map((provider) => (
          <ModelSelector.Group key={provider} heading={provider}>
            {models
              .filter((model) => model.provider === provider)
              .map((model) => (
                <ModelSelector.Item
                  key={model.value}
                  value={model.value}
                  keywords={model.keywords}
                  onSelect={onSelect}
                >
                  <ModelSelector.Logo provider={provider} src={logo} />
                  <ModelSelector.Name>{model.name}</ModelSelector.Name>
                  <ModelSelector.LogoGroup>
                    <ModelSelector.Logo
                      provider="Secondary"
                      src={logo}
                      alt="Secondary host"
                    />
                  </ModelSelector.LogoGroup>
                </ModelSelector.Item>
              ))}
          </ModelSelector.Group>
        ))}
        <ModelSelector.Separator />
        <ModelSelector.Item value="unavailable" disabled>
          Unavailable model
        </ModelSelector.Item>
      </ModelSelector.List>
    </>
  );
}
export const Basic: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    const [selected, setSelected] = useState('swift');
    return (
      <Stack>
        <ModelSelector opened={opened} onChange={setOpened}>
          <ModelSelector.Trigger>
            {models.find((model) => model.value === selected)?.name}
          </ModelSelector.Trigger>
          <ModelSelector.Content>
            <Options
              onSelect={(value) => {
                setSelected(value);
                setOpened(false);
              }}
            />
          </ModelSelector.Content>
        </ModelSelector>
        <Text role="status">Selected: {selected}</Text>
      </Stack>
    );
  },
};
export const Themed: Story = {
  render: () => {
    const theme = createTheme({
      primaryColor: 'grape',
      components: {
        ModelSelector: ModelSelector.extend({
          defaultProps: { radius: 'xl' },
          styles: {
            header: { background: 'var(--mantine-color-grape-light)' },
          },
        }),
        ModelSelectorLogo: ModelSelector.Logo.extend({
          defaultProps: { w: 24, h: 24 },
        }),
      },
    });
    return (
      <MantineProvider theme={theme}>
        <ModelSelector>
          <ModelSelector.Trigger>Choose a model</ModelSelector.Trigger>
          <ModelSelector.Content
            title="Available models"
            commandProps={{ styles: { item: { padding: 16 } } }}
          >
            <Options onSelect={() => {}} />
          </ModelSelector.Content>
        </ModelSelector>
      </MantineProvider>
    );
  },
};
export const KeyboardDialog: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    const [selected, setSelected] = useState('swift');
    useEffect(() => {
      const keydown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
          event.preventDefault();
          setOpened((value) => !value);
        }
      };
      document.addEventListener('keydown', keydown);
      return () => document.removeEventListener('keydown', keydown);
    }, []);
    return (
      <Stack>
        <Button onClick={() => setOpened(true)}>
          Open model picker <ModelSelector.Shortcut>⌘K</ModelSelector.Shortcut>
        </Button>
        <Text>
          Selected: {selected}. The application registers the keyboard shortcut.
        </Text>
        <ModelSelector.Dialog opened={opened} onChange={setOpened}>
          <Options
            onSelect={(value) => {
              setSelected(value);
              setOpened(false);
            }}
          />
        </ModelSelector.Dialog>
      </Stack>
    );
  },
};
export const WithAISDK: Story = {
  render: () => {
    const [transport] = useState(createDemoTransport);
    const { sendMessage, messages, status, stop } = useChat({ transport });
    const [model, setModel] = useState('swift');
    const [opened, setOpened] = useState(false);
    const [sentModel, setSentModel] = useState('');
    return (
      <Stack>
        <Text>
          Model IDs are application-defined; this example uses a local demo
          transport.
        </Text>
        {messages.map((message) => (
          <Text key={message.id}>
            {message.parts
              .filter((part) => part.type === 'text')
              .map((part) => part.text)
              .join('')}
          </Text>
        ))}
        <PromptInput
          onSubmit={({ text, files }) => {
            setSentModel(model);
            return sendMessage({ text, files }, { body: { model } });
          }}
        >
          <PromptInput.Textarea aria-label="Model prompt" />
          <PromptInput.Footer>
            <PromptInput.Tools>
              <ModelSelector opened={opened} onChange={setOpened}>
                <ModelSelector.Trigger>{model}</ModelSelector.Trigger>
                <ModelSelector.Content>
                  <Options
                    onSelect={(value) => {
                      setModel(value);
                      setOpened(false);
                    }}
                  />
                </ModelSelector.Content>
              </ModelSelector>
            </PromptInput.Tools>
            <PromptInput.Submit status={status} onStop={() => stop()} />
          </PromptInput.Footer>
        </PromptInput>
        <Text role="status">Model sent in request: {sentModel || '—'}</Text>
      </Stack>
    );
  },
};
