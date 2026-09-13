'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  type BoxProps,
  Button,
  type ButtonCssVariables,
  type ButtonProps,
  type ButtonStylesNames,
  createVarsResolver,
  Divider,
  type DividerProps,
  type ElementProps,
  type Factory,
  factory,
  rem,
  type StylesApiProps,
  Tooltip,
  type TooltipProps,
  useProps,
  useStyles,
} from '@mantine/core';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import classes from './Checkpoint.module.css';

export interface CheckpointProps
  extends BoxProps,
    StylesApiProps<CheckpointFactory>,
    ElementProps<'div'> {
  dividerProps?: DividerProps;
}
export type CheckpointFactory = Factory<{
  props: CheckpointProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'line';
  staticComponents: {
    Icon: typeof CheckpointIcon;
    Trigger: typeof CheckpointTrigger;
  };
}>;
export const Checkpoint = factory<CheckpointFactory>(({ ref, ..._props }) => {
  const props = useProps('Checkpoint', {}, _props);
  const {
    children,
    dividerProps,
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
    ...others
  } = props;
  const getStyles = useStyles<CheckpointFactory>({
    name: 'Checkpoint',
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
  return (
    <Box {...others} {...getStyles('root')} ref={ref}>
      {children}
      <Divider
        {...dividerProps}
        {...getStyles('line', {
          className: dividerProps?.className,
          style: dividerProps?.style,
        })}
      />
    </Box>
  );
});

export interface CheckpointIconProps
  extends BoxProps,
    StylesApiProps<CheckpointIconFactory>,
    ElementProps<'span'> {
  /** Size of the icon wrapper. Defaults to 16px. */
  size?: number | string;
  /** Attributes and ref for the default bookmark SVG; ignored with custom children. */
  svgProps?: Omit<ComponentPropsWithRef<'svg'>, 'children'>;
}
export type CheckpointIconFactory = Factory<{
  props: CheckpointIconProps;
  ref: HTMLSpanElement;
  stylesNames: 'root';
  vars: { root: '--checkpoint-icon-size' };
}>;
const iconVars = createVarsResolver<CheckpointIconFactory>((_, { size }) => ({
  root: { '--checkpoint-icon-size': rem(size) },
}));
export const CheckpointIcon = factory<CheckpointIconFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('CheckpointIcon', { size: 16 }, _props);
    const {
      children,
      svgProps,
      size: _size,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<CheckpointIconFactory>({
      name: 'CheckpointIcon',
      props,
      classes: { root: classes.icon },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      varsResolver: iconVars,
    });
    return (
      <Box
        component="span"
        aria-hidden="true"
        {...others}
        {...getStyles('root')}
        ref={ref}
      >
        {children ?? (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...svgProps}
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </Box>
    );
  },
);

export interface CheckpointTriggerProps
  extends ButtonProps,
    ElementProps<'button', 'color'> {
  tooltip?: ReactNode;
  tooltipProps?: Omit<TooltipProps, 'children' | 'label'>;
}
export type CheckpointTriggerFactory = Factory<{
  props: CheckpointTriggerProps;
  ref: HTMLButtonElement;
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
}>;
export const CheckpointTrigger = factory<CheckpointTriggerFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'CheckpointTrigger',
      { variant: 'subtle', size: 'compact-sm', color: 'gray' },
      _props,
    );
    const {
      tooltip,
      tooltipProps,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<CheckpointTriggerFactory>({
      name: 'CheckpointTrigger',
      props,
      classes: { root: classes.trigger, label: classes.label },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (Object.keys(Button.classes) as ButtonStylesNames[]).map((key) => [
        key,
        getStyles(key),
      ]),
    );
    const button = (
      <Button
        {...others}
        type="button"
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
    return tooltip === undefined ||
      tooltip === null ||
      tooltip === false ||
      tooltip === '' ? (
      button
    ) : (
      <Tooltip
        position="bottom-start"
        events={{ hover: true, focus: true, touch: false }}
        {...tooltipProps}
        label={tooltip}
      >
        {button}
      </Tooltip>
    );
  },
);
Checkpoint.displayName = 'Checkpoint';
Checkpoint.classes = { root: classes.root, line: classes.line };
CheckpointIcon.displayName = 'CheckpointIcon';
CheckpointIcon.classes = { root: classes.icon };
CheckpointIcon.varsResolver = iconVars;
CheckpointTrigger.displayName = 'CheckpointTrigger';
CheckpointTrigger.classes = Button.classes;
Checkpoint.Icon = CheckpointIcon;
Checkpoint.Trigger = CheckpointTrigger;
