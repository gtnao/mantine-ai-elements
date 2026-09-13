import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MessageResponse } from './MessageResponse';

describe('MessageResponse', () => {
  it('shows alternative text for failed images and loads replacement sources', () => {
    const { rerender } = render(
      <MantineProvider>
        <MessageResponse>
          {'![Chart](https://example.com/broken.png)'}
        </MessageResponse>
      </MantineProvider>,
    );
    fireEvent.error(screen.getByRole('img', { name: 'Chart' }));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Chart')).toBeVisible();
    rerender(
      <MantineProvider>
        <MessageResponse controls={false}>
          {'![Chart](https://example.com/replacement.png)'}
        </MessageResponse>
      </MantineProvider>,
    );
    expect(screen.getByRole('img', { name: 'Chart' })).toHaveAttribute(
      'src',
      'https://example.com/replacement.png',
    );
    expect(
      screen.queryByRole('button', { name: 'Download image' }),
    ).not.toBeInTheDocument();
  });
  it('renders GFM, math, CJK emphasis and code with the real streaming parser', async () => {
    const markdown =
      '# Result\n\n**日本語** and ~~old~~\n\n| Name | Value |\n| --- | --- |\n| A | 42 |\n\n$$x^2$$\n\n```typescript\nconst answer = 42;\n```';
    const { container } = render(
      <MantineProvider>
        <MessageResponse>{markdown}</MessageResponse>
      </MantineProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Result' })).toBeVisible();
    expect(container.querySelector('strong')).toHaveTextContent('日本語');
    expect(container.querySelector('del')).toHaveTextContent('old');
    expect(screen.getByRole('cell', { name: '42' })).toBeVisible();
    expect(container.querySelector('.katex')).not.toBeNull();
    await waitFor(() =>
      expect(container.querySelector('[data-highlighted]')).not.toBeNull(),
    );
    expect(container.querySelector('pre code')).toHaveTextContent(
      'const answer = 42;',
    );
  });
  it('updates renderer and control settings even when the markdown text is unchanged', () => {
    const text = 'Hello\n\n| A |\n| --- |\n| B |';
    const { rerender } = render(
      <MantineProvider>
        <MessageResponse>{text}</MessageResponse>
      </MantineProvider>,
    );
    expect(screen.getByRole('button', { name: 'Copy table' })).toBeVisible();
    rerender(
      <MantineProvider>
        <MessageResponse
          controls={false}
          components={{
            p: ({ children }) => (
              <p data-testid="custom-paragraph">{children}</p>
            ),
          }}
        >
          {text}
        </MessageResponse>
      </MantineProvider>,
    );
    expect(screen.getByTestId('custom-paragraph')).toHaveTextContent('Hello');
    expect(
      screen.queryByRole('button', { name: 'Copy table' }),
    ).not.toBeInTheDocument();
  });
  it('parses incomplete fences and replaces them with the completed response', async () => {
    const { container, rerender } = render(
      <MantineProvider>
        <MessageResponse isAnimating>{'```js\nconst'}</MessageResponse>
      </MantineProvider>,
    );
    expect(container.querySelector('pre')).toHaveTextContent('const');
    expect(screen.getByRole('button', { name: 'Copy Code' })).toBeDisabled();
    rerender(
      <MantineProvider>
        <MessageResponse>{'```js\nconst answer = 42;\n```'}</MessageResponse>
      </MantineProvider>,
    );
    expect(screen.getByRole('button', { name: 'Copy Code' })).toBeEnabled();
    await waitFor(() =>
      expect(container.querySelector('pre')).toHaveTextContent(
        'const answer = 42;',
      ),
    );
  });
  it('shows Mantine link confirmation and keeps fragment links in the page', async () => {
    const user = userEvent.setup();
    render(
      <MantineProvider>
        <MessageResponse linkSafety={{ enabled: true }}>
          {'[External](https://example.com) [Footnote](#note)'}
        </MessageResponse>
      </MantineProvider>,
    );
    expect(screen.getByRole('link', { name: 'Footnote' })).not.toHaveAttribute(
      'target',
      '_blank',
    );
    await user.click(screen.getByRole('link', { name: 'External' }));
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: 'Open external link?' }),
      ).toBeVisible(),
    );
    await user.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(await navigator.clipboard.readText()).toBe('https://example.com/');
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });
});
