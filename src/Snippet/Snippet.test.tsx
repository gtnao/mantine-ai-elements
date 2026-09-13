import { createTheme, MantineProvider } from '@mantine/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Snippet } from './Snippet';
import { SnippetCopyButton } from './SnippetCopyButton';
import { SnippetInput } from './SnippetParts';

afterEach(() => vi.unstubAllGlobals());
describe('Snippet', () => {
  it('keeps input read-only, focuses through addons, and respects native theme slots and disabled groups', () => {
    const input = createRef<HTMLInputElement>();
    const click = vi.fn();
    const theme = createTheme({
      components: {
        SnippetInput: SnippetInput.extend({
          styles: { input: { color: 'rgb(1, 2, 3)' } },
          defaultProps: { attributes: { input: { 'data-custom': 'input' } } },
        }),
        SnippetCopyButton: SnippetCopyButton.extend({
          styles: { icon: { opacity: 0.8 } },
        }),
      },
    });
    const { rerender } = render(
      <MantineProvider env="test" theme={theme}>
        <Snippet code="pnpm add mantine-ai-elements">
          <Snippet.Addon>
            <Snippet.Text>$</Snippet.Text>
          </Snippet.Addon>
          <Snippet.Input ref={input} aria-label="Command" />
          <Snippet.Addon align="inline-end">
            <Snippet.CopyButton onClick={click} />
          </Snippet.Addon>
        </Snippet>
      </MantineProvider>,
    );
    expect(input.current).toBe(
      screen.getByRole('textbox', { name: 'Command' }),
    );
    expect(input.current).toHaveAttribute('readonly');
    expect(input.current).toHaveValue('pnpm add mantine-ai-elements');
    expect(input.current).toHaveStyle({ color: 'rgb(1, 2, 3)' });
    expect(input.current).toHaveAttribute('data-custom', 'input');
    fireEvent.click(screen.getByText('$'));
    expect(input.current).toHaveFocus();
    rerender(
      <MantineProvider env="test">
        <Snippet code="next" disabled>
          <Snippet.Input aria-label="Command" />
          <Snippet.CopyButton onClick={click} />
        </Snippet>
      </MantineProvider>,
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
    fireEvent.click(screen.getByRole('button'));
    expect(click).not.toHaveBeenCalled();
  });
  it('guards pending copies, stale feedback, errors, cancellation and late unmount completion', async () => {
    let resolve = () => {};
    const write = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    vi.stubGlobal('navigator', { clipboard: { writeText: write } });
    const onCopy = vi.fn(),
      onError = vi.fn();
    const view = (code: string, cancel = false) => (
      <MantineProvider env="test">
        <Snippet code={code}>
          <Snippet.CopyButton
            onCopy={onCopy}
            onError={onError}
            onClick={(event) => {
              if (cancel) event.preventDefault();
            }}
            timeout={10}
          />
        </Snippet>
      </MantineProvider>
    );
    const { rerender, unmount } = render(view('first'));
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(write).toHaveBeenCalledTimes(1);
    rerender(view('second'));
    await act(async () => resolve());
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toHaveAccessibleName('Copy');
    write.mockRejectedValueOnce(new Error('Denied'));
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Denied' }),
      ),
    );
    write.mockResolvedValueOnce();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveAccessibleName('Copied'),
    );
    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveAccessibleName('Copy'),
    );
    rerender(view('third', true));
    fireEvent.click(screen.getByRole('button'));
    expect(write).toHaveBeenCalledTimes(3);
    rerender(view('third'));
    fireEvent.click(screen.getByRole('button'));
    unmount();
    await act(async () => resolve());
    expect(onCopy).toHaveBeenCalledTimes(2);
  });
});
