import type { ChatTransport, UIDataTypes, UIMessage, UIMessageChunk } from 'ai';
export type SandboxMessage = UIMessage<
  unknown,
  UIDataTypes,
  {
    'run-code': {
      input: { filename: string; code: string };
      output: { logs: string };
    };
  }
>;
/** Fixture data only: no generated code is evaluated by this transport. */
export function createSandboxTransport(): ChatTransport<SandboxMessage> {
  return {
    async sendMessages({ messages, abortSignal }) {
      const text =
        messages
          .at(-1)
          ?.parts.filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join('') ?? '';
      const input = {
        filename: 'primes.ts',
        code: 'const primes = [2, 3, 5, 7];\nconsole.log(primes);',
      };
      const serialized = JSON.stringify(input);
      const chunks: UIMessageChunk[] = [
        { type: 'start', messageId: crypto.randomUUID() },
        { type: 'tool-input-start', toolCallId: 'run', toolName: 'run-code' },
        ...Array.from(
          { length: Math.ceil(serialized.length / 8) },
          (_, index) => ({
            type: 'tool-input-delta' as const,
            toolCallId: 'run',
            inputTextDelta: serialized.slice(index * 8, index * 8 + 8),
          }),
        ),
        {
          type: 'tool-input-available',
          toolCallId: 'run',
          toolName: 'run-code',
          input,
        },
        text === '/tool-error'
          ? {
              type: 'tool-output-error',
              toolCallId: 'run',
              errorText: 'Example execution service failed',
            }
          : {
              type: 'tool-output-available',
              toolCallId: 'run',
              output: { logs: '[2, 3, 5, 7]' },
            },
        { type: 'finish', finishReason: 'stop' },
      ];
      let timer: ReturnType<typeof setTimeout> | undefined;
      let cleanup = () => {};
      return new ReadableStream<UIMessageChunk>({
        start(controller) {
          const abort = () => {
            cleanup();
            controller.error(new DOMException('Stopped', 'AbortError'));
          };
          cleanup = () => {
            clearTimeout(timer);
            abortSignal?.removeEventListener('abort', abort);
          };
          if (abortSignal?.aborted) {
            abort();
            return;
          }
          abortSignal?.addEventListener('abort', abort, { once: true });
          let index = 0;
          const tick = () => {
            if (text === '/error') {
              cleanup();
              controller.error(new Error('Sandbox transport unavailable'));
              return;
            }
            const chunk = chunks[index++];
            if (!chunk) {
              cleanup();
              controller.close();
              return;
            }
            controller.enqueue(chunk);
            timer = setTimeout(
              tick,
              chunk.type === 'tool-input-available' ? 1000 : 100,
            );
          };
          timer = setTimeout(tick, 300);
        },
        cancel() {
          cleanup();
        },
      });
    },
    async reconnectToStream() {
      return null;
    },
  };
}
