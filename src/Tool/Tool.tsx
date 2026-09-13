'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Badge,
  type BadgeCssVariables,
  type BadgeProps,
  type BadgeStylesNames,
  Box,
  type BoxProps,
  Collapse,
  type CollapseProps,
  type ElementProps,
  type Factory,
  factory,
  type StylesApiProps,
  Text,
  UnstyledButton,
  type UnstyledButtonProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useId, useUncontrolled } from '@mantine/hooks';
import type { DynamicToolUIPart, ToolUIPart } from 'ai';
import {
  createContext,
  isValidElement,
  type ReactNode,
  useContext,
} from 'react';
import { CodeBlock, type CodeBlockProps } from '../CodeBlock/CodeBlock';
import classes from './Tool.module.css';

export type ToolPart = ToolUIPart | DynamicToolUIPart;
export interface ToolProps
  extends BoxProps,
    StylesApiProps<ToolFactory>,
    ElementProps<'div', 'onChange'> {
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (opened: boolean) => void;
  disabled?: boolean;
}
export type ToolFactory = Factory<{
  props: ToolProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'header' | 'name' | 'chevron' | 'content' | 'body';
  staticComponents: {
    Header: typeof ToolHeader;
    Content: typeof ToolContent;
    Input: typeof ToolInput;
    Output: typeof ToolOutput;
    StatusBadge: typeof ToolStatusBadge;
  };
}>;
interface ToolContextValue {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  disabled: boolean;
  id: string;
  getStyles: ReturnType<typeof useStyles<ToolFactory>>;
}
const Context = createContext<ToolContextValue | null>(null);
function useTool() {
  const context = useContext(Context);
  if (!context)
    throw new Error('Tool.Header and Tool.Content must be used within Tool');
  return context;
}
export const Tool = factory<ToolFactory>(({ ref, ..._props }) => {
  const props = useProps('Tool', { disabled: false }, _props);
  const {
    opened: openedProp,
    defaultOpened,
    onChange,
    disabled,
    id: idProp,
    children,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    attributes,
    ...others
  } = props;
  const id = useId(idProp);
  const [opened, setOpened] = useUncontrolled({
    value: openedProp,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange,
  });
  const getStyles = useStyles<ToolFactory>({
    name: 'Tool',
    props,
    classes,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    attributes,
  });
  return (
    <Context.Provider value={{ opened, setOpened, disabled, id, getStyles }}>
      <Box
        {...others}
        {...getStyles('root')}
        ref={ref}
        id={id}
        data-opened={opened || undefined}
      >
        {children}
      </Box>
    </Context.Provider>
  );
});
const statuses = {
  'input-streaming': { label: 'Pending', color: 'gray', icon: 'circle' },
  'input-available': { label: 'Running', color: 'blue', icon: 'clock' },
  'approval-requested': {
    label: 'Awaiting Approval',
    color: 'yellow',
    icon: 'clock',
  },
  'approval-responded': { label: 'Responded', color: 'blue', icon: 'check' },
  'output-available': { label: 'Completed', color: 'green', icon: 'check' },
  'output-error': { label: 'Error', color: 'red', icon: 'cross' },
  'output-denied': { label: 'Denied', color: 'orange', icon: 'cross' },
} satisfies Record<
  ToolPart['state'],
  { label: string; color: string; icon: string }
