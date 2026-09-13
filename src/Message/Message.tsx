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
  Tooltip,
  type TooltipProps,
  useProps,
  useStyles,
} from '@mantine/core';
import type { UIMessage } from 'ai';
import { createContext, useContext } from 'react';
import classes from './Message.module.css';
import { MessageBranch } from './MessageBranch';
import { MessageResponse } from './MessageResponse';
export type MessageStylesNames = 'root' | 'content' | 'actions' | 'toolbar';
export interface MessageProps
  extends BoxProps,
    ElementProps<'div'>,
    StylesApiProps<MessageFactory> {
  from: UIMessage['role'];
}
export type MessageFactory = Factory<{
  props: MessageProps;
  ref: HTMLDivElement;
  stylesNames: MessageStylesNames;
  staticComponents: {
    Content: typeof MessageContent;
    Actions: typeof MessageActions;
    Action: typeof MessageAction;
    Toolbar: typeof MessageToolbar;
    Branch: typeof MessageBranch;
    Response: typeof MessageResponse;
  };
}>;
const Context = createContext<ReturnType<
  typeof useStyles<MessageFactory>
> | null>(null);
export const Message = factory<MessageFactory>(({ ref, ..._props }) => {
  const props = useProps('Message', {}, _props);
  const {
    from,
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
  const getStyles = useStyles<MessageFactory>({
    name: 'Message',
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
    <Context.Provider value={getStyles}>
      <Box {...others} {...getStyles('root')} data-from={from} ref={ref}>
        {children}
      </Box>
    </Context.Provider>
  );
});
export interface MessageSectionProps extends BoxProps, ElementProps<'div'> {}
function createSection(selector: 'content' | 'actions' | 'toolbar') {
  const Section = factory<{ props: MessageSectionProps; ref: HTMLDivElement }>(
    ({ ref, className, style, ...props }) => {
      const parent = useContext(Context);
      const fallback = useStyles<MessageFactory>({
        name: 'Message',
        classes,
        props: { from: 'assistant' },
      });
      const getStyles = parent ?? fallback;
      return (
        <Box
          {...props}
          {...getStyles(selector, { className, style })}
          ref={ref}
        />
      );
    },
  );
  Section.displayName = `Message.${selector}`;
  return Section;
}
export const MessageContent = createSection('content');
export const MessageActions = createSection('actions');
export const MessageToolbar = createSection('toolbar');
export interface MessageActionProps
  extends ActionIconProps,
    ElementProps<'button', 'color'> {
  tooltip?: string;
  label?: string;
  tooltipProps?: Omit<TooltipProps, 'children' | 'label'>;
}
export const MessageAction = factory<{
  props: MessageActionProps;
  ref: HTMLButtonElement;
}>(({ ref, ..._props }) => {
  const { tooltip, label, tooltipProps, ...props } = useProps(
    'MessageAction',
    { variant: 'subtle', size: 'sm' },
    _props,
  );
  const button = (
    <ActionIcon
      {...props}
      __staticSelector="MessageAction"
      ref={ref}
      aria-label={props['aria-label'] ?? label ?? tooltip}
      type="button"
    />
  );
  return tooltip ? (
    <Tooltip label={tooltip} {...tooltipProps}>
      {button}
    </Tooltip>
  ) : (
    button
  );
});
Message.displayName = 'Message';
Message.classes = classes;
Message.Content = MessageContent;
Message.Actions = MessageActions;
Message.Toolbar = MessageToolbar;
Message.Action = MessageAction;
Message.Branch = MessageBranch;
Message.Response = MessageResponse;
MessageAction.displayName = 'Message.Action';
