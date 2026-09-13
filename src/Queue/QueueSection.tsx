'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  type BoxProps,
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
import { useId, useUncontrolled } from '@mantine/hooks';
import { createContext, type ReactNode, useContext } from 'react';
import classes from './QueueSection.module.css';

export interface QueueSectionProps
  extends BoxProps,
    StylesApiProps<QueueSectionFactory>,
    ElementProps<'div', 'onChange'> {
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (opened: boolean) => void;
  disabled?: boolean;
}
export type QueueSectionFactory = Factory<{
  props: QueueSectionProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'trigger' | 'content' | 'body';
  staticComponents: {
    Trigger: typeof QueueSectionTrigger;
    Label: typeof QueueSectionLabel;
    Content: typeof QueueSectionContent;
  };
}>;
interface SectionContext {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  disabled: boolean;
  id: string;
  getStyles: ReturnType<typeof useStyles<QueueSectionFactory>>;
}
const Context = createContext<SectionContext | null>(null);
function useSection() {
  const context = useContext(Context);
  if (!context)
    throw new Error(
      'QueueSectionTrigger and QueueSectionContent must be used within QueueSection',
    );
  return context;
}
export const QueueSection = factory<QueueSectionFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'QueueSection',
      { disabled: false, defaultOpened: true },
      _props,
    );
    const {
      opened: controlled,
      defaultOpened,
      onChange,
      disabled,
      id: idProp,
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
    const [opened, setOpened] = useUncontrolled({
      value: controlled,
      defaultValue: defaultOpened,
      finalValue: true,
      onChange,
    });
    const id = useId(idProp);
    const getStyles = useStyles<QueueSectionFactory>({
      name: 'QueueSection',
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
      <Context.Provider value={{ opened, setOpened, disabled, id, getStyles }}>
        <Box
          {...others}
          {...getStyles('root')}
          ref={ref}
          id={id}
          data-state={opened ? 'open' : 'closed'}
        >
          {children}
        </Box>
      </Context.Provider>
    );
  },
);
export interface QueueSectionTriggerProps
  extends UnstyledButtonProps,
    ElementProps<'button', keyof UnstyledButtonProps> {
  'data-disabled'?: boolean;
}
export type QueueSectionTriggerFactory = Factory<{
  props: QueueSectionTriggerProps;
  ref: HTMLButtonElement;
}>;
export const QueueSectionTrigger = factory<QueueSectionTriggerFactory>(
  ({ ref, ..._props }) => {
    const { children, onClick, disabled, className, style, ...others } =
      useProps('QueueSectionTrigger', {}, _props);
    const context = useSection();
    return (
      <UnstyledButton
        {...others}
        {...context.getStyles('trigger', { className, style })}
        ref={ref}
        id={`${context.id}-trigger`}
        type="button"
        disabled={disabled || context.disabled}
        aria-expanded={context.opened}
        onClick={(event) => {
          if (disabled || context.disabled || others['data-disabled']) return;
          onClick?.(event);
          if (!event.defaultPrevented) context.setOpened(!context.opened);
        }}
      >
        {children}
      </UnstyledButton>
    );
  },
);
export interface QueueSectionContentProps
  extends Omit<CollapseProps, 'expanded'> {}
export type QueueSectionContentFactory = Factory<{
  props: QueueSectionContentProps;
  ref: HTMLDivElement;
}>;
export const QueueSectionContent = factory<QueueSectionContentFactory>(
  ({ ref, ..._props }) => {
    const {
      children,
      className,
      style,
      id: idProp,
      ...others
    } = useProps('QueueSectionContent', {}, _props);
    const context = useSection();
    const id = useId(idProp);
    return (
      <Collapse
        role="region"
        aria-labelledby={`${context.id}-trigger`}
        {...others}
        {...context.getStyles('content', { className, style })}
        ref={ref}
        id={id}
        expanded={context.opened}
      >
        <Box {...context.getStyles('body')}>{children}</Box>
      </Collapse>
    );
  },
);
export interface QueueSectionLabelProps
  extends BoxProps,
    StylesApiProps<QueueSectionLabelFactory>,
    ElementProps<'span'> {
  count?: number;
  label: string;
  icon?: ReactNode;
}
export type QueueSectionLabelFactory = Factory<{
  props: QueueSectionLabelProps;
  ref: HTMLSpanElement;
  stylesNames: 'root' | 'chevron' | 'label';
}>;
export const QueueSectionLabel = factory<QueueSectionLabelFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('QueueSectionLabel', {}, _props);
    const {
      count,
      label,
      icon,
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
    const context = useContext(Context);
    const getStyles = useStyles<QueueSectionLabelFactory>({
      name: 'QueueSectionLabel',
      props,
      classes: {
        root: classes.labelRoot,
        chevron: classes.chevron,
        label: classes.label,
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
        <Box
          component="svg"
          {...getStyles('chevron')}
          data-closed={context?.opened === false || undefined}
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </Box>
        {icon}
        <Box component="span" {...getStyles('label')}>
          {children ?? (
            <>
              {count === undefined ? '' : `${count} `}
              {label}
            </>
          )}
        </Box>
      </Box>
    );
  },
);
QueueSection.displayName = 'QueueSection';
QueueSection.classes = {
  root: classes.root,
  trigger: classes.trigger,
  content: classes.content,
  body: classes.body,
};
QueueSectionTrigger.displayName = 'QueueSectionTrigger';
QueueSectionContent.displayName = 'QueueSectionContent';
QueueSectionLabel.displayName = 'QueueSectionLabel';
QueueSectionLabel.classes = {
  root: classes.labelRoot,
  chevron: classes.chevron,
  label: classes.label,
};
QueueSection.Trigger = QueueSectionTrigger;
QueueSection.Content = QueueSectionContent;
QueueSection.Label = QueueSectionLabel;
