import { Button, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentHoverCard } from './AttachmentHoverCard';
import { Attachment, Attachments } from './Attachments';
import {
  type AttachmentData,
  getAttachmentLabel,
  getMediaCategory,
} from './attachment-data';

const file: AttachmentData = {
  id: 'file',
  type: 'file',
  mediaType: 'image',
  url: '/chart.png',
  filename: 'Chart',
};

describe('Attachments', () => {
  it('previews SDK top-level media types, falls back on load failure, and preserves source document labels', () => {
    const source: AttachmentData = {
      id: 'source',
      type: 'source-document',
      sourceId: 'docs',
      title: 'API reference',
      mediaType: 'text/html',
      filename: 'api.html',
    };
    expect(getMediaCategory(source)).toBe('source');
    expect(getAttachmentLabel(source)).toBe('API reference');
    render(
      <MantineProvider>
        <Attachments variant="list">
          <Attachment data={file}>
            <Attachment.Preview
              fallbackIcon={<span>Preview unavailable</span>}
            />
            <Attachment.Info showMediaType />
          </Attachment>
          <Attachment data={source}>
            <Attachment.Info showMediaType />
            <Attachment.Remove />
          </Attachment>
        </Attachments>
      </MantineProvider>,
    );
    fireEvent.error(screen.getByRole('img', { name: 'Chart' }));
    expect(screen.getByText('Preview unavailable')).toBeVisible();
    expect(screen.getByText('text/html')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Remove' }),
    ).not.toBeInTheDocument();
  });
  it('composes cancellable removal without bubbling or submitting and inherits layout changes', async () => {
    const user = userEvent.setup();
    const remove = vi.fn();
    const parentClick = vi.fn();
    const view = (cancel: boolean, variant: 'grid' | 'list') => (
      <MantineProvider>
        <Attachments variant={variant} onClick={parentClick}>
          <Attachment data={file} onRemove={remove}>
            <Attachment.Info />
            <Attachment.Remove
              onClick={(event) => {
                if (cancel) event.preventDefault();
              }}
            />
          </Attachment>
        </Attachments>
      </MantineProvider>
    );
    const { rerender } = render(view(true, 'grid'));
    expect(screen.queryByText('Chart')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(remove).not.toHaveBeenCalled();
    expect(parentClick).not.toHaveBeenCalled();
    rerender(view(false, 'list'));
    expect(screen.getByText('Chart')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(remove).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
  });
});
describe('AttachmentHoverCard', () => {
  it('does not open after the preview is disabled during its delay', async () => {
    const change = vi.fn();
    const view = (disabled: boolean) => (
      <MantineProvider>
        <AttachmentHoverCard
          disabled={disabled}
          openDelay={40}
          onChange={change}
        >
          <AttachmentHoverCard.Trigger>
            <Button>Preview</Button>
          </AttachmentHoverCard.Trigger>
          <AttachmentHoverCard.Content>Details</AttachmentHoverCard.Content>
        </AttachmentHoverCard>
      </MantineProvider>
    );
    const { rerender } = render(view(false));
    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Preview' }), {
      pointerType: 'mouse',
    });
    rerender(view(true));
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(change).not.toHaveBeenCalled();
  });
  it('opens on keyboard focus and dismisses once with Escape', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <MantineProvider>
        <AttachmentHoverCard
          hideDetached={false}
          onChange={change}
          transitionProps={{ duration: 0 }}
        >
          <AttachmentHoverCard.Trigger>
            <Button>Preview document</Button>
          </AttachmentHoverCard.Trigger>
          <AttachmentHoverCard.Content>
            Document details
          </AttachmentHoverCard.Content>
        </AttachmentHoverCard>
      </MantineProvider>,
    );
    await user.tab();
    await waitFor(() =>
      expect(screen.getByText('Document details')).toBeVisible(),
    );
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByText('Document details')).not.toBeInTheDocument(),
    );
    expect(change.mock.calls).toEqual([[true], [false]]);
  });
  it('cancels delayed opening on Escape and honors controlled state and event cancellation', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <MantineProvider>
        <AttachmentHoverCard openDelay={40} onChange={change}>
          <AttachmentHoverCard.Trigger>
            <Button>Delayed preview</Button>
          </AttachmentHoverCard.Trigger>
          <AttachmentHoverCard.Content>
            Delayed details
          </AttachmentHoverCard.Content>
        </AttachmentHoverCard>
      </MantineProvider>,
    );
    await user.tab();
    await user.keyboard('{Escape}');
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(change).not.toHaveBeenCalledWith(true);
    rerender(
      <MantineProvider>
        <AttachmentHoverCard
          hideDetached={false}
          opened
          onChange={change}
          transitionProps={{ duration: 0 }}
        >
          <AttachmentHoverCard.Trigger>
            <Button onFocus={(event) => event.preventDefault()}>
              Controlled preview
            </Button>
          </AttachmentHoverCard.Trigger>
          <AttachmentHoverCard.Content>
            Controlled details
          </AttachmentHoverCard.Content>
        </AttachmentHoverCard>
      </MantineProvider>,
    );
    await waitFor(() =>
      expect(screen.getByText('Controlled details')).toBeVisible(),
    );
    await user.keyboard('{Escape}');
    expect(change).toHaveBeenLastCalledWith(false);
    expect(screen.getByText('Controlled details')).toBeVisible();
  });
});
