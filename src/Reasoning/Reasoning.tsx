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
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  MessageResponse,
  type MessageResponseProps,
} from '../Message/MessageResponse';
import { Shimmer } from '../Shimmer/Shimmer';
import classes from './Reasoning.module.css';

export interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (opened: boolean) => void;
  duration: number | undefined;
}
interface InternalContext extends ReasoningContextValue {
  id: string;
  disabled: boolean;
  getStyles: ReturnType<typeof useStyles<ReasoningFactory>>;
}
const Context = createContext<InternalContext | null>(null);
function useContextValue() {
  const value = useContext(Context);
  if (!value)
    throw new Error('Reasoning components must be used within Reasoning');
  return value;
}
export function useReasoning(): ReasoningContextValue {
  return useContextValue();
}
export interface ReasoningProps
  extends BoxProps,
    StylesApiProps<ReasoningFactory>,
    ElementProps<'div', 'onChange'> {
  isStreaming?: boolean;
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (opened: boolean) => void;
  /** Display duration in seconds instead of measuring the current stream. */
  duration?: number;
  disabled?: boolean;
}
export type ReasoningFactory = Factory<{
  props: ReasoningProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'trigger' | 'content' | 'chevron';
  staticComponents: {
    Trigger: typeof ReasoningTrigger;
    Content: typeof ReasoningContent;
  };
}>;
export const Reasoning = factory<ReasoningFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'Reasoning',
    { isStreaming: false, disabled: false },
    _props,
  );
  const {
    isStreaming,
    disabled,
    opened,
    defaultOpened,
    onChange,
    duration: durationProp,
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
  const [isOpen, setIsOpen] = useUncontrolled({
    value: opened,
    defaultValue: defaultOpened ?? isStreaming,
    finalValue: false,
    onChange,
  });
  const [measuredDuration, setMeasuredDuration] = useState<number>();
  const started = useRef<number | null>(null);
  const everStreamed = useRef(isStreaming);
  const previousStreaming = useRef(false);
  const autoClosed = useRef(false);
  const getStyles = useStyles<ReasoningFactory>({
    name: 'Reasoning',
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
  useEffect(() => {
    if (isStreaming) {
      everStreamed.current = true;
      if (started.current === null) {
        started.current = Date.now();
        setMeasuredDuration(undefined);
      }
      if (!previousStreaming.current && !isOpen && defaultOpened !== false)
        setIsOpen(true);
    } else if (started.current !== null) {
      setMeasuredDuration(Math.ceil((Date.now() - started.current) / 1000));
      started.current = null;
    }
    previousStreaming.current = isStreaming;
  }, [isStreaming, isOpen, defaultOpened, setIsOpen]);
  useEffect(() => {
    if (!everStreamed.current || isStreaming || !isOpen || autoClosed.current)
      return;
    const timer = setTimeout(() => {
      autoClosed.current = true;
      setIsOpen(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isStreaming, isOpen, setIsOpen]);
  return (
    <Context.Provider
      value={{
        isStreaming,
        disabled,
        isOpen,
        setIsOpen,
        duration: durationProp ?? measuredDuration,
        id,
        getStyles,
      }}
    >
      <Box
        {...others}
        {...getStyles('root')}
        id={id}
        ref={ref}
        data-streaming={isStreaming || undefined}
      >
        {children}
      </Box>
    </Context.Provider>
  );
});

export interface ReasoningTriggerProps
  extends UnstyledButtonProps,
    ElementProps<'button', keyof UnstyledButtonProps> {
  'data-disabled'?: boolean;
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
}
export type ReasoningTriggerFactory = Factory<{
  props: ReasoningTriggerProps;
  ref: HTMLButtonElement;
}>;
function thinkingMessage(streaming: boolean, duration?: number) {
  if (streaming || duration === 0)
    return (
      <Shimmer component="span" duration={1} m={0}>
        Thinking...
      </Shimmer>
    );
  return duration === undefined
    ? 'Thought for a few seconds'
    : `Thought for ${duration} ${duration === 1 ? 'second' : 'seconds'}`;
}
export const ReasoningTrigger = factory<ReasoningTriggerFactory>(
  ({ ref, ..._props }) => {
    const {
      children,
      getThinkingMessage = thinkingMessage,
      onClick,
      className,
      style,
      disabled,
      ...others
    } = useProps('ReasoningTrigger', {}, _props);
    const context = useContextValue();
    return (
      <UnstyledButton
        {...others}
        {...context.getStyles('trigger', { className, style })}
        ref={ref}
        type="button"
        id={`${context.id}-trigger`}
        aria-expanded={context.isOpen}
        aria-controls={`${context.id}-content`}
        disabled={disabled || context.disabled}
        onClick={(event) => {
          onClick?.(event);
          if (
            !event.defaultPrevented &&
            !disabled &&
            !context.disabled &&
            !others['data-disabled']
          )
            context.setIsOpen(!context.isOpen);
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
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M12 18V5a3 3 0 0 0-6-1 4 4 0 0 0-3 6 4 4 0 0 0 1 7 4 4 0 0 0 8 1Zm0-13a3 3 0 0 1 6-1 4 4 0 0 1 3 6 4 4 0 0 1-1 7 4 4 0 0 1-8 1M6 8l3 2m9-2-3 2M7 16l2-2m8 2-2-2" />
            </svg>
            {getThinkingMessage(context.isStreaming, context.duration)}
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
              data-opened={context.isOpen || undefined}
            >
              <path d="m6 9 6 6 6-6" />
            </Box>
          </>
        )}
      </UnstyledButton>
    );
  },
);
export interface ReasoningContentProps
  extends Omit<CollapseProps, 'expanded' | 'children'> {
  children: string;
  responseProps?: Omit<MessageResponseProps, 'children'>;
}
export type ReasoningContentFactory = Factory<{
  props: ReasoningContentProps;
  ref: HTMLDivElement;
}>;
export const ReasoningContent = factory<ReasoningContentFactory>(
  ({ ref, ..._props }) => {
    const { children, responseProps, className, style, ...others } = useProps(
      'ReasoningContent',
      {},
      _props,
    );
    const context = useContextValue();
    return (
      <Collapse
        {...others}
        {...context.getStyles('content', { className, style })}
        ref={ref}
        expanded={context.isOpen}
        id={`${context.id}-content`}
        role="region"
        aria-labelledby={`${context.id}-trigger`}
      >
        <MessageResponse
          py="sm"
          isAnimating={context.isStreaming}
          {...responseProps}
        >
          {children}
        </MessageResponse>
      </Collapse>
    );
  },
);
Reasoning.displayName = 'Reasoning';
ReasoningTrigger.displayName = 'ReasoningTrigger';
ReasoningContent.displayName = 'ReasoningContent';
Reasoning.classes = classes;
Reasoning.Trigger = ReasoningTrigger;
Reasoning.Content = ReasoningContent;
