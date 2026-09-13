import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { WebPreview } from './WebPreview';

describe('WebPreview', () => {
  it('separates URL draft from navigation, respects controlled changes and ignores cancelled/composing Enter', () => {
    const change = vi.fn(),
      inputChange = vi.fn(),
      submit = vi.fn((e) => e.preventDefault());
    const view = (url: string, cancel = false) => (
      <MantineProvider env="test">
        <form onSubmit={submit}>
          <WebPreview url={url} onUrlChange={change}>
            <WebPreview.Url
              onChange={inputChange}
              onKeyDown={(e) => {
                if (cancel) e.preventDefault();
              }}
            />
            <WebPreview.Body />
          </WebPreview>
        </form>
      </MantineProvider>
    );
    const { rerender } = render(view('https://example.test/one'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'https://example.test/two' } });
    expect(inputChange).toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByTitle('Preview')).toHaveAttribute(
      'src',
      'https://example.test/one',
    );
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(change).toHaveBeenCalledWith('https://example.test/two');
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByTitle('Preview')).toHaveAttribute(
      'src',
      'https://example.test/one',
    );
    rerender(view('https://example.test/three', true));
    expect(input).toHaveValue('https://example.test/three');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(change).toHaveBeenCalledTimes(1);
  });
  it('forwards iframe props/ref/loading and provides accessible controlled console with duplicate log messages', () => {
    const frame = createRef<HTMLIFrameElement>(),
      change = vi.fn();
    const timestamp = new Date('2026-01-01T12:30:00Z');
    const logs = [
      { level: 'warn' as const, message: 'Repeated warning', timestamp },
      { level: 'error' as const, message: 'Repeated warning', timestamp },
    ];
    const { rerender } = render(
      <MantineProvider env="test">
        <WebPreview
          defaultUrl="/fallback"
          consoleOpened
          onConsoleOpenedChange={change}
        >
          <WebPreview.Body
            ref={frame}
            src="/override"
            frameLoading="lazy"
            loading={<span>Preparing</span>}
            styles={{ frame: { borderRadius: 12 } }}
          />
          <WebPreview.Console
            logs={logs}
            collapseProps={{ transitionDuration: 0 }}
          />
        </WebPreview>
      </MantineProvider>,
    );
    expect(frame.current).toBe(screen.getByTitle('Preview'));
    expect(frame.current).toHaveAttribute('src', '/override');
    expect(frame.current).toHaveAttribute('loading', 'lazy');
    expect(frame.current?.getAttribute('sandbox')).not.toContain(
      'allow-same-origin',
    );
    expect(frame.current).toHaveStyle({ borderRadius: '12px' });
    expect(screen.getByText('Preparing')).toBeVisible();
    expect(
      screen.getAllByText('Repeated warning', { exact: false }),
    ).toHaveLength(2);
    expect(screen.getAllByText('12:30:00')).toHaveLength(2);
    const button = screen.getByRole('button', { name: 'Console' });
    expect(button).toHaveAttribute(
      'aria-controls',
      screen.getByRole('region').id,
    );
    fireEvent.click(button);
    expect(change).toHaveBeenCalledWith(false);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    rerender(
      <MantineProvider env="test">
        <WebPreview consoleOpened>
          <WebPreview.Body loading={false} sandbox="" />
          <WebPreview.Console
            emptyState="No events"
            collapseProps={{ transitionDuration: 0 }}
          />
        </WebPreview>
      </MantineProvider>,
    );
    expect(screen.getByTitle('Preview')).toHaveAttribute('sandbox', '');
    expect(screen.getByText('No events')).toBeVisible();
    expect(
      document.querySelector('.mantine-WebPreviewBody-loading'),
    ).toBeNull();
  });
});
