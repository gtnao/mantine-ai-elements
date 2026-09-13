import { useChat } from '@ai-sdk/react';
import {
  Alert,
  Badge,
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
  Attachment,
  Attachments,
  Conversation,
  Message,
  PromptInput,
  PromptInputProvider,
  usePromptInputAttachments,
  usePromptInputController,
  usePromptInputReferencedSources,
} from '../index';
import { createDemoTransport } from '../stories/demo-transport';

const meta = { title: 'PromptInput', component: PromptInput } satisfies Meta<
  typeof PromptInput
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { onSubmit: () => {} },
  render: () => {
    const [last, setLast] = useState('');
    return (
      <Stack>
        <PromptInput onSubmit={({ text }) => setLast(text)}>
          <PromptInput.Body>
            <PromptInput.Textarea
              aria-label="Message"
              placeholder="Type a message…"
            />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Tools>
              <Text size="xs" c="dimmed">
                Shift + Enter for a new line
              </Text>
            </PromptInput.Tools>
            <PromptInput.Submit submitLabel="Send" />
          </PromptInput.Footer>
        </PromptInput>
        <Text size="sm">Submitted: {last || '—'}</Text>
      </Stack>
    );
  },
};

export const WithAISDK: Story = {
  args: { onSubmit: () => {} },
  render: () => {
    const [transport] = useState(createDemoTransport);
    const { messages, sendMessage, status, stop, error, clearError } = useChat({
      transport,
    });
    return (
      <Stack>
        <Badge variant="light">{status}</Badge>
        {messages.map((message) => (
          <div key={message.id}>
            <Text size="xs" c="dimmed">
              {message.role}
            </Text>
            <Text style={{ whiteSpace: 'pre-wrap' }}>
              {message.parts
                .map((part) => (part.type === 'text' ? part.text : ''))
                .join('')}
            </Text>
          </div>
        ))}
        {error && (
          <Alert color="red" title="Send failed">
            {error.message}
            <Button variant="subtle" onClick={clearError}>
              Dismiss
            </Button>
          </Alert>
        )}
        <PromptInput
          onSubmit={({ text, files }) => sendMessage({ text, files })}
        >
          <PromptInput.Body>
            <PromptInput.Textarea
              aria-label="Message"
              placeholder="Type a message…"
            />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Tools>
              <Text size="xs" c="dimmed">
                Send /error to try an error
              </Text>
            </PromptInput.Tools>
            <PromptInput.Submit
              status={status}
              onStop={() => stop()}
              submitLabel="Send"
              stopLabel="Stop generating"
            />
          </PromptInput.Footer>
        </PromptInput>
      </Stack>
    );
  },
};

export const ThemedAndControlled: Story = {
  args: { onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState('An editable initial draft');
    const theme = createTheme({
      primaryColor: 'grape',
      components: {
        PromptInput: PromptInput.extend({
          styles: { root: { borderRadius: 24 }, footer: { padding: 8 } },
        }),
        PromptInputSubmit: PromptInput.Submit.extend({
          defaultProps: { variant: 'light', radius: 'xl' },
        }),
      },
    });
    return (
      <MantineProvider theme={theme}>
        <PromptInput onSubmit={() => setValue('')}>
          <PromptInput.Body>
            <PromptInput.Textarea
              aria-label="Message"
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
            />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Tools>
              <Button
                variant="subtle"
                onClick={() => setValue('Please summarize this text')}
              >
                Insert example
              </Button>
            </PromptInput.Tools>
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput>
      </MantineProvider>
    );
  },
};

