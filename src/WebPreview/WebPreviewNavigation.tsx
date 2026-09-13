'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  type ElementProps,
  type Factory,
  Flex,
  type FlexProps,
  factory,
  useProps,
  useStyles,
} from '@mantine/core';
import classes from './WebPreview.module.css';
export interface WebPreviewNavigationProps
  extends FlexProps,
    ElementProps<'div'> {}
export type WebPreviewNavigationFactory = Factory<{
  props: WebPreviewNavigationProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const WebPreviewNavigation = factory<WebPreviewNavigationFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'WebPreviewNavigation',
      { gap: 4, align: 'center', wrap: 'wrap' },
      _props,
    );
    const {
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<WebPreviewNavigationFactory>({
      name: 'WebPreviewNavigation',
      props,
      classes: { root: classes.navigation },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Flex {...others} {...getStyles('root')} ref={ref} unstyled={unstyled} />
    );
  },
);
WebPreviewNavigation.displayName = 'WebPreviewNavigation';
WebPreviewNavigation.classes = { root: classes.navigation };
