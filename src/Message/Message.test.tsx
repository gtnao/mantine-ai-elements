import { MantineProvider, TextInput } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Message } from './Message';
import { MessageBranch } from './MessageBranch';

function Branches({
  branch,
  onBranchChange,
  count = 2,
}: {
  branch?: number;
  onBranchChange?: (index: number) => void;
  count?: number;
}) {
  return (
    <MantineProvider>
      <MessageBranch branch={branch} onBranchChange={onBranchChange}>
        <MessageBranch.Content>
          {Array.from({ length: count }, (_, index) => (
            <TextInput
              /* biome-ignore lint/suspicious/noArrayIndexKey: Fixed fixture indices are stable version identities. */
              key={`version-${index}`}
              aria-label={`Draft ${index + 1}`}
            />
          ))}
        </MessageBranch.Content>
        <MessageBranch.Selector>
          <MessageBranch.Previous />
          <MessageBranch.Page />
          <MessageBranch.Next />
        </MessageBranch.Selector>
      </MessageBranch>
    </MantineProvider>
  );
}
describe('Message composition', () => {
  it('loops between branches and retains input state in inactive branches', async () => {
    const user = userEvent.setup();
    render(<Branches />);
    await user.type(
      screen.getByRole('textbox', { name: 'Draft 1' }),
      'Preserved',
    );
    await user.click(screen.getByRole('button', { name: 'Previous branch' }));
    expect(screen.getByText('2 of 2')).toBeVisible();
    expect(
      screen.queryByRole('textbox', { name: 'Draft 1' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next branch' }));
    expect(screen.getByRole('textbox', { name: 'Draft 1' })).toHaveValue(
      'Preserved',
    );
  });
  it('respects controlled branch state while reporting navigation', async () => {
    const user = userEvent.setup();
    const onBranchChange = vi.fn();
    const { rerender } = render(
      <Branches branch={0} onBranchChange={onBranchChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Next branch' }));
    expect(onBranchChange).toHaveBeenCalledWith(1);
    expect(screen.getByText('1 of 2')).toBeVisible();
    rerender(<Branches branch={1} onBranchChange={onBranchChange} />);
    expect(screen.getByText('2 of 2')).toBeVisible();
  });
  it('normalizes invalid and removed branch indices and hides empty navigation', () => {
    const { rerender } = render(<Branches branch={99} />);
    expect(screen.getByRole('textbox', { name: 'Draft 2' })).toBeVisible();
    rerender(<Branches branch={99} count={1} />);
    expect(screen.getByRole('textbox', { name: 'Draft 1' })).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<Branches branch={99} count={0} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
  it('allows canceling navigation and uses labels independently of tooltip text', async () => {
    const user = userEvent.setup();
    const onBranchChange = vi.fn();
    render(
      <MantineProvider>
        <Message from="assistant">
          <Message.Action
            label="Retry response"
            tooltip="Generate another response"
          >
            R
          </Message.Action>
          <Message.Branch onBranchChange={onBranchChange}>
            <Message.Branch.Content>
              <div key="a">First</div>
              <div key="b">Second</div>
            </Message.Branch.Content>
            <Message.Branch.Next onClick={(event) => event.preventDefault()} />
          </Message.Branch>
        </Message>
      </MantineProvider>,
    );
    expect(
      screen.getByRole('button', { name: 'Retry response' }),
    ).toHaveAttribute('type', 'button');
    await user.click(screen.getByRole('button', { name: 'Next branch' }));
    expect(onBranchChange).not.toHaveBeenCalled();
  });
});
