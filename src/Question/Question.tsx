'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  type BoxProps,
  Button,
  type ButtonCssVariables,
  type ButtonProps,
  type ButtonStylesNames,
  createScopedKeydownHandler,
  type ElementProps,
  type Factory,
  factory,
  type StylesApiProps,
  Text,
  Textarea,
  type TextareaFactory,
  type TextareaProps,
  useDirection,
  useProps,
  useStyles,
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classes from './Question.module.css';

export interface QuestionValue {
  selectedValues: readonly string[];
  text: string;
}
export interface QuestionResponse {
  selectedValues: readonly string[];
  text?: string;
}
export interface QuestionProps
  extends BoxProps,
    StylesApiProps<QuestionFactory>,
    ElementProps<'form', 'defaultValue' | 'onSubmit' | 'value'> {
  value?: QuestionValue;
  defaultValue?: QuestionValue;
  onValueChange?: (value: QuestionValue) => void;
  selectionMode?: 'single' | 'multiple';
  disabled?: boolean;
  pending?: boolean;
  onSubmit?: (
    response: QuestionResponse,
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
  onSubmitError?: (error: unknown) => void;
}
export type QuestionFactory = Factory<{
  props: QuestionProps;
  ref: HTMLFormElement;
  stylesNames: 'root' | 'prompt' | 'description' | 'options' | 'actions';
  staticComponents: {
    Prompt: typeof QuestionPrompt;
    Description: typeof QuestionDescription;
    Options: typeof QuestionOptions;
    Option: typeof QuestionOption;
    Input: typeof QuestionInput;
    Actions: typeof QuestionActions;
    Submit: typeof QuestionSubmit;
  };
}>;
interface QuestionContextValue {
  value: QuestionValue;
  disabled: boolean;
  pending: boolean;
  selectionMode: 'single' | 'multiple';
  toggle: (value: string) => void;
  setText: (text: string) => void;
  getStyles: ReturnType<typeof useStyles<QuestionFactory>>;
}
const Context = createContext<QuestionContextValue | null>(null);
function useQuestion() {
  const context = useContext(Context);
  if (!context)
    throw new Error('Question components must be used within Question');
  return context;
}
const emptyValue: QuestionValue = { selectedValues: [], text: '' };
export const Question = factory<QuestionFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'Question',
    { selectionMode: 'single', disabled: false, pending: false },
    _props,
  );
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    selectionMode = 'single',
    disabled,
    pending,
    onSubmit,
    onSubmitError,
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
  const [value, setValue, controlled] = useUncontrolled({
    value: controlledValue,
    defaultValue,
    finalValue: emptyValue,
    onChange: onValueChange,
  });
  const current = useRef(value);
  current.current = value;
  const flight = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const getStyles = useStyles<QuestionFactory>({
    name: 'Question',
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
  const update = (next: QuestionValue) => {
    if (disabled || pending || flight.current) return;
    if (!controlled) current.current = next;
    setValue(next);
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const cancelled = event.defaultPrevented;
    event.preventDefault();
    if (cancelled || disabled || pending || flight.current || !onSubmit) return;
    const text = current.current.text.trim();
    const selectedValues = [...current.current.selectedValues];
    if (!text && selectedValues.length === 0) return;
    flight.current = true;
    setSubmitting(true);
    try {
      await onSubmit({ selectedValues, text: text || undefined }, event);
    } catch (error) {
      if (mounted.current) onSubmitError?.(error);
    } finally {
      flight.current = false;
      if (mounted.current) setSubmitting(false);
    }
  };
  return (
    <Context.Provider
      value={{
        value,
        selectionMode,
        disabled: disabled || pending || submitting,
        pending: pending || submitting,
        getStyles,
        setText: (text) => update({ ...current.current, text }),
        toggle: (option) => {
          const selected = current.current.selectedValues;
          update({
            ...current.current,
            selectedValues: selected.includes(option)
              ? selected.filter((item) => item !== option)
              : selectionMode === 'single'
                ? [option]
                : [...selected, option],
          });
        },
      }}
    >
      <Box
        component="form"
        {...others}
        {...getStyles('root')}
        ref={ref}
        aria-busy={pending || submitting}
        onSubmit={handleSubmit}
      >
        {children}
      </Box>
    </Context.Provider>
  );
});

