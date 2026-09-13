'use client';

/* Adapted from AI Elements (Apache-2.0). See NOTICE for attribution. */
import {
  ActionIcon,
  type ActionIconProps,
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  factory,
  type StylesApiProps,
  Text,
  useProps,
  useStyles,
} from '@mantine/core';
import { useMergedRef, useReducedMotion } from '@mantine/hooks';
import type { UIMessage } from 'ai';
import { createContext, type ReactNode, type Ref, useContext } from 'react';
import {
  StickToBottom,
  type StickToBottomProps,
  useStickToBottomContext,
} from 'use-stick-to-bottom';
import classes from './Conversation.module.css';

export type {
  StickToBottomContext,
  StickToBottomInstance,
} from 'use-stick-to-bottom';
export { useStickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
export type ConversationStylesNames = 'root' | 'viewport' | 'content';
export interface ConversationProps
  extends BoxProps,
    StylesApiProps<ConversationFactory>,
    Omit<StickToBottomProps, keyof BoxProps | 'style' | 'className'> {}
export type ConversationFactory = Factory<{
  props: ConversationProps;
  ref: HTMLDivElement;
  stylesNames: ConversationStylesNames;
  staticComponents: {
    Content: typeof ConversationContent;
    EmptyState: typeof ConversationEmptyState;
    ScrollButton: typeof ConversationScrollButton;
    Download: typeof ConversationDownload;
  };
}>;
const StylesContext = createContext<ReturnType<
  typeof useStyles<ConversationFactory>
> | null>(null);
export const Conversation = factory<ConversationFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('Conversation', {}, _props);
    const {
      className,
      style,
      classNames,
      styles,
      unstyled,
      vars,
      attributes,
      initial,
      resize,
      ...others
    } = props;
    const reducedMotion = useReducedMotion();
    const getStyles = useStyles<ConversationFactory>({
      name: 'Conversation',
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
      <StylesContext.Provider value={getStyles}>
        <Box
          component={StickToBottom}
          {...others}
          {...getStyles('root')}
          ref={ref}
          role={others.role ?? 'log'}
          initial={initial ?? (reducedMotion ? 'instant' : 'smooth')}
          resize={resize ?? (reducedMotion ? 'instant' : 'smooth')}
        />
      </StylesContext.Provider>
    );
  },
);

export interface ConversationContentProps
  extends BoxProps,
    Omit<StickToBottom.ContentProps, keyof BoxProps> {
  viewportRef?: Ref<HTMLDivElement>;
}
export const ConversationContent = factory<{
  props: ConversationContentProps;
  ref: HTMLDivElement;
}>(
  ({
    ref,
    viewportRef,
    children,
    scrollClassName,
    className,
    style,
    ...others
  }) => {
    const context = useStickToBottomContext();
    const getStyles = useContext(StylesContext);
    const contentRef = useMergedRef(context.contentRef, ref);
    const scrollRef = useMergedRef(context.scrollRef, viewportRef);
    if (!getStyles)
      throw new Error('Conversation.Content requires a Conversation parent');
    return (
      <Box
        {...getStyles('viewport', { className: scrollClassName })}
        ref={scrollRef}
      >
        <Box
          {...others}
          {...getStyles('content', { className, style })}
          ref={contentRef}
        >
          {typeof children === 'function' ? children(context) : children}
        </Box>
      </Box>
    );
  },
);

export interface ConversationEmptyStateProps
  extends BoxProps,
    ElementProps<'div', 'title'>,
    StylesApiProps<ConversationEmptyStateFactory> {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}
