import { createTheme, MantineProvider } from '@mantine/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Reasoning } from './Reasoning';

function Panel(props: React.ComponentProps<typeof Reasoning>) {
  return (
    <MantineProvider env="test">
      <Reasoning {...props}>
        <Reasoning.Trigger />
        <Reasoning.Content transitionDuration={0}>
          A **careful** explanation.
        </Reasoning.Content>
      </Reasoning>
    </MantineProvider>
  );
}
afterEach(() => vi.useRealTimers());
describe('Reasoning', () => {
  it('keeps historical panels open after manual expansion and renders Markdown', () => {
    vi.useFakeTimers();
    render(<Panel />);
    const trigger = screen.getByRole('button', {
      name: 'Thought for a few seconds',
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(screen.getByText('careful').tagName).toBe('STRONG');
    expect(screen.getByRole('region')).toHaveAttribute(
      'id',
      trigger.getAttribute('aria-controls'),
    );
    act(() => vi.advanceTimersByTime(3000));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
  it('measures a stream, closes once after completion, and leaves subsequent manual expansion open', () => {
    vi.useFakeTimers();
    const { rerender } = render(<Panel isStreaming />);
    const trigger = screen.getByRole('button', { name: 'Thinking...' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    act(() => vi.advanceTimersByTime(300));
    rerender(<Panel isStreaming={false} />);
    expect(trigger).toHaveTextContent('Thought for 1 second');
    act(() => vi.advanceTimersByTime(999));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    act(() => vi.advanceTimersByTime(1));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    act(() => vi.advanceTimersByTime(2000));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
  it('respects manual closing during a stream and defaultOpened false, then opens for a new stream', () => {
    const { rerender } = render(<Panel isStreaming />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    rerender(<Panel isStreaming duration={2} />);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    rerender(<Panel isStreaming={false} />);
    rerender(<Panel isStreaming />);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    rerender(<Panel isStreaming={false} />);
    fireEvent.click(trigger);
    rerender(<Panel isStreaming defaultOpened={false} />);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
  it('leaves controlled state to the parent and clears the close timer on restart and unmount', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { rerender, unmount } = render(
      <Panel opened isStreaming onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    onChange.mockClear();
    rerender(
      <Panel opened isStreaming={false} duration={5} onChange={onChange} />,
    );
    expect(screen.getByRole('button')).toHaveTextContent(
      'Thought for 5 seconds',
    );
    act(() => vi.advanceTimersByTime(500));
    rerender(<Panel opened isStreaming onChange={onChange} />);
    act(() => vi.advanceTimersByTime(1500));
    expect(onChange).not.toHaveBeenCalled();
    rerender(<Panel opened onChange={onChange} />);
    unmount();
    act(() => vi.advanceTimersByTime(1500));
    expect(onChange).not.toHaveBeenCalled();
  });
  it('supports themed slots, refs, disabled and cancellable non-submit triggers, and custom labels', () => {
    const root = createRef<HTMLDivElement>();
    const trigger = createRef<HTMLButtonElement>();
    const content = createRef<HTMLDivElement>();
    const submit = vi.fn();
    const theme = createTheme({
      components: {
        Reasoning: Reasoning.extend({
          styles: { trigger: { color: 'rgb(1, 2, 3)' } },
        }),
      },
    });
    const { rerender } = render(
      <MantineProvider theme={theme} env="test">
        <form onSubmit={submit}>
          <Reasoning ref={root} defaultOpened duration={0}>
            <Reasoning.Trigger
              ref={trigger}
              onClick={(event) => event.preventDefault()}
              getThinkingMessage={(_, duration) => `Elapsed ${duration}`}
            />
            <Reasoning.Content ref={content} transitionDuration={0}>
              Content
            </Reasoning.Content>
          </Reasoning>
        </form>
      </MantineProvider>,
    );
    expect(trigger.current).toHaveStyle({ color: 'rgb(1, 2, 3)' });
    expect(root.current).toContainElement(content.current);
    fireEvent.click(screen.getByRole('button', { name: 'Elapsed 0' }));
    expect(trigger.current).toHaveAttribute('aria-expanded', 'true');
    expect(submit).not.toHaveBeenCalled();
    rerender(<Panel disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
