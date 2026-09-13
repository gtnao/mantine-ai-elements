import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Source, Sources } from './Sources';

describe('Sources', () => {
  it('controls multiple panels without duplicate IDs and respects parent-controlled opening', () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(
      <MantineProvider env="test">
        <Sources opened onChange={onChange}>
          <Sources.Trigger count={2} />
          <Sources.Content ref={ref} transitionDuration={0}>
            <Source href="https://example.com/one" title="One" />
          </Sources.Content>
          <Sources.Content transitionDuration={0}>
            <Source href="https://example.com/two" title="Two" />
          </Sources.Content>
        </Sources>
      </MantineProvider>,
    );
    const regions = screen.getAllByRole('region');
    expect(regions[0]?.id).not.toBe(regions[1]?.id);
    expect(regions[0]).toBe(ref.current);
    expect(regions[0]).toHaveAccessibleName('Used 2 sources');
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(false);
    expect(screen.getAllByRole('link')).toHaveLength(2);
    rerender(
      <MantineProvider env="test">
        <Sources opened={false}>
          <Sources.Trigger count={1} />
          <Sources.Content transitionDuration={0}>Closed</Sources.Content>
        </Sources>
      </MantineProvider>,
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('Used 1 source');
    expect(screen.queryByRole('region')).toBeNull();
  });
  it('preserves link customization, fallback labels, polymorphism, refs, and themes', () => {
    const ref = createRef<HTMLAnchorElement>();
    const theme = createTheme({
      components: {
        Source: Source.extend({ styles: { root: { color: 'rgb(1, 2, 3)' } } }),
      },
    });
    render(
      <MantineProvider theme={theme}>
        <Source ref={ref} href="https://example.com" />
        <Source href="/local" title="Local" target="_self" rel="author">
          <strong>Custom label</strong>
        </Source>
        <Source component="button" type="button">
          Custom control
        </Source>
      </MantineProvider>,
    );
    expect(ref.current).toHaveAccessibleName('https://example.com');
    expect(ref.current).toHaveAttribute('target', '_blank');
    expect(ref.current).toHaveAttribute('rel', 'noreferrer');
    expect(ref.current).toHaveStyle({ color: 'rgb(1, 2, 3)' });
    expect(screen.getByRole('link', { name: 'Custom label' })).toHaveAttribute(
      'target',
      '_self',
    );
    expect(screen.getByRole('link', { name: 'Custom label' })).toHaveAttribute(
      'rel',
      'author',
    );
    expect(
      screen.getByRole('button', { name: 'Custom control' }),
    ).toBeInTheDocument();
  });
  it('keeps zero-count and custom triggers usable, respects cancellation and never submits a form', () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <MantineProvider env="test">
        <form onSubmit={onSubmit}>
          <Sources>
            <Sources.Trigger count={0}>References</Sources.Trigger>
            <Sources.Content transitionDuration={0}>
              No references yet.
            </Sources.Content>
          </Sources>
        </form>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('region')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(
      <MantineProvider>
        <Sources>
          <Sources.Trigger
            count={0}
            onClick={(event) => event.preventDefault()}
          />
        </Sources>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    rerender(
      <MantineProvider>
        <Sources disabled>
          <Sources.Trigger count={0} />
        </Sources>
      </MantineProvider>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