export type ConversationEmptyStateFactory = Factory<{
  props: ConversationEmptyStateProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
const emptyClasses = { root: classes.empty };
export const ConversationEmptyState = factory<ConversationEmptyStateFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'ConversationEmptyState',
      {
        title: 'No messages yet',
        description: 'Start a conversation to see messages here',
      },
      _props,
    );
    const {
      title,
      description,
      icon,
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
    const getStyles = useStyles<ConversationEmptyStateFactory>({
      name: 'ConversationEmptyState',
      classes: emptyClasses,
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
      <Box {...others} {...getStyles('root')} ref={ref}>
        {children ?? (
          <>
            {icon}
            <div>
              <Text component="h3" size="sm" fw={500}>
                {title}
              </Text>
              {description && (
                <Text size="sm" c="dimmed">
                  {description}
                </Text>
              )}
            </div>
          </>
        )}
      </Box>
    );
  },
);

export interface ConversationScrollButtonProps
  extends ActionIconProps,
    ElementProps<'button', 'color'> {}
export const ConversationScrollButton = factory<{
  props: ConversationScrollButtonProps;
  ref: HTMLButtonElement;
}>(({ ref, ..._props }) => {
  const { children, onClick, ...props } = useProps(
    'ConversationScrollButton',
    {
      variant: 'default',
      radius: 'xl',
      size: 'lg',
      'aria-label': 'Scroll to bottom',
      pos: 'absolute',
      bottom: 16,
      left: '50%',
      style: { transform: 'translateX(-50%)' },
    },
    _props,
  );
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  const reducedMotion = useReducedMotion();
  return (
    !isAtBottom && (
      <ActionIcon
        {...props}
        __staticSelector="ConversationScrollButton"
        ref={ref}
        type="button"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented)
            void scrollToBottom(reducedMotion ? 'instant' : undefined);
        }}
      >
        {children ?? (
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14m-6-6 6 6 6-6" />
          </svg>
        )}
      </ActionIcon>
    )
  );
});

export function messagesToMarkdown(
  messages: readonly UIMessage[],
  formatMessage: (message: UIMessage, index: number) => string = (message) =>
    `**${message.role.charAt(0).toUpperCase() + message.role.slice(1)}:** ${message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('')}`,
): string {
  return messages.map(formatMessage).join('\n\n');
}
export interface ConversationDownloadProps
  extends ConversationScrollButtonProps {
  messages: readonly UIMessage[];
  filename?: string;
  formatMessage?: (message: UIMessage, index: number) => string;
}
export const ConversationDownload = factory<{
  props: ConversationDownloadProps;
  ref: HTMLButtonElement;
}>(({ ref, ..._props }) => {
  const { messages, filename, formatMessage, children, onClick, ...props } =
    useProps(
      'ConversationDownload',
      {
        filename: 'conversation.md',
        variant: 'default',
        radius: 'xl',
        size: 'lg',
        'aria-label': 'Download conversation',
        pos: 'absolute',
        top: 16,
        right: 16,
      },
      _props,
    );
  return (
    <ActionIcon
      {...props}
      __staticSelector="ConversationDownload"
      ref={ref}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const url = URL.createObjectURL(
          new Blob([messagesToMarkdown(messages, formatMessage)], {
            type: 'text/markdown',
          }),
        );
        const link = document.createElement('a');
        try {
          link.href = url;
          link.download = filename ?? 'conversation.md';
          document.body.append(link);
          link.click();
        } finally {
          link.remove();
          URL.revokeObjectURL(url);
        }
      }}
    >
      {children ?? (
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />
        </svg>
      )}
    </ActionIcon>
  );
});
Conversation.displayName = 'Conversation';
Conversation.classes = classes;
Conversation.Content = ConversationContent;
Conversation.EmptyState = ConversationEmptyState;
Conversation.ScrollButton = ConversationScrollButton;
Conversation.Download = ConversationDownload;
ConversationContent.displayName = 'Conversation.Content';
ConversationEmptyState.displayName = 'Conversation.EmptyState';
ConversationEmptyState.classes = emptyClasses;
ConversationScrollButton.displayName = 'Conversation.ScrollButton';
ConversationDownload.displayName = 'Conversation.Download';
