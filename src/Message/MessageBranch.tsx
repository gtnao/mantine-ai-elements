'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  ActionIcon,
  type ActionIconProps,
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  factory,
  type StylesApiProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import {
  Children,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import classes from './MessageBranch.module.css';
export type MessageBranchStylesNames = 'root' | 'panel' | 'selector' | 'page';
export interface MessageBranchProps
  extends BoxProps,
    ElementProps<'div'>,
    StylesApiProps<MessageBranchFactory> {
  branch?: number;
  defaultBranch?: number;
  onBranchChange?: (index: number) => void;
}
export type MessageBranchFactory = Factory<{
  props: MessageBranchProps;
  ref: HTMLDivElement;
  stylesNames: MessageBranchStylesNames;
  staticComponents: {
    Content: typeof MessageBranchContent;
    Selector: typeof MessageBranchSelector;
    Previous: typeof MessageBranchPrevious;
    Next: typeof MessageBranchNext;
    Page: typeof MessageBranchPage;
  };
}>;
interface BranchContext {
  branch: number;
  total: number;
  setTotal: (total: number) => void;
  change: (index: number) => void;
  getStyles: ReturnType<typeof useStyles<MessageBranchFactory>>;
}
const Context = createContext<BranchContext | null>(null);
function useBranch() {
  const context = useContext(Context);
  if (!context)
    throw new Error('MessageBranch components require a MessageBranch parent');
  return context;
}
const normalizeIndex = (value: number, total: number) =>
  Math.max(
    0,
    Math.min(
      Number.isFinite(value) ? Math.trunc(value) : 0,
      Math.max(0, total - 1),
    ),
  );
export const MessageBranch = factory<MessageBranchFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('MessageBranch', {}, _props);
    const {
      branch,
      defaultBranch,
      onBranchChange,
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
    const [value, setValue] = useUncontrolled({
      value: branch,
      defaultValue: defaultBranch,
      finalValue: 0,
      onChange: onBranchChange,
    });
    const [total, setTotal] = useState(0);
    const getStyles = useStyles<MessageBranchFactory>({
      name: 'MessageBranch',
      classes,
      props,
      className,
      style,
      classNames,
      styles,
      unstyled,
      vars,
      attributes,
    });
    return (
      <Context.Provider
        value={{ branch: value, total, setTotal, change: setValue, getStyles }}
      >
        <Box {...others} {...getStyles('root')} ref={ref}>
          {children}
        </Box>
      </Context.Provider>
    );
  },
);
export interface MessageBranchContentProps
  extends BoxProps,
    ElementProps<'div'> {}
export const MessageBranchContent = factory<{
  props: MessageBranchContentProps;
  ref: HTMLDivElement;
}>(({ ref, children, className, style, ...props }) => {
  const { branch, setTotal, getStyles } = useBranch();
  const nodes = Children.toArray(children);
  const count = nodes.length;
  useEffect(() => {
    setTotal(count);
    return () => setTotal(0);
  }, [count, setTotal]);
  const current = normalizeIndex(branch, count);
  return (
    <Box {...props} ref={ref} className={className} style={style}>
      {nodes.map((node, index) => (
        <Box
          {...getStyles('panel')}
          hidden={index !== current}
          key={
            typeof node === 'object' && 'key' in node
              ? node.key
              : `branch-${index}`
          }
        >
          {node}
        </Box>
      ))}
    </Box>
  );
});
export interface MessageBranchSelectorProps
  extends BoxProps,
    ElementProps<'div'> {}
export const MessageBranchSelector = factory<{
  props: MessageBranchSelectorProps;
  ref: HTMLDivElement;
}>(({ ref, className, style, ...props }) => {
  const { total, getStyles } = useBranch();
  return total > 1 ? (
    <Box
      {...props}
      {...getStyles('selector', { className, style })}
      ref={ref}
    />
  ) : null;
});
export interface MessageBranchButtonProps
  extends ActionIconProps,
    ElementProps<'button', 'color'> {}
function createNavigation(direction: -1 | 1) {
  const name = direction === -1 ? 'MessageBranchPrevious' : 'MessageBranchNext';
  const Navigation = factory<{
    props: MessageBranchButtonProps;
    ref: HTMLButtonElement;
  }>(({ ref, ..._props }) => {
    const { children, onClick, disabled, ...props } = useProps(
      name,
      {
        variant: 'subtle',
        size: 'sm',
        'aria-label': direction === -1 ? 'Previous branch' : 'Next branch',
      },
      _props,
    );
    const { total, branch, change } = useBranch();
    return (
      <ActionIcon
        {...props}
        __staticSelector={name}
        type="button"
        ref={ref}
        disabled={disabled || total <= 1}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && total > 1)
            change((normalizeIndex(branch, total) + direction + total) % total);
        }}
      >
        {children ?? (
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d={direction === -1 ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'} />
          </svg>
        )}
      </ActionIcon>
    );
  });
  Navigation.displayName = name;
  return Navigation;
}
export const MessageBranchPrevious = createNavigation(-1);
export const MessageBranchNext = createNavigation(1);
export interface MessageBranchPageProps extends BoxProps, ElementProps<'span'> {
  formatLabel?: (current: number, total: number) => ReactNode;
}
export const MessageBranchPage = factory<{
  props: MessageBranchPageProps;
  ref: HTMLSpanElement;
}>(
  ({
    ref,
    className,
    style,
    formatLabel = (current, total) => `${current} of ${total}`,
    children,
    ...props
  }) => {
    const { branch, total, getStyles } = useBranch();
    return (
      <Box
        component="span"
        {...props}
        {...getStyles('page', { className, style })}
        ref={ref}
      >
        {children ??
          formatLabel(total ? normalizeIndex(branch, total) + 1 : 0, total)}
      </Box>
    );
  },
);
MessageBranch.displayName = 'MessageBranch';
MessageBranch.classes = classes;
MessageBranch.Content = MessageBranchContent;
MessageBranch.Selector = MessageBranchSelector;
MessageBranch.Previous = MessageBranchPrevious;
MessageBranch.Next = MessageBranchNext;
MessageBranch.Page = MessageBranchPage;
MessageBranchContent.displayName = 'MessageBranch.Content';
MessageBranchSelector.displayName = 'MessageBranch.Selector';
MessageBranchPage.displayName = 'MessageBranch.Page';
