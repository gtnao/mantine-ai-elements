import { useChat } from '@ai-sdk/react';
import { Alert, Button, Checkbox, Group, Stack, Text } from '@mantine/core';
import type { ChatTransport, UIMessage } from 'ai';
import { useRef, useState } from 'react';
import { PromptInput, type PromptInputMessage, Queue } from '../index';
import { createDemoTransport } from './demo-transport';

type Draft = PromptInputMessage & { id: string };
/** Application-owned queue: no scheduling or persistence is hidden in Queue. */
export function QueueChatExample() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = useRef<{ id: string; completed: boolean } | null>(null);
  const failNext = useRef(false);
  const [shouldFail, setShouldFail] = useState(false);
  const [notice, setNotice] = useState('Add a draft to the queue.');
  const [transport] = useState<ChatTransport<UIMessage>>(() => {
    const demo = createDemoTransport();
    return {
      ...demo,
      async sendMessages(options) {
        if (failNext.current) {
          failNext.current = false;
          setShouldFail(false);
          throw new Error(
            'Simulated network failure. The draft is still queued.',
          );
        }
        return demo.sendMessages(options);
      },
    };
  });
  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    transport,
    onFinish: ({ isAbort, isError }) => {
      if (active.current) active.current.completed = !isAbort && !isError;
    },
  });
  const busy =
    activeId !== null || status === 'submitted' || status === 'streaming';
  async function send(draft: Draft) {
    if (active.current) return;
    const attempt = { id: draft.id, completed: false };
    active.current = attempt;
    setActiveId(draft.id);
    clearError();
    setNotice('Sending queued draft…');
    try {
      if (messages.some((message) => message.id === draft.id)) {
        await sendMessage({
          text: draft.text,
          files: draft.files,
          messageId: draft.id,
        });
      } else {
        await sendMessage({
          id: draft.id,
          role: 'user',
          parts: [...draft.files, { type: 'text', text: draft.text }],
        });
      }
      if (attempt.completed) {
        setDrafts((current) => current.filter((item) => item.id !== draft.id));
        setNotice('Reply completed. The draft was removed from the queue.');
      } else {
        setNotice('Draft kept in queue. Send it again to retry.');
      }
    } catch (cause) {
      setNotice(
        cause instanceof Error
          ? cause.message
          : 'Unable to prepare the message. Draft kept in queue.',
      );
    } finally {
      if (active.current === attempt) {
        active.current = null;
        setActiveId(null);
      }
    }
  }
  return (
    <Stack maw={640}>
      <Text size="sm" c="dimmed">
        Add drafts while a reply streams. Choose when to send each draft. Failed
        or stopped requests keep their draft for retry.
      </Text>
      <Queue>
        <Queue.Section>
          <Queue.SectionTrigger>
            <Queue.SectionLabel count={drafts.length} label="Queued drafts" />
          </Queue.SectionTrigger>
          <Queue.SectionContent>
            {drafts.length === 0 ? (
              <Text size="sm" p="xs">
                No queued drafts.
              </Text>
            ) : (
              <Queue.List listProps={{ 'aria-label': 'Drafts' }}>
                {drafts.map((draft) => (
                  <Queue.Item key={draft.id}>
                    <Group gap="xs" wrap="nowrap">
                      <Queue.ItemIndicator />
                      <Queue.ItemContent>
                        {draft.text || 'Files only'}
                      </Queue.ItemContent>
                      <Queue.ItemActions>
                        <Queue.ItemAction
                          aria-label={`Send ${draft.text || 'files'}`}
                          disabled={busy}
                          onClick={() => void send(draft)}
                        >
                          ↑
                        </Queue.ItemAction>
                        <Queue.ItemAction
                          aria-label={`Remove ${draft.text || 'files'}`}
                          disabled={activeId === draft.id}
                          onClick={() =>
                            setDrafts((current) =>
                              current.filter((item) => item.id !== draft.id),
                            )
                          }
                        >
                          ×
                        </Queue.ItemAction>
                      </Queue.ItemActions>
                    </Group>
                    {draft.files.length > 0 && (
                      <Queue.ItemAttachment>
                        {draft.files.map((file) =>
                          file.mediaType.startsWith('image/') ? (
                            <Queue.ItemImage
                              key={file.url}
                              src={file.url}
                              alt={file.filename ?? 'Queued image'}
                            />
                          ) : (
                            <Queue.ItemFile key={file.url}>
                              {file.filename ?? 'Queued file'}
                            </Queue.ItemFile>
                          ),
                        )}
                      </Queue.ItemAttachment>
                    )}
                  </Queue.Item>
                ))}
              </Queue.List>
            )}
          </Queue.SectionContent>
        </Queue.Section>
      </Queue>
      <PromptInput
        multiple
        onSubmit={(message) => {
          setDrafts((current) => [
            ...current,
            { ...message, id: crypto.randomUUID() },
          ]);
          setNotice('Draft added to queue.');
        }}
      >
        <PromptInput.Body>
          <PromptInput.Textarea
            aria-label="Queue draft"
            placeholder="Write a draft to queue…"
          />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Tools>
            <PromptInput.ActionMenu>
              <PromptInput.ActionMenuTrigger />
              <PromptInput.ActionMenuContent>
                <PromptInput.ActionAddAttachments />
              </PromptInput.ActionMenuContent>
            </PromptInput.ActionMenu>
          </PromptInput.Tools>
          <PromptInput.Submit submitLabel="Add to queue" />
        </PromptInput.Footer>
      </PromptInput>
      <Group>
        <Checkbox
          label="Fail next send"
          checked={shouldFail}
          disabled={busy}
          onChange={(event) => {
            failNext.current = event.currentTarget.checked;
            setShouldFail(event.currentTarget.checked);
          }}
        />
        {busy && (
          <Button variant="default" onClick={() => void stop()}>
            Stop reply
          </Button>
        )}
      </Group>
      {error && (
        <Alert color="red" title="Send failed">
          {error.message}
        </Alert>
      )}
      <Text role="status">{notice}</Text>
      <Stack aria-label="Chat history">
        {messages.map((message) => (
          <Text key={message.id} data-role={message.role}>
            <strong>{message.role === 'user' ? 'You: ' : 'Assistant: '}</strong>
            {message.parts
              .filter((part) => part.type === 'text')
              .map((part) => part.text)
              .join('\n')}
          </Text>
        ))}
      </Stack>
    </Stack>
  );
}
