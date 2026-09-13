import { createTheme, MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Suggestion, Suggestions } from './Suggestion';

describe('Suggestion', () => {
  it('emits the source value through keyboard activation without submitting its parent form', async () => {
    const user = userEvent.setup();
    const select = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <MantineProvider>
        <form onSubmit={submit}>
          <Suggestions>
            <Suggestion suggestion="Explain the details" onClick={select}>
              Explain
            </Suggestion>
            <Suggestion suggestion="Disabled" disabled onClick={select} />
            <Suggestion suggestion="Loading" loading onClick={select} />
          </Suggestions>
        </form>
      </MantineProvider>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    expect(select).toHaveBeenCalledExactlyOnceWith('Explain the details');
    expect(submit).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Disabled' }));
    await user.click(screen.getByRole('button', { name: 'Loading' }));
    expect(select).toHaveBeenCalledTimes(1);
  });
  it('resolves extension and native themes, slot overrides, and root/viewport/button refs', () => {
    const button = createRef<HTMLButtonElement>();
    const root = createRef<HTMLDivElement>();
    const viewport = createRef<HTMLDivElement>();
    render(
      <MantineProvider
        theme={createTheme({
          components: {
            Button: { defaultProps: { color: 'grape' } },
            Suggestion: Suggestion.extend({
              defaultProps: { size: 'lg' },
              styles: { label: { fontWeight: 700 } },
            }),
            Suggestions: Suggestions.extend({
              styles: { viewport: { borderRadius: 12 } },
            }),
          },
        })}
      >
        <Suggestions
          ref={root}
          viewportRef={viewport}
          classNames={{ root: 'list-custom' }}
        >
          <Suggestion
            ref={button}
            suggestion="Themed"
            styles={{ label: { letterSpacing: 2 } }}
          />
        </Suggestions>
      </MantineProvider>,
    );
    expect(button.current).toBe(screen.getByRole('button', { name: 'Themed' }));
    expect(button.current).toHaveAttribute('data-size', 'lg');
    expect(button.current?.querySelector('.mantine-Button-label')).toHaveStyle({
      fontWeight: 700,
      letterSpacing: '2px',
    });
    expect(root.current).toHaveClass('list-custom');
    expect(viewport.current).toHaveStyle({ borderRadius: '12px' });
  });
});