function DraftFiles() {
  const attachments = usePromptInputAttachments();
  const references = usePromptInputReferencedSources();
  return (
    <Attachments variant="inline">
      {[...attachments.files, ...references.sources].map((entry) => (
        <Attachment
          key={entry.id}
          data={entry}
          onRemove={() =>
            entry.type === 'file'
              ? attachments.remove(entry.id)
              : references.remove(entry.id)
          }
        >
          <Attachment.Preview />
          <Attachment.Info />
          <Attachment.Remove />
        </Attachment>
      ))}
    </Attachments>
  );
}
function FileTools() {
  const [error, setError] = useState('');
  return (
    <>
      <PromptInput.ActionMenu>
        <PromptInput.ActionMenuTrigger />
        <PromptInput.ActionMenuContent>
          <PromptInput.ActionAddAttachments />
          <PromptInput.ActionAddScreenshot
            onCaptureError={(error) =>
              setError(error instanceof Error ? error.message : String(error))
            }
          />
        </PromptInput.ActionMenuContent>
      </PromptInput.ActionMenu>
      {error && (
        <Text role="alert" c="red" size="xs">
          {error}
        </Text>
      )}
    </>
  );
}
export const AttachmentsAndChat: Story = {
  args: { onSubmit: () => {} },
  render: () => {
    const [transport] = useState(createDemoTransport);
    const { messages, sendMessage, status, stop, error } = useChat({
      transport,
    });
    const [validation, setValidation] = useState('');
    const [model, setModel] = useState<string | null>('fast');
    return (
      <Stack>
        <Text size="sm">
          Select, paste, or drop up to three images or text files (2 MB each).
          Files can be sent without text.
        </Text>
        <Conversation h={240}>
          <Conversation.Content>
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <Message.Content>
                  {message.parts.map((part, index) =>
                    part.type === 'text' ? (
                      <Message.Response
                        // biome-ignore lint/suspicious/noArrayIndexKey: AI SDK streaming parts retain their position within a message.
                        key={`${message.id}-${index}`}
                        isAnimating={status === 'streaming'}
                      >
                        {part.text}
                      </Message.Response>
                    ) : part.type === 'file' ? (
                      <Attachments
                        // biome-ignore lint/suspicious/noArrayIndexKey: AI SDK streaming parts retain their position within a message.
                        key={`${message.id}-${index}`}
                        variant="inline"
                      >
                        <Attachment
                          data={{ ...part, id: `${message.id}-${index}` }}
                        >
                          <Attachment.Preview />
                          <Attachment.Info />
                        </Attachment>
                      </Attachments>
                    ) : null,
                  )}
                </Message.Content>
              </Message>
            ))}
          </Conversation.Content>
          <Conversation.ScrollButton />
        </Conversation>
        {validation && (
          <Alert color="orange" title="Attachment not added">
            {validation}
          </Alert>
        )}
        {error && (
          <Alert color="red" title="Chat error">
            {error.message}
          </Alert>
        )}
        <PromptInput
          accept="image/*,.txt"
          multiple
          maxFiles={3}
          maxFileSize={2 * 1024 * 1024}
          onAttachmentError={({ message }) => setValidation(message)}
          onSubmit={({ text, files }) => {
            setValidation('');
            return sendMessage({ text, files }, { body: { model } });
          }}
        >
          <PromptInput.Header>
            <DraftFiles />
          </PromptInput.Header>
          <PromptInput.Body>
            <PromptInput.Textarea
              aria-label="Message"
              placeholder="Ask about your files…"
            />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Tools>
              <FileTools />
              <PromptInput.Select
                aria-label="Model"
                w={100}
                data={[
                  { value: 'fast', label: 'Fast' },
                  { value: 'deep', label: 'Detailed' },
                ]}
                value={model}
                onChange={setModel}
              />
            </PromptInput.Tools>
            <PromptInput.Submit status={status} onStop={() => stop()} />
          </PromptInput.Footer>
        </PromptInput>
      </Stack>
    );
  },
};
function ExternalDraftButton() {
  const controller = usePromptInputController();
  return (
    <Group>
      <Button
        variant="light"
        onClick={() =>
          controller.textInput.setInput('Summarize the selected references')
        }
      >
        Insert draft outside form
      </Button>
      <Button variant="subtle" onClick={controller.attachments.openFileDialog}>
        Attach outside form
      </Button>
    </Group>
  );
}
function ReferenceCommands() {
  const references = usePromptInputReferencedSources();
  return (
    <PromptInput.Command label="Reference documents">
      <PromptInput.Command.Input
        aria-label="Search references"
        placeholder="Find a reference…"
      />
      <PromptInput.Command.List>
        <PromptInput.Command.Empty>
          No references found.
        </PromptInput.Command.Empty>
        <PromptInput.Command.Group heading="Documentation">
          {['Getting started', 'API reference', 'Examples'].map((title) => (
            <PromptInput.Command.Item
              key={title}
              value={title}
              keywords={title === 'Getting started' ? ['guide'] : []}
              onSelect={() =>
                references.add({
                  type: 'source-document',
                  sourceId: title,
                  title,
                  mediaType: 'text/plain',
                })
              }
            >
              {title}
            </PromptInput.Command.Item>
          ))}
        </PromptInput.Command.Group>
        <PromptInput.Command.Separator />
        <PromptInput.Command.Item disabled value="private">
          Private reference (unavailable)
        </PromptInput.Command.Item>
      </PromptInput.Command.List>
    </PromptInput.Command>
  );
}
export const ProviderAndReferences: Story = {
  args: { onSubmit: () => {} },
  render: () => {
    const [last, setLast] = useState('');
    return (
      <PromptInputProvider initialInput="A shared draft">
        <Stack>
          <ExternalDraftButton />
          <PromptInput
            onSubmit={({ text, files }) =>
              setLast(`${text} (${files.length} files)`)
            }
            multiple
            maxFiles={5}
          >
            <PromptInput.Header>
              <DraftFiles />
            </PromptInput.Header>
            <ReferenceCommands />
            <PromptInput.Body>
              <PromptInput.Textarea aria-label="Shared message" />
            </PromptInput.Body>
            <PromptInput.Footer>
              <PromptInput.Tools>
                <FileTools />
                <PromptInput.HoverCard>
                  <PromptInput.HoverCardTrigger>
                    <PromptInput.Button>About references</PromptInput.Button>
                  </PromptInput.HoverCardTrigger>
                  <PromptInput.HoverCardContent w={260}>
                    <Text size="sm">
                      References are separate from file attachments. Read
                      usePromptInputReferencedSources() when building request
                      metadata.
                    </Text>
                  </PromptInput.HoverCardContent>
                </PromptInput.HoverCard>
              </PromptInput.Tools>
              <PromptInput.Submit />
            </PromptInput.Footer>
          </PromptInput>
          <Text role="status">Submitted: {last || '—'}</Text>
        </Stack>
      </PromptInputProvider>
    );
  },
};
