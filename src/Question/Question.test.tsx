import { createTheme, DirectionProvider, MantineProvider } from '@mantine/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps, createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Question } from './Question';

function Fields() {
  return (
    <>
      <Question.Prompt>Choose features</Question.Prompt>
      <Question.Options aria-label="Features">
        <Question.Option value="search">Search</Question.Option>
        <Question.Option value="disabled" disabled>
          Unavailable
        </Question.Option>
        <Question.Option value="export">Export</Question.Option>
      </Question.Options>
      <Question.Input aria-label="Details" />
      <Question.Actions>
        <Question.Submit />
      </Question.Actions>
    </>
  );
}
function Panel(props: ComponentProps<typeof Question>) {
  return (
    <MantineProvider>
      <Question {...props}>
        <Fields />
      </Question>
    </MantineProvider>
  );
}
describe('Question', () => {
  it('replaces and deselects single options, combines text and choices, and retains the submitted draft', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Panel onSubmit={onSubmit} />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Search' }));
    await user.click(screen.getByRole('radio', { name: 'Export' }));
    expect(screen.getByRole('radio', { name: 'Search' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await user.click(screen.getByRole('radio', { name: 'Export' }));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Search' }));
    await user.type(screen.getByRole('textbox'), '  Keep tests  ');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledWith(
      { selectedValues: ['search'], text: 'Keep tests' },
      expect.anything(),
    );
    expect(screen.getByRole('textbox')).toHaveValue('  Keep tests  ');
    expect(screen.getByRole('radio', { name: 'Search' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
  it('supports controlled state and batched uncontrolled multi-selection without losing choices', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Panel
        selectionMode="multiple"
        value={{ selectedValues: [], text: '' }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Search' }));
    expect(onValueChange).toHaveBeenCalledWith({
      selectedValues: ['search'],
      text: '',
    });
    expect(screen.getByRole('checkbox', { name: 'Search' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    rerender(<Panel selectionMode="multiple" />);
    act(() => {
      fireEvent.click(screen.getByRole('checkbox', { name: 'Search' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'Export' }));
    });
    expect(screen.getByRole('checkbox', { name: 'Search' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('checkbox', { name: 'Export' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
  it('skips disabled options with arrows, preserves a selected radio, and honors RTL and cancellation', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Panel />);
    const first = screen.getByRole('radio', { name: 'Search' });
    first.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Export' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Export' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Export' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.keyboard('{Home}');
    expect(first).toHaveFocus();
    rerender(
      <DirectionProvider initialDirection="rtl">
        <Panel />
      </DirectionProvider>,
    );
    screen.getByRole('radio', { name: 'Search' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Export' })).toHaveFocus();
    rerender(
      <MantineProvider>
        <Question>
          <Question.Options>
            <Question.Option
              value="a"
              onClick={(event) => event.preventDefault()}
              onKeyDown={(event) => event.preventDefault()}
            >
              A
            </Question.Option>
            <Question.Option value="b">B</Question.Option>
          </Question.Options>
        </Question>
      </MantineProvider>,
    );
    await user.click(screen.getByRole('radio', { name: 'A' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'A' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });
  it('locks async submission, reports failure for retry, and passes the live form event before awaiting', async () => {
    let reject!: (error: Error) => void;
    const onSubmitError = vi.fn();
    const onSubmit = vi.fn((_, event) => {
      expect(event.currentTarget).toHaveAttribute('data-testid', 'question');
      return new Promise<void>((_, fail) => {
        reject = fail;
      });
    });
    render(
      <Panel
        data-testid="question"
        defaultValue={{ selectedValues: ['search'], text: 'notes' }}
        onSubmit={onSubmit}
        onSubmitError={onSubmitError}
      />,
    );
    const form = screen.getByTestId('question');
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox')).toBeDisabled();
    await act(async () => reject(new Error('Offline')));
    expect(onSubmitError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Offline' }),
    );
    expect(screen.getByRole('textbox')).toHaveValue('notes');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
  it('supports refs and root/native child themes, blocks whitespace and cancelled form submissions', () => {
    const root = createRef<HTMLFormElement>();
    const input = createRef<HTMLTextAreaElement>();
    const onSubmit = vi.fn();
    const theme = createTheme({
      components: {
        Question: Question.extend({
          styles: {
            root: { borderRadius: 17 },
            prompt: { color: 'rgb(1, 2, 3)' },
          },
        }),
        QuestionInput: Question.Input.extend({
          styles: { input: { fontSize: 18 } },
        }),
      },
    });
    const { rerender } = render(
      <MantineProvider theme={theme}>
        <Question ref={root} onSubmit={onSubmit}>
          <Question.Prompt>Prompt</Question.Prompt>
          <Question.Input ref={input} aria-label="Answer" />
          <Question.Submit />
        </Question>
      </MantineProvider>,
    );
    expect(root.current).toHaveStyle({ borderRadius: '17px' });
    expect(input.current).toHaveStyle({ fontSize: '18px' });
    expect(screen.getByText('Prompt')).toHaveStyle({ color: 'rgb(1, 2, 3)' });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    fireEvent.submit(root.current as HTMLFormElement);
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(
      <Panel
        defaultValue={{ selectedValues: ['search'], text: '' }}
        onSubmit={onSubmit}
        onSubmitCapture={(event) => event.preventDefault()}
        data-testid="question"
      />,
    );
    fireEvent.submit(screen.getByTestId('question'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
