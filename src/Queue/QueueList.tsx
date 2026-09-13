'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  type Factory,
  factory,
  ScrollArea,
  type ScrollAreaCssVariables,
  type ScrollAreaProps,
  type ScrollAreaStylesNames,
  type StylesApiProps,
  useProps,
  useStyles,
} from '@mantine/core';
import type { ComponentPropsWithRef } from 'react';
import classes from './QueueList.module.css';
export interface QueueListProps
  extends Omit<
      ScrollAreaProps,
      'classNames' | 'styles' | 'vars' | 'attributes'
    >,
    StylesApiProps<QueueListFactory> {
  listProps?: ComponentPropsWithRef<'ul'>;
}
export type QueueListFactory = Factory<{
  props: QueueListProps;
  ref: HTMLDivElement;
  stylesNames: ScrollAreaStylesNames | 'scrollArea' | 'list';
  vars: ScrollAreaCssVariables;
}>;
export const QueueList = factory<QueueListFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'QueueList',
    { mah: 160, scrollbars: 'y', offsetScrollbars: 'present' },
    _props,
  );
  const {
    children,
    listProps,
    mah,
    h,
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
    ...others
  } = props;
  const getStyles = useStyles<QueueListFactory>({
    name: 'QueueList',
    props,
    classes,
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  const resolved = Object.fromEntries(
    (Object.keys(ScrollArea.classes) as ScrollAreaStylesNames[]).map((key) => [
      key,
      getStyles(key === 'root' ? 'scrollArea' : key),
    ]),
  );
  return (
    <Box {...getStyles('root')} mah={mah} h={h} ref={ref}>
      <Box className={classes.inner}>
        <ScrollArea
          {...others}
          unstyled={unstyled}
          classNames={Object.fromEntries(
            Object.entries(resolved).map(([key, value]) => [
              key,
              value.className,
            ]),
          )}
          styles={Object.fromEntries(
            Object.entries(resolved).map(([key, value]) => [key, value.style]),
          )}
          attributes={Object.fromEntries(
            Object.entries(resolved).map(([key, value]) => [
              key,
              Object.fromEntries(
                Object.entries(value).filter(
                  ([name]) => name !== 'className' && name !== 'style',
                ),
              ),
            ]),
          )}
        >
          <Box
            component="ul"
            {...listProps}
            {...getStyles('list', {
              className: listProps?.className,
              style: listProps?.style,
            })}
          >
            {children}
          </Box>
        </ScrollArea>
      </Box>
    </Box>
  );
});
QueueList.displayName = 'QueueList';
QueueList.classes = {
  ...ScrollArea.classes,
  root: classes.root,
  scrollArea: classes.scrollArea,
  list: classes.list,
};
