import {
  type ChatTransport,
  isToolUIPart,
  type UIMessage,
  type UIMessageChunk,
} from 'ai';

/** Deterministic approval roundtrip. No tool executes outside this demo stream. */
export function createApprovalTransport(
  options: { reasoning?: boolean; report?: boolean } = {},
): ChatTransport<UIMessage> {
  return {
    async sendMessages({ messages, abortSignal }) {
      const last = messages.at(-1);
      const response =
        last?.role === 'assistant'
          ? last.parts
              .filter(isToolUIPart)
              .find((part) => part.state === 'approval-responded')
          : undefined;
      const messageId = response ? last?.id : crypto.randomUUID();
      const report =
        '# Team notes report\n\n- Keep the release checklist small and explicit.\n- Preserve composable Mantine APIs.\n- Verify the packed library in a consuming application.\n\nThis summary uses three fixed demo notes.';
      const answer = response?.approval?.approved
        ? options.report
          ? report
          : 'The approved demo lookup found three results.'
        : 'The demo lookup was not executed.';
      const chunks: UIMessageChunk[] = response
        ? [
            { type: 'start', messageId },
            response.approval?.approved
              ? {
                  type: 'tool-output-available',
                  toolCallId: response.toolCallId,
                  output: { found: 3 },
                }
              : { type: 'tool-output-denied', toolCallId: response.toolCallId },
            { type: 'text-start', id: 'answer' },
            ...(options.report && response.approval?.approved
              ? [
                  'Release checklist',
                  'Component design',
                  'Package verification',
                ].map((title, index) => ({
                  type: 'source-url' as const,
                  sourceId: `note-${index}`,
                  url: `https://example.com/team-notes/${index + 1}`,
                  title,
                }))
              : []),
            ...Array.from(
              { length: Math.ceil(answer.length / 40) },
              (_, index) => ({
                type: 'text-delta' as const,
                id: 'answer',
                delta: answer.slice(index * 40, index * 40 + 40),
              }),
            ),
            { type: 'text-end', id: 'answer' },
            { type: 'finish', finishReason: 'stop' },
          ]
        : [
            { type: 'start', messageId },
            ...(options.reasoning
              ? ([
                  { type: 'reasoning-start', id: 'reasoning' },
                  {
                    type: 'reasoning-delta',
                    id: 'reasoning',
                    delta:
                      'I will check the shared notes after requesting permission.',
                  },
                  { type: 'reasoning-end', id: 'reasoning' },
                ] as UIMessageChunk[])
              : []),
            {
              type: 'tool-input-available',
              toolCallId: 'lookup',
              toolName: 'lookup',
              input: { collection: 'team-notes', query: 'Mantine' },
            },
            {
              type: 'tool-approval-request',
              toolCallId: 'lookup',
              approvalId: crypto.randomUUID(),
              reason: 'This lookup reads the shared team notes.',
            },
            { type: 'finish', finishReason: 'tool-calls' },
          ];
      let timer: ReturnType<typeof setTimeout> | undefined;
      let abort: (() => void) | undefined;
      const cleanup = () => {
        clearTimeout(timer);
        if (abort) abortSignal?.removeEventListener('abort', abort);
      };
      return new ReadableStream<UIMessageChunk>({
        start(controller) {
          let index = 0;
          abort = () => {
            cleanup();
            controller.error(new DOMException('Stopped', 'AbortError'));
          };
          if (abortSignal?.aborted) {
            abort();
            return;
          }
          abortSignal?.addEventListener('abort', abort, { once: true });
          const tick = () => {
            const chunk = chunks[index++];
            if (!chunk) {
              cleanup();
              controller.close();
              return;
            }
            controller.enqueue(chunk);
            timer = setTimeout(tick, 250);
          };
          timer = setTimeout(tick, 250);
        },
        cancel: cleanup,
      });
    },
    async reconnectToStream() {
      return null;
    },
  };
}
