import { useChat } from '@ai-sdk/react';
import {
  Button,
  Checkbox,
  createTheme,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  isToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from 'ai';
import { useRef, useState } from 'react';
import {
  Confirmation,
  type ConfirmationApproval,
  Message,
  Tool,
} from '../index';
import { createApprovalTransport } from '../stories/approval-transport';

const meta = {
  title: 'Confirmation',
  component: Confirmation,
  args: { state: 'approval-requested' },
} satisfies Meta<typeof Confirmation>;
export default meta;
type Story = StoryObj<typeof meta>;
function Contents() {
  return (
    <>
      <Confirmation.Title>
        <Confirmation.Request>
          Allow the application to look up the shared team notes?
        </Confirmation.Request>
        <Confirmation.Accepted>You approved this lookup.</Confirmation.Accepted>
        <Confirmation.Rejected>You rejected this lookup.</Confirmation.Rejected>
      </Confirmation.Title>
      <Confirmation.Actions>
        <Confirmation.Action
          approved={false}
          reason="Declined by the reader"
          variant="default"
        >
          Reject
        </Confirmation.Action>
        <Confirmation.Action approved>Approve</Confirmation.Action>
      </Confirmation.Actions>
    </>
  );
}
function BasicDemo() {
  const [approval, setApproval] = useState<ConfirmationApproval>({
    id: 'example',
  });
  return (
    <Stack>
      <Confirmation
        approval={approval}
        state={
          approval?.approved === undefined
            ? 'approval-requested'
            : 'approval-responded'
        }
        onResponse={(response) => setApproval(response)}
      >
        <Contents />
      </Confirmation>
      <Button variant="subtle" onClick={() => setApproval({ id: 'example' })}>
        Reset example
      </Button>
    </Stack>
  );
}
export const Basic: Story = { render: () => <BasicDemo /> };
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Confirmation: Confirmation.extend({
            defaultProps: {
              color: 'grape',
              radius: 'lg',
              title: 'Team knowledge access',
            },
            styles: {
              root: { border: '1px solid var(--mantine-color-grape-5)' },
            },
          }),
          ConfirmationAction: Confirmation.Action.extend({
            defaultProps: { radius: 'xl', color: 'grape' },
          }),
        },
      })}
    >
      <BasicDemo />
    </MantineProvider>
  ),
};
function ChatDemo() {
  const [transport] = useState(createApprovalTransport);
  const chat = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });
  const [failOnce, setFailOnce] = useState(false);
  const failed = useRef(new Set<string>());
  const [responseError, setResponseError] = useState<string>();
  const busy = chat.status === 'submitted' || chat.status === 'streaming';
  const awaitingResponse = chat.messages
    .at(-1)
    ?.parts.some(
      (part) =>
        isToolUIPart(part) &&
        (part.state === 'approval-requested' ||
          part.state === 'approval-responded'),
    );
  return (
    <Stack>
      <Text size="sm" c="dimmed">
        Approving or rejecting updates useChat and automatically resumes the
        same assistant message. No real database is accessed.
      </Text>
      <Checkbox
        label="Simulate a failed approval submission once"
        checked={failOnce}
        onChange={(event) => setFailOnce(event.currentTarget.checked)}
      />
      <Button
        disabled={busy || awaitingResponse}
        onClick={() => {
          setResponseError(undefined);
          void chat.sendMessage({ text: 'Look up team notes' });
        }}
      >
        Request lookup
      </Button>
      {chat.messages.map((message) => (
        <Message key={message.id} from={message.role}>
          <Message.Content>
            {message.parts.map((part, index) =>
              isToolUIPart(part) ? (
                <Tool key={part.toolCallId} defaultOpened>
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
                    <Tool.Input input={part.input} />
                    <Confirmation
                      approval={part.approval}
                      state={part.state}
                      onResponseError={(error) =>
                        setResponseError(
                          error instanceof Error
                            ? error.message
                            : 'Approval failed',
                        )
                      }
                      onResponse={async (response) => {
                        setResponseError(undefined);
                        if (failOnce && !failed.current.has(response.id)) {
                          failed.current.add(response.id);
                          throw new Error(
                            'Approval submission failed. Please retry.',
                          );
                        }
                        await chat.addToolApprovalResponse(response);
                      }}
                    >
                      <Contents />
                    </Confirmation>
                    <Tool.Output
                      output={part.output}
                      errorText={part.errorText}
                    />
                  </Tool.Content>
                </Tool>
              ) : part.type === 'text' ? (
                <Message.Response
                  // biome-ignore lint/suspicious/noArrayIndexKey: Text parts have no ID and keep their append-only position during the stream.
                  key={index}
                >
                  {part.text}
                </Message.Response>
              ) : null,
            )}
          </Message.Content>
        </Message>
      ))}
      {responseError && (
        <Text role="alert" c="red">
          {responseError}
        </Text>
      )}
      {chat.error && (
        <Text role="alert" c="red">
          {chat.error.message}
        </Text>
      )}
    </Stack>
  );
}
export const WithAISDK: Story = { render: () => <ChatDemo /> };
