import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Queue } from './Queue';
import { QueueItemAction, QueueItemContent } from './QueueItems';
import { QueueList } from './QueueList';

describe('Queue', () => {
  it('preserves semantic lists, completion status, native image attributes, and non-submitting actions', () => {
    const submit = vi.fn((event) => event.preventDefault());
    const remove = vi.fn();
    const item = createRef<HTMLLIElement>();
    const image = createRef<HTMLImageElement>();
    render(
      <MantineProvider>
        <form onSubmit={submit}>
          <Queue>
            <Queue.List>
              <Queue.Item ref={item}>
                <Queue.ItemIndicator completed />
                <Queue.ItemContent completed>Completed task</Queue.ItemContent>
                <Queue.ItemDescription completed>
                  Task details
                </Queue.ItemDescription>
                <Queue.ItemActions>
                  <Queue.ItemAction aria-label="Remove task" onClick={remove}>
                    ×
                  </Queue.ItemAction>
                  <Queue.ItemAction
                    disabled
                    aria-label="Disabled task"
                    onClick={remove}
                  >
                    ×
                  </Queue.ItemAction>
                  <Queue.ItemAction
                    data-disabled
                    aria-label="Unavailable task"
                    onClick={remove}
                  >
                    ×
                  </Queue.ItemAction>
                </Queue.ItemActions>
                <Queue.ItemAttachment>
                  <Queue.ItemImage
                    ref={image}
                    src="/preview.png"
                    alt="Reference image"
                  />
                  <Queue.ItemFile>reference.pdf</Queue.ItemFile>
                </Queue.ItemAttachment>
              </Queue.Item>
            </Queue.List>
          </Queue>
        </form>
      </MantineProvider>,
    );
    expect(screen.getByRole('list').firstElementChild).toBe(item.current);
    expect(screen.getByRole('img', { name: 'Completed' })).toBeInTheDocument();
    expect(screen.getByText('Completed task')).toHaveAttribute(
      'data-completed',
    );
    expect(image.current).toHaveAttribute('width', '32');
    expect(image.current).toHaveAttribute('height', '32');
    expect(image.current).toHaveAccessibleName('Reference image');
    for (const button of screen.getAllByRole('button')) fireEvent.click(button);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
  });
  it('applies native and own themes, all action slots, viewport refs/attributes, and custom list props', () => {
    const viewport = createRef<HTMLDivElement>();
    const list = createRef<HTMLUListElement>();
    const theme = createTheme({
      components: {
        Queue: Queue.extend({ styles: { root: { borderRadius: 13 } } }),
        QueueItemContent: QueueItemContent.extend({
          defaultProps: { size: 'lg', lineClamp: 3 },
        }),
        QueueItemAction: QueueItemAction.extend({
          styles: { icon: { color: 'rgb(1, 2, 3)' } },
          defaultProps: { attributes: { root: { 'data-custom': 'yes' } } },
        }),
        QueueList: QueueList.extend({
          styles: { list: { padding: 3 } },
          defaultProps: {
            attributes: { viewport: { 'data-slot': 'viewport' } },
          },
        }),
      },
    });
    render(
      <MantineProvider theme={theme}>
        <Queue data-testid="queue">
          <Queue.List
            viewportRef={viewport}
            listProps={{
              ref: list,
              'aria-label': 'Tasks',
              className: 'custom-list',
            }}
          >
            <Queue.Item>
              <Queue.ItemContent>Long task</Queue.ItemContent>
              <Queue.ItemAction aria-label="Remove">×</Queue.ItemAction>
            </Queue.Item>
          </Queue.List>
        </Queue>
      </MantineProvider>,
    );
    expect(screen.getByTestId('queue')).toHaveStyle({ borderRadius: '13px' });
    expect(
      screen.getByText('Long task').style.getPropertyValue('--text-line-clamp'),
    ).toBe('3');
    expect(viewport.current).toHaveAttribute('data-slot', 'viewport');
    expect(list.current).toBe(screen.getByRole('list', { name: 'Tasks' }));
    expect(list.current).toHaveClass('custom-list');
    expect(list.current).toHaveStyle({ padding: '3px' });
    expect(screen.getByRole('button')).toHaveAttribute('data-custom', 'yes');
    expect(screen.getByText('×')).toHaveStyle({ color: 'rgb(1, 2, 3)' });
  });
});
