import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PromptInput, PromptInputButton, PromptInputCommand } from '../index';

describe('PromptInput controls', () => {
  it('filters by keywords, skips disabled commands, and selects with Enter without submitting the prompt', async () => {
    const select = vi.fn();
    const submit = vi.fn();
    render(
      <MantineProvider>
        <PromptInput onSubmit={submit}>
          <PromptInput.Command loop label="Sources">
            <PromptInput.Command.Input aria-label="Search sources" />
            <PromptInput.Command.List>
              <PromptInput.Command.Empty>No sources</PromptInput.Command.Empty>
              <PromptInput.Command.Group heading="Documents">
                <PromptInput.Command.Item
                  value="hidden"
                  disabled
                  onSelect={select}
                >
                  Unavailable
                </PromptInput.Command.Item>
                <PromptInput.Command.Item
                  value="guide"
                  keywords={['manual']}
                  onSelect={select}
                >
                  Guide
                </PromptInput.Command.Item>
                <PromptInput.Command.Item value="notes" onSelect={select}>
                  Notes
                </PromptInput.Command.Item>
              </PromptInput.Command.Group>
              <PromptInput.Command.Separator />
            </PromptInput.Command.List>
          </PromptInput.Command>
          <PromptInput.Textarea
            defaultValue="Keep draft"
            aria-label="Message"
          />
          <PromptInput.Submit />
        </PromptInput>
      </MantineProvider>,
    );
    const input = screen.getByRole('combobox', { name: 'Search sources' });
    await userEvent.type(input, 'manual{Enter}');
    expect(select).toHaveBeenCalledWith('guide');
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue(
      'Keep draft',
    );
    await userEvent.clear(input);
    await userEvent.type(input, 'nothing');
    expect(screen.getByText('No sources')).toBeVisible();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}');
    expect(select).toHaveBeenLastCalledWith('notes');
  });

  it('opens Mantine menus, respects action cancellation, and applies extension themes and refs', async () => {
    const ref = createRef<HTMLInputElement>();
    const buttonRef = createRef<HTMLButtonElement>();
    const theme = createTheme({
      components: {
        PromptInputButton: PromptInputButton.extend({
          styles: { root: { borderRadius: 19 } },
        }),
        PromptInputCommand: PromptInputCommand.extend({
          styles: { item: { padding: 17 } },
        }),
      },
    });
    render(
      <MantineProvider theme={theme}>
        <PromptInput onSubmit={() => {}}>
          <PromptInput.ActionMenu hideDetached={false}>
            <PromptInput.ActionMenuTrigger
              ref={buttonRef}
              tooltip={{ content: 'Attach', shortcut: '⌘U' }}
            />
            <PromptInput.ActionMenuContent>
              <PromptInput.ActionAddAttachments
                onClick={(event) => event.preventDefault()}
              />
            </PromptInput.ActionMenuContent>
          </PromptInput.ActionMenu>
          <PromptInput.Command>
            <PromptInput.Command.Input ref={ref} aria-label="Search" />
            <PromptInput.Command.List>
              <PromptInput.Command.Item value="file">
                File
              </PromptInput.Command.Item>
            </PromptInput.Command.List>
          </PromptInput.Command>
        </PromptInput>
      </MantineProvider>,
    );
    const upload = vi.spyOn(screen.getByLabelText('Upload files'), 'click');
    expect(ref.current).toBe(screen.getByRole('combobox'));
    expect(buttonRef.current).toHaveStyle({ borderRadius: '19px' });
    expect(screen.getByRole('option')).toHaveStyle({ padding: '17px' });
    fireEvent.focus(buttonRef.current as HTMLButtonElement);
    await waitFor(() =>
      expect(screen.getByRole('tooltip')).toHaveTextContent('⌘U'),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Add to prompt' }),
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Add photos or files' }),
    );
    expect(upload).not.toHaveBeenCalled();
  });
});
