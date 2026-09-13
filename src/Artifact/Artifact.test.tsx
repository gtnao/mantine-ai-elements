import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Artifact, ArtifactTitle } from './Artifact';
import { ArtifactAction, ArtifactClose } from './ArtifactAction';

describe('Artifact', () => {
  it('lets the application own actions and visibility without submitting a surrounding form', () => {
    const submit = vi.fn((event) => event.preventDefault());
    const copy = vi.fn();
    function Example() {
      const [opened, setOpened] = useState(true);
      return (
        <form onSubmit={submit}>
          {opened && (
            <Artifact>
              <Artifact.Header>
                <Artifact.Title>Report</Artifact.Title>
                <Artifact.Actions>
                  <Artifact.Action tooltip="Copy report" onClick={copy}>
                    C
                  </Artifact.Action>
                  <Artifact.Action label="Unavailable" disabled onClick={copy}>
                    X
                  </Artifact.Action>
                  <Artifact.Close
                    label="Dismiss report"
                    onClick={() => setOpened(false)}
                  />
                </Artifact.Actions>
              </Artifact.Header>
              <Artifact.Content>Generated report</Artifact.Content>
            </Artifact>
          )}
        </form>
      );
    }
    render(
      <MantineProvider env="test">
        <Example />
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy report' }));
    fireEvent.click(screen.getByRole('button', { name: 'Unavailable' }));
    expect(copy).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Generated report')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss report' }));
    expect(screen.queryByText('Generated report')).toBeNull();
    expect(submit).not.toHaveBeenCalled();
  });
  it('supports standalone polymorphic parts, refs, native variables and custom action slots', () => {
    const link = createRef<HTMLAnchorElement>();
    const title = createRef<HTMLHeadingElement>();
    const root = createRef<HTMLElement>();
    const theme = createTheme({
      components: {
        ActionIcon: { defaultProps: { radius: 'xl' } },
        ArtifactAction: ArtifactAction.extend({
          styles: { icon: { color: 'rgb(1, 2, 3)' } },
          defaultProps: { attributes: { root: { 'data-test': 'action' } } },
        }),
        ArtifactTitle: ArtifactTitle.extend({ defaultProps: { fw: 700 } }),
        ArtifactClose: ArtifactClose.extend({
          defaultProps: { label: 'Dismiss' },
        }),
      },
    });
    render(
      <MantineProvider theme={theme} env="test">
        <Artifact
          component="section"
          ref={root}
          radius={20}
          aria-label="Artifact panel"
        >
          <ArtifactTitle component="h2" ref={title}>
            Result
          </ArtifactTitle>
        </Artifact>
        <ArtifactAction
          component="a"
          href="#result"
          ref={link}
          tooltip="Open output"
          icon={<span aria-hidden>Icon</span>}
        >
          Ignored
        </ArtifactAction>
        <ArtifactClose aria-label="Close output">Custom</ArtifactClose>
      </MantineProvider>,
    );
    expect(root.current?.tagName).toBe('SECTION');
    expect(title.current).toBe(screen.getByRole('heading', { name: 'Result' }));
    expect(title.current).toHaveStyle({ fontWeight: 700 });
    expect(link.current).toBe(
      screen.getByRole('link', { name: 'Open output' }),
    );
    expect(link.current).toHaveAttribute('href', '#result');
    expect(link.current).toHaveAttribute('data-test', 'action');
    expect(link.current?.style.getPropertyValue('--ai-radius')).toBe(
      'var(--mantine-radius-xl)',
    );
    expect(screen.getByText('Icon').parentElement).toHaveStyle({
      color: 'rgb(1, 2, 3)',
    });
    expect(screen.queryByText('Ignored')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Close output' }),
    ).toHaveTextContent('Custom');
  });
});
