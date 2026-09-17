import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Plan, PlanContent, PlanTrigger } from './Plan';

describe('Plan', () => {
  it('keeps streaming independent of opening, preserves footer actions, and supports controlled/cancelled toggles', () => {
    const change = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const { rerender } = render(
      <MantineProvider env="test">
        <form onSubmit={submit}>
          <Plan isStreaming>
            <Plan.Header>
              <div>
                <Plan.Title>Migration plan</Plan.Title>
                <Plan.Description>
                  Review the implementation steps.
                </Plan.Description>
              </div>
              <Plan.Trigger />
            </Plan.Header>
            <Plan.Content transitionDuration={0}>Steps</Plan.Content>
            <Plan.Footer>
              <Plan.Action>Footer action</Plan.Action>
            </Plan.Footer>
          </Plan>
        </form>
      </MantineProvider>,
    );
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.getByText('Footer action')).toBeVisible();
    expect(
      screen
        .getByRole('heading', { name: 'Migration plan' })
        .querySelector('.mantine-Shimmer-root')?.tagName,
    ).toBe('SPAN');
    expect(
      screen.getByText('Review the implementation steps.').parentElement
        ?.tagName,
    ).toBe('P');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle plan' }));
    expect(screen.getByRole('region', { name: 'Plan details' })).toBeVisible();
    expect(submit).not.toHaveBeenCalled();
    rerender(
      <MantineProvider env="test">
        <Plan opened onChange={change}>
          <Plan.Title>Static plan</Plan.Title>
          <Plan.Trigger onClick={(event) => event.preventDefault()} />
          <Plan.Content transitionDuration={0}>Steps</Plan.Content>
        </Plan>
      </MantineProvider>,
    );
    expect(
      screen.getByRole('heading').querySelector('.mantine-Shimmer-root'),
    ).toBeNull();
    fireEvent.click(screen.getByRole('button'));
    expect(change).not.toHaveBeenCalled();
    rerender(
      <MantineProvider env="test">
        <Plan opened onChange={change}>
          <Plan.Trigger />
          <Plan.Content transitionDuration={0}>Steps</Plan.Content>
        </Plan>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(change).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });
  it('forwards refs, unique content IDs, native theme defaults, all trigger slots, and disabled states', () => {
    const ref = createRef<HTMLDivElement>();
    const title = createRef<HTMLHeadingElement>();
    const theme = createTheme({
      components: {
        ActionIcon: { defaultProps: { radius: 'xl' } },
        PlanTrigger: PlanTrigger.extend({
          styles: { icon: { color: 'rgb(1, 2, 3)' } },
          defaultProps: { attributes: { root: { 'data-custom': 'yes' } } },
        }),
        PlanContent: PlanContent.extend({ styles: { body: { padding: 13 } } }),
      },
    });
    const click = vi.fn();
    render(
      <MantineProvider theme={theme} env="test">
        <Plan defaultOpened>
          <Plan.Title ref={title} order={2}>
            Plan heading
          </Plan.Title>
          <Plan.Trigger data-disabled onClick={click}>
            ×
          </Plan.Trigger>
          <Plan.Content ref={ref} transitionDuration={0}>
            One
          </Plan.Content>
          <Plan.Content transitionDuration={0}>Two</Plan.Content>
        </Plan>
        <Plan disabled>
          <Plan.Trigger onClick={click} />
        </Plan>
      </MantineProvider>,
    );
    expect(title.current?.tagName).toBe('H2');
    const regions = screen.getAllByRole('region');
    expect(regions[0]).toBe(ref.current);
    expect(regions[0]?.id).not.toBe(regions[1]?.id);
    expect(ref.current?.firstElementChild).toHaveStyle({ padding: '13px' });
    expect(screen.getByText('×')).toHaveStyle({ color: 'rgb(1, 2, 3)' });
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('data-custom', 'yes');
    expect(buttons[0]?.style.getPropertyValue('--ai-radius')).toBe(
      'var(--mantine-radius-xl)',
    );
    expect(buttons[1]).toBeDisabled();
    for (const button of buttons) fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
  });
});
