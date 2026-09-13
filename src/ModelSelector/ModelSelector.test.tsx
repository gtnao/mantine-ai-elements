import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ModelSelector } from './ModelSelector';

describe('ModelSelector', () => {
  it('opens from a non-submit button, filters, selects, and restores focus', async () => {
    const onSelect = vi.fn();
    function Demo() {
      const [opened, setOpened] = useState(false);
      return (
        <ModelSelector
          opened={opened}
          onChange={setOpened}
          transitionProps={{ duration: 0 }}
        >
          <ModelSelector.Trigger>Select model</ModelSelector.Trigger>
          <ModelSelector.Content>
            <ModelSelector.Input aria-label="Find model" data-autofocus />
            <ModelSelector.List>
              <ModelSelector.Empty>No models</ModelSelector.Empty>
              <ModelSelector.Group heading="Models">
                <ModelSelector.Item disabled value="unavailable">
                  Unavailable
                </ModelSelector.Item>
                <ModelSelector.Item
                  value="swift"
                  keywords={['fast']}
                  onSelect={(value) => {
                    onSelect(value);
                    setOpened(false);
                  }}
                >
                  <ModelSelector.Name>Swift</ModelSelector.Name>
                  <ModelSelector.Shortcut>⌘1</ModelSelector.Shortcut>
                </ModelSelector.Item>
                <ModelSelector.Item value="deep">Deep</ModelSelector.Item>
              </ModelSelector.Group>
            </ModelSelector.List>
          </ModelSelector.Content>
        </ModelSelector>
      );
    }
    render(
      <MantineProvider>
        <Demo />
      </MantineProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'Select model' });
    expect(trigger).toHaveAttribute('type', 'button');
    await userEvent.click(trigger);
    const search = await screen.findByRole('combobox', { name: 'Find model' });
    expect(
      screen.getByRole('dialog', { name: 'Model selector' }),
    ).toBeInTheDocument();
    await userEvent.type(search, 'missing');
    expect(screen.getByText('No models')).toBeVisible();
    await userEvent.clear(search);
    await userEvent.type(search, 'fast{Enter}');
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('swift');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('supports standalone controlled dialogs, cancellation, theme styles and content refs', async () => {
    const change = vi.fn();
    const ref = createRef<HTMLDivElement>();
    const theme = createTheme({
      components: {
        ModelSelector: ModelSelector.extend({
          styles: { content: { borderRadius: 23 } },
        }),
      },
    });
    render(
      <MantineProvider theme={theme}>
        <ModelSelector.Dialog
          ref={ref}
          opened
          onChange={change}
          title="Pick a model"
          transitionProps={{ duration: 0 }}
        >
          <ModelSelector.Input aria-label="Models" />
          <ModelSelector.List>
            <ModelSelector.Item value="local">Local</ModelSelector.Item>
          </ModelSelector.List>
        </ModelSelector.Dialog>
      </MantineProvider>,
    );
    expect(screen.getByRole('dialog')).toHaveStyle({ borderRadius: '23px' });
    expect(ref.current).not.toBeNull();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(change).toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('allows a custom logo URL, encoded provider paths, fallbacks and accessible alternatives', () => {
    const view = render(
      <MantineProvider>
        <ModelSelector.Logo
          provider="custom/team"
          fallbackSrc="/fallback.svg"
        />
      </MantineProvider>,
    );
    const img = screen.getByRole('img', { name: 'custom/team logo' });
    expect(img).toHaveAttribute(
      'src',
      'https://models.dev/logos/custom%2Fteam.svg',
    );
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', '/fallback.svg');
    view.rerender(
      <MantineProvider>
        <ModelSelector.Logo
          provider="custom/team"
          src="/custom.svg"
          alt="Local provider"
        />
      </MantineProvider>,
    );
    expect(screen.getByRole('img', { name: 'Local provider' })).toHaveAttribute(
      'src',
      '/custom.svg',
    );
    expect(screen.getByRole('img')).not.toHaveAttribute('data-invert');
  });
});
