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
import classes from './ChainOfThought.module.css';
import {
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from './ChainOfThoughtParts';

export interface ChainOfThoughtProps
  extends BoxProps,
    StylesApiProps<ChainOfThoughtFactory>,
    ElementProps<'div', 'onChange'> {
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (opened: boolean) => void;
  disabled?: boolean;
}
export type ChainOfThoughtFactory = Factory<{
  props: ChainOfThoughtProps;
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
    Header: typeof ChainOfThoughtHeader;
    Step: typeof ChainOfThoughtStep;
    SearchResults: typeof ChainOfThoughtSearchResults;
    SearchResult: typeof ChainOfThoughtSearchResult;
    Image: typeof ChainOfThoughtImage;
    Content: typeof ChainOfThoughtContent;
  };
}>;
interface ChainOfThoughtContext {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  disabled: boolean;
  id: string;
  getStyles: ReturnType<typeof useStyles<ChainOfThoughtFactory>>;
}
const Context = createContext<ChainOfThoughtContext | null>(null);
function useChainOfThought() {
  const context = useContext(Context);
  if (!context)
    throw new Error(
      'ChainOfThoughtHeader and ChainOfThoughtContent must be used within ChainOfThought',
    );
  return context;
}
export const ChainOfThought = factory<ChainOfThoughtFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'ChainOfThought',
      { disabled: false, defaultOpened: false },
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
      finalValue: false,
      onChange,
    });
    const id = useId(idProp);
    const getStyles = useStyles<ChainOfThoughtFactory>({
      name: 'ChainOfThought',
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
export interface ChainOfThoughtHeaderProps
  extends UnstyledButtonProps,
    ElementProps<'button', keyof UnstyledButtonProps | 'ref'> {
  'data-disabled'?: boolean;
  icon?: ReactNode;
}
export type ChainOfThoughtHeaderFactory = PolymorphicFactory<{
  props: ChainOfThoughtHeaderProps;
  defaultRef: HTMLButtonElement;
  defaultComponent: 'button';
}>;
export const ChainOfThoughtHeader =
  polymorphicFactory<ChainOfThoughtHeaderFactory>(({ ref, ..._props }) => {
    const { children, icon, onClick, disabled, className, style, ...others } =
      useProps('ChainOfThoughtHeader', {}, _props);
    const context = useChainOfThought();
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
        <Box component="span" {...context.getStyles('icon')} aria-hidden="true">
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
              <path d="M12 18V5a3 3 0 0 0-5.8-1A4 4 0 0 0 3 10a4 4 0 0 0 1 7 4 4 0 0 0 8 1Zm0 0V5a3 3 0 0 1 5.8-1A4 4 0 0 1 21 10a4 4 0 0 1-1 7 4 4 0 0 1-8 1Z" />
            </svg>
          ) : (
            icon
          )}
        </Box>
        <Box component="span" {...context.getStyles('title')}>
          {children ?? 'Chain of Thought'}
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
      </UnstyledButton>
    );
  });
export interface ChainOfThoughtContentProps
  extends Omit<CollapseProps, 'expanded'> {}
export type ChainOfThoughtContentFactory = Factory<{
  props: ChainOfThoughtContentProps;
  ref: HTMLDivElement;
}>;
export const ChainOfThoughtContent = factory<ChainOfThoughtContentFactory>(
  ({ ref, ..._props }) => {
    const {
      children,
      className,
      style,
      id: idProp,
      ...others
    } = useProps('ChainOfThoughtContent', {}, _props);
    const context = useChainOfThought();
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

ChainOfThought.displayName = 'ChainOfThought';
ChainOfThought.classes = {
  root: classes.root,
  trigger: classes.trigger,
  content: classes.content,
  body: classes.body,
  icon: classes.icon,
  title: classes.title,
  chevron: classes.chevron,
};
ChainOfThoughtHeader.displayName = 'ChainOfThoughtHeader';
ChainOfThoughtContent.displayName = 'ChainOfThoughtContent';
ChainOfThought.Header = ChainOfThoughtHeader;
ChainOfThought.Content = ChainOfThoughtContent;
ChainOfThought.Step = ChainOfThoughtStep;
ChainOfThought.SearchResults = ChainOfThoughtSearchResults;
ChainOfThought.SearchResult = ChainOfThoughtSearchResult;
ChainOfThought.Image = ChainOfThoughtImage;
