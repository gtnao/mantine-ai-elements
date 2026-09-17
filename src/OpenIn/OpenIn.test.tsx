import { Button, createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { OpenIn, OpenInChatGPT, OpenInItem, OpenInTrigger } from './OpenIn';

function Providers() {
  return (
    <>
      <OpenIn.ChatGPT />
      <OpenIn.Claude />
      <OpenIn.T3 />
      <OpenIn.Scira />
      <OpenIn.v0 />
      <OpenIn.Cursor />
    </>
  );
}
describe('OpenIn', () => {
  it('encodes the current query for all six providers while preserving native link behavior', () => {
    const query = '日本語 & key=value? # fragment\nSecond line + percent%';
    const { rerender } = render(
      <MantineProvider env="test">
        <OpenIn query={query} defaultOpened>
          <OpenIn.Trigger />
          <OpenIn.Content>
            <Providers />
          </OpenIn.Content>
        </OpenIn>
      </MantineProvider>,
    );
    const expected = [
      ['Open in ChatGPT', 'https://chatgpt.com/', 'prompt'],
      ['Open in Claude', 'https://claude.ai/new', 'q'],
      ['Open in T3 Chat', 'https://t3.chat/new', 'q'],
      ['Open in Scira', 'https://scira.ai/', 'q'],
      ['Open in v0', 'https://v0.app/', 'q'],
      ['Open in Cursor', 'https://cursor.com/link/prompt', 'text'],
    ];
    for (const [name, base, key] of expected) {
      const link = screen.getByRole('menuitem', { name });
      const url = new URL(link.getAttribute('href') ?? '');
      expect(`${url.origin}${url.pathname}`).toBe(base);
      expect(url.searchParams.get(key ?? '')).toBe(query);
      expect(url.hash).toBe('');
      expect(url.searchParams.has('key')).toBe(false);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    rerender(
      <MantineProvider env="test">
        <OpenIn query="" opened>
          <OpenIn.Content>
            <OpenIn.ChatGPT />
          </OpenIn.Content>
        </OpenIn>
      </MantineProvider>,
    );
    const url = new URL(
      screen.getByRole('menuitem').getAttribute('href') ?? '',
    );
    expect(url.searchParams.get('prompt')).toBe('');
    expect(url.searchParams.get('hints')).toBe('search');
  });
  it('honors controlled state, custom targets, refs, and cancellation of navigation', () => {
    const onChange = vi.fn();
    const triggerRef = createRef<HTMLButtonElement>();
    const linkRef = createRef<HTMLAnchorElement>();
    const { rerender } = render(
      <MantineProvider env="test">
        <OpenIn query="query" opened={false} onChange={onChange}>
          <OpenIn.Target>
            <Button ref={triggerRef}>Choose assistant</Button>
          </OpenIn.Target>
          <OpenIn.Content>
            <OpenIn.ChatGPT />
          </OpenIn.Content>
        </OpenIn>
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(triggerRef.current).toHaveAccessibleName('Choose assistant');
    rerender(
      <MantineProvider env="test">
        <OpenIn query="query" defaultOpened key="interactive">
          <OpenIn.Trigger />
          <OpenIn.Content>
            <OpenIn.ChatGPT
              ref={linkRef}
              closeMenuOnClick={false}
              href="/custom"
              target="_self"
              rel="author"
              onClick={(event) => event.preventDefault()}
              leftSection={null}
            >
              Custom destination
            </OpenIn.ChatGPT>
          </OpenIn.Content>
        </OpenIn>
      </MantineProvider>,
    );
    const link = screen.getByRole('menuitem', { name: 'Custom destination' });
    expect(linkRef.current).toBe(link);
    expect(link).toHaveAttribute('href', '/custom');
    expect(link).toHaveAttribute('target', '_self');
    expect(fireEvent.click(link)).toBe(false);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
  it('removes navigation from disabled anchors and skips them during initial keyboard navigation', () => {
    const onClick = vi.fn();
    render(
      <MantineProvider env="test">
        <OpenIn query="query" defaultOpened>
          <OpenIn.Content>
            <OpenIn.ChatGPT disabled onClick={onClick} />
            <OpenIn.Claude />
            <OpenIn.Item
              component="a"
              href="/disabled"
              disabled
              onClick={onClick}
            >
              Disabled custom link
            </OpenIn.Item>
            <OpenIn.Cursor data-disabled />
          </OpenIn.Content>
        </OpenIn>
      </MantineProvider>,
    );
    for (const name of [
      'Open in ChatGPT',
      'Disabled custom link',
      'Open in Cursor',
    ]) {
      const item = screen.getByRole('menuitem', { name });
      expect(item).not.toHaveAttribute('href');
      expect(item).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(item);
      fireEvent(
        item,
        new MouseEvent('auxclick', {
          bubbles: true,
          cancelable: true,
          button: 1,
        }),
      );
    }
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    expect(
      screen.getByRole('menuitem', { name: 'Open in Claude' }),
    ).toHaveFocus();
  });
  it('applies menu and individual item/trigger themes to native Mantine slots', () => {
    const ref = createRef<HTMLButtonElement>();
    const theme = createTheme({
      components: {
        OpenIn: OpenIn.extend({
          styles: {
            dropdown: { borderRadius: 18 },
            itemSection: { width: 20 },
          },
        }),
        OpenInChatGPT: OpenInChatGPT.extend({
          styles: { itemLabel: { fontWeight: 900 } },
        }),
        OpenInItem: OpenInItem.extend({
          styles: { item: { color: 'rgb(1, 2, 3)' } },
        }),
        OpenInTrigger: OpenInTrigger.extend({
          styles: { label: { fontStyle: 'italic' } },
        }),
      },
    });
    render(
      <MantineProvider env="test" theme={theme}>
        <OpenIn query="query" defaultOpened>
          <OpenIn.Trigger ref={ref} />
          <OpenIn.Content>
            <OpenIn.Label>Assistants</OpenIn.Label>
            <OpenIn.ChatGPT />
            <OpenIn.Separator />
            <OpenIn.Item>Custom action</OpenIn.Item>
          </OpenIn.Content>
        </OpenIn>
      </MantineProvider>,
    );
    expect(screen.getByRole('menu')).toHaveStyle({ borderRadius: '18px' });
    expect(screen.getByText('Open in ChatGPT')).toHaveStyle({
      fontWeight: 900,
    });
    expect(screen.getByRole('menuitem', { name: 'Custom action' })).toHaveStyle(
      { color: 'rgb(1, 2, 3)' },
    );
    expect(screen.getByText('Open in chat')).toHaveStyle({
      fontStyle: 'italic',
    });
    expect(ref.current).toHaveAttribute('type', 'button');
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
