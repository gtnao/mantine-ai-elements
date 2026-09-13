import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';

/** Browser-only deterministic transport. No API key, server, or model required. */
export function createDemoTransport(
  options: { reasoning?: boolean; tool?: 'static' | 'dynamic' } = {},
): ChatTransport<UIMessage> {
  return {
    async sendMessages({ abortSignal, messages }) {
      const last = messages.at(-1);
      const text =
        last?.parts
          .filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join('') ?? '';
      const chunks: UIMessageChunk[] = [
        { type: 'start', messageId: crypto.randomUUID() },
        ...(options.reasoning
          ? ([
              { type: 'reasoning-start', id: 'reasoning' },
              ...Array.from(
                'I will **compare the requirements**, check the available information, and explain the result.',
              ).map((delta) => ({
                type: 'reasoning-delta',
                id: 'reasoning',
                delta,
              })),
              { type: 'reasoning-end', id: 'reasoning' },
            ] as UIMessageChunk[])
          : []),
        ...(options.tool
          ? ([
              {
                type: 'tool-input-start',
                toolCallId: 'lookup',
                toolName: 'web-search',
                dynamic: options.tool === 'dynamic',
              },
              ...Array.from(JSON.stringify({ query: text })).map(
                (inputTextDelta) => ({
                  type: 'tool-input-delta',
                  toolCallId: 'lookup',
                  inputTextDelta,
                }),
              ),
              {
                type: 'tool-input-available',
                toolCallId: 'lookup',
                toolName: 'web-search',
                input: { query: text },
                dynamic: options.tool === 'dynamic',
              },
              ...(text === '/tool-error'
                ? [
                    {
                      type: 'tool-output-error',
                      toolCallId: 'lookup',
                      errorText: 'Search service is unavailable',
                      dynamic: options.tool === 'dynamic',
                    },
                  ]
                : [
                    {
                      type: 'tool-output-available',
                      toolCallId: 'lookup',
                      output: { matches: 0, cached: false },
                      dynamic: options.tool === 'dynamic',
                    },
                  ]),
            ] as UIMessageChunk[])
          : []),
        { type: 'text-start', id: 'answer' },
        ...Array.from(
          `You said: "${text}". This reply streams through AI SDK useChat. Try stopping it while it generates.`,
        ).map(
          (delta): UIMessageChunk => ({
            type: 'text-delta',
            id: 'answer',
            delta,
          }),
        ),
        { type: 'text-end', id: 'answer' },
        { type: 'finish', finishReason: 'stop' },
      ];
      let timer: ReturnType<typeof setTimeout> | undefined;
      let abort: (() => void) | undefined;
      return new ReadableStream<UIMessageChunk>({
        start(controller) {
          let index = 0;
          abort = () => {
            clearTimeout(timer);
            if (abort) abortSignal?.removeEventListener('abort', abort);
            controller.error(new DOMException('Stopped', 'AbortError'));
          };
          if (abortSignal?.aborted) {
            abort();
            return;
          }
          abortSignal?.addEventListener('abort', abort, { once: true });
          const tick = () => {
            if (text === '/error') {
              if (abort) abortSignal?.removeEventListener('abort', abort);
              controller.error(new Error('Demo transport error'));
              return;
            }
            const chunk = chunks[index++];
            if (!chunk) {
              if (abort) abortSignal?.removeEventListener('abort', abort);
              controller.close();
              return;
            }
            controller.enqueue(chunk);
            timer = setTimeout(
              tick,
              chunk.type === 'tool-input-available' ? 800 : 35,
            );
          };
          timer = setTimeout(tick, 500);
        },
        cancel() {
          clearTimeout(timer);
          if (abort) abortSignal?.removeEventListener('abort', abort);
        },
      });
    },
    async reconnectToStream() {
      return null;
    },
  };
}
