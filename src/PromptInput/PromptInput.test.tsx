import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  PromptInput,
  type PromptInputProps,
  type PromptInputSubmitProps,
} from '../index';

function setup(
  onSubmit: PromptInputProps['onSubmit'],
  submit: PromptInputSubmitProps = {},
) {
  return render(
    <MantineProvider>
      <PromptInput onSubmit={onSubmit}>
        <PromptInput.Textarea aria-label="Message" />
        <PromptInput.Submit {...submit} />
      </PromptInput>
    </MantineProvider>,
  );
}

describe('PromptInput', () => {
  it('sends the AI Elements payload and preserves the next draft while pending', async () => {
    let finish!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    setup(onSubmit);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox');
    await user.type(input, 'First{Enter}');
    expect(input).toHaveValue('');
    // Native form.reset does not update user-event's cached input state.
    fireEvent.input(input, { target: { value: 'Second' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]).toEqual([
      { text: 'First', files: [] },
      expect.anything(),
    ]);
    expect(input).toHaveValue('Second');
    finish();
    await waitFor(() => expect(input).toHaveValue('Second'));
  });

  it('supports Shift+Enter and prevents IME confirmation from submitting', async () => {
    const onSubmit = vi.fn();
    setup(onSubmit);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox');
    await user.type(input, 'First{Shift>}{Enter}{/Shift}Second');
    expect(input).toHaveValue('First\nSecond');
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each(['submitted', 'streaming'] as const)(
    'stops during %s and blocks Enter without erasing the next draft',
    async (status) => {
      const onSubmit = vi.fn();
      const onStop = vi.fn();
      setup(onSubmit, { status, onStop });
      const user = userEvent.setup();
      await user.type(screen.getByRole('textbox'), 'Next{Enter}');
      await user.click(screen.getByRole('button', { name: 'Stop generating' }));
      expect(onStop).toHaveBeenCalledOnce();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole('textbox')).toHaveValue('Next');
    },
  );

  it('does not submit blank or disabled input', async () => {
    const onSubmit = vi.fn();
    const view = setup(onSubmit);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), '   {Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    view.unmount();
    setup(onSubmit, { disabled: true });
    await user.type(screen.getByRole('textbox'), 'Hello{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('leaves controlled value ownership with the consumer and respects keyboard overrides', async () => {
    const onSubmit = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <PromptInput onSubmit={onSubmit}>
          <PromptInput.Textarea
            aria-label="Message"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            onKeyDown={(e) => e.preventDefault()}
          />
          <PromptInput.Submit />
        </PromptInput>
      );
    }
    render(
      <MantineProvider>
        <Controlled />
      </MantineProvider>,
    );
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Controlled' },
    });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).toHaveBeenCalledWith(
      { text: 'Controlled', files: [] },
      expect.anything(),
    );
    expect(screen.getByRole('textbox')).toHaveValue('Controlled');
  });

  it('reports callback errors and allows another submission', async () => {
    const error = new Error('Failed');
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);
    const onSubmitError = vi.fn();
    render(
      <MantineProvider>
        <PromptInput onSubmit={onSubmit} onSubmitError={onSubmitError}>
          <PromptInput.Textarea aria-label="Message" />
          <PromptInput.Submit />
        </PromptInput>
      </MantineProvider>,
    );
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'First{Enter}');
    await waitFor(() => expect(onSubmitError).toHaveBeenCalledWith(error));
    await user.type(screen.getByRole('textbox'), 'Second{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('supports theme overrides, Styles API, and DOM refs', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const theme = createTheme({
      components: {
        PromptInput: PromptInput.extend({
          styles: { root: { borderRadius: 24 } },
        }),
        PromptInputSubmit: PromptInput.Submit.extend({
          defaultProps: { color: 'grape' },
        }),
      },
    });
    const { container } = render(
      <MantineProvider theme={theme}>
        <PromptInput
          onSubmit={() => {}}
          classNames={{ footer: 'custom-footer' }}
        >
          <PromptInput.Textarea ref={ref} aria-label="Message" />
          <PromptInput.Footer>
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput>
      </MantineProvider>,
    );
    expect(ref.current).toBe(screen.getByRole('textbox'));
    expect(container.querySelector('form')).toHaveStyle({
      borderRadius: '24px',
    });
    expect(container.querySelector('.custom-footer')).toBeInTheDocument();
    expect(
      screen.getByRole('button').style.getPropertyValue('--ai-bg'),
    ).toContain('grape');
  });
});
