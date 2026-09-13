import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Sandbox } from './Sandbox';
import { SandboxHeader } from './SandboxParts';
import { SandboxTabsTrigger } from './SandboxTabs';

const states = [
  'input-streaming',
  'input-available',
  'approval-requested',
  'approval-responded',
  'output-available',
  'output-error',
  'output-denied',
] as const;
const labels = [
  'Pending',
  'Running',
  'Awaiting Approval',
  'Responded',
  'Completed',
  'Error',
  'Denied',
];
describe('Sandbox', () => {
  it('supports all tool states, controlled disclosure, cancellation, and native form semantics', () => {
    const change = vi.fn(),
      submit = vi.fn((e) => e.preventDefault());
    const view = (state: (typeof states)[number], cancel = false) => (
      <MantineProvider env="test">
        <form onSubmit={submit}>
          <Sandbox opened onChange={change}>
            <Sandbox.Header
              title="code.py"
              state={state}
              onClick={(e) => {
                if (cancel) e.preventDefault();
              }}
            />
            <Sandbox.Content transitionDuration={0}>
              Code output
            </Sandbox.Content>
          </Sandbox>
        </form>
      </MantineProvider>
    );
    const { rerender } = render(view('input-streaming'));
    for (const [index, state] of states.entries()) {
      rerender(view(state));
      expect(screen.getByText(labels[index] ?? '')).toBeVisible();
    }
    fireEvent.click(screen.getByRole('button'));
    expect(change).toHaveBeenCalledWith(false);
    expect(screen.getByRole('region')).toBeVisible();
    expect(submit).not.toHaveBeenCalled();
    rerender(view('output-available', true));
    fireEvent.click(screen.getByRole('button'));
    expect(change).toHaveBeenCalledTimes(1);
  });
  it('retains Mantine tab keyboard/disabled behavior and exposes native slots, refs and controlled values', () => {
    const tab = createRef<HTMLButtonElement>();
    const header = createRef<HTMLButtonElement>();
    const selected = vi.fn();
    const theme = createTheme({
      components: {
        SandboxHeader: SandboxHeader.extend({
          styles: { title: { fontWeight: 700 } },
        }),
        SandboxTabsTrigger: SandboxTabsTrigger.extend({
          styles: { tabLabel: { color: 'rgb(1, 2, 3)' } },
          defaultProps: { attributes: { tab: { 'data-custom': 'tab' } } },
        }),
      },
    });
    render(
      <MantineProvider env="test" theme={theme}>
        <Sandbox>
          <Sandbox.Header
            ref={header}
            title="script.py"
            state="output-available"
          />
          <Sandbox.Content transitionDuration={0}>
            <Sandbox.Tabs value="code" onChange={selected}>
              <Sandbox.TabsBar>
                <Sandbox.TabsList aria-label="Execution details">
                  <Sandbox.TabsTrigger value="code" ref={tab}>
                    Code
                  </Sandbox.TabsTrigger>
                  <Sandbox.TabsTrigger value="disabled" disabled>
                    Unavailable
                  </Sandbox.TabsTrigger>
                  <Sandbox.TabsTrigger value="output">
                    Output
                  </Sandbox.TabsTrigger>
                </Sandbox.TabsList>
              </Sandbox.TabsBar>
              <Sandbox.TabContent value="code">Source text</Sandbox.TabContent>
              <Sandbox.TabContent value="output">
                Result text
              </Sandbox.TabContent>
            </Sandbox.Tabs>
          </Sandbox.Content>
        </Sandbox>
      </MantineProvider>,
    );
    expect(header.current).toBe(
      screen.getByRole('button', { name: 'script.py Completed' }),
    );
    expect(screen.getByText('script.py')).toHaveStyle({ fontWeight: 700 });
    expect(tab.current).toBe(screen.getByRole('tab', { name: 'Code' }));
    expect(tab.current).toHaveAttribute('data-custom', 'tab');
    expect(screen.getByText('Code')).toHaveStyle({ color: 'rgb(1, 2, 3)' });
    tab.current?.focus();
    fireEvent.keyDown(tab.current as HTMLButtonElement, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Output' })).toHaveFocus();
    expect(selected).toHaveBeenCalledWith('output');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Source text');
  });
});
