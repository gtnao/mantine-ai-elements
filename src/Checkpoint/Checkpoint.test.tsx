import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from './Checkpoint';

describe('Checkpoint', () => {
  it('activates the application callback without submitting a surrounding form and respects disabled/loading', () => {
    const restore = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const { rerender } = render(
      <MantineProvider>
        <form onSubmit={submit}>
          <Checkpoint>
            <Checkpoint.Icon />
            <Checkpoint.Trigger onClick={restore}>
              Restore chat
            </Checkpoint.Trigger>
          </Checkpoint>
        </form>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Restore chat' }));
    expect(restore).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    rerender(
      <MantineProvider>
        <CheckpointTrigger disabled onClick={restore}>
          Disabled
        </CheckpointTrigger>
        <CheckpointTrigger loading onClick={restore}>
          Restoring
        </CheckpointTrigger>
      </MantineProvider>,
    );
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(restore).toHaveBeenCalledTimes(1);
  });
  it('preserves native and component themes, attributes, refs, custom icons, and focus tooltips', async () => {
    const root = createRef<HTMLDivElement>();
    const icon = createRef<HTMLSpanElement>();
    const button = createRef<HTMLButtonElement>();
    const svg = createRef<SVGSVGElement>();
    const theme = createTheme({
      components: {
        Checkpoint: Checkpoint.extend({ styles: { line: { opacity: 0.4 } } }),
        CheckpointIcon: CheckpointIcon.extend({ defaultProps: { size: 22 } }),
        Button: { defaultProps: { radius: 'xl' } },
        CheckpointTrigger: CheckpointTrigger.extend({
          styles: { label: { color: 'rgb(1, 2, 3)' } },
          defaultProps: { attributes: { root: { 'data-themed': 'yes' } } },
        }),
      },
    });
    render(
      <MantineProvider theme={theme} env="test">
        <Checkpoint ref={root} data-testid="checkpoint">
          <CheckpointIcon ref={icon} svgProps={{ ref: svg, strokeWidth: 3 }} />
          <CheckpointTrigger
            ref={button}
            tooltip="Restore this chat history"
            tooltipProps={{ transitionProps: { duration: 0 } }}
          >
            Restore
          </CheckpointTrigger>
        </Checkpoint>
        <CheckpointIcon data-testid="custom">
          <span>Custom icon</span>
        </CheckpointIcon>
      </MantineProvider>,
    );
    expect(root.current).toBe(screen.getByTestId('checkpoint'));
    expect(icon.current?.tagName).toBe('SPAN');
    expect(
      icon.current?.style.getPropertyValue('--checkpoint-icon-size'),
    ).toContain('1.375rem');
    expect(svg.current).toHaveAttribute('stroke-width', '3');
    expect(screen.getByTestId('custom').querySelector('svg')).toBeNull();
    expect(screen.getByRole('separator')).toHaveStyle({ opacity: '0.4' });
    expect(button.current).toHaveAttribute('data-themed', 'yes');
    expect(button.current?.style.getPropertyValue('--button-radius')).toBe(
      'var(--mantine-radius-xl)',
    );
    expect(screen.getByText('Restore')).toHaveStyle({ color: 'rgb(1, 2, 3)' });
    fireEvent.focus(button.current as HTMLButtonElement);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Restore this chat history',
    );
    fireEvent.blur(button.current as HTMLButtonElement);
  });
});
