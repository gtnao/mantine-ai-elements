import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
} from './InlineCitation';

describe('InlineCitation', () => {
  it('opens from focus and touch activation, preserves inline markup and closes on Escape', async () => {
    const ref = createRef<HTMLButtonElement>();
    const submit = vi.fn();
    const { container } = render(
      <MantineProvider>
        <form onSubmit={submit}>
          <p>
            <InlineCitation>
              <InlineCitation.Text>Grounded answer.</InlineCitation.Text>
              <InlineCitation.Card transitionProps={{ duration: 0 }}>
                <InlineCitation.CardTrigger
                  ref={ref}
                  sources={['https://example.com/a', '/local']}
                />
                <InlineCitation.CardBody>
                  <InlineCitation.Source
                    title="Reference"
                    url="https://example.com/a"
                    description="Supporting evidence"
                  >
                    <InlineCitation.Quote>
                      A quoted passage.
                    </InlineCitation.Quote>
                  </InlineCitation.Source>
                </InlineCitation.CardBody>
              </InlineCitation.Card>
            </InlineCitation>
          </p>
        </form>
      </MantineProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'example.com +1' });
    expect(trigger).toBe(ref.current);
    expect(container.querySelector('p div')).toBeNull();
    fireEvent.focus(trigger);
    await screen.findByText('Reference');
    expect(container.querySelector('p div')).toBeNull();
    fireEvent.keyDown(trigger, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByText('Reference')).toBeNull());
    fireEvent.pointerDown(trigger, { pointerType: 'touch' });
    fireEvent.click(trigger);
    await screen.findByText('Reference');
    expect(submit).not.toHaveBeenCalled();
  });
  it('keeps controlled state authoritative, tolerates local URLs and exposes Mantine themes', () => {
    const onChange = vi.fn();
    const theme = createTheme({
      components: {
        InlineCitationCard: InlineCitationCard.extend({
          styles: { dropdown: { backgroundColor: 'rgb(1, 2, 3)' } },
        }),
        InlineCitationCardTrigger: InlineCitationCardTrigger.extend({
          styles: { label: { fontWeight: 900 } },
        }),
      },
    });
    const { rerender } = render(
      <MantineProvider env="test" theme={theme}>
        <InlineCitationCard opened={false} onChange={onChange}>
          <InlineCitationCard.Trigger sources={['/local']} />
          <InlineCitationCard.Body>Evidence</InlineCitationCard.Body>
        </InlineCitationCard>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: '/local' }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText('Evidence')).toBeNull();
    expect(screen.getByText('/local')).toHaveStyle({ fontWeight: 900 });
    rerender(
      <MantineProvider env="test" theme={theme}>
        <InlineCitationCard opened transitionProps={{ duration: 0 }}>
          <InlineCitationCard.Trigger sources={[]} />
          <InlineCitationCard.Body>Evidence</InlineCitationCard.Body>
        </InlineCitationCard>
      </MantineProvider>,
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('unknown');
    expect(screen.getByText('Evidence')).toHaveStyle({
      backgroundColor: 'rgb(1, 2, 3)',
    });
  });
  it('honors click cancellation and disabled state with custom labels', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MantineProvider env="test">
        <InlineCitationCard onChange={onChange}>
          <InlineCitationCard.Trigger
            sources={['not a URL']}
            onClick={(event) => event.preventDefault()}
          >
            [1]
          </InlineCitationCard.Trigger>
          <InlineCitationCard.Body>Evidence</InlineCitationCard.Body>
        </InlineCitationCard>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: '[1]' }));
    expect(onChange).not.toHaveBeenCalled();
    rerender(
      <MantineProvider env="test">
        <InlineCitationCard disabled onChange={onChange}>
          <InlineCitationCard.Trigger sources={['not a URL']} />
          <InlineCitationCard.Body>Evidence</InlineCitationCard.Body>
        </InlineCitationCard>
      </MantineProvider>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
