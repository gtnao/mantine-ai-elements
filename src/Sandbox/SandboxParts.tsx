'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  Collapse,
  type CollapseProps,
  type ElementProps,
  type Factory,
  factory,
  type StylesApiProps,
  UnstyledButton,
  type UnstyledButtonProps,
  useProps,
  useStyles,
} from '@mantine/core';
import type { ToolUIPart } from 'ai';
import type { ReactNode } from 'react';
import { ToolStatusBadge, type ToolStatusBadgeProps } from '../Tool/Tool';
import { useSandbox } from './Sandbox';
import classes from './Sandbox.module.css';
export interface SandboxHeaderProps
  extends Omit<
      UnstyledButtonProps,
      'title' | 'styles' | 'classNames' | 'vars' | 'attributes'
    >,
    StylesApiProps<SandboxHeaderFactory>,
    ElementProps<'button', keyof UnstyledButtonProps | 'title'> {
  title?: ReactNode;
  state: ToolUIPart['state'];
  icon?: ReactNode;
  statusBadgeProps?: Omit<ToolStatusBadgeProps, 'state'>;
  'data-disabled'?: boolean;
}
export type SandboxHeaderFactory = Factory<{
  props: SandboxHeaderProps;
  ref: HTMLButtonElement;
  stylesNames: 'root' | 'icon' | 'title' | 'status' | 'chevron';
}>;
export const SandboxHeader = factory<SandboxHeaderFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('SandboxHeader', {}, _props);
    const {
      title,
      state,
      icon,
      statusBadgeProps,
      children,
      disabled,
      onClick,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const context = useSandbox();
    const getStyles = useStyles<SandboxHeaderFactory>({
      name: 'SandboxHeader',
      props,
      classes: {
        root: classes.header,
        icon: classes.icon,
        title: classes.title,
        status: classes.status,
        chevron: classes.chevron,
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
      <UnstyledButton
        {...others}
        {...getStyles('root')}
        ref={ref}
        type="button"
        disabled={disabled || context.disabled}
        aria-expanded={context.opened}
        id={`${context.id}-header`}
        aria-controls={`${context.id}-content`}
        onClick={(event) => {
          if (disabled || context.disabled || others['data-disabled']) return;
          onClick?.(event);
          if (!event.defaultPrevented) context.setOpened(!context.opened);
        }}
      >
        <Box component="span" {...getStyles('icon')} aria-hidden>
          {icon ?? (
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" />
            </svg>
          )}
        </Box>
        <Box component="span" {...getStyles('title')}>
          {title}
        </Box>{' '}
        <ToolStatusBadge
          {...statusBadgeProps}
          {...getStyles('status', {
            className: statusBadgeProps?.className,
            style: statusBadgeProps?.style,
          })}
          state={state}
        />
        {children}
        <svg
          {...getStyles('chevron')}
          data-opened={context.opened || undefined}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </UnstyledButton>
    );
  },
);
SandboxHeader.displayName = 'SandboxHeader';
SandboxHeader.classes = {
  root: classes.header,
  icon: classes.icon,
  title: classes.title,
  status: classes.status,
  chevron: classes.chevron,
};
export interface SandboxContentProps
  extends Omit<CollapseProps, 'expanded'>,
    StylesApiProps<SandboxContentFactory> {}
export type SandboxContentFactory = Factory<{
  props: SandboxContentProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const SandboxContent = factory<SandboxContentFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('SandboxContent', {}, _props);
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
    const context = useSandbox();
    const getStyles = useStyles<SandboxContentFactory>({
      name: 'SandboxContent',
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
      <Collapse
        {...others}
        {...getStyles('root')}
        ref={ref}
        expanded={context.opened}
        id={`${context.id}-content`}
        role="region"
        aria-labelledby={`${context.id}-header`}
      />
    );
  },
);
SandboxContent.displayName = 'SandboxContent';
SandboxContent.classes = { root: classes.content };
