import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UIMessage } from 'ai';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Conversation,
  messagesToMarkdown,
  type StickToBottomContext,
} from './Conversation';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const messages: UIMessage[] = [
  {
    id: 'a',
    role: 'assistant',
    parts: [
      { type: 'text', text: 'Hello ' },
      { type: 'reasoning', text: 'Private reasoning' },
      { type: 'text', text: 'world' },
    ],
  },
];
describe('Conversation', () => {
  it('exposes separate root, content, viewport and imperative context refs', () => {
    const root = createRef<HTMLDivElement>();
    const content = createRef<HTMLDivElement>();
    const viewport = createRef<HTMLDivElement>();
    const context = createRef<StickToBottomContext>();
    render(
      <MantineProvider>
        <Conversation ref={root} contextRef={context}>
          <Conversation.Content ref={content} viewportRef={viewport}>
            {(value) => (
              <span>{value.isAtBottom ? 'At bottom' : 'Reading history'}</span>
            )}
          </Conversation.Content>
        </Conversation>
      </MantineProvider>,
    );
    expect(root.current).toBe(screen.getByRole('log'));
    expect(context.current?.contentRef.current).toBe(content.current);
    expect(context.current?.scrollRef.current).toBe(viewport.current);
    expect(content.current?.parentElement).toBe(viewport.current);
  });
  it('formats only text parts by default and supports indexed custom formatters', () => {
    expect(messagesToMarkdown(messages)).toBe('**Assistant:** Hello world');
    expect(
      messagesToMarkdown(
        messages,
        (message, index) => `${index}: ${message.id}`,
      ),
    ).toBe('0: a');
    expect(messagesToMarkdown([])).toBe('');
  });
  it('downloads the requested filename and cleans up the object URL', async () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:conversation');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL }),
    );
    let filename = '';
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        filename = this.download;
      });
    render(
      <MantineProvider>
        <Conversation.Download messages={messages} filename="chat.md" />
      </MantineProvider>,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Download conversation' }),
    );
    expect(click).toHaveBeenCalledOnce();
    expect(filename).toBe('chat.md');
    expect(createObjectURL.mock.calls[0]?.[0]).toBeInstanceOf(Blob);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:conversation');
    expect(document.querySelector('a[download]')).toBeNull();
  });
  it('lets the application cancel download and replace empty-state content', async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    render(
      <MantineProvider>
        <Conversation.EmptyState>
          <span>Custom welcome</span>
        </Conversation.EmptyState>
        <Conversation.Download
          messages={messages}
          onClick={(event) => event.preventDefault()}
        />
      </MantineProvider>,
    );
    expect(screen.queryByText('No messages yet')).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Download conversation' }),
    );
    expect(click).not.toHaveBeenCalled();
  });
});
