import { jsonSchema } from 'ai';
import { previewDocument } from './web-preview-document';
export interface PreviewDocument {
  html: string;
}
export const previewSchema = jsonSchema<PreviewDocument>(
  {
    type: 'object',
    required: ['html'],
    properties: { html: { type: 'string' } },
  },
  {
    validate: (value) =>
      typeof value === 'object' &&
      value !== null &&
      'html' in value &&
      typeof value.html === 'string'
        ? { success: true, value: value as PreviewDocument }
        : { success: false, error: new Error('Invalid preview document') },
  },
);
/** Local chunked JSON response for the real useObject hook. */
export const fetchPreview: typeof fetch = async (_input, init) => {
  if (JSON.parse(String(init?.body ?? '{}')).fail)
    return new Response('Preview generation failed. Try again.', {
      status: 503,
    });
  const text = JSON.stringify({
    html: previewDocument('Generated interactive preview'),
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cleanup = () => {};
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        const abort = () => {
          cleanup();
          controller.error(new DOMException('Stopped', 'AbortError'));
        };
        cleanup = () => {
          clearTimeout(timer);
          init?.signal?.removeEventListener('abort', abort);
        };
        if (init?.signal?.aborted) {
          abort();
          return;
        }
        init?.signal?.addEventListener('abort', abort, { once: true });
        let cursor = 0;
        const tick = () => {
          if (cursor >= text.length) {
            cleanup();
            controller.close();
            return;
          }
          controller.enqueue(
            new TextEncoder().encode(text.slice(cursor, cursor + 120)),
          );
          cursor += 120;
          timer = setTimeout(tick, 100);
        };
        timer = setTimeout(tick, 150);
      },
      cancel() {
        cleanup();
      },
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
