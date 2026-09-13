import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChainOfThought } from './ChainOfThought';
import {
  ChainOfThoughtSearchResult,
  ChainOfThoughtStep,
} from './ChainOfThoughtParts';

describe('ChainOfThought', () => {
  it('controls disclosure with labelled unique panels, native button semantics, cancellation, and disabled state', () => {
    const change = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(
      <MantineProvider env="test">
        <form onSubmit={submit}>
          <ChainOfThought onChange={change}>
            <ChainOfThought.Header ref={ref} />
            <ChainOfThought.Content transitionDuration={0}>
              Details
            </ChainOfThought.Content>
            <ChainOfThought.Content transitionDuration={0}>
              More details
            </ChainOfThought.Content>
          </ChainOfThought>
        </form>
      </MantineProvider>,
    );
    expect(screen.queryByRole('region')).toBeNull();
    expect(ref.current).toHaveAccessibleName('Chain of Thought');
    fireEvent.click(ref.current as HTMLButtonElement);
    expect(change).toHaveBeenCalledWith(true);
    expect(submit).not.toHaveBeenCalled();
    const regions = screen.getAllByRole('region');
    expect(regions[0]?.id).not.toBe(regions[1]?.id);
    expect(regions[0]).toHaveAccessibleName('Chain of Thought');
    change.mockClear();
    rerender(
      <MantineProvider env="test">
        <ChainOfThought opened onChange={change}>
          <ChainOfThought.Header onClick={(event) => event.preventDefault()}>
            Summary
          </ChainOfThought.Header>
          <ChainOfThought.Content transitionDuration={0}>
            Details
          </ChainOfThought.Content>
        </ChainOfThought>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(change).not.toHaveBeenCalled();
    rerender(
      <MantineProvider env="test">
        <ChainOfThought opened disabled onChange={change}>
          <ChainOfThought.Header />
        </ChainOfThought>
      </MantineProvider>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
  it('supports standalone steps, accessible status, arbitrary icons, native badge links/themes/refs, and image frame customization', () => {
    const ref = createRef<HTMLAnchorElement>();
    const theme = createTheme({
      components: {
        ChainOfThoughtStep: ChainOfThoughtStep.extend({
          styles: { label: { color: 'rgb(1, 2, 3)' } },
        }),
        Badge: { defaultProps: { radius: 'sm' } },
        ChainOfThoughtSearchResult: ChainOfThoughtSearchResult.extend({
          styles: { label: { fontWeight: 700 } },
          defaultProps: {
            attributes: { section: { 'data-section': 'custom' } },
          },
        }),
      },
    });
    render(
      <MantineProvider theme={theme}>
        <ChainOfThought.Step
          label="Search records"
          status="active"
          description={0}
          icon={<span>Custom icon</span>}
        >
          <ChainOfThought.SearchResults>
            <ChainOfThought.SearchResult
              component="a"
              href="/reference"
              ref={ref}
              leftSection={<span aria-hidden="true">Source icon</span>}
            >
              Reference
            </ChainOfThought.SearchResult>
          </ChainOfThought.SearchResults>
        </ChainOfThought.Step>
        <ChainOfThought.Image
          caption="Reference preview"
          frameProps={{ style: { maxHeight: 120 }, className: 'custom-frame' }}
        >
          <img src="/preview.png" alt="Preview" />
        </ChainOfThought.Image>
      </MantineProvider>,
    );
    expect(screen.getByText('Search records')).toHaveTextContent('In progress');
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Custom icon')).toBeInTheDocument();
    expect(screen.getByText('Search records')).toHaveStyle({
      color: 'rgb(1, 2, 3)',
    });
    expect(ref.current).toBe(screen.getByRole('link', { name: 'Reference' }));
    expect(ref.current).toHaveAttribute('href', '/reference');
    expect(ref.current?.style.getPropertyValue('--badge-radius')).toBe(
      'var(--mantine-radius-sm)',
    );
    expect(screen.getByText('Reference')).toHaveStyle({ fontWeight: '700' });
    expect(screen.getByText('Source icon').parentElement).toHaveAttribute(
      'data-section',
      'custom',
    );
    expect(screen.getByAltText('Preview').parentElement).toHaveClass(
      'custom-frame',
    );
    expect(screen.getByAltText('Preview').parentElement).toHaveStyle({
      maxHeight: '120px',
    });
    expect(screen.getByText('Reference preview')).toBeInTheDocument();
  });
});
