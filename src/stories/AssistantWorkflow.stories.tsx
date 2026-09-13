import { useChat } from '@ai-sdk/react';
import { Button, Group, Stack, Text } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  isToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from 'ai';
import { useState } from 'react';
import {
  Attachment,
  Attachments,
  Confirmation,
  Conversation,
  Message,
  ModelSelector,
  PromptInput,
  PromptInputProvider,
  Question,
  Reasoning,
  Tool,
  usePromptInputAttachments,
  usePromptInputController,
} from '../index';
import { createApprovalTransport } from './approval-transport';

const meta = { title: 'Examples/Assistant workflow' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
function DraftFiles() {
  const attachments = usePromptInputAttachments();
  return (
    <Attachments variant="inline">
      {attachments.files.map((file) => (
        <Attachment
          key={file.id}
          data={file}
          onRemove={() => attachments.remove(file.id)}
        >
          <Attachment.Preview />
          <Attachment.Info />
          <Attachment.Remove />
        </Attachment>
      ))}
    </Attachments>
  );
}
function Workflow() {
  const [transport] = useState(() =>
    createApprovalTransport({ reasoning: true }),
  );
  const chat = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });
  const controller = usePromptInputController();
  const [model, setModel] = useState('swift');
  const [pickerOpened, setPickerOpened] = useState(false);
  const [questionDone, setQuestionDone] = useState(false);
  const [error, setError] = useState<string>();
  const waiting = chat.messages
    .at(-1)
    ?.parts.some(
      (part) =>
        isToolUIPart(part) &&
        (part.state === 'approval-requested' ||
          part.state === 'approval-responded'),
    );
  const busy = chat.status === 'submitted' || chat.status === 'streaming';
  return (
    <Stack>
      <Text size="sm" c="dimmed">
        A complete input-to-approval flow with attachments, model selection,
        reasoning, tools, and follow-up questions. All data is local demo data.
      </Text>
      {!questionDone && (
        <Question
          onSubmit={({ selectedValues }) => {
            controller.textInput.setInput(
              `Look up ${selectedValues.join(', ')} in the shared notes`,
            );
            setQuestionDone(true);
          }}
        >
          <Question.Prompt>Which notes should we look up?</Question.Prompt>
          <Question.Options aria-label="Note topic">
            <Question.Option value="release planning">
              Release planning
            </Question.Option>
            <Question.Option value="component design">
              Component design
            </Question.Option>
          </Question.Options>
          <Question.Actions>
            <Question.Submit>Use this topic</Question.Submit>
          </Question.Actions>
        </Question>
      )}
      <Conversation h={420}>
        <Conversation.Content>
          {chat.messages.length === 0 && (
            <Conversation.EmptyState
              title="Ask about the team notes"
              description="Choose a topic or write your own question below."
            />
          )}
          {chat.messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <Message.Content>
                {message.parts.map((part, index) =>
                  part.type === 'file' ? (
                    <Attachments
                      // biome-ignore lint/suspicious/noArrayIndexKey: File parts keep their positions and may share a URL.
                      key={index}
                      variant="inline"
                    >
                      <Attachment
                        data={{ ...part, id: `${message.id}-file-${index}` }}
                      >
                        <Attachment.Preview />
                        <Attachment.Info />
                      </Attachment>
                    </Attachments>
                  ) : part.type === 'reasoning' ? (
                    <Reasoning
                      key={part.id ?? index}
                      isStreaming={
                        chat.status === 'streaming' &&
                        part.state === 'streaming'
                      }
                    >
                      <Reasoning.Trigger />
                      <Reasoning.Content>{part.text}</Reasoning.Content>
                    </Reasoning>
                  ) : isToolUIPart(part) ? (
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
                          state={part.state}
                          approval={part.approval}
                          onResponse={chat.addToolApprovalResponse}
                          onResponseError={() =>
                            setError('Approval failed; try again.')
                          }
                        >
                          <Confirmation.Title>
                            <Confirmation.Request>
                              Allow access to the shared notes for this demo
                              lookup?
                            </Confirmation.Request>
                            <Confirmation.Accepted>
                              Lookup approved.
                            </Confirmation.Accepted>
                            <Confirmation.Rejected>
                              Lookup rejected.
                            </Confirmation.Rejected>
                          </Confirmation.Title>
                          <Confirmation.Actions>
                            <Confirmation.Action
                              approved={false}
                              variant="default"
                            >
                              Reject
                            </Confirmation.Action>
                            <Confirmation.Action approved>
                              Approve
                            </Confirmation.Action>
                          </Confirmation.Actions>
                        </Confirmation>
                        <Tool.Output
                          output={part.output}
                          errorText={part.errorText}
                        />
                      </Tool.Content>
                    </Tool>
                  ) : part.type === 'text' ? (
                    <Message.Response
                      // biome-ignore lint/suspicious/noArrayIndexKey: AI SDK text parts retain their append-only positions while streaming.
                      key={index}
                    >
                      {part.text}
                    </Message.Response>
                  ) : null,
                )}
              </Message.Content>
            </Message>
          ))}
        </Conversation.Content>
        <Conversation.ScrollButton />
      </Conversation>
      {(error || chat.error) && (
        <Text role="alert" c="red">
          {error ?? chat.error?.message}
        </Text>
      )}
      <PromptInput
        multiple
        maxFiles={3}
        onSubmit={({ text, files }) =>
          chat.sendMessage({ text, files }, { body: { model } })
        }
        onAttachmentError={(failure) => setError(failure.message)}
        onSubmitError={() => setError('Submission failed; try again.')}
      >
        <PromptInput.Header>
          <DraftFiles />
        </PromptInput.Header>
        <PromptInput.Textarea
          aria-label="Workflow message"
          disabled={busy || waiting}
          placeholder="Ask about the team notes"
        />
        <PromptInput.Footer>
          <Group gap="xs">
            <PromptInput.ActionMenu>
              <PromptInput.ActionMenuTrigger />
              <PromptInput.ActionMenuContent>
                <PromptInput.ActionAddAttachments />
              </PromptInput.ActionMenuContent>
            </PromptInput.ActionMenu>
            <ModelSelector opened={pickerOpened} onChange={setPickerOpened}>
              <ModelSelector.Trigger size="xs" disabled={busy || waiting}>
                {model}
              </ModelSelector.Trigger>
              <ModelSelector.Content>
                <ModelSelector.Input aria-label="Search models" />
                <ModelSelector.List>
                  <ModelSelector.Empty>No models found.</ModelSelector.Empty>
                  {['swift', 'thorough'].map((value) => (
                    <ModelSelector.Item
                      key={value}
                      value={value}
                      onSelect={() => {
                        setModel(value);
                        setPickerOpened(false);
                      }}
                    >
                      {value}
                    </ModelSelector.Item>
                  ))}
                </ModelSelector.List>
              </ModelSelector.Content>
            </ModelSelector>
          </Group>
          <PromptInput.Submit
            status={chat.status}
            disabled={waiting && !busy}
            onStop={() => void chat.stop()}
          />
        </PromptInput.Footer>
      </PromptInput>
      {waiting && (
        <Text size="sm" c="dimmed">
          Respond to the approval request before sending another question.
        </Text>
      )}
      <Button
        variant="subtle"
        size="xs"
        onClick={() => setQuestionDone(false)}
        disabled={busy || waiting}
      >
        Choose another topic
      </Button>
    </Stack>
  );
}
export const Chat: Story = {
  render: () => (
    <PromptInputProvider>
      <Workflow />
    </PromptInputProvider>
  ),
};
