'use client';

import { useChat } from '@ai-sdk/react';
import { Alert, Badge, Stack, Text } from '@mantine/core';
import { PromptInput, type PromptInputMessage } from 'mantine-ai-elements';
import { useState } from 'react';
import { createDemoTransport } from './demo-transport';

export default function Chat() {
  const [transport] = useState(createDemoTransport);
  const { messages, status, sendMessage, stop, error } = useChat({ transport });
  const submit = ({ text, files }: PromptInputMessage) =>
    sendMessage({ text, files });
  return (
    <Stack>
      <Badge data-testid="status">{status}</Badge>
      {messages.map((message) => (
        <Text
          key={message.id}
          data-testid={message.role}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {message.parts
            .map((part) => (part.type === 'text' ? part.text : ''))
            .join('')}
        </Text>
      ))}
      {error && <Alert color="red">{error.message}</Alert>}
      <PromptInput onSubmit={submit}>
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
          <PromptInput.Submit
            status={status}
            onStop={() => stop()}
            submitLabel="Send"
            stopLabel="Stop"
          />
        </PromptInput.Footer>
      </PromptInput>
    </Stack>
  );
}
