import { MantineProvider } from '@mantine/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeBlock } from './CodeBlock';
import { highlightCodeAsync } from './highlight';

afterEach(() => vi.restoreAllMocks());
describe('CodeBlock', () => {
  it('preserves code, blank lines and trailing newline through real highlighting', async () => {
    const code = 'const greeting = "Hello";\n\nconsole.log(greeting);\n';
    const { container } = render(
      <MantineProvider>
        <CodeBlock code={code} language="typescript" showLineNumbers />
      </MantineProvider>,
    );
    expect(container.querySelector('code')?.textContent).toBe(code);
    await waitFor(() =>
      expect(container.querySelector('[data-highlighted]')).not.toBeNull(),
    );
    expect(container.querySelector('code')?.textContent).toBe(code);
    expect(container.querySelectorAll('[data-numbered]')).toHaveLength(4);
  });
  it('does not show stale highlighted text after code and language change', async () => {
    const { container, rerender } = render(
      <MantineProvider>
        <CodeBlock code="const a = 1" language="typescript" />
      </MantineProvider>,
    );
    rerender(
      <MantineProvider>
        <CodeBlock code="print('new')" language="python" />
      </MantineProvider>,
    );
    expect(container.querySelector('code')?.textContent).toBe("print('new')");
    await waitFor(() =>
      expect(container.querySelector('[data-highlighted]')).not.toBeNull(),
    );
    expect(container.querySelector('code')?.textContent).toBe("print('new')");
  });
  it('keeps distinct same-length snippets with identical ends and handles unknown language', async () => {
    const prefix = ' '.repeat(110);
    const suffix = ' '.repeat(110);
    const [a, b] = await Promise.all([
      highlightCodeAsync(`${prefix}one${suffix}`, 'text'),
      highlightCodeAsync(`${prefix}two${suffix}`, 'text'),
    ]);
    expect(
      a.tokens
        .flat()
        .map((token) => token.content)
        .join(''),
    ).toContain('one');
    expect(
      b.tokens
        .flat()
        .map((token) => token.content)
        .join(''),
    ).toContain('two');
    const unknown = await highlightCodeAsync(
      'unknown source',
      'unrecognized-language',
    );
    expect(
      unknown.tokens
        .flat()
        .map((token) => token.content)
        .join(''),
    ).toBe('unknown source');
  });
  it('copies the current code once while pending and reports clipboard failures', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    const onCopy = vi.fn();
    let resolve: (() => void) | undefined;
    const write = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockImplementationOnce(
        () =>
          new Promise<void>((done) => {
            resolve = done;
          }),
      );
    const { rerender } = render(
      <MantineProvider>
        <CodeBlock code="first" language="text">
          <CodeBlock.CopyButton onError={onError} onCopy={onCopy} />
        </CodeBlock>
      </MantineProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(write).toHaveBeenCalledTimes(1);
    resolve?.();
    await waitFor(() => expect(onCopy).toHaveBeenCalledOnce());
    rerender(
      <MantineProvider>
        <CodeBlock code="second" language="text">
          <CodeBlock.CopyButton onError={onError} />
        </CodeBlock>
      </MantineProvider>,
    );
    write.mockRejectedValueOnce(new Error('Denied'));
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(write).toHaveBeenLastCalledWith('second');
    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Denied' }),
      ),
    );
  });
  it('selects a language with the keyboard through Mantine Select', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MantineProvider>
        <CodeBlock.LanguageSelector
          data={['typescript', 'python']}
          onChange={onChange}
        />
      </MantineProvider>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Language' }));
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith(
      'typescript',
      expect.objectContaining({ value: 'typescript' }),
    );
  });
});
