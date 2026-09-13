'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  factory,
  type StylesApiProps,
  useProps,
  useStyles,
} from '@mantine/core';
import type { ReactNode } from 'react';
import { useWebPreview } from './WebPreview';
import classes from './WebPreview.module.css';
export interface WebPreviewBodyProps
  extends BoxProps,
    StylesApiProps<WebPreviewBodyFactory>,
    ElementProps<'iframe', keyof BoxProps | 'loading'> {
  /** Application-owned loading content; does not infer iframe load success. */
  loading?: ReactNode;
  /** Native iframe loading attribute, separate from the loading content slot. */
  frameLoading?: 'eager' | 'lazy';
  wrapperProps?: BoxProps & ElementProps<'div'>;
}
export type WebPreviewBodyFactory = Factory<{
  props: WebPreviewBodyProps;
  ref: HTMLIFrameElement;
  stylesNames: 'root' | 'frame' | 'loading';
}>;
export const WebPreviewBody = factory<WebPreviewBodyFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'WebPreviewBody',
      {
        title: 'Preview',
        sandbox: 'allow-scripts allow-forms allow-popups allow-presentation',
      },
      _props,
    );
    const {
      src,
      loading,
      frameLoading,
      wrapperProps,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const { url } = useWebPreview();
    const getStyles = useStyles<WebPreviewBodyFactory>({
      name: 'WebPreviewBody',
      rootSelector: 'frame',
      props,
      classes: {
        root: classes.body,
        frame: classes.frame,
        loading: classes.loading,
      },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Box
        {...wrapperProps}
        {...getStyles('root', {
          className: wrapperProps?.className,
          style: wrapperProps?.style,
        })}
      >
        <Box
          component="iframe"
          {...others}
          {...getStyles('frame')}
          ref={ref}
          loading={frameLoading}
          src={(src ?? url) || undefined}
        />
        {loading !== undefined &&
          loading !== null &&
          loading !== false &&
          loading !== '' && <Box {...getStyles('loading')}>{loading}</Box>}
      </Box>
    );
  },
);
WebPreviewBody.displayName = 'WebPreviewBody';
WebPreviewBody.classes = {
  root: classes.body,
  frame: classes.frame,
  loading: classes.loading,
};
