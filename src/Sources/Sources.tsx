'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Anchor,
  type AnchorCssVariables,
  type AnchorProps,
  Box,
  type BoxProps,
  Collapse,
  type CollapseProps,
  type ElementProps,
  type Factory,
  factory,
  type PolymorphicFactory,
  polymorphicFactory,
  type StylesApiProps,
  UnstyledButton,
  type UnstyledButtonProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useId, useUncontrolled } from '@mantine/hooks';
import { createContext, type ReactNode, useContext } from 'react';
import classes from './Sources.module.css';
export interface SourcesProps
  extends BoxProps,
    StylesApiProps<SourcesFactory>,
    ElementProps<'div', 'onChange'> {
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (opened: boolean) => void;
  disabled?: boolean;
}
export type SourcesFactory = Factory<{
  props: SourcesProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'trigger' | 'chevron' | 'content' | 'body';
  staticComponents: {
    Trigger: typeof SourcesTrigger;
    Content: typeof SourcesContent;
    Source: typeof Source;
  };
}>;
interface ContextValue {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  disabled: boolean;
  id: string;
  getStyles: ReturnType<typeof useStyles<SourcesFactory>>;
}
const Context = createContext<ContextValue | null>(null);
function useSources() {
  const context = useContext(Context);
  if (!context)
    throw new Error(
      'Sources.Trigger and Sources.Content must be used within Sources',
    );
  return context;
}
export const Sources = factory<SourcesFactory>(({ ref, ..._props }) => {
  const props = useProps('Sources', { disabled: false }, _props);
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
    finalValue: false,
    onChange,
  });
  const id = useId(idProp);
  const getStyles = useStyles<SourcesFactory>({
    name: 'Sources',
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
      <Box {...others} {...getStyles('root')} ref={ref} id={id}>
        {children}
      </Box>
    </Context.Provider>
  );
});
export interface SourcesTriggerProps
  extends UnstyledButtonProps,
    ElementProps<'button', keyof UnstyledButtonProps> {
  count: number;
  'data-disabled'?: boolean;
}
export type SourcesTriggerFactory = Factory<{
  props: SourcesTriggerProps;
  ref: HTMLButtonElement;
}>;
export const SourcesTrigger = factory<SourcesTriggerFactory>(
  ({ ref, ..._props }) => {
    const { count, children, onClick, disabled, className, style, ...others } =
      useProps('SourcesTrigger', {}, _props);
    const context = useSources();
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
            <span>
              Used {count} {count === 1 ? 'source' : 'sources'}
            </span>
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
export interface SourcesContentProps extends Omit<CollapseProps, 'expanded'> {}
export type SourcesContentFactory = Factory<{
  props: SourcesContentProps;
  ref: HTMLDivElement;
}>;
export const SourcesContent = factory<SourcesContentFactory>(
  ({ ref, ..._props }) => {
    const {
      children,
      className,
      style,
      id: idProp,
      ...others
    } = useProps('SourcesContent', {}, _props);
    const id = useId(idProp);
    const context = useSources();
    return (
      <Collapse
        {...others}
        {...context.getStyles('content', { className, style })}
        ref={ref}
        id={id}
        expanded={context.opened}
        role="region"
        aria-labelledby={`${context.id}-trigger`}
      >
        <Box {...context.getStyles('body')}>{children}</Box>
      </Collapse>
    );
  },
);
export interface SourceProps
  extends AnchorProps,
    ElementProps<'a', keyof AnchorProps> {
  icon?: ReactNode;
}
export type SourceFactory = PolymorphicFactory<{
  props: SourceProps;
  defaultComponent: 'a';
  defaultRef: HTMLAnchorElement;
  stylesNames: 'root';
  vars: AnchorCssVariables;
}>;
export const Source = polymorphicFactory<SourceFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'Source',
      { target: '_blank', rel: 'noreferrer', size: 'xs', fw: 500 },
      _props,
    );
    const {
      title,
      href,
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
    const getStyles = useStyles<SourceFactory>({
      name: 'Source',
      props,
      classes: { root: classes.source },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Anchor
        {...others}
        {...getStyles('root')}
        ref={ref}
        href={href}
        title={title}
        unstyled={unstyled}
      >
        {children ?? (
          <>
            {icon === undefined ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Zm0 0v15" />
              </svg>
            ) : (
              icon
            )}
            <span>{title || href}</span>
          </>
        )}
      </Anchor>
    );
  },
);
Sources.displayName = 'Sources';
SourcesTrigger.displayName = 'SourcesTrigger';
SourcesContent.displayName = 'SourcesContent';
Source.displayName = 'Source';
Sources.classes = classes;
Source.classes = { root: classes.source };
Sources.Trigger = SourcesTrigger;
Sources.Content = SourcesContent;
Sources.Source = Source;
