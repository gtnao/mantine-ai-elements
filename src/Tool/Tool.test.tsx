import { createTheme, MantineProvider, Text } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Tool,
  type ToolHeaderProps,
  ToolInput,
  ToolOutput,
  ToolStatusBadge,
} from './Tool';

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
describe('Tool', () => {
  it('renders every SDK state and distinguishes static hyphenated names from dynamic names', () => {
    render(
      <MantineProvider>
        {states.map((state) => (
          <Tool key={state}>
            <Tool.Header type="tool-web-search" state={state} />
          </Tool>
        ))}
        <Tool>
          <Tool.Header
            type="dynamic-tool"
            toolName="lookup"
            title="Custom title"
            state="input-available"
          />
        </Tool>
      </MantineProvider>,
    );
    for (const label of labels)
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    expect(screen.getAllByText('web-search')).toHaveLength(7);
    expect(
      screen.getByRole('button', { name: 'Custom title Running' }),
    ).toBeInTheDocument();
    // @ts-expect-error Dynamic tools require a toolName.
    const invalid: ToolHeaderProps = {
      type: 'dynamic-tool',
      state: 'input-available',
    };
    expect(invalid.type).toBe('dynamic-tool');
  });
  it('supports controlled disclosure, refs and theme slots without submitting a form', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const root = createRef<HTMLDivElement>();
    const header = createRef<HTMLButtonElement>();
    const content = createRef<HTMLDivElement>();
    const theme = createTheme({
      components: {
        Tool: Tool.extend({
          styles: { header: { color: 'rgb(1, 2, 3)' }, body: { padding: 23 } },
        }),
        ToolStatusBadge: ToolStatusBadge.extend({
          styles: { label: { fontWeight: 600 } },
        }),
      },
    });
    const { rerender } = render(
      <MantineProvider theme={theme} env="test">
        <form onSubmit={onSubmit}>
          <Tool ref={root} opened onChange={onChange}>
            <Tool.Header
              ref={header}
              type="dynamic-tool"
              toolName="lookup"
              state="input-available"
            />
            <Tool.Content ref={content} transitionDuration={0}>
              Details
            </Tool.Content>
          </Tool>
        </form>
      </MantineProvider>,
    );
    expect(header.current).toHaveStyle({ color: 'rgb(1, 2, 3)' });
    expect(screen.getByText('Running')).toHaveStyle({ fontWeight: 600 });
    expect(root.current).toContainElement(content.current);
    expect(header.current).toHaveAttribute(
      'aria-controls',
      content.current?.id,
    );
    fireEvent.click(header.current as HTMLButtonElement);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('region')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(
      <MantineProvider env="test">
        <Tool>
          <Tool.Header
            type="tool-search"
            state="input-streaming"
            onClick={(event) => event.preventDefault()}
          />
          <Tool.Content transitionDuration={0}>Hidden</Tool.Content>
        </Tool>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
  it('preserves false, zero, null, empty output and partial input; handles errors and custom results', () => {
    const { rerender, container } = render(
      <MantineProvider>
        <ToolOutput output={false} />
      </MantineProvider>,
    );
    expect(container.querySelector('code')).toHaveTextContent('false');
    for (const output of [0, null, '']) {
      rerender(
        <MantineProvider>
          <ToolOutput output={output} />
        </MantineProvider>,
      );
      expect(screen.getByText('Result')).toBeInTheDocument();
      expect(container.querySelector('code')?.textContent).toBe(
        output === '' ? '' : JSON.stringify(output),
      );
    }
    rerender(
      <MantineProvider>
        <ToolInput input={undefined} />
      </MantineProvider>,
    );
    expect(screen.getByText('Parameters')).toBeInTheDocument();
    expect(container.querySelector('code')).toHaveTextContent('');
    rerender(
      <MantineProvider>
        <ToolOutput errorText="Failed to load" output={{ partial: true }} />
      </MantineProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load');
    expect(container.querySelector('code')).toHaveTextContent(
      '"partial": true',
    );
    rerender(
      <MantineProvider>
        <ToolOutput output={<Text>Custom result</Text>} />
      </MantineProvider>,
    );
    expect(screen.getByText('Custom result')).toBeInTheDocument();
    expect(container.querySelector('code')).toBeNull();
    rerender(
      <MantineProvider>
        <ToolOutput />
      </MantineProvider>,
    );
    expect(screen.queryByText('Result')).not.toBeInTheDocument();
  });
  it('does not crash the surrounding interface on non-serializable dynamic data', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const { rerender } = render(
      <MantineProvider>
        <ToolOutput output={circular} />
      </MantineProvider>,
    );
    expect(
      screen.getByText('[Unable to serialize value as JSON]'),
    ).toBeInTheDocument();
    rerender(
      <MantineProvider>
        <Tool disabled>
          <Tool.Header type="tool-search" state="output-available" />
        </Tool>
      </MantineProvider>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
