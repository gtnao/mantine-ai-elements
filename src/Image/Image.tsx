'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  type ImageCssVariables,
  Image as MantineImage,
  type ImageProps as MantineImageProps,
  type PolymorphicFactory,
  polymorphicFactory,
  useProps,
  useStyles,
} from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type { GeneratedFile } from 'ai';
import { useEffect, useRef, useState } from 'react';

export type ImageProps = Omit<MantineImageProps, 'src'> & {
  alt?: string;
  /** Accepted for compatibility with AI SDK image data; rendering uses base64. */
  uint8Array?: GeneratedFile['uint8Array'];
  providerMetadata?: GeneratedFile['providerMetadata'];
} & (
    | {
        base64: GeneratedFile['base64'];
        mediaType: GeneratedFile['mediaType'];
        src?: never;
      }
    | { src: string; base64?: never; mediaType?: never }
  );
export type ImageFactory = PolymorphicFactory<{
  props: ImageProps;
  defaultComponent: 'img';
  defaultRef: HTMLImageElement;
  stylesNames: 'root';
  vars: ImageCssVariables;
}>;
export const Image = polymorphicFactory<ImageFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'AIImage',
    { radius: 'md', w: 'auto', maw: '100%', h: 'auto', alt: '' },
    _props,
  );
  const {
    base64,
    mediaType,
    src,
    uint8Array: _bytes,
    providerMetadata: _metadata,
    fallbackSrc,
    onError,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
    ...others
  } = props;
  const getStyles = useStyles<ImageFactory>({
    name: 'AIImage',
    classes: {},
    props,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
  });
  const root = getStyles('root');
  const imageRef = useRef<HTMLImageElement>(null);
  const mergedRef = useMergedRef(imageRef, ref);
  const source =
    base64 !== undefined ? `data:${mediaType};base64,${base64}` : src;
  // Keep failures tied to the requested source. An effect-based reset can race
  // a cached image error and replace a working fallback with the broken source.
  const [loadState, setLoadState] = useState({ source, failed: !source });
  if (loadState.source !== source) setLoadState({ source, failed: !source });
  const fallback =
    loadState.source === source && loadState.failed && Boolean(fallbackSrc);
  useEffect(() => {
    const element = imageRef.current;
    // An SSR image can finish (and fail) before React attaches its event handler.
    if (
      element instanceof HTMLImageElement &&
      element.complete &&
      element.naturalWidth === 0 &&
      element.currentSrc
    ) {
      setLoadState({ source, failed: true });
    }
  }, [source]);
  return (
    <MantineImage
      {...others}
      ref={mergedRef}
      unstyled={unstyled}
      src={fallback ? fallbackSrc : source}
      fallbackSrc=""
      data-fallback={fallback || undefined}
      onError={(event) => {
        setLoadState({ source, failed: true });
        onError?.(event);
      }}
      classNames={{ root: root.className }}
      styles={{ root: root.style }}
    />
  );
});
Image.displayName = 'AIImage';
/** Alias to distinguish this component from Mantine's Image import. */
export const AIImage = Image;