>;
function StatusIcon({ kind }: { kind: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      {kind === 'clock' ? (
        <path d="M12 7v5l3 2" />
      ) : kind === 'check' ? (
        <path d="m7 12 3 3 7-7" />
      ) : kind === 'cross' ? (
        <path d="m8 8 8 8m0-8-8 8" />
      ) : null}
    </svg>
  );
}
export interface ToolStatusBadgeProps
  extends BadgeProps,
    ElementProps<'span', keyof BadgeProps> {
  state: ToolPart['state'];
}
export type ToolStatusBadgeFactory = Factory<{
  props: ToolStatusBadgeProps;
  ref: HTMLSpanElement;
  stylesNames: BadgeStylesNames;
  vars: BadgeCssVariables;
}>;
export const ToolStatusBadge = factory<ToolStatusBadgeFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'ToolStatusBadge',
      { variant: 'light', size: 'sm', radius: 'xl', tt: 'none' },
      _props,
    );
    const {
      state,
      children,
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<ToolStatusBadgeFactory>({
      name: 'ToolStatusBadge',
      props,
      classes: {},
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (Object.keys(Badge.classes) as BadgeStylesNames[]).map((slot) => [
        slot,
        getStyles(slot),
      ]),
    );
    const status = statuses[state];
    return (
      <Badge
        component="span"
        color={status.color}
        leftSection={<StatusIcon kind={status.icon} />}
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
      >
        {children ?? status.label}
      </Badge>
    );
  },
);
export function getStatusBadge(state: ToolPart['state']) {
  return <ToolStatusBadge state={state} />;
}
export type ToolHeaderProps = Omit<UnstyledButtonProps, 'title'> &
  ElementProps<'button', keyof UnstyledButtonProps | 'type' | 'title'> & {
    title?: ReactNode;
    statusBadgeProps?: Omit<ToolStatusBadgeProps, 'state'>;
    'data-disabled'?: boolean;
  } & (
    | { type: ToolUIPart['type']; state: ToolUIPart['state']; toolName?: never }
    | {
        type: DynamicToolUIPart['type'];
        state: DynamicToolUIPart['state'];
        toolName: string;
      }
  );
export type ToolHeaderFactory = Factory<{
  props: ToolHeaderProps;
  ref: HTMLButtonElement;
}>;
export const ToolHeader = factory<ToolHeaderFactory>(({ ref, ..._props }) => {
  const {
    title,
    type,
    state,
    toolName,
    statusBadgeProps,
    children,
    className,
    style,
    onClick,
    disabled,
    ...others
  } = useProps('ToolHeader', {}, _props);
  const context = useTool();
  return (
    <UnstyledButton
      {...others}
      {...context.getStyles('header', { className, style })}
      ref={ref}
      type="button"
      disabled={context.disabled || disabled}
      id={`${context.id}-header`}
      aria-controls={`${context.id}-content`}
      aria-expanded={context.opened}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          !context.disabled &&
          !disabled &&
          !others['data-disabled']
        )
          context.setOpened(!context.opened);
      }}
    >
      {children ?? (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path d="m14 6 4 4 3-3a6 6 0 0 1-7 8l-6 6a3 3 0 0 1-4-4l6-6a6 6 0 0 1 8-7l-4 2Z" />
          </svg>
          <Box component="span" {...context.getStyles('name')}>
            {title ?? (type === 'dynamic-tool' ? toolName : type.slice(5))}
          </Box>{' '}
          <ToolStatusBadge
            state={state}
            style={{ flexShrink: 0 }}
            {...statusBadgeProps}
          />
          <Box
            component="svg"
            {...context.getStyles('chevron')}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            data-opened={context.opened || undefined}
          >
            <path d="m6 9 6 6 6-6" />
          </Box>
        </>
      )}
    </UnstyledButton>
  );
});
export interface ToolContentProps extends Omit<CollapseProps, 'expanded'> {}
export type ToolContentFactory = Factory<{
  props: ToolContentProps;
  ref: HTMLDivElement;
}>;
export const ToolContent = factory<ToolContentFactory>(({ ref, ..._props }) => {
  const { className, style, children, ...others } = useProps(
    'ToolContent',
    {},
    _props,
  );
  const context = useTool();
  return (
    <Collapse
      {...others}
      {...context.getStyles('content', { className, style })}
      ref={ref}
      expanded={context.opened}
      id={`${context.id}-content`}
      role="region"
      aria-labelledby={`${context.id}-header`}
    >
      <Box {...context.getStyles('body')}>{children}</Box>
    </Collapse>
  );
});

