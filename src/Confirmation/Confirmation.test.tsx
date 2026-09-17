import { createTheme, MantineProvider } from '@mantine/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { type ComponentProps, createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Confirmation } from './Confirmation';

function Panel(props: ComponentProps<typeof Confirmation>) {
  return (
    <MantineProvider>
      <Confirmation {...props}>
        <Confirmation.Title>
          <Confirmation.Request>Allow this lookup?</Confirmation.Request>
          <Confirmation.Accepted>Approved</Confirmation.Accepted>
          <Confirmation.Rejected>Rejected</Confirmation.Rejected>
        </Confirmation.Title>
        <Confirmation.Actions>
          <Confirmation.Action approved={false} reason="Declined">
            Reject
          </Confirmation.Action>
          <Confirmation.Action approved>Approve</Confirmation.Action>
        </Confirmation.Actions>
      </Confirmation>
    </MantineProvider>
  );
}
describe('Confirmation', () => {
  it('shows only applicable approval content, including accepted tools that later fail', () => {
    const { rerender } = render(<Panel state="input-streaming" />);
    expect(screen.queryByRole('alert')).toBeNull();
    rerender(<Panel state="input-available" approval={{ id: 'a' }} />);
    expect(screen.queryByRole('alert')).toBeNull();
    rerender(
      <Panel
        state="approval-requested"
        approval={{ id: 'a' }}
        onResponse={vi.fn()}
      />,
    );
    expect(screen.getByText('Allow this lookup?')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
    for (const state of [
      'approval-responded',
      'output-available',
      'output-error',
    ] as const) {
      rerender(<Panel state={state} approval={{ id: 'a', approved: true }} />);
      expect(screen.getByText('Approved')).toBeVisible();
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.queryByText('Allow this lookup?')).toBeNull();
    }
    rerender(
      <Panel
        state="output-denied"
        approval={{ id: 'a', approved: false, reason: 'Declined' }}
      />,
    );
    expect(screen.getByText('Rejected')).toBeVisible();
    expect(screen.queryByText('Approved')).toBeNull();
  });
  it('locks both actions synchronously and keeps success pending until the application updates state', async () => {
    let resolve!: () => void;
    const onResponse = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    const { rerender } = render(
      <Panel
        state="approval-requested"
        approval={{ id: 'a' }}
        onResponse={onResponse}
      />,
    );
    const approve = screen.getByRole('button', { name: 'Approve' });
    const reject = screen.getByRole('button', { name: 'Reject' });
    act(() => {
      fireEvent.click(approve);
      fireEvent.click(reject);
      fireEvent.click(approve);
    });
    expect(onResponse).toHaveBeenCalledTimes(1);
    expect(onResponse).toHaveBeenCalledWith({
      id: 'a',
      approved: true,
      reason: undefined,
    });
    expect(approve).toBeDisabled();
    expect(reject).toBeDisabled();
    await act(async () => resolve());
    expect(approve).toBeDisabled();
    expect(screen.queryByText('Approved')).toBeNull();
    rerender(
      <Panel
        state="approval-responded"
        approval={{ id: 'a', approved: true }}
        onResponse={onResponse}
      />,
    );
    expect(screen.getByText('Approved')).toBeVisible();
  });
  it('reports rejection and allows retry while ignoring a stale failure from another approval', async () => {
    const failures: Array<(error: Error) => void> = [];
    const onResponse = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          failures.push(reject);
        }),
    );
    const onResponseError = vi.fn();
    const { rerender, unmount } = render(
      <Panel
        state="approval-requested"
        approval={{ id: 'a' }}
        onResponse={onResponse}
        onResponseError={onResponseError}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    await act(async () => failures[0]?.(new Error('Offline')));
    expect(onResponseError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Offline' }),
    );
    expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(onResponse).toHaveBeenLastCalledWith({
      id: 'a',
      approved: false,
      reason: 'Declined',
    });
    rerender(
      <Panel
        state="approval-requested"
        approval={{ id: 'b' }}
        onResponse={onResponse}
        onResponseError={onResponseError}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await act(async () => failures[1]?.(new Error('Old request')));
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(onResponseError).toHaveBeenCalledTimes(1);
    unmount();
    await act(async () => failures[2]?.(new Error('Unmounted')));
    expect(onResponseError).toHaveBeenCalledTimes(1);
  });
  it('preserves cancellable native callbacks, explicit pending, refs, and Mantine themes', async () => {
    const onResponse = vi.fn();
    const onClick = vi.fn();
    const onSubmit = vi.fn();
    const root = createRef<HTMLDivElement>();
    const action = createRef<HTMLButtonElement>();
    const theme = createTheme({
      components: {
        Confirmation: Confirmation.extend({
          styles: { root: { borderRadius: 17 } },
        }),
        ConfirmationAction: Confirmation.Action.extend({
          styles: { label: { fontWeight: 700 } },
        }),
      },
    });
    const { rerender } = render(
      <MantineProvider theme={theme}>
        <form onSubmit={onSubmit}>
          <Confirmation
            ref={root}
            state="approval-requested"
            approval={{ id: 'a' }}
            onResponse={onResponse}
          >
            <Confirmation.Action
              ref={action}
              approved
              onClick={(event) => event.preventDefault()}
            >
              Cancel callback
            </Confirmation.Action>
            <Confirmation.Action onClick={onClick}>
              Custom callback
            </Confirmation.Action>
          </Confirmation>
        </form>
      </MantineProvider>,
    );
    expect(root.current).toHaveStyle({ borderRadius: '17px' });
    expect(screen.getByText('Cancel callback')).toHaveStyle({
      fontWeight: 700,
    });
    expect(root.current).toContainElement(action.current);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel callback' }));
    expect(onResponse).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Custom callback' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(
      <Panel
        state="approval-requested"
        approval={{ id: 'a' }}
        onResponse={onResponse}
        pending
      />,
    );
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    rerender(<Panel state="approval-requested" approval={{ id: 'a' }} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled(),
    );
  });
});
