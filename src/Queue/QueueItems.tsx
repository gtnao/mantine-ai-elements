'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  ActionIcon,
  type ActionIconCssVariables,
  type ActionIconProps,
  type ActionIconStylesNames,
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  Flex,
  type FlexProps,
  factory,
  Image,
  type ImageCssVariables,
  type ImageProps,
  type StylesApiProps,
  Text,
  type TextCssVariables,
  type TextProps,
  useProps,
  useStyles,
} from '@mantine/core';
import type { ReactNode } from 'react';
import classes from './QueueItems.module.css';

export interface QueueItemProps
  extends BoxProps,
    StylesApiProps<QueueItemFactory>,
    ElementProps<'li', keyof BoxProps> {}
export type QueueItemFactory = Factory<{
  props: QueueItemProps;
  ref: HTMLLIElement;
  stylesNames: 'root';
}>;
export const QueueItem = factory<QueueItemFactory>(({ ref, ..._props }) => {
  const props = useProps('QueueItem', {}, _props);
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
  const getStyles = useStyles<QueueItemFactory>({
    name: 'QueueItem',
    props,
    classes: { root: classes.item },
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  return <Box component="li" {...others} {...getStyles('root')} ref={ref} />;
});
QueueItem.displayName = 'QueueItem';
QueueItem.classes = { root: classes.item };

export interface QueueItemIndicatorProps
  extends BoxProps,
    StylesApiProps<QueueItemIndicatorFactory>,
    ElementProps<'span', keyof BoxProps> {
  completed?: boolean;
}
export type QueueItemIndicatorFactory = Factory<{
  props: QueueItemIndicatorProps;
  ref: HTMLSpanElement;
  stylesNames: 'root';
}>;
export const QueueItemIndicator = factory<QueueItemIndicatorFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('QueueItemIndicator', {}, _props);
    const {
      completed,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<QueueItemIndicatorFactory>({
      name: 'QueueItemIndicator',
      props,
      classes: { root: classes.indicator },
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
        component="span"
        role="img"
        aria-label={completed ? 'Completed' : 'Pending'}
        {...others}
        {...getStyles('root')}
        ref={ref}
        data-completed={completed || undefined}
      />
    );
  },
);
QueueItemIndicator.displayName = 'QueueItemIndicator';
QueueItemIndicator.classes = { root: classes.indicator };

export interface QueueItemContentProps
  extends TextProps,
    ElementProps<'span', keyof TextProps> {
  completed?: boolean;
}
export type QueueItemContentFactory = Factory<{
  props: QueueItemContentProps;
  ref: HTMLSpanElement;
  stylesNames: 'root';
  vars: TextCssVariables;
}>;
export const QueueItemContent = factory<QueueItemContentFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'QueueItemContent',
      { size: 'sm', c: 'dimmed', lineClamp: 1 },
      _props,
    );
    const {
      completed,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<QueueItemContentFactory>({
      name: 'QueueItemContent',
      props,
      classes: { root: classes.content },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Text
        component="span"
        {...others}
        {...getStyles('root')}
        ref={ref}
        unstyled={unstyled}
        data-completed={completed || undefined}
      />
    );
  },
);
QueueItemContent.displayName = 'QueueItemContent';
QueueItemContent.classes = { root: classes.content };

export interface QueueItemDescriptionProps
  extends TextProps,
    ElementProps<'div', keyof TextProps> {
  completed?: boolean;
}
export type QueueItemDescriptionFactory = Factory<{
  props: QueueItemDescriptionProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
  vars: TextCssVariables;
}>;
export const QueueItemDescription = factory<QueueItemDescriptionFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'QueueItemDescription',
      { size: 'xs', c: 'dimmed' },
      _props,
    );
    const {
      completed,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<QueueItemDescriptionFactory>({
      name: 'QueueItemDescription',
      props,
      classes: { root: classes.description },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Text
        component="div"
        {...others}
        {...getStyles('root')}
        ref={ref}
        unstyled={unstyled}
        data-completed={completed || undefined}
      />
    );
  },
);
QueueItemDescription.displayName = 'QueueItemDescription';
QueueItemDescription.classes = { root: classes.description };

export interface QueueItemActionsProps
  extends FlexProps,
    ElementProps<'div', keyof FlexProps> {}
export type QueueItemActionsFactory = Factory<{
  props: QueueItemActionsProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const QueueItemActions = factory<QueueItemActionsFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'QueueItemActions',
      { gap: 4, align: 'center' },
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
    const getStyles = useStyles<QueueItemActionsFactory>({
      name: 'QueueItemActions',
      props,
      classes: { root: classes.actions },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Flex
        component="div"
        {...others}
        {...getStyles('root')}
        ref={ref}
        unstyled={unstyled}
      />
    );
  },
);
QueueItemActions.displayName = 'QueueItemActions';
QueueItemActions.classes = { root: classes.actions };

