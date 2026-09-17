'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Badge,
  type BadgeCssVariables,
  type BadgeProps,
  type BadgeStylesNames,
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  Flex,
  type FlexProps,
  factory,
  type PolymorphicFactory,
  polymorphicFactory,
  type StylesApiProps,
  Text,
  type TextProps,
  useProps,
  useStyles,
  VisuallyHidden,
} from '@mantine/core';
import type { ReactNode } from 'react';
import classes from './ChainOfThoughtParts.module.css';
export interface ChainOfThoughtStepProps
  extends BoxProps,
    StylesApiProps<ChainOfThoughtStepFactory>,
    ElementProps<'div'> {
  icon?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  status?: 'complete' | 'active' | 'pending';
  /** Localized accessible status; defaults to Complete, In progress, or Pending. */
  statusLabel?: string;
}
export type ChainOfThoughtStepFactory = Factory<{
  props: ChainOfThoughtStepProps;
  ref: HTMLDivElement;
  stylesNames:
    | 'root'
    | 'icon'
    | 'line'
    | 'body'
    | 'label'
    | 'description'
    | 'status';
}>;
export const ChainOfThoughtStep = factory<ChainOfThoughtStepFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'ChainOfThoughtStep',
      { status: 'complete' },
      _props,
    );
    const {
      icon,
      label,
      description,
      status,
      statusLabel,
      children,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<ChainOfThoughtStepFactory>({
      name: 'ChainOfThoughtStep',
      props,
      classes: {
        root: classes.step,
        icon: classes.icon,
        line: classes.line,
        body: classes.body,
        label: classes.label,
        description: classes.description,
        status: classes.status,
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
      <Box {...others} {...getStyles('root')} ref={ref} data-status={status}>
        <Box {...getStyles('icon')} aria-hidden="true">
          {icon === undefined ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="2" />
            </svg>
          ) : (
            icon
          )}
          <Box {...getStyles('line')} />
        </Box>
        <Box {...getStyles('body')}>
          <Text component="div" size="sm" {...getStyles('label')}>
            {label}
            <VisuallyHidden {...getStyles('status')}>
              {' '}
              —{' '}
              {statusLabel ??
                {
                  complete: 'Complete',
                  active: 'In progress',
                  pending: 'Pending',
                }[status ?? 'complete']}
            </VisuallyHidden>
          </Text>
          {description !== undefined && description !== null && (
            <Text
              component="div"
              c="dimmed"
              size="xs"
              {...getStyles('description')}
            >
              {description}
            </Text>
          )}
          {children}
        </Box>
      </Box>
    );
  },
);
ChainOfThoughtStep.displayName = 'ChainOfThoughtStep';
ChainOfThoughtStep.classes = {
  root: classes.step,
  icon: classes.icon,
  line: classes.line,
  body: classes.body,
  label: classes.label,
  description: classes.description,
  status: classes.status,
};
export interface ChainOfThoughtSearchResultsProps extends FlexProps {}
export type ChainOfThoughtSearchResultsFactory = Factory<{
  props: ChainOfThoughtSearchResultsProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const ChainOfThoughtSearchResults =
  factory<ChainOfThoughtSearchResultsFactory>(({ ref, ..._props }) => {
    const props = useProps(
      'ChainOfThoughtSearchResults',
      { wrap: 'wrap', align: 'center', gap: 'xs' },
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
    const getStyles = useStyles<ChainOfThoughtSearchResultsFactory>({
      name: 'ChainOfThoughtSearchResults',
      props,
      classes: { root: classes.results },
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
  });
ChainOfThoughtSearchResults.displayName = 'ChainOfThoughtSearchResults';
ChainOfThoughtSearchResults.classes = { root: classes.results };
export interface ChainOfThoughtSearchResultProps extends BadgeProps {}
export type ChainOfThoughtSearchResultFactory = PolymorphicFactory<{
  props: ChainOfThoughtSearchResultProps;
  defaultComponent: 'div';
  defaultRef: HTMLDivElement;
  stylesNames: BadgeStylesNames;
  vars: BadgeCssVariables;
}>;
export const ChainOfThoughtSearchResult =
  polymorphicFactory<ChainOfThoughtSearchResultFactory>(
    ({ ref, ..._props }) => {
      const props = useProps(
        'ChainOfThoughtSearchResult',
        { variant: 'light', color: 'gray', size: 'sm', fw: 400, tt: 'none' },
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
      const getStyles = useStyles<ChainOfThoughtSearchResultFactory>({
        name: 'ChainOfThoughtSearchResult',
        props,
        classes: { root: classes.result, label: classes.resultLabel },
        className,
        style,
        classNames,
        styles,
        vars,
        attributes,
        unstyled,
      });
      const resolved = Object.fromEntries(
        (Object.keys(Badge.classes) as BadgeStylesNames[]).map((key) => [
          key,
          getStyles(key),
        ]),
      );
      return (
        <Badge
          {...others}
          ref={ref}
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
        />
      );
    },
  );
ChainOfThoughtSearchResult.displayName = 'ChainOfThoughtSearchResult';
ChainOfThoughtSearchResult.classes = Badge.classes;
export interface ChainOfThoughtImageProps
  extends BoxProps,
    StylesApiProps<ChainOfThoughtImageFactory>,
    ElementProps<'div'> {
  caption?: string;
  frameProps?: Omit<BoxProps & ElementProps<'div', keyof BoxProps>, 'children'>;
  captionProps?: TextProps;
}
export type ChainOfThoughtImageFactory = Factory<{
  props: ChainOfThoughtImageProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'frame' | 'caption';
}>;
export const ChainOfThoughtImage = factory<ChainOfThoughtImageFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('ChainOfThoughtImage', {}, _props);
    const {
      caption,
      frameProps,
      captionProps,
      children,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<ChainOfThoughtImageFactory>({
      name: 'ChainOfThoughtImage',
      props,
      classes: {
        root: classes.image,
        frame: classes.frame,
        caption: classes.caption,
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
      <Box {...others} {...getStyles('root')} ref={ref}>
        <Box
          {...frameProps}
          {...getStyles('frame', {
            className: frameProps?.className,
            style: frameProps?.style,
          })}
        >
          {children}
        </Box>
        {caption && (
          <Text
            size="xs"
            c="dimmed"
            {...captionProps}
            {...getStyles('caption', {
              className: captionProps?.className,
              style: captionProps?.style,
            })}
          >
            {caption}
          </Text>
        )}
      </Box>
    );
  },
);
ChainOfThoughtImage.displayName = 'ChainOfThoughtImage';
ChainOfThoughtImage.classes = {
  root: classes.image,
  frame: classes.frame,
  caption: classes.caption,
};
