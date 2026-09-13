'use client';

/* Adapted from AI Elements, Copyright 2023 Vercel, Inc. (Apache-2.0).
 * Modified for Mantine, text-only composition, submission guards and error reporting.
 * Upstream commit and attribution: see NOTICE.
 */

import {
  ActionIcon,
  type ActionIconProps,
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  factory,
  Loader,
  type StylesApiProps,
  Textarea,
  type TextareaProps,
  useProps,
  useStyles,
} from '@mantine/core';
import type { ChatStatus, FileUIPart } from 'ai';
import {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useRef,
} from 'react';
import classes from './PromptInput.module.css';

export interface PromptInputMessage {
  text: string;
  /** Empty until attachment support is added. Matches AI Elements' payload. */
  files: FileUIPart[];
}

export type PromptInputStylesNames = 'root' | 'body' | 'footer' | 'tools';
export interface PromptInputProps
  extends BoxProps,
    StylesApiProps<PromptInputFactory>,
    ElementProps<'form', 'onSubmit'> {
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
  /** Errors thrown/rejected by onSubmit. AI SDK errors remain owned by useChat. */
  onSubmitError?: (error: unknown) => void;
}

export type PromptInputFactory = Factory<{
  props: PromptInputProps;
  ref: HTMLFormElement;
  stylesNames: PromptInputStylesNames;
  staticComponents: {
    Body: typeof PromptInputBody;
    Footer: typeof PromptInputFooter;
    Tools: typeof PromptInputTools;
    Textarea: typeof PromptInputTextarea;
    Submit: typeof PromptInputSubmit;
  };
}>;

const StylesContext = createContext<ReturnType<
  typeof useStyles<PromptInputFactory>
> | null>(null);

export interface PromptInputSectionProps
  extends BoxProps,
    ElementProps<'div'> {}

function createSection(selector: 'body' | 'footer' | 'tools') {
  const Section = factory<{
    props: PromptInputSectionProps;
    ref: HTMLDivElement;
  }>(({ className, style, ref, ...props }) => {
    const getStyles = useContext(StylesContext);
    if (!getStyles)
      throw new Error('PromptInput sections require a PromptInput parent');
    return (
      <Box
        {...getStyles(selector, { className, style })}
        {...props}
        ref={ref}
      />
    );
  });
  Section.displayName = `PromptInput.${selector}`;
  return Section;
}

export const PromptInputBody = createSection('body');
export const PromptInputFooter = createSection('footer');
export const PromptInputTools = createSection('tools');

function cannotSubmit(form: HTMLFormElement) {
  const button = form.querySelector<HTMLButtonElement>(
    '[data-prompt-input-submit]',
  );
  return button?.disabled || button?.dataset.generating === 'true';
}

export interface PromptInputTextareaProps extends TextareaProps {}

export const PromptInputTextarea = factory<{
  props: PromptInputTextareaProps;
  ref: HTMLTextAreaElement;
}>(({ ref, ...props }) => {
  const { onKeyDown, onCompositionStart, onCompositionEnd, ...others } =
    useProps(
      'PromptInputTextarea',
      { autosize: true, minRows: 2, maxRows: 8, variant: 'unstyled' },
      props,
    );
  const composing = useRef(false);

  return (
    <Textarea
      {...others}
      __staticSelector="PromptInputTextarea"
      name="message"
      ref={ref}
      onCompositionStart={(event) => {
        composing.current = true;
        onCompositionStart?.(event);
      }}
      onCompositionEnd={(event) => {
        composing.current = false;
        onCompositionEnd?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.key !== 'Enter' || event.shiftKey)
          return;
        if (
          composing.current ||
          event.nativeEvent.isComposing ||
          event.nativeEvent.keyCode === 229
        )
          return;
        event.preventDefault();
        const form = event.currentTarget.form;
        if (form && !cannotSubmit(form)) form.requestSubmit();
      }}
    />
  );
});
PromptInputTextarea.displayName = 'PromptInput.Textarea';

export interface PromptInputSubmitProps
  extends ActionIconProps,
    ElementProps<'button', 'color'> {
  status?: ChatStatus;
  onStop?: () => void;
  submitLabel?: string;
  stopLabel?: string;
}

function StatusIcon({ status }: { status?: ChatStatus }) {
  if (status === 'submitted') return <Loader size={16} color="currentColor" />;
  let shape: ReactNode = <path d="M5 12h14m-6-6 6 6-6 6" />;
  if (status === 'streaming')
    shape = <rect x="6" y="6" width="12" height="12" rx="1" />;
  if (status === 'error') shape = <path d="m6 6 12 12M6 18 18 6" />;
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {shape}
    </svg>
  );
}

export const PromptInputSubmit = factory<{
  props: PromptInputSubmitProps;
  ref: HTMLButtonElement;
}>(({ ref, ...props }) => {
  const {
    status,
    onStop,
    onClick,
    children,
    disabled,
    loading,
    submitLabel,
    stopLabel,
    ...others
  } = useProps(
    'PromptInputSubmit',
    { submitLabel: 'Send message', stopLabel: 'Stop generating', size: 'lg' },
    props,
  );
  const generating = status === 'submitted' || status === 'streaming';
  return (
    <ActionIcon
      {...others}
      __staticSelector="PromptInputSubmit"
      ref={ref}
      data-prompt-input-submit=""
      data-generating={generating || undefined}
      aria-label={props['aria-label'] ?? (generating ? stopLabel : submitLabel)}
      type={generating ? 'button' : 'submit'}
      disabled={disabled || (generating && !onStop)}
      loading={generating ? false : loading}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (generating) {
          event.preventDefault();
          onStop?.();
        }
      }}
    >
      {children ?? <StatusIcon status={status} />}
    </ActionIcon>
  );
});
PromptInputSubmit.displayName = 'PromptInput.Submit';

export const PromptInput = factory<PromptInputFactory>(({ ref, ..._props }) => {
  const props = useProps('PromptInput', {}, _props);
  const {
    children,
    onSubmit,
    onSubmitError,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    attributes,
    ...others
  } = props;
  const getStyles = useStyles<PromptInputFactory>({
    name: 'PromptInput',
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
  const submitting = useRef(false);

  return (
    <StylesContext.Provider value={getStyles}>
      <Box<'form'>
        {...others}
        {...getStyles('root')}
        component="form"
        ref={ref}
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          if (submitting.current || cannotSubmit(form)) return;
          const text = new FormData(form).get('message');
          if (typeof text !== 'string' || !text.trim()) return;
          submitting.current = true;
          // AI Elements' local mode clears before async work so the next draft survives.
          form.reset();
          try {
            await onSubmit({ text, files: [] }, event);
          } catch (error) {
            onSubmitError?.(error);
          } finally {
            submitting.current = false;
          }
        }}
      >
        {children}
      </Box>
    </StylesContext.Provider>
  );
});
PromptInput.displayName = 'PromptInput';
PromptInput.classes = classes;
PromptInput.Body = PromptInputBody;
PromptInput.Footer = PromptInputFooter;
PromptInput.Tools = PromptInputTools;
PromptInput.Textarea = PromptInputTextarea;
PromptInput.Submit = PromptInputSubmit;
