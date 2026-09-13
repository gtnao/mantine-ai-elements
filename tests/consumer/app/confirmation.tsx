'use client';
import { useChat } from '@ai-sdk/react';
import { Button, Stack, Text } from '@mantine/core';
import {
  isToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from 'ai';
import { Confirmation, Tool } from 'mantine-ai-elements';
import { useState } from 'react';
import { createApprovalTransport } from './approval-transport';
export default function ConfirmationChat() {
  const [transport] = useState(createApprovalTransport);
  const chat = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });
  const [error, setError] = useState<string>();
  const waiting = chat.messages
    .at(-1)
    ?.parts.some(
      (part) =>
        isToolUIPart(part) &&
        (part.state === 'approval-requested' ||
          part.state === 'approval-responded'),
    );
  return (
    <Stack data-testid="confirmation-chat">
      <Button
        disabled={
          waiting || chat.status === 'streaming' || chat.status === 'submitted'
        }
        onClick={() => void chat.sendMessage({ text: 'Lookup' })}
      >
        Request approval
      </Button>
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
              <Confirmation
                approval={part.approval}
                state={part.state}
                onResponse={chat.addToolApprovalResponse}
                onResponseError={() => setError('Approval failed')}
              >
                <Confirmation.Title>
                  <Confirmation.Request>
                    Approve the lookup?
                  </Confirmation.Request>
                  <Confirmation.Accepted>Approved</Confirmation.Accepted>
                  <Confirmation.Rejected>Rejected</Confirmation.Rejected>
                </Confirmation.Title>
                <Confirmation.Actions>
                  <Confirmation.Action approved={false}>
                    Reject
                  </Confirmation.Action>
                  <Confirmation.Action approved>Approve</Confirmation.Action>
                </Confirmation.Actions>
              </Confirmation>
              <Tool.Output output={part.output} errorText={part.errorText} />
            </Tool.Content>
          </Tool>
        )),
      )}
      {error && <Text role="alert">{error}</Text>}
    </Stack>
  );
}