// Dynamic tool values may not be JSON serializable. Keep rendering other tools
// and allow the application to supply a richer custom output element.
function stringify(value: unknown) {
  if (value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return '[Unable to serialize value as JSON]';
  }
}
export interface ToolInputProps
  extends BoxProps,
    StylesApiProps<ToolInputFactory>,
    ElementProps<'div'> {
  input: ToolPart['input'];
  label?: ReactNode;
  codeBlockProps?: Omit<CodeBlockProps, 'code'>;
}
export type ToolInputFactory = Factory<{
  props: ToolInputProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'label';
}>;
export const ToolInput = factory<ToolInputFactory>(({ ref, ..._props }) => {
  const props = useProps('ToolInput', { label: 'Parameters' }, _props);
  const {
    input,
    label,
    codeBlockProps,
    children,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    attributes,
    ...others
  } = props;
  const getStyles = useStyles<ToolInputFactory>({
    name: 'ToolInput',
    props,
    classes: { root: classes.detail, label: classes.label },
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    attributes,
  });
  return (
    <Box {...others} {...getStyles('root')} ref={ref}>
      <Text component="h4" {...getStyles('label')}>
        {label}
      </Text>
      {children ?? (
        <CodeBlock
          code={stringify(input)}
          language="json"
          {...codeBlockProps}
        />
      )}
    </Box>
  );
});
export interface ToolOutputProps
  extends BoxProps,
    StylesApiProps<ToolOutputFactory>,
    ElementProps<'div'> {
  output?: ToolPart['output'];
  errorText?: ToolPart['errorText'];
  label?: ReactNode;
  errorLabel?: ReactNode;
  codeBlockProps?: Omit<CodeBlockProps, 'code'>;
}
export type ToolOutputFactory = Factory<{
  props: ToolOutputProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'label' | 'error';
}>;
export const ToolOutput = factory<ToolOutputFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'ToolOutput',
    { label: 'Result', errorLabel: 'Error' },
    _props,
  );
  const {
    output,
    errorText,
    label,
    errorLabel,
    codeBlockProps,
    children,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    attributes,
    ...others
  } = props;
  const getStyles = useStyles<ToolOutputFactory>({
    name: 'ToolOutput',
    props,
    classes: {
      root: classes.detail,
      label: classes.label,
      error: classes.error,
    },
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    attributes,
  });
  if (output === undefined && errorText === undefined && children === undefined)
    return null;
  return (
    <Box
      {...others}
      {...getStyles('root')}
      ref={ref}
      data-error={errorText !== undefined || undefined}
    >
      <Text component="h4" {...getStyles('label')}>
        {errorText !== undefined ? errorLabel : label}
      </Text>
      {errorText !== undefined && (
        <Box {...getStyles('error')} role="alert">
          {errorText}
        </Box>
      )}
      {children ??
        (isValidElement(output) ? (
          output
        ) : output !== undefined ? (
          <CodeBlock
            code={typeof output === 'string' ? output : stringify(output)}
            language="json"
            {...codeBlockProps}
          />
        ) : null)}
    </Box>
  );
});
Tool.displayName = 'Tool';
ToolHeader.displayName = 'ToolHeader';
ToolContent.displayName = 'ToolContent';
ToolInput.displayName = 'ToolInput';
ToolOutput.displayName = 'ToolOutput';
ToolStatusBadge.displayName = 'ToolStatusBadge';
Tool.classes = classes;
ToolInput.classes = { root: classes.detail, label: classes.label };
ToolOutput.classes = {
  root: classes.detail,
  label: classes.label,
  error: classes.error,
};
Tool.Header = ToolHeader;
Tool.Content = ToolContent;
Tool.Input = ToolInput;
Tool.Output = ToolOutput;
Tool.StatusBadge = ToolStatusBadge;
