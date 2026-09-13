import { createTheme, MantineProvider } from '@mantine/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { LanguageModelUsage } from 'ai';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Context, ContextTrigger } from './Context';
import * as pricing from './context-cost';

const usage: LanguageModelUsage = {
  inputTokens: 1000,
  outputTokens: 500,
  totalTokens: 1500,
  inputTokenDetails: {
    noCacheTokens: 700,
    cacheReadTokens: 200,
    cacheWriteTokens: 100,
  },
  outputTokenDetails: { textTokens: 400, reasoningTokens: 100 },
};
function Details() {
  return (
    <Context.Content>
      <Context.ContentHeader />
      <Context.ContentBody>
        <Context.InputUsage />
        <Context.OutputUsage />
        <Context.ReasoningUsage />
        <Context.CacheUsage />
      </Context.ContentBody>
      <Context.ContentFooter />
    </Context.Content>
  );
}
afterEach(() => vi.restoreAllMocks());
describe('Context', () => {
  it('supports controlled opening, native refs/themes, and clamped progress with honest over-capacity text', () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const theme = createTheme({
      components: {
        Context: Context.extend({
          styles: { footer: { padding: 23 } },
          defaultProps: {
            attributes: { dropdown: { 'data-testid': 'context-dropdown' } },
          },
        }),
        ContextTrigger: ContextTrigger.extend({
          styles: { label: { fontWeight: 800 } },
        }),
      },
    });
    const { rerender } = render(
      <MantineProvider env="test" theme={theme}>
        <Context
          usedTokens={150}
          maxTokens={100}
          opened={false}
          onChange={onChange}
        >
          <Context.Trigger ref={ref} />
          <Details />
        </Context>
      </MantineProvider>,
    );
    expect(ref.current).toHaveAccessibleName('150%');
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText('Estimated total')).toBeNull();
    rerender(
      <MantineProvider env="test" theme={theme}>
        <Context
          usedTokens={150}
          maxTokens={100}
          opened
          transitionProps={{ duration: 0 }}
          costUSD={{ totalUSD: 0 }}
        >
          <Context.Trigger ref={ref} />
          <Details />
        </Context>
      </MantineProvider>,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByTestId('context-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Estimated total').parentElement).toHaveStyle({
      padding: '23px',
    });
    expect(screen.getAllByText('150%')[0]?.parentElement).toHaveStyle({
      fontWeight: 800,
    });
  });
  it('opens on focus, closes on Escape, and treats unknown capacity and cost as unknown', async () => {
    render(
      <MantineProvider env="test">
        <Context
          usedTokens={0}
          maxTokens={0}
          usage={usage}
          transitionProps={{ duration: 0 }}
        >
          <Context.Trigger />
          <Details />
        </Context>
      </MantineProvider>,
    );
    const button = screen.getByRole('button');
    fireEvent.focus(button);
    await screen.findByText('Estimated total');
    expect(button).toHaveAccessibleName('—');
    expect(screen.queryByText(/NaN|Infinity|\$0.00/)).toBeNull();
    expect(screen.getByText('Cache').parentElement).toHaveTextContent('300');
    expect(screen.getByText('Reasoning').parentElement).toHaveTextContent(
      '100',
    );
    fireEvent.keyDown(button, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByText('Estimated total')).toBeNull(),
    );
  });
  it('ignores stale estimates and bypasses estimation for explicit cost data', async () => {
    let finishOld!: (cost: pricing.ContextCosts) => void;
    const spy = vi
      .spyOn(pricing, 'estimateContextCosts')
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishOld = resolve;
          }),
      )
      .mockResolvedValue({ totalUSD: 2 });
    const { rerender } = render(
      <MantineProvider env="test">
        <Context
          opened
          usedTokens={1}
          maxTokens={10}
          usage={usage}
          modelId="old"
        >
          <Details />
        </Context>
      </MantineProvider>,
    );
    rerender(
      <MantineProvider env="test">
        <Context
          opened
          usedTokens={1}
          maxTokens={10}
          usage={usage}
          modelId="new"
        >
          <Details />
        </Context>
      </MantineProvider>,
    );
    await screen.findByText('$2.00');
    await act(async () => finishOld({ totalUSD: 99 }));
    expect(screen.queryByText('$99.00')).toBeNull();
    rerender(
      <MantineProvider env="test">
        <Context
          opened
          usedTokens={1}
          maxTokens={10}
          usage={usage}
          modelId="override"
          costUSD={{ totalUSD: 3 }}
        >
          <Details />
        </Context>
      </MantineProvider>,
    );
    expect(screen.getByText('$3.00')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
