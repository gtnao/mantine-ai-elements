import type { FileUIPart, SourceDocumentUIPart } from 'ai';
export type AttachmentData = (FileUIPart | SourceDocumentUIPart) & {
  id: string;
};
export type AttachmentVariant = 'grid' | 'inline' | 'list';
export type AttachmentMediaCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'source'
  | 'unknown';
export function getMediaCategory(
  data: AttachmentData,
): AttachmentMediaCategory {
  if (data.type === 'source-document') return 'source';
  const topLevel = data.mediaType?.split('/')[0];
  if (topLevel === 'image' || topLevel === 'video' || topLevel === 'audio')
    return topLevel;
  return topLevel === 'application' || topLevel === 'text'
    ? 'document'
    : 'unknown';
}
export function getAttachmentLabel(data: AttachmentData): string {
  if (data.type === 'source-document')
    return data.title || data.filename || 'Source';
  return (
    data.filename ||
    (getMediaCategory(data) === 'image' ? 'Image' : 'Attachment')
  );
}