export interface QuestionPromptProps extends BoxProps, ElementProps<'p'> {}
export type QuestionPromptFactory = Factory<{
  props: QuestionPromptProps;
  ref: HTMLParagraphElement;
}>;
export const QuestionPrompt = factory<QuestionPromptFactory>(
  ({ ref, ..._props }) => {
    const { className, style, ...others } = useProps(
      'QuestionPrompt',
      {},
      _props,
    );
    return (
      <Text
        component="p"
        {...others}
        {...useQuestion().getStyles('prompt', { className, style })}
        ref={ref}
      />
    );
  },
);
export interface QuestionDescriptionProps extends BoxProps, ElementProps<'p'> {}
export type QuestionDescriptionFactory = Factory<{
  props: QuestionDescriptionProps;
  ref: HTMLParagraphElement;
}>;
export const QuestionDescription = factory<QuestionDescriptionFactory>(
  ({ ref, ..._props }) => {
    const { className, style, ...others } = useProps(
      'QuestionDescription',
      {},
      _props,
    );
    return (
      <Text
        component="p"
        {...others}
        {...useQuestion().getStyles('description', { className, style })}
        ref={ref}
      />
    );
  },
);
export interface QuestionOptionsProps extends BoxProps, ElementProps<'div'> {}
export type QuestionOptionsFactory = Factory<{
  props: QuestionOptionsProps;
  ref: HTMLDivElement;
}>;
export const QuestionOptions = factory<QuestionOptionsFactory>(
  ({ ref, ..._props }) => {
    const { className, style, ...others } = useProps(
      'QuestionOptions',
      {},
      _props,
    );
    const context = useQuestion();
    return (
      <Box
        {...others}
        {...context.getStyles('options', { className, style })}
        ref={ref}
        data-question-options
        role={context.selectionMode === 'single' ? 'radiogroup' : 'group'}
      />
    );
  },
);
export interface QuestionActionsProps extends BoxProps, ElementProps<'div'> {}
export type QuestionActionsFactory = Factory<{
  props: QuestionActionsProps;
  ref: HTMLDivElement;
}>;
export const QuestionActions = factory<QuestionActionsFactory>(
  ({ ref, ..._props }) => {
    const { className, style, ...others } = useProps(
      'QuestionActions',
      {},
      _props,
    );
    return (
      <Box
        {...others}
        {...useQuestion().getStyles('actions', { className, style })}
        ref={ref}
      />
    );
  },
);

export interface QuestionOptionProps
  extends ButtonProps,
    ElementProps<'button', keyof ButtonProps | 'value'> {
  value: string;
}
export type QuestionOptionFactory = Factory<{
  props: QuestionOptionProps;
  ref: HTMLButtonElement;
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
}>;
export const QuestionOption = factory<QuestionOptionFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'QuestionOption',
      { size: 'sm', h: 'auto', py: 'xs', maw: '100%' },
      _props,
    );
    const {
      value,
      disabled,
      loading,
      onClick,
      onKeyDown,
      children,
      variant,
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
      ...others
    } = props;
    const context = useQuestion();
    const { dir } = useDirection();
    const selected = context.value.selectedValues.includes(value);
    const getStyles = useStyles<QuestionOptionFactory>({
      name: 'QuestionOption',
      props,
      classes: { label: classes.optionLabel },
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (Object.keys(Button.classes) as ButtonStylesNames[]).map((slot) => [
        slot,
        getStyles(slot),
      ]),
    );
    return (
      <Button
        {...others}
        ref={ref}
        type="button"
        value={value}
        disabled={context.disabled || disabled}
        loading={loading}
        variant={variant ?? (selected ? 'filled' : 'outline')}
        unstyled={unstyled}
        role={context.selectionMode === 'single' ? 'radio' : 'checkbox'}
        aria-checked={selected}
        data-question-option
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, entry]) => [
            key,
            entry.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, entry]) => [key, entry.style]),
        )}
        onClick={(event) => {
          if (
            context.disabled ||
            disabled ||
            loading ||
            others['data-disabled']
          )
            return;
          onClick?.(event);
          if (!event.defaultPrevented) context.toggle(value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            context.disabled ||
            disabled ||
            loading ||
            others['data-disabled'] ||
            !event.currentTarget.closest('[data-question-options]')
          )
            return;
          const current = event.currentTarget;
          createScopedKeydownHandler({
            parentSelector: '[data-question-options]',
            siblingSelector:
              '[data-question-option]:not([data-disabled]):not([data-loading])',
            orientation:
              event.key === 'ArrowUp' || event.key === 'ArrowDown'
                ? 'vertical'
                : 'horizontal',
            dir,
          })(event);
          const focused = current.ownerDocument.activeElement;
          if (
            event.defaultPrevented &&
            context.selectionMode === 'single' &&
            focused instanceof HTMLButtonElement &&
            focused !== current &&
            focused.getAttribute('aria-checked') === 'false'
          )
            focused.click();
        }}
      >
        {children ?? value}
      </Button>
    );
  },
);
export interface QuestionInputProps
  extends Omit<TextareaProps, 'value' | 'defaultValue'>,
    ElementProps<'textarea', keyof TextareaProps> {}
