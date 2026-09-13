import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Task, TaskItemFile } from './Task';

describe('Task', () => {
  it('uses a native non-submitting button, supports custom roots, cancellation, and controlled state', () => {
    const change = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const trigger = createRef<HTMLButtonElement>();
    const { rerender } = render(
      <MantineProvider env="test">
        <form onSubmit={submit}>
          <Task opened onChange={change}>
            <Task.Trigger
              ref={trigger}
              title="Inspect files"
              onClick={(event) => event.preventDefault()}
              renderRoot={(props) => (
                <button {...props} type="button" data-custom-root />
              )}
            />
            <Task.Content transitionDuration={0}>Details</Task.Content>
          </Task>
        </form>
      </MantineProvider>,
    );
    expect(trigger.current).toBe(
      screen.getByRole('button', { name: 'Inspect files' }),
    );
    expect(trigger.current).toHaveAttribute('data-custom-root');
    fireEvent.click(trigger.current as HTMLButtonElement);
    expect(change).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
    rerender(
      <MantineProvider env="test">
        <Task opened onChange={change}>
          <Task.Trigger title="Ignored title">
            <strong>Custom content</strong>
          </Task.Trigger>
          <Task.Content transitionDuration={0}>Details</Task.Content>
        </Task>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Custom content' }));
    expect(change).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    rerender(
      <MantineProvider env="test">
        <Task defaultOpened={false} opened={false} disabled>
          <Task.Trigger title="Disabled" />
          <Task.Content transitionDuration={0}>Details</Task.Content>
        </Task>
      </MantineProvider>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.queryByRole('region')).toBeNull();
  });
  it('labels distinct regions, preserves refs and themes, and supports inline file composition', () => {
    const content = createRef<HTMLDivElement>();
    const file = createRef<HTMLSpanElement>();
    const theme = createTheme({
      components: {
        Task: Task.extend({
          styles: { body: { borderColor: 'rgb(1, 2, 3)' } },
          defaultProps: { attributes: { trigger: { 'data-theme': 'task' } } },
        }),
        TaskItemFile: TaskItemFile.extend({ defaultProps: { radius: 'xl' } }),
      },
    });
    render(
      <MantineProvider theme={theme} env="test">
        <Task>
          <Task.Trigger title="Read project files" />
          <Task.Content ref={content} transitionDuration={0}>
            <Task.Item component="p">
              Read{' '}
              <Task.ItemFile component="span" ref={file}>
                index.ts
              </Task.ItemFile>
            </Task.Item>
          </Task.Content>
          <Task.Content transitionDuration={0}>Second panel</Task.Content>
        </Task>
      </MantineProvider>,
    );
    const regions = screen.getAllByRole('region');
    expect(regions[0]).toBe(content.current);
    expect(regions[0]?.id).not.toBe(regions[1]?.id);
    expect(regions[0]).toHaveAccessibleName('Read project files');
    expect(content.current?.firstElementChild).toHaveStyle({
      borderColor: 'rgb(1, 2, 3)',
    });
    expect(file.current?.parentElement?.tagName).toBe('P');
    expect(file.current?.tagName).toBe('SPAN');
    expect(file.current?.style.getPropertyValue('--paper-radius')).toBe(
      'var(--mantine-radius-xl)',
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-theme', 'task');
  });
});
