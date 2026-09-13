import { Badge, createTheme, MantineProvider, Text } from '@mantine/core';
import { render, screen, waitFor } from '@testing-library/react';
import { createRef, StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  JSXPreview,
  JSXPreviewContent,
  JSXPreviewError,
  useJSXPreview,
} from './JSXPreview';

describe('JSXPreview', () => {
  it('catches injected component render failures and retries when bindings change', async () => {
    const onError = vi.fn();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    function Result({ failed }: { failed: boolean }) {
      if (failed) throw new Error('Component failed');
      return <p>Component recovered</p>;
    }
    const components = { Result };
    const view = (failed: boolean) => (
      <MantineProvider env="test">
        <JSXPreview
          trusted
          jsx="<Result failed={failed} />"
          components={components}
          bindings={{ failed }}
          onError={onError}
        >
          <JSXPreview.Content />
          <JSXPreview.Error />
        </JSXPreview>
      </MantineProvider>
    );
    try {
      const { rerender } = render(view(true));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Component failed',
      );
      expect(onError).toHaveBeenCalledTimes(1);
      rerender(view(false));
      expect(await screen.findByText('Component recovered')).toBeVisible();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(
        /Cannot update a component/,
      );
    } finally {
      consoleError.mockRestore();
    }
  });
  it('requires explicit trust and supports injected Mantine components, bindings, refs and theme slots', async () => {
    const called = vi.fn(() => 'Ready');
    const root = createRef<HTMLDivElement>();
    const content = createRef<HTMLDivElement>();
    const components = { UI: { Badge }, Text };
    const bindings = { label: called };
    const theme = createTheme({
      components: {
        JSXPreview: JSXPreview.extend({ styles: { root: { padding: 13 } } }),
        JSXPreviewContent: JSXPreviewContent.extend({
          defaultProps: { attributes: { root: { 'data-themed': 'content' } } },
        }),
      },
    });
    const view = (trusted: boolean) => (
      <MantineProvider env="test" theme={theme}>
        <JSXPreview
          ref={root}
          trusted={trusted}
          jsx="<UI.Badge>{label()}</UI.Badge><Text>Details</Text>"
          components={components}
          bindings={bindings}
        >
          <JSXPreview.Content
            ref={content}
            untrustedFallback="Preview disabled"
          />
        </JSXPreview>
      </MantineProvider>
    );
    const { rerender } = render(view(false));
    expect(screen.getByText('Preview disabled')).toBeVisible();
    expect(called).not.toHaveBeenCalled();
    expect(root.current).toHaveStyle({ padding: '13px' });
    expect(content.current).toHaveAttribute('data-themed', 'content');
    rerender(view(true));
    expect(await screen.findByText('Ready')).toBeVisible();
    expect(screen.getByText('Details')).toBeVisible();
    expect(called).toHaveBeenCalled();
    rerender(view(false));
    expect(screen.queryByText('Ready')).not.toBeInTheDocument();
  });

  it('retains the last successful stream, reports a final error once and recovers on replacement', async () => {
    const onError = vi.fn();
    const consoleError = vi.spyOn(console, 'error');
    const alert = createRef<HTMLDivElement>();
    function Status() {
      const { lastGoodJsx } = useJSXPreview();
      return <output aria-label="Last successful JSX">{lastGoodJsx}</output>;
    }
    const view = (jsx: string, streaming: boolean) => (
      <StrictMode>
        <MantineProvider env="test">
          <JSXPreview
            trusted
            jsx={jsx}
            isStreaming={streaming}
            onError={onError}
          >
            <JSXPreview.Content />
            <JSXPreviewError
              ref={alert}
              title="Preview failed"
              styles={{ message: { fontWeight: 700 } }}
            >
              {(error) => `Could not render: ${error.message}`}
            </JSXPreviewError>
            <Status />
          </JSXPreview>
        </MantineProvider>
      </StrictMode>
    );
    const { rerender } = render(view('<p>First', true));
    expect(await screen.findByText('First')).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('<p>First</p>'),
    );
    rerender(view('<p>{missingFunction()}</p>', true));
    await waitFor(() => expect(screen.getByText('First')).toBeVisible());
    expect(onError).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(view('<p>{missingFunction()}</p>', false));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not render:',
    );
    expect(alert.current).toBe(screen.getByRole('alert'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    rerender(view('<p>{missingFunction()}</p>', false));
    expect(onError).toHaveBeenCalledTimes(1);
    rerender(view('<p>Recovered</p>', false));
    expect(await screen.findByText('Recovered')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(
      /Cannot update a component|not wrapped in act/,
    );
    consoleError.mockRestore();
  });
});
