'use client';
import { useChat } from '@ai-sdk/react';
import { Button, Stack, Text } from '@mantine/core';
import {
  Attachment,
  Attachments,
  ModelSelector,
  PromptInput,
  PromptInputProvider,
  usePromptInputAttachments,
  usePromptInputController,
  usePromptInputReferencedSources,
} from 'mantine-ai-elements';
import { useRef, useState } from 'react';
import { createDemoTransport } from './demo-transport';

function Files() {
  const files = usePromptInputAttachments();
  const references = usePromptInputReferencedSources();
  return (
    <>
      <Attachments variant="inline">
        {files.files.map((file) => (
          <Attachment
            key={file.id}
            data={file}
            onRemove={() => files.remove(file.id)}
          >
            <Attachment.Preview />
            <Attachment.Info />
            <Attachment.Remove />
          </Attachment>
        ))}
      </Attachments>
      <PromptInput.Command
        label="Reference picker"
        styles={{ item: { borderRadius: 13 } }}
      >
        <PromptInput.Command.Input aria-label="Find reference" />
        <PromptInput.Command.List>
          <PromptInput.Command.Empty>No reference</PromptInput.Command.Empty>
          <PromptInput.Command.Group heading="References">
            <PromptInput.Command.Item
              value="guide"
              keywords={['manual']}
              onSelect={() =>
                references.add({
                  type: 'source-document',
                  sourceId: 'guide',
                  title: 'Guide',
                  mediaType: 'text/plain',
                })
              }
            >
              Guide
            </PromptInput.Command.Item>
          </PromptInput.Command.Group>
        </PromptInput.Command.List>
      </PromptInput.Command>
      <Text data-testid="reference-count">{references.sources.length}</Text>
    </>
  );
}
function Outside() {
  const controller = usePromptInputController();
  return (
    <Button onClick={() => controller.textInput.setInput('Shared draft')}>
      Insert shared draft
    </Button>
  );
}
export default function PromptAttachments() {
  const [transport] = useState(createDemoTransport);
  const { messages, status, sendMessage, stop } = useChat({ transport });
  const [error, setError] = useState('');
  const [pickerOpened, setPickerOpened] = useState(false);
  const [model, setModel] = useState<string | null>('fast');
  const failed = useRef(false);
  const parts = messages.flatMap((message) =>
    message.parts.filter((part) => part.type === 'file'),
  );
  return (
    <Stack data-testid="prompt-attachments">
      <PromptInputProvider>
        <Outside />
        <PromptInput
          multiple
          accept="image/*,.txt"
          maxFiles={2}
          maxFileSize={1024 * 1024}
          onAttachmentError={({ code }) => setError(code)}
          onSubmitError={() => setError('Retry requested')}
          onSubmit={async ({ text, files }) => {
            if (text === 'retry' && !failed.current) {
              failed.current = true;
              throw new Error('Retry');
            }
            setError('');
            await sendMessage({ text, files }, { body: { model } });
          }}
        >
          <PromptInput.Header>
            <Files />
          </PromptInput.Header>
          <PromptInput.Body>
            <PromptInput.Textarea aria-label="Attachment draft" />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Tools>
              <PromptInput.ActionMenu>
                <PromptInput.ActionMenuTrigger />
                <PromptInput.ActionMenuContent>
                  <PromptInput.ActionAddAttachments />
                  <PromptInput.ActionAddScreenshot
                    onCaptureError={() => setError('Capture failed')}
                  />
                </PromptInput.ActionMenuContent>
              </PromptInput.ActionMenu>
              <ModelSelector opened={pickerOpened} onChange={setPickerOpened}>
                <ModelSelector.Trigger>Pick a model</ModelSelector.Trigger>
                <ModelSelector.Content
                  title="Choose attachment model"
                  commandProps={{ styles: { item: { padding: 15 } } }}
                >
                  <ModelSelector.Input
                    aria-label="Filter attachment models"
                    data-autofocus
                  />
                  <ModelSelector.List>
                    <ModelSelector.Empty>
                      No matching models
                    </ModelSelector.Empty>
                    <ModelSelector.Group heading="Available models">
                      <ModelSelector.Item
                        value="detailed"
                        keywords={['thorough']}
                        onSelect={(value) => {
                          setModel(value);
                          setPickerOpened(false);
                        }}
                      >
                        <ModelSelector.Logo
                          provider="local"
                          src="/image-preview.svg"
                        />
                        <ModelSelector.Name>Detailed model</ModelSelector.Name>
                      </ModelSelector.Item>
                    </ModelSelector.Group>
                  </ModelSelector.List>
                </ModelSelector.Content>
              </ModelSelector>
              <PromptInput.Select
                aria-label="Attachment model"
                data={['fast', 'detailed']}
                value={model}
                onChange={setModel}
              />
            </PromptInput.Tools>
            <PromptInput.Submit
              submitLabel="Send attachments"
              stopLabel="Stop attachments"
              status={status}
              onStop={() => stop()}
            />
          </PromptInput.Footer>
        </PromptInput>
        <Text data-testid="attachment-status">{status}</Text>
        <Text data-testid="attachment-error">{error}</Text>
        <output data-testid="sent-files">{JSON.stringify(parts)}</output>
      </PromptInputProvider>
    </Stack>
  );
}
