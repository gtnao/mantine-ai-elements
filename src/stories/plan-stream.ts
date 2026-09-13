import { jsonSchema } from 'ai';
export interface PlanDocument {
  title: string;
  description: string;
  steps: string[];
}
function isPlan(value: unknown): value is PlanDocument {
  if (typeof value !== 'object' || value === null) return false;
  const plan = value as Record<string, unknown>;
  return (
    typeof plan.title === 'string' &&
    typeof plan.description === 'string' &&
    Array.isArray(plan.steps) &&
    plan.steps.every((step) => typeof step === 'string')
  );
}
export const planSchema = jsonSchema<PlanDocument>(
  {
    type: 'object',
    required: ['title', 'description', 'steps'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      steps: { type: 'array', items: { type: 'string' } },
    },
  },
  {
    validate: (value) =>
      isPlan(value)
        ? { success: true, value }
        : { success: false, error: new Error('Incomplete plan document') },
  },
);
const document: PlanDocument = {
  title: 'Build an accessible chat interface',
  description:
    'Implement the chat layout, connect the AI SDK transport, and verify keyboard interaction before release.',
  steps: [
    'Create the conversation and prompt input layout.',
    'Connect the application transport and handle streamed replies.',
    'Verify keyboard navigation, error recovery, and file attachments.',
  ],
};
/** Local chunked JSON response for the real useObject hook. */
export const fetchPlan: typeof fetch = async (_input, init) => {
  if (JSON.parse(String(init?.body ?? '{}')).fail)
    return new Response('Plan generation failed. Try again.', { status: 503 });
  const text = JSON.stringify(document);
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
            new TextEncoder().encode(text.slice(cursor, cursor + 12)),
          );
          cursor += 12;
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
