import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';

export const previewSource =
  '<Paper withBorder p="md"><Stack gap="xs"><Badge>Generated preview</Badge><Text fw={600}>{title}</Text><Text>The preview uses injected Mantine components.</Text><Counter /></Stack></Paper>';

/** Only these fixed application-owned strings are emitted, never user JSX. */
export function createJSXPreviewTransport(): ChatTransport<UIMessage> {
  return {
    async sendMessages({ messages, abortSignal }) {
      const command = messages
        .at(-1)
        ?.parts.filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('');
      const source =
        command === '/invalid'
          ? '<Paper><Text>{missingFunction()}</Text></Paper>'
          : previewSource;
      const chunks: UIMessageChunk[] = [
        { type: 'start', messageId: crypto.randomUUID() },
        { type: 'text-start', id: 'jsx' },
        ...Array.from(
          { length: Math.ceil(source.length / 12) },
          (_, index) => ({
            type: 'text-delta' as const,
            id: 'jsx',
            delta: source.slice(index * 12, index * 12 + 12),
          }),
        ),
        { type: 'text-end', id: 'jsx' },
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
            if (command === '/error') {
              cleanup();
              controller.error(new Error('Preview transport unavailable'));
              return;
            }
            const chunk = chunks[index++];
            if (!chunk) {
              cleanup();
              controller.close();
              return;
            }
            controller.enqueue(chunk);
            timer = setTimeout(tick, 100);
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
