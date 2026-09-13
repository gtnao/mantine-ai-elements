'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  ActionIcon,
  type ActionIconProps,
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  factory,
  Image,
  type ImageProps,
  type StylesApiProps,
  Text,
  useProps,
  useStyles,
} from '@mantine/core';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useState,
} from 'react';
import classes from './Attachments.module.css';
import {
  type AttachmentData,
  type AttachmentMediaCategory,
  type AttachmentVariant,
  getAttachmentLabel,
  getMediaCategory,
} from './attachment-data';

const CollectionContext = createContext<{ variant: AttachmentVariant } | null>(
  null,
);
export interface AttachmentContextValue {
  data: AttachmentData;
  mediaCategory: AttachmentMediaCategory;
  onRemove?: () => void;
  variant: AttachmentVariant;
}
const ItemContext = createContext<AttachmentContextValue | null>(null);
const StylesContext = createContext<ReturnType<
  typeof useStyles<AttachmentFactory>
> | null>(null);
export const useAttachmentsContext = () =>
  useContext(CollectionContext) ?? { variant: 'grid' as const };
export function useAttachmentContext() {
  const context = useContext(ItemContext);
  if (!context)
    throw new Error('Attachment components must be used within Attachment');
  return context;
}
function useAttachmentStyles() {
  const styles = useContext(StylesContext);
  if (!styles)
    throw new Error('Attachment components must be used within Attachment');
  return styles;
}
export interface AttachmentsProps
  extends BoxProps,
    StylesApiProps<AttachmentsFactory>,
    ElementProps<'div'> {
  variant?: AttachmentVariant;
}
export type AttachmentsFactory = Factory<{
  props: AttachmentsProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
  variant: AttachmentVariant;
  staticComponents: { Empty: typeof AttachmentEmpty };
}>;
export const Attachments = factory<AttachmentsFactory>(({ ref, ..._props }) => {
  const props = useProps('Attachments', { variant: 'grid' }, _props);
  const {
    variant = 'grid',
    children,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
    attributes,
    ...others
  } = props;
  const getStyles = useStyles<AttachmentsFactory>({
    name: 'Attachments',
    classes: { root: classes.collection },
    props,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
    attributes,
  });
  return (
    <CollectionContext.Provider value={{ variant }}>
      <Box {...others} {...getStyles('root')} ref={ref} data-variant={variant}>
        {children}
      </Box>
    </CollectionContext.Provider>
  );
});
export interface AttachmentProps
  extends BoxProps,
    StylesApiProps<AttachmentFactory>,
    ElementProps<'div'> {
  data: AttachmentData;
  onRemove?: () => void;
}
export type AttachmentFactory = Factory<{
  props: AttachmentProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'preview' | 'info' | 'name' | 'mediaType' | 'remove';
  staticComponents: {
    Preview: typeof AttachmentPreview;
    Info: typeof AttachmentInfo;
    Remove: typeof AttachmentRemove;
  };
}>;
export const Attachment = factory<AttachmentFactory>(({ ref, ..._props }) => {
  const props = useProps('Attachment', {}, _props);
  const {
    data,
    onRemove,
    children,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
    attributes,
    ...others
  } = props;
  const { variant } = useAttachmentsContext();
  const getStyles = useStyles<AttachmentFactory>({
    name: 'Attachment',
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
    attributes,
  });
  return (
    <ItemContext.Provider
      value={{ data, onRemove, variant, mediaCategory: getMediaCategory(data) }}
    >
      <StylesContext.Provider value={getStyles}>
        <Box
          {...others}
          {...getStyles('root')}
          ref={ref}
          data-variant={variant}
        >
          {children}
        </Box>
      </StylesContext.Provider>
    </ItemContext.Provider>
  );
});
const categoryPaths: Record<AttachmentMediaCategory, string> = {
  image: 'M3 3h18v18H3z M3 17l6-6 4 4 3-3 5 5 M8 7h.01',
  video: 'M3 6h12v12H3z M15 10l6-3v10l-6-3',
  audio:
    'M9 18V5l12-2v13 M9 8l12-2 M9 18a3 3 0 1 1-3-3h3 M21 16a3 3 0 1 1-3-3h3',
  document: 'M5 3h10l4 4v14H5z M14 3v5h5 M8 12h8 M8 16h6',
  source:
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M3 12h18 M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  unknown: 'M8 13l7-7a3 3 0 0 1 4 4l-9 9a5 5 0 0 1-7-7l9-9 M6 15l8-8',
};
export interface AttachmentPreviewProps extends BoxProps, ElementProps<'div'> {
  fallbackIcon?: ReactNode;
  imageProps?: Omit<ImageProps & ElementProps<'img', 'color'>, 'src'>;
  videoProps?: Omit<ComponentProps<'video'>, 'src'>;
}
export const AttachmentPreview = factory<{
  props: AttachmentPreviewProps;
  ref: HTMLDivElement;
}>(
  ({
    ref,
    fallbackIcon,
    imageProps,
    videoProps,
    className,
    style,
    ...props
  }) => {
    const { data, mediaCategory } = useAttachmentContext();
    const getStyles = useAttachmentStyles();
    const [failed, setFailed] = useState<string | null>(null);
    const url = data.type === 'file' ? data.url : undefined;
    const fallback = fallbackIcon ?? (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        role="img"
        aria-label={getAttachmentLabel(data)}
      >
        <path d={categoryPaths[mediaCategory]} />
      </svg>
    );
    return (
      <Box {...props} {...getStyles('preview', { className, style })} ref={ref}>
        {url && failed !== url && mediaCategory === 'image' ? (
          <Image
            alt={getAttachmentLabel(data)}
            fit="cover"
            w="100%"
            h="100%"
            {...imageProps}
            src={url}
            onError={(event) => {
              setFailed(url);
              imageProps?.onError?.(event);
            }}
          />
        ) : url && failed !== url && mediaCategory === 'video' ? (
          <video
            muted
            playsInline
            preload="metadata"
            aria-label={getAttachmentLabel(data)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            {...videoProps}
            src={url}
            onError={(event) => {
              setFailed(url);
              videoProps?.onError?.(event);
            }}
          />
        ) : (
          fallback
        )}
      </Box>
    );
  },
);
export interface AttachmentInfoProps extends BoxProps, ElementProps<'div'> {
  showMediaType?: boolean;
}
export const AttachmentInfo = factory<{
  props: AttachmentInfoProps;
  ref: HTMLDivElement;
}>(({ ref, showMediaType = false, children, className, style, ...props }) => {
  const { data, variant } = useAttachmentContext();
  const getStyles = useAttachmentStyles();
  if (variant === 'grid') return null;
  return (
    <Box {...props} {...getStyles('info', { className, style })} ref={ref}>
      {children ?? (
        <>
          <Text {...getStyles('name')}>{getAttachmentLabel(data)}</Text>
          {showMediaType && data.mediaType && (
            <Text {...getStyles('mediaType')}>{data.mediaType}</Text>
          )}
        </>
      )}
    </Box>
  );
});
export interface AttachmentRemoveProps
  extends ActionIconProps,
    ElementProps<'button', 'color'> {
  label?: string;
}
export const AttachmentRemove = factory<{
  props: AttachmentRemoveProps;
  ref: HTMLButtonElement;
}>(({ ref, ..._props }) => {
  const { label, children, className, style, onClick, ...props } = useProps(
    'AttachmentRemove',
    { label: 'Remove', variant: 'subtle', size: 'sm' },
    _props,
  );
  const { onRemove } = useAttachmentContext();
  const getStyles = useAttachmentStyles();
  if (!onRemove) return null;
  return (
    <ActionIcon
      {...props}
      {...getStyles('remove', { className, style })}
      __staticSelector="AttachmentRemove"
      ref={ref}
      type="button"
      aria-label={props['aria-label'] ?? label}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          !props.disabled &&
          !props.loading &&
          !props['data-disabled']
        )
          onRemove();
      }}
    >
      {children ?? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 6 12 12M6 18 18 6" />
        </svg>
      )}
    </ActionIcon>
  );
});
export interface AttachmentEmptyProps extends BoxProps, ElementProps<'div'> {}
export const AttachmentEmpty = factory<{
  props: AttachmentEmptyProps;
  ref: HTMLDivElement;
}>(({ ref, children, ...props }) => (
  <Box p="md" c="dimmed" fz="sm" ta="center" {...props} ref={ref}>
    {children ?? 'No attachments'}
  </Box>
));
Attachments.displayName = 'Attachments';
Attachment.displayName = 'Attachment';
AttachmentPreview.displayName = 'Attachment.Preview';
AttachmentInfo.displayName = 'Attachment.Info';
AttachmentRemove.displayName = 'Attachment.Remove';
AttachmentEmpty.displayName = 'Attachments.Empty';
Attachment.classes = classes;
Attachments.classes = { root: classes.collection };
Attachment.Preview = AttachmentPreview;
Attachment.Info = AttachmentInfo;
Attachment.Remove = AttachmentRemove;
Attachments.Empty = AttachmentEmpty;
