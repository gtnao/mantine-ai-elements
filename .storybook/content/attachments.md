# Attachments

Display AI SDK file parts and source documents in thumbnail grids, inline badges, or full-width lists. The application owns the attachment array and removal behavior.

```tsx
import { Attachment, Attachments, type AttachmentData } from 'mantine-ai-elements';

<Attachments variant="list">
  {files.map((file: AttachmentData) => (
    <Attachment key={file.id} data={file} onRemove={() => removeFile(file.id)}>
      <Attachment.Preview />
      <Attachment.Info showMediaType />
      <Attachment.Remove label={`Remove ${file.filename ?? 'attachment'}`} />
    </Attachment>
  ))}
</Attachments>
```

`AttachmentData` is `(FileUIPart | SourceDocumentUIPart) & { id: string }`. Supply stable IDs. When rendering `UIMessage.parts`, use each part's actual AI SDK type; source documents require `sourceId`, `title`, and `mediaType` and do not have a URL field. File parts provide `url`, `mediaType`, and optional `filename`.

These components display existing data. They do not upload files, create or revoke object URLs, modify AI SDK messages, or implement audio/video generation. The owner of a temporary URL must release it when it is no longer needed.

## Composition

- `Attachments` chooses `variant="grid"` (default), `"inline"`, or `"list"`. Grid uses 96px thumbnails; inline uses compact badges; list shows full-width rows. A standalone Attachment defaults to grid.
- `Attachment` supplies `data` and optional `onRemove` to its children.
- `Attachment.Preview` displays an image, muted video, or media-category icon. `fallbackIcon` replaces the icon; image/video load failures fall back to it. `imageProps` and `videoProps` customize the media element, including alternative text, loading, and controls. The source URL always comes from `data.url`.
- `Attachment.Info` displays the name and optional media type; it is hidden in grid mode. Provide children for custom or localized information.
- `Attachment.Remove` is absent when no `onRemove` is provided. It accepts Mantine ActionIcon props, `label`, and custom children. It stops click propagation and calls your `onClick` before removal; `preventDefault()` cancels removal. It does not submit a form.
- `Attachments.Empty` displays “No attachments” or your custom children; render it when your array is empty.

Named `AttachmentPreview`, `AttachmentInfo`, `AttachmentRemove`, and `AttachmentEmpty` exports refer to the same implementations.

`getMediaCategory` returns `image`, `video`, `audio`, `document`, `source`, or `unknown`. Both complete MIME types and AI SDK's top-level types such as `image` are accepted. `getAttachmentLabel` prefers a source title, then filename, with English fallbacks. `useAttachmentsContext` exposes the layout; `useAttachmentContext` exposes data, category, layout, and removal and requires an Attachment parent.

## Hover and focus previews

```tsx
<AttachmentHoverCard closeDelay={100}>
  <AttachmentHoverCard.Trigger>
    <Attachment data={file} tabIndex={0}>
      <Attachment.Preview />
      <Attachment.Info />
    </Attachment>
  </AttachmentHoverCard.Trigger>
  <AttachmentHoverCard.Content>Additional file details</AttachmentHoverCard.Content>
</AttachmentHoverCard>
```

Use `variant="inline"` on the surrounding Attachments for this pattern. Trigger requires one element that forwards a ref. Add keyboard focusability to non-interactive targets as shown. Names `AttachmentHoverCardTrigger` and `AttachmentHoverCardContent` are also exported.

The preview opens on pointer entry or keyboard focus. `openDelay` and `closeDelay` default to zero. Moving between trigger and content retains the preview, and Escape dismisses it, including a pending delayed opening. Selecting text inside the content keeps it available. The content uses Mantine Popover, with its portal, positioning, roles, and outside-click behavior.

Use Mantine's `opened`, `defaultOpened`, and `onChange` for controlled or uncontrolled state. `position="bottom-start"` and `offset={4}` are the defaults. These root props replace Radix's content-level `align`, `side`, and `sideOffset`; a single child replaces `asChild`. Content remains keyboard-interactive, unlike upstream's removal of descendants from the tab order. Touch focus can also reveal the preview.

## Mantine customization

Use `Attachments.extend` with the `root` selector. Use `Attachment.extend` with `root`, `preview`, `info`, `name`, `mediaType`, and `remove`. Box style props and root refs are forwarded. Child preview/info props can override their className and style. Remove also supports ActionIcon's Styles API and the `AttachmentRemove` theme key.

`AttachmentHoverCard.extend` themes Popover's `dropdown`, `arrow`, and `overlay` selectors. Content accepts Mantine Popover.Dropdown props. Trigger refs target the rendered element; Content refs target the dropdown.

Remove controls are visible on keyboard focus and touch devices, in addition to pointer hover. Light/dark colors come from Mantine. Long names truncate inside the selected layout.
