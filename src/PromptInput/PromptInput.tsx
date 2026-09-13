'use client';

import { PromptInputCommand } from './PromptInputCommand';
import {
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputButton,
  PromptInputHoverCard,
  PromptInputHoverCardContent,
  PromptInputHoverCardTrigger,
  PromptInputSelect,
  PromptInputTab,
  PromptInputTabBody,
  PromptInputTabItem,
  PromptInputTabLabel,
  PromptInputTabsList,
} from './PromptInputControls';

/* Adapted from AI Elements, Copyright 2023 Vercel, Inc. (Apache-2.0).
 * Modified for Mantine, attachment ownership, submission guards and error reporting.
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
import { useMergedRef } from '@mantine/hooks';
import type { ChatStatus, FileUIPart } from 'ai';
import {
  createContext,
  type FormEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import classes from './PromptInput.module.css';
import {
  LocalAttachmentsContext,
  LocalReferencedSourcesContext,
  type PromptInputAttachmentConstraints,
  PromptInputControllerContext,
  useAttachmentStore,
  usePromptInputAttachments,
  useReferencedSources,
  validateFiles,
} from './prompt-input-state';

export interface PromptInputMessage {
  text: string;
  /** Ready-to-send AI SDK file parts. Local files are converted to data URLs. */
  files: FileUIPart[];
}

export type PromptInputStylesNames =
  | 'root'
  | 'header'
  | 'body'
  | 'footer'
  | 'tools';
