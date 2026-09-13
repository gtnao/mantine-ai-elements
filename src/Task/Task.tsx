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
  Paper,
  type PaperCssVariables,
  type PaperProps,
  type PolymorphicFactory,
  polymorphicFactory,
  type StylesApiProps,
  Text,
  type TextCssVariables,
  type TextProps,
  UnstyledButton,
  type UnstyledButtonProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useId, useUncontrolled } from '@mantine/hooks';
import { createContext, type ReactNode, useContext } from 'react';
import classes from './Task.module.css';

export interface TaskProps
  extends BoxProps,
    StylesApiProps<TaskFactory>,
    ElementProps<'div', 'onChange'> {
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (opened: boolean) => void;
  disabled?: boolean;
}
export type TaskFactory = Factory<{
  props: TaskProps;
  ref: HTMLDivElement;
  stylesNames:
    | 'root'
    | 'trigger'
    | 'content'
    | 'body'
    | 'icon'
    | 'title'
    | 'chevron';
  staticComponents: {
    Trigger: typeof TaskTrigger;
    Item: typeof TaskItem;
    ItemFile: typeof TaskItemFile;
    Content: typeof TaskContent;
  };
}>;
interface SectionContext {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  disabled: boolean;
  id: string;
  getStyles: ReturnType<typeof useStyles<TaskFactory>>;
}
const Context = createContext<SectionContext | null>(null);
function useSection() {
  const context = useContext(Context);
  if (!context)
    throw new Error('TaskTrigger and TaskContent must be used within Task');
  return context;
}
export const Task = factory<TaskFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'Task',
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
  const getStyles = useStyles<TaskFactory>({
    name: 'Task',
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
});
export interface TaskTriggerProps
  extends UnstyledButtonProps,
    ElementProps<'button', keyof UnstyledButtonProps | 'ref'> {
  'data-disabled'?: boolean;
  title: string;
  icon?: ReactNode;
}
export type TaskTriggerFactory = PolymorphicFactory<{
  props: TaskTriggerProps;
  defaultRef: HTMLButtonElement;
  defaultComponent: 'button';
}>;
export const TaskTrigger = polymorphicFactory<TaskTriggerFactory>(
  ({ ref, ..._props }) => {
    const {
      children,
      title,
      icon,
      onClick,
      disabled,
      className,
      style,
      ...others
    } = useProps('TaskTrigger', {}, _props);
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
        {children ?? (
          <>
            <Box
              component="span"
              {...context.getStyles('icon')}
              aria-hidden="true"
            >
              {icon === undefined ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              ) : (
                icon
              )}
            </Box>
            <Box component="span" {...context.getStyles('title')}>
              {title}
            </Box>
            <Box
              component="svg"
              {...context.getStyles('chevron')}
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
            </Box>
          </>
        )}
      </UnstyledButton>
    );
  },
);
export interface TaskContentProps extends Omit<CollapseProps, 'expanded'> {}
export type TaskContentFactory = Factory<{
  props: TaskContentProps;
  ref: HTMLDivElement;
}>;
export const TaskContent = factory<TaskContentFactory>(({ ref, ..._props }) => {
  const {
    children,
    className,
    style,
    id: idProp,
    ...others
  } = useProps('TaskContent', {}, _props);
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
});

export interface TaskItemProps
  extends TextProps,
    ElementProps<'div', keyof TextProps | 'ref'> {}
export type TaskItemFactory = PolymorphicFactory<{
  props: TaskItemProps;
  defaultComponent: 'div';
  defaultRef: HTMLDivElement;
  stylesNames: 'root';
  vars: TextCssVariables;
}>;
export const TaskItem = polymorphicFactory<TaskItemFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('TaskItem', { size: 'sm', c: 'dimmed' }, _props);
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
    const getStyles = useStyles<TaskItemFactory>({
      name: 'TaskItem',
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
    return (
      <Text
        component="div"
        {...others}
        {...getStyles('root')}
        ref={ref}
        unstyled={unstyled}
      />
    );
  },
);
export interface TaskItemFileProps
  extends PaperProps,
    ElementProps<'div', keyof PaperProps | 'ref'> {}
export type TaskItemFileFactory = PolymorphicFactory<{
  props: TaskItemFileProps;
  defaultComponent: 'div';
  defaultRef: HTMLDivElement;
  stylesNames: 'root';
  vars: PaperCssVariables;
}>;
export const TaskItemFile = polymorphicFactory<TaskItemFileFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'TaskItemFile',
      { withBorder: true, radius: 'sm' },
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
    const getStyles = useStyles<TaskItemFileFactory>({
      name: 'TaskItemFile',
      props,
      classes: { root: classes.file },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Paper {...others} {...getStyles('root')} ref={ref} unstyled={unstyled} />
    );
  },
);
Task.displayName = 'Task';
Task.classes = {
  root: classes.root,
  trigger: classes.trigger,
  content: classes.content,
  body: classes.body,
  icon: classes.icon,
  title: classes.title,
  chevron: classes.chevron,
};
TaskTrigger.displayName = 'TaskTrigger';
TaskContent.displayName = 'TaskContent';
TaskItem.displayName = 'TaskItem';
TaskItem.classes = { root: classes.item };
TaskItemFile.displayName = 'TaskItemFile';
TaskItemFile.classes = { root: classes.file };
Task.Trigger = TaskTrigger;
Task.Content = TaskContent;
Task.Item = TaskItem;
Task.ItemFile = TaskItemFile;
