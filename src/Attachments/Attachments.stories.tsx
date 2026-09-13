import {
  Button,
  createTheme,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Attachment,
  type AttachmentData,
  AttachmentHoverCard,
  Attachments,
  getAttachmentLabel,
} from '../index';

const illustration =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="#e5dbff"/><path d="M8 76 36 32 54 60 70 42 90 76Z" fill="#7950f2"/><circle cx="70" cy="20" r="8" fill="#fcc419"/></svg>',
  );
const files: AttachmentData[] = [
  {
    id: 'image',
    type: 'file',
    mediaType: 'image/svg+xml',
    filename: 'Landscape.svg',
    url: illustration,
  },
  {
    id: 'document',
    type: 'file',
    mediaType: 'application/pdf',
    filename: 'Project requirements.pdf',
    url: '',
  },
  {
    id: 'audio',
    type: 'file',
    mediaType: 'audio/mpeg',
    filename: 'Interview.mp3',
    url: '',
  },
  {
    id: 'source',
    type: 'source-document',
    sourceId: 'reference',
    mediaType: 'text/html',
    title: 'API reference',
    filename: 'reference.html',
  },
];
const meta = { title: 'Attachments', component: Attachments } satisfies Meta<
  typeof Attachments
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: () => {
    const [items, setItems] = useState(files);
    return (
      <Stack>
        <Attachments>
          {items.map((file) => (
            <Attachment
              key={file.id}
              data={file}
              onRemove={() =>
                setItems((current) =>
                  current.filter((item) => item.id !== file.id),
                )
              }
            >
              <Attachment.Preview />
              <Attachment.Remove label={`Remove ${getAttachmentLabel(file)}`} />
            </Attachment>
          ))}
          {items.length === 0 && <Attachments.Empty />}
        </Attachments>
        <Button variant="subtle" onClick={() => setItems(files)}>
          Restore attachments
        </Button>
      </Stack>
    );
  },
};
export const List: Story = {
  render: () => (
    <Attachments variant="list">
      {files.map((file) => (
        <Attachment key={file.id} data={file}>
          <Attachment.Preview />
          <Attachment.Info showMediaType />
        </Attachment>
      ))}
    </Attachments>
  ),
};
export const InlinePreview: Story = {
  render: () => (
    <Attachments variant="inline">
      {files.map((file) => (
        <AttachmentHoverCard key={file.id} closeDelay={100}>
          <AttachmentHoverCard.Trigger>
            <Attachment data={file} tabIndex={0}>
              <Attachment.Preview />
              <Attachment.Info />
            </Attachment>
          </AttachmentHoverCard.Trigger>
          <AttachmentHoverCard.Content>
            <Stack gap="xs">
              <Text fw={600}>{getAttachmentLabel(file)}</Text>
              <Text size="sm">{file.mediaType}</Text>
            </Stack>
          </AttachmentHoverCard.Content>
        </AttachmentHoverCard>
      ))}
    </Attachments>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Attachment: Attachment.extend({
            styles: {
              root: {
                borderColor: 'var(--mantine-color-grape-5)',
                borderRadius: 20,
              },
              preview: { background: 'var(--mantine-color-grape-light)' },
              name: { fontWeight: 700 },
            },
          }),
          Attachments: Attachments.extend({
            defaultProps: { variant: 'list' },
            styles: { root: { gap: 16 } },
          }),
        },
      })}
    >
      <Attachments>
        {files.slice(0, 2).map((file) => (
          <Attachment key={file.id} data={file}>
            <Attachment.Preview />
            <Attachment.Info showMediaType />
          </Attachment>
        ))}
      </Attachments>
    </MantineProvider>
  ),
};