export type QuestionInputFactory = Factory<{
  props: QuestionInputProps;
  ref: HTMLTextAreaElement;
  stylesNames: TextareaFactory['stylesNames'];
}>;
export const QuestionInput = factory<QuestionInputFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'QuestionInput',
      { minRows: 3, autosize: true },
      _props,
    );
    const {
      onChange,
      disabled,
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
      ...others
    } = props;
    const context = useQuestion();
    const getStyles = useStyles<QuestionInputFactory>({
      name: 'QuestionInput',
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
      (Object.keys(Textarea.classes) as TextareaFactory['stylesNames'][]).map(
        (slot) => [slot, getStyles(slot)],
      ),
    );
    return (
      <Textarea
        {...others}
        ref={ref}
        value={context.value.text}
        disabled={disabled || context.disabled}
        unstyled={unstyled}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, entry]) => [
            key,
            entry.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, entry]) => [key, entry.style]),
        )}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented && !disabled && !context.disabled)
            context.setText(event.currentTarget.value);
        }}
      />
    );
  },
);
export interface QuestionSubmitProps
  extends ButtonProps,
    ElementProps<'button', keyof ButtonProps> {
  children?: ReactNode;
}
export type QuestionSubmitFactory = Factory<{
  props: QuestionSubmitProps;
  ref: HTMLButtonElement;
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
}>;
export const QuestionSubmit = factory<QuestionSubmitFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('QuestionSubmit', { children: 'Submit' }, _props);
    const {
      disabled,
      loading,
      children,
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
      onClick,
      ...others
    } = props;
    const context = useQuestion();
    const getStyles = useStyles<QuestionSubmitFactory>({
      name: 'QuestionSubmit',
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
      (Object.keys(Button.classes) as ButtonStylesNames[]).map((slot) => [
        slot,
        getStyles(slot),
      ]),
    );
    const unavailable =
      disabled ||
      context.disabled ||
      (!context.value.selectedValues.length && !context.value.text.trim());
    return (
      <Button
        {...others}
        ref={ref}
        type="submit"
        disabled={unavailable}
        loading={loading ?? context.pending}
        unstyled={unstyled}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, entry]) => [
            key,
            entry.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, entry]) => [key, entry.style]),
        )}
        onClick={(event) => {
          if (unavailable || loading || others['data-disabled'])
            event.preventDefault();
          else onClick?.(event);
        }}
      >
        {children}
      </Button>
    );
  },
);
Question.displayName = 'Question';
QuestionPrompt.displayName = 'QuestionPrompt';
QuestionDescription.displayName = 'QuestionDescription';
QuestionOptions.displayName = 'QuestionOptions';
QuestionOption.displayName = 'QuestionOption';
QuestionInput.displayName = 'QuestionInput';
QuestionActions.displayName = 'QuestionActions';
QuestionSubmit.displayName = 'QuestionSubmit';
Question.classes = classes;
Question.Prompt = QuestionPrompt;
Question.Description = QuestionDescription;
Question.Options = QuestionOptions;
Question.Option = QuestionOption;
Question.Input = QuestionInput;
Question.Actions = QuestionActions;
Question.Submit = QuestionSubmit;