export interface QueueItemAttachmentProps
  extends FlexProps,
    ElementProps<'div', keyof FlexProps> {}
export type QueueItemAttachmentFactory = Factory<{
  props: QueueItemAttachmentProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const QueueItemAttachment = factory<QueueItemAttachmentFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'QueueItemAttachment',
      { gap: 'xs', wrap: 'wrap' },
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
    const getStyles = useStyles<QueueItemAttachmentFactory>({
      name: 'QueueItemAttachment',
      props,
      classes: { root: classes.attachment },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Flex
        component="div"
        {...others}
        {...getStyles('root')}
        ref={ref}
        unstyled={unstyled}
      />
    );
  },
);
QueueItemAttachment.displayName = 'QueueItemAttachment';
QueueItemAttachment.classes = { root: classes.attachment };

export interface QueueItemImageProps
  extends ImageProps,
    ElementProps<'img', keyof ImageProps> {}
export type QueueItemImageFactory = Factory<{
  props: QueueItemImageProps;
  ref: HTMLImageElement;
  stylesNames: 'root';
  vars: ImageCssVariables;
}>;
export const QueueItemImage = factory<QueueItemImageFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'QueueItemImage',
      { w: 32, h: 32, width: 32, height: 32, alt: '', radius: 'sm' },
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
    const getStyles = useStyles<QueueItemImageFactory>({
      name: 'QueueItemImage',
      props,
      classes: { root: classes.image },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Image
        component="img"
        {...others}
        {...getStyles('root')}
        ref={ref}
        unstyled={unstyled}
      />
    );
  },
);
QueueItemImage.displayName = 'QueueItemImage';
QueueItemImage.classes = { root: classes.image };

export interface QueueItemActionProps
  extends ActionIconProps,
    ElementProps<'button', 'color'> {}
export type QueueItemActionFactory = Factory<{
  props: QueueItemActionProps;
  ref: HTMLButtonElement;
  stylesNames: ActionIconStylesNames;
  vars: ActionIconCssVariables;
}>;
export const QueueItemAction = factory<QueueItemActionFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'QueueItemAction',
      { variant: 'subtle', color: 'gray', size: 'sm' },
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
      onClick,
      ...others
    } = props;
    const getStyles = useStyles<QueueItemActionFactory>({
      name: 'QueueItemAction',
      props,
      classes: { root: classes.action },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (Object.keys(ActionIcon.classes) as ActionIconStylesNames[]).map(
        (key) => [key, getStyles(key)],
      ),
    );
    return (
      <ActionIcon
        {...others}
        ref={ref}
        type="button"
        unstyled={unstyled}
        onClick={(event) => {
          if (!others['data-disabled']) onClick?.(event);
        }}
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
      />
    );
  },
);
QueueItemAction.displayName = 'QueueItemAction';
QueueItemAction.classes = ActionIcon.classes;

export interface QueueItemFileProps
  extends BoxProps,
    StylesApiProps<QueueItemFileFactory>,
    ElementProps<'span'> {
  icon?: ReactNode;
}
export type QueueItemFileFactory = Factory<{
  props: QueueItemFileProps;
  ref: HTMLSpanElement;
  stylesNames: 'root' | 'icon' | 'label';
}>;
export const QueueItemFile = factory<QueueItemFileFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('QueueItemFile', {}, _props);
    const {
      children,
      icon,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<QueueItemFileFactory>({
      name: 'QueueItemFile',
      props,
      classes: {
        root: classes.file,
        icon: classes.fileIcon,
        label: classes.fileLabel,
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
      <Box component="span" {...others} {...getStyles('root')} ref={ref}>
        <Box component="span" {...getStyles('icon')} aria-hidden="true">
          {icon === undefined ? (
            <svg
              aria-hidden="true"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m21.4 11.6-9.2 9.2a6 6 0 0 1-8.5-8.5l10-10a4 4 0 0 1 5.7 5.7l-10 10a2 2 0 0 1-2.8-2.8l9.2-9.2" />
            </svg>
          ) : (
            icon
          )}
        </Box>
        <Box component="span" {...getStyles('label')}>
          {children}
        </Box>
      </Box>
    );
  },
);
QueueItemFile.displayName = 'QueueItemFile';
QueueItemFile.classes = {
  root: classes.file,
  icon: classes.fileIcon,
  label: classes.fileLabel,
};
