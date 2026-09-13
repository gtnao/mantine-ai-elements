import { jsonSchema } from 'ai';
export interface TaskReport {
  tasks: {
    id: string;
    title: string;
    items: { id: string; text: string; filename?: string }[];
  }[];
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function isTaskReport(value: unknown): value is TaskReport {
  return (
    isRecord(value) &&
    Array.isArray(value.tasks) &&
    value.tasks.every(
      (task) =>
        isRecord(task) &&
        typeof task.id === 'string' &&
        typeof task.title === 'string' &&
        Array.isArray(task.items) &&
        task.items.every(
          (item) =>
            isRecord(item) &&
            typeof item.id === 'string' &&
            typeof item.text === 'string' &&
            (item.filename === undefined || typeof item.filename === 'string'),
        ),
    )
  );
}
export const taskReportSchema = jsonSchema<TaskReport>(
  {
    type: 'object',
    required: ['tasks'],
    properties: {
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'title', 'items'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'text'],
                properties: {
                  id: { type: 'string' },
                  text: { type: 'string' },
                  filename: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    validate: (value) =>
      isTaskReport(value)
        ? { success: true, value }
        : {
            success: false,
            error: new Error(
              'The generated report does not match the task schema.',
            ),
          },
  },
);
const report: TaskReport = {
  tasks: [
    {
      id: 'inspect',
      title: 'Inspect the component structure',
      items: [
        { id: 'search', text: 'Locate the chat interface.' },
        {
          id: 'read',
          text: 'Read the component entry point',
          filename: 'src/index.ts',
        },
      ],
    },
    {
      id: 'verify',
      title: 'Verify the public component API',
      items: [
        { id: 'types', text: 'Review public types and exports.' },
        {
          id: 'tests',
          text: 'Check behavior tests',
          filename: 'src/Task/Task.test.tsx',
        },
      ],
    },
  ],
};
/** Streams JSON text through the real useObject parser; never calls a network API. */
export const fetchTaskReport: typeof fetch = async (_input, init) => {
  const mode = JSON.parse(String(init?.body ?? '{}')).mode;
  if (mode === 'error')
    return new Response('The task service is unavailable.', { status: 503 });
  const text = JSON.stringify(
    mode === 'invalid'
      ? { tasks: [{ id: 'invalid', title: 'Incomplete report' }] }
      : report,
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cleanup: () => void = () => {};
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        let cursor = 0;
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
        const tick = () => {
          if (cursor >= text.length) {
            cleanup();
            controller.close();
            return;
          }
          controller.enqueue(
            new TextEncoder().encode(text.slice(cursor, cursor + 16)),
          );
          cursor += 16;
          timer = setTimeout(tick, 90);
        };
        timer = setTimeout(tick, 200);
      },
      cancel() {
        cleanup();
      },
    }),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
};
