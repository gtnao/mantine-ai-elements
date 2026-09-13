import {
  type ChatTransport,
  isToolUIPart,
  type UIMessage,
  type UIMessageChunk,
} from 'ai';

/** Deterministic approval roundtrip. No tool executes outside this demo stream. */
export function createApprovalTransport(): ChatTransport<UIMessage> {
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
            {
              type: 'text-delta',
              id: 'answer',
              delta: response.approval?.approved
                ? 'The approved demo lookup found three results.'
                : 'The demo lookup was not executed.',
            },
            { type: 'text-end', id: 'answer' },
            { type: 'finish', finishReason: 'stop' },
          ]
        : [
            { type: 'start', messageId },
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
