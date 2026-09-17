import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QueueSection } from './QueueSection';

describe('QueueSection', () => {
  it('opens by default, labels distinct panels, and respects cancellation and controlled state', () => {
    const change = vi.fn();
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(
      <MantineProvider env="test">
        <QueueSection onChange={change}>
          <QueueSection.Trigger onClick={(event) => event.preventDefault()}>
            <QueueSection.Label count={0} label="Queued" />
          </QueueSection.Trigger>
          <QueueSection.Content ref={ref} transitionDuration={0}>
            First
          </QueueSection.Content>
          <QueueSection.Content transitionDuration={0}>
            Second
          </QueueSection.Content>
        </QueueSection>
      </MantineProvider>,
    );
    const regions = screen.getAllByRole('region');
    expect(regions[0]?.id).not.toBe(regions[1]?.id);
    expect(regions[0]).toBe(ref.current);
    expect(regions[0]).toHaveAccessibleName('0 Queued');
    fireEvent.click(screen.getByRole('button', { name: '0 Queued' }));
    expect(change).not.toHaveBeenCalled();
    rerender(
      <MantineProvider env="test">
        <QueueSection opened onChange={change}>
          <QueueSection.Trigger>Tasks</QueueSection.Trigger>
          <QueueSection.Content transitionDuration={0}>
            First
          </QueueSection.Content>
        </QueueSection>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(change).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    rerender(
      <MantineProvider env="test">
        <QueueSection opened={false} disabled onChange={change}>
          <QueueSection.Trigger>Tasks</QueueSection.Trigger>
          <QueueSection.Content transitionDuration={0}>
            First
          </QueueSection.Content>
        </QueueSection>
      </MantineProvider>,
    );
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
