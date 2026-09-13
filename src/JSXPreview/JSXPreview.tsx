'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Alert,
  type AlertCssVariables,
  type AlertProps,
  type AlertStylesNames,
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  factory,
  type StylesApiProps,
  useProps,
  useStyles,
} from '@mantine/core';
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { completeJsx } from './complete-jsx';
import classes from './JSXPreview.module.css';
import { PreviewRenderer } from './PreviewRenderer';
import type { JSXPreviewComponents } from './parser-adapter';

export interface JSXPreviewContextValue {
  jsx: string;
  processedJsx: string;
  isStreaming: boolean;
  trusted: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;
  lastGoodJsx: string;
  setLastGoodJsx: (jsx: string) => void;
  components?: JSXPreviewComponents;
  bindings?: Record<string, unknown>;
  onErrorProp?: (error: Error) => void;
}
const Context = createContext<JSXPreviewContextValue | null>(null);
export function useJSXPreview() {
  const context = useContext(Context);
  if (!context)
    throw new Error('JSXPreview components must be used within JSXPreview');
  return context;
}

export interface JSXPreviewProps
  extends BoxProps,
    StylesApiProps<JSXPreviewFactory>,
    ElementProps<'div', keyof BoxProps | 'onError'> {
  jsx: string;
  isStreaming?: boolean;
  /** Explicitly allow this JSX to execute in the host application. This is not a sandbox. */
  trusted?: boolean;
  components?: JSXPreviewComponents;
  bindings?: Record<string, unknown>;
  onError?: (error: Error) => void;
}
export type JSXPreviewRootProps = JSXPreviewProps;
export type JSXPreviewFactory = Factory<{
  props: JSXPreviewProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
  staticComponents: {
    Content: typeof JSXPreviewContent;
    Error: typeof JSXPreviewError;
  };
}>;
export const JSXPreview = factory<JSXPreviewFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'JSXPreview',
    { isStreaming: false, trusted: false },
    _props,
  );
  const {
    jsx,
    isStreaming,
    trusted,
    components,
    bindings,
    onError,
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
  const input = useMemo(
    () => ({ jsx, components, bindings, trusted, isStreaming }),
    [jsx, components, bindings, trusted, isStreaming],
  );
  const [previous, setPrevious] = useState(input);
  const [error, setError] = useState<Error | null>(null);
  const [lastGoodJsx, setLastGoodJsx] = useState('');
  if (input !== previous) {
    setPrevious(input);
    setError(null);
    if (!trusted) setLastGoodJsx('');
  }
  const processedJsx = useMemo(
    () => (isStreaming ? completeJsx(jsx) : jsx),
    [jsx, isStreaming],
  );
  const getStyles = useStyles<JSXPreviewFactory>({
    name: 'JSXPreview',
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
    <Context.Provider
      value={{
        jsx,
        processedJsx,
        isStreaming,
        trusted,
        components,
        bindings,
        error,
        setError,
        lastGoodJsx,
        setLastGoodJsx,
        onErrorProp: onError,
      }}
    >
      <Box
        {...others}
        {...getStyles('root')}
        ref={ref}
        data-streaming={isStreaming || undefined}
      >
        {children}
      </Box>
    </Context.Provider>
  );
});

export interface JSXPreviewContentProps
  extends BoxProps,
    StylesApiProps<JSXPreviewContentFactory>,
    ElementProps<'div', keyof BoxProps | 'children'> {
  /** Shown while the parser module loads. */
  loading?: ReactNode;
  /** Shown instead of executing JSX until the root has trusted=true. */
  untrustedFallback?: ReactNode;
}
export type JSXPreviewContentFactory = Factory<{
  props: JSXPreviewContentProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const JSXPreviewContent = factory<JSXPreviewContentFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('JSXPreviewContent', {}, _props);
    const {
      loading,
      untrustedFallback,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const context = useJSXPreview();
    const getStyles = useStyles<JSXPreviewContentFactory>({
      name: 'JSXPreviewContent',
      props,
      classes: { root: classes.content },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Box
        {...others}
        {...getStyles('root')}
        ref={ref}
        aria-busy={context.isStreaming}
      >
        {context.trusted ? (
          <PreviewRenderer
            jsx={context.processedJsx}
            components={context.components}
            bindings={context.bindings}
            isStreaming={context.isStreaming}
            lastGoodJsx={context.lastGoodJsx}
            onSuccess={context.setLastGoodJsx}
            onError={(error) => {
              context.setError(error);
              context.onErrorProp?.(error);
            }}
            loading={loading}
          />
        ) : (
          untrustedFallback
        )}
      </Box>
    );
  },
);

export interface JSXPreviewErrorProps
  extends Omit<
      AlertProps,
      'children' | keyof StylesApiProps<JSXPreviewErrorFactory>
    >,
    StylesApiProps<JSXPreviewErrorFactory>,
    ElementProps<'div', keyof AlertProps> {
  children?: ReactNode | ((error: Error) => ReactNode);
}
export type JSXPreviewErrorFactory = Factory<{
  props: JSXPreviewErrorProps;
  ref: HTMLDivElement;
  stylesNames: AlertStylesNames;
  vars: AlertCssVariables;
}>;
export const JSXPreviewError = factory<JSXPreviewErrorFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('JSXPreviewError', { color: 'red' }, _props);
    const {
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
    const { error } = useJSXPreview();
    const getStyles = useStyles<JSXPreviewErrorFactory>({
      name: 'JSXPreviewError',
      props,
      classes: {},
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (Object.keys(Alert.classes) as AlertStylesNames[]).map((slot) => [
        slot,
        getStyles(slot),
      ]),
    );
    if (!error) return null;
    return (
      <Alert
        {...others}
        ref={ref}
        unstyled={unstyled}
        attributes={attributes}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([slot, value]) => [
            slot,
            value.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([slot, value]) => [slot, value.style]),
        )}
      >
        {typeof children === 'function'
          ? children(error)
          : children !== undefined
            ? children
            : error.message}
      </Alert>
    );
  },
);
JSXPreview.displayName = 'JSXPreview';
JSXPreview.classes = { root: classes.root };
JSXPreviewContent.displayName = 'JSXPreviewContent';
JSXPreviewContent.classes = { root: classes.content };
JSXPreviewError.displayName = 'JSXPreviewError';
JSXPreviewError.classes = Alert.classes;
JSXPreview.Content = JSXPreviewContent;
JSXPreview.Error = JSXPreviewError;
