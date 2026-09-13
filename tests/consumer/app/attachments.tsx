'use client';
import {
  Attachment,
  type AttachmentData,
  AttachmentHoverCard,
  Attachments,
} from 'mantine-ai-elements';
import { useState } from 'react';

const initial: AttachmentData[] = [
  {
    id: 'image',
    type: 'file',
    filename: 'Preview image',
    mediaType: 'image/svg+xml',
    url:
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24" fill="purple"/></svg>',
      ),
  },
  {
    id: 'video',
    type: 'file',
    filename: 'Preview video',
    mediaType: 'video/webm',
    url: '/attachment-preview.webm',
  },
];
const source: AttachmentData = {
  id: 'source',
  type: 'source-document',
  sourceId: 'docs',
  title: 'Reference document',
  mediaType: 'text/html',
};
export default function AttachmentExample() {
  const [files, setFiles] = useState(initial);
  return (
    <section data-testid="attachments-example">
      <Attachments variant="list">
        {files.map((file) => (
          <Attachment
            data={file}
            key={file.id}
            onRemove={() =>
              setFiles((items) => items.filter((item) => item.id !== file.id))
            }
          >
            <Attachment.Preview />
            <Attachment.Info showMediaType />
            <Attachment.Remove label={`Remove ${file.filename}`} />
          </Attachment>
        ))}
      </Attachments>
      <Attachments variant="inline">
        <AttachmentHoverCard>
          <AttachmentHoverCard.Trigger>
            <Attachment data={source} tabIndex={0}>
              <Attachment.Info />
            </Attachment>
          </AttachmentHoverCard.Trigger>
          <AttachmentHoverCard.Content>
            Verified source details
          </AttachmentHoverCard.Content>
        </AttachmentHoverCard>
      </Attachments>
    </section>
  );
}