export interface PromptInputProps
  extends BoxProps,
    PromptInputAttachmentConstraints,
    StylesApiProps<PromptInputFactory>,
    ElementProps<'form', 'onSubmit'> {
  multiple?: boolean;
  globalDrop?: boolean;
  fileInputLabel?: string;
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
    Button: typeof PromptInputButton;
    ActionMenu: typeof PromptInputActionMenu;
    ActionMenuTrigger: typeof PromptInputActionMenuTrigger;
    ActionMenuContent: typeof PromptInputActionMenuContent;
    ActionMenuItem: typeof PromptInputActionMenuItem;
    ActionAddAttachments: typeof PromptInputActionAddAttachments;
    ActionAddScreenshot: typeof PromptInputActionAddScreenshot;
    Select: typeof PromptInputSelect;
    HoverCard: typeof PromptInputHoverCard;
    HoverCardTrigger: typeof PromptInputHoverCardTrigger;
    HoverCardContent: typeof PromptInputHoverCardContent;
    TabsList: typeof PromptInputTabsList;
    Tab: typeof PromptInputTab;
    TabBody: typeof PromptInputTabBody;
    TabLabel: typeof PromptInputTabLabel;
    TabItem: typeof PromptInputTabItem;
    Command: typeof PromptInputCommand;
    Header: typeof PromptInputHeader;
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

function createSection(selector: 'header' | 'body' | 'footer' | 'tools') {
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

export const PromptInputHeader = createSection('header');
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
  const {
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
    onPaste,
    onChange,
    value,
    defaultValue,
    ...others
  } = useProps(
    'PromptInputTextarea',
    { autosize: true, minRows: 2, maxRows: 8, variant: 'unstyled' },
    props,
  );
  const composing = useRef(false);
  const controller = useContext(PromptInputControllerContext);
  const attachments = usePromptInputAttachments();

  return (
    <Textarea
      {...others}
      __staticSelector="PromptInputTextarea"
      name="message"
      ref={ref}
      value={controller ? controller.textInput.value : value}
      defaultValue={controller ? undefined : defaultValue}
      onChange={(event) => {
        controller?.textInput.setInput(event.currentTarget.value);
        onChange?.(event);
      }}
      onPaste={(event) => {
        onPaste?.(event);
        if (event.defaultPrevented) return;
        const files = Array.from(event.clipboardData?.items ?? [])
          .filter((item) => item.kind === 'file')
          .map((item) => item.getAsFile())
          .filter((file): file is File => file !== null);
        if (files.length) {
          event.preventDefault();
          attachments.add(files);
        }
      }}
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
        if (event.defaultPrevented) return;
        if (
          event.key === 'Backspace' &&
          !event.currentTarget.value &&
          !composing.current &&
          !event.nativeEvent.isComposing
        ) {
          const last = attachments.files.at(-1);
          if (last) {
            event.preventDefault();
            attachments.remove(last.id);
          }
          return;
        }
        if (event.key !== 'Enter' || event.shiftKey) return;
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
    accept,
    maxFiles,
    maxFileSize,
    onAttachmentError,
    multiple,
    globalDrop,
    fileInputLabel = 'Upload files',
    onDrop,
    onDragOver,
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
  const controller = useContext(PromptInputControllerContext);
  const localStore = useAttachmentStore();
  const store = controller?.store ?? localStore;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const mergedRef = useMergedRef(ref, formRef);
  const sources = useReferencedSources();
  const add = useCallback(
    (files: File[] | FileList) => {
      store.add(
        validateFiles(files, store.current.current.length, {
          accept,
          maxFiles,
          maxFileSize,
          onAttachmentError,
        }),
      );
    },
    [
      store.add,
      store.current,
      accept,
      maxFiles,
      maxFileSize,
      onAttachmentError,
    ],
  );
  const register = controller?.register;
  useEffect(() => {
    if (inputRef.current && register) return register(inputRef.current);
  }, [register]);
  useEffect(() => {
    if (!globalDrop) return;
    const dragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
    };
    const drop = (event: DragEvent) => {
      if (event.defaultPrevented || !event.dataTransfer?.files.length) return;
      event.preventDefault();
      add(event.dataTransfer.files);
    };
    document.addEventListener('dragover', dragOver);
    document.addEventListener('drop', drop);
    return () => {
      document.removeEventListener('dragover', dragOver);
      document.removeEventListener('drop', drop);
    };
  }, [globalDrop, add]);
  const attachments = {
    files: store.files,
    add,
    remove: store.remove,
    clear: store.clear,
    fileInputRef: inputRef,
    openFileDialog: () => inputRef.current?.click(),
  };

  return (
    <LocalAttachmentsContext.Provider value={attachments}>
      <LocalReferencedSourcesContext.Provider value={sources.context}>
        <StylesContext.Provider value={getStyles}>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={accept}
            multiple={multiple}
            aria-label={fileInputLabel}
            onChange={(event) => {
              if (event.currentTarget.files) add(event.currentTarget.files);
              event.currentTarget.value = '';
            }}
          />
          <Box<'form'>
            {...others}
            {...getStyles('root')}
            component="form"
            ref={mergedRef}
            onDragOver={(event) => {
              onDragOver?.(event);
              if (
                !event.defaultPrevented &&
                event.dataTransfer.types.includes('Files')
              )
                event.preventDefault();
            }}
            onDrop={(event) => {
              onDrop?.(event);
              if (event.defaultPrevented || !event.dataTransfer.files.length)
                return;
              event.preventDefault();
              add(event.dataTransfer.files);
            }}
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              if (submitting.current || cannotSubmit(form)) return;
              const input =
                controller?.textRef.current.value ??
                new FormData(form).get('message');
              const text = typeof input === 'string' ? input : '';
              const snapshot = store.snapshot();
              if (!text.trim() && !snapshot.ids.size) return;
              const sourceIds = new Set(
                sources.current.current.map((source) => source.id),
              );
              const revision = controller?.textRef.current.revision;
              submitting.current = true;
              // AI Elements' local mode clears before async work so the next draft survives.
              if (!controller) form.reset();
              try {
                const files = snapshot.ids.size ? await snapshot.convert() : [];
                await onSubmit({ text, files }, event);
                store.removeMany(snapshot.ids);
                sources.removeMany(sourceIds);
                if (
                  controller &&
                  controller.textRef.current.revision === revision
                )
                  controller.textInput.clear();
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
      </LocalReferencedSourcesContext.Provider>
    </LocalAttachmentsContext.Provider>
  );
});
PromptInput.displayName = 'PromptInput';
PromptInput.classes = classes;
PromptInput.Header = PromptInputHeader;
PromptInput.Body = PromptInputBody;
PromptInput.Footer = PromptInputFooter;
PromptInput.Tools = PromptInputTools;
PromptInput.Textarea = PromptInputTextarea;
PromptInput.Submit = PromptInputSubmit;

PromptInput.Button = PromptInputButton;
PromptInput.ActionMenu = PromptInputActionMenu;
PromptInput.ActionMenuTrigger = PromptInputActionMenuTrigger;
PromptInput.ActionMenuContent = PromptInputActionMenuContent;
PromptInput.ActionMenuItem = PromptInputActionMenuItem;
PromptInput.ActionAddAttachments = PromptInputActionAddAttachments;
PromptInput.ActionAddScreenshot = PromptInputActionAddScreenshot;
PromptInput.Select = PromptInputSelect;
PromptInput.HoverCard = PromptInputHoverCard;
PromptInput.HoverCardTrigger = PromptInputHoverCardTrigger;
PromptInput.HoverCardContent = PromptInputHoverCardContent;
PromptInput.TabsList = PromptInputTabsList;
PromptInput.Tab = PromptInputTab;
PromptInput.TabBody = PromptInputTabBody;
PromptInput.TabLabel = PromptInputTabLabel;
PromptInput.TabItem = PromptInputTabItem;
PromptInput.Command = PromptInputCommand;
