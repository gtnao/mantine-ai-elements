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
  Select,
  type SelectProps,
  type StylesApiProps,
  useProps,
  useStyles,
} from '@mantine/core';
import {
  type CSSProperties,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ThemedToken } from 'shiki';
import classes from './CodeBlock.module.css';
import {
  type CodeBlockLanguage,
  highlightCodeAsync,
  type TokenizedCode,
} from './highlight';

function tokenColors(
  token: Pick<ThemedToken, 'htmlStyle' | 'color' | 'bgColor'>,
): CSSProperties {
  const { color, backgroundColor, ...others } = (token.htmlStyle ??
    {}) as CSSProperties;
  return {
    ...others,
    '--code-token-light': color ?? token.color ?? 'inherit',
    '--code-token-bg': backgroundColor ?? token.bgColor ?? 'transparent',
  } as CSSProperties;
}
export type CodeBlockStylesNames =
  | 'root'
  | 'header'
  | 'title'
  | 'filename'
  | 'actions'
  | 'content'
  | 'pre'
  | 'code'
  | 'line'
  | 'token';
export interface CodeBlockContainerProps
  extends BoxProps,
    StylesApiProps<CodeBlockFactory>,
    ElementProps<'div'> {
  language?: CodeBlockLanguage;
  code?: string;
}
export interface CodeBlockProps extends CodeBlockContainerProps {
  code: string;
  language: CodeBlockLanguage;
  showLineNumbers?: boolean;
  onHighlightError?: (error: unknown) => void;
}
export type CodeBlockFactory = Factory<{
  props: CodeBlockProps;
  ref: HTMLDivElement;
  stylesNames: CodeBlockStylesNames;
  staticComponents: {
    Container: typeof CodeBlockContainer;
    Header: typeof CodeBlockHeader;
    Title: typeof CodeBlockTitle;
    Filename: typeof CodeBlockFilename;
    Actions: typeof CodeBlockActions;
    Content: typeof CodeBlockContent;
    CopyButton: typeof CodeBlockCopyButton;
    LanguageSelector: typeof CodeBlockLanguageSelector;
  };
}>;
const StylesContext = createContext<ReturnType<
  typeof useStyles<CodeBlockFactory>
> | null>(null);
const CodeContext = createContext<string | null>(null);
export const CodeBlockContainer = factory<{
  props: CodeBlockContainerProps;
  ref: HTMLDivElement;
  stylesNames: CodeBlockStylesNames;
}>(({ ref, ..._props }) => {
  const props = useProps('CodeBlock', {}, _props);
  const {
    children,
    code,
    language,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    attributes,
    ...others
  } = props;
  const getStyles = useStyles<CodeBlockFactory>({
    name: 'CodeBlock',
    classes,
    props: { ...props, code: code ?? '', language: language ?? 'text' },
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
        {...others}
        {...getStyles('root')}
        data-language={language}
        ref={ref}
      >
        {children}
      </Box>
    </StylesContext.Provider>
  );
});
export const CodeBlock = factory<CodeBlockFactory>(({ ref, ..._props }) => {
  const {
    code,
    language,
    showLineNumbers,
    onHighlightError,
    children,
    ...props
  } = useProps('CodeBlock', {}, _props);
  return (
    <CodeContext.Provider value={code}>
      <CodeBlockContainer {...props} code={code} language={language} ref={ref}>
        {children}
        <CodeBlockContent
          code={code}
          language={language}
          showLineNumbers={showLineNumbers}
          onHighlightError={onHighlightError}
        />
      </CodeBlockContainer>
    </CodeContext.Provider>
  );
});
export interface CodeBlockSectionProps extends BoxProps, ElementProps<'div'> {}
function createSection(selector: 'header' | 'title' | 'actions') {
  const Section = factory<{
    props: CodeBlockSectionProps;
    ref: HTMLDivElement;
  }>(({ ref, className, style, ...props }) => {
    const getStyles = useContext(StylesContext);
    return (
      <Box
        {...props}
        {...(getStyles
          ? getStyles(selector, { className, style })
          : {
              className: [classes[selector], className]
                .filter(Boolean)
                .join(' '),
              style,
            })}
        ref={ref}
      />
    );
  });
  Section.displayName = `CodeBlock.${selector}`;
  return Section;
}
export const CodeBlockHeader = createSection('header');
export const CodeBlockTitle = createSection('title');
export const CodeBlockActions = createSection('actions');
export interface CodeBlockFilenameProps
  extends BoxProps,
    ElementProps<'span'> {}
export const CodeBlockFilename = factory<{
  props: CodeBlockFilenameProps;
  ref: HTMLSpanElement;
}>(({ ref, className, style, ...props }) => {
  const getStyles = useContext(StylesContext);
  return (
    <Box
      component="span"
      {...props}
      {...(getStyles
        ? getStyles('filename', { className, style })
        : {
            className: [classes.filename, className].filter(Boolean).join(' '),
            style,
          })}
      ref={ref}
    />
  );
});
export interface CodeBlockContentProps extends BoxProps, ElementProps<'div'> {
  code: string;
  language: CodeBlockLanguage;
  showLineNumbers?: boolean;
  onHighlightError?: (error: unknown) => void;
}
export const CodeBlockContent = factory<{
  props: CodeBlockContentProps;
  ref: HTMLDivElement;
}>(
  ({
    ref,
    code,
    language,
    showLineNumbers,
    onHighlightError,
    className,
    style,
    ...props
  }) => {
    const inherited = useContext(StylesContext);
    const getStyles = useStyles<CodeBlockFactory>({
      name: 'CodeBlock',
      classes,
      props: { code, language },
    });
    const styles = inherited ?? getStyles;
    const [result, setResult] = useState<{
      code: string;
      language: string;
      tokens: TokenizedCode;
    } | null>(null);
    const errorRef = useRef(onHighlightError);
    errorRef.current = onHighlightError;
    useEffect(() => {
      let active = true;
      void highlightCodeAsync(code, language).then(
        (tokens) => {
          if (active) setResult({ code, language, tokens });
        },
        (error) => {
          if (active) errorRef.current?.(error);
        },
      );
      return () => {
        active = false;
      };
    }, [code, language]);
    const highlighted =
      result?.code === code && result.language === language
        ? result.tokens
        : null;
    const lines =
      highlighted?.tokens ??
      code.split('\n').map((content) => [{ content, color: 'inherit' }]);
    return (
      <Box
        {...props}
        {...styles('content', { className, style })}
        data-highlighted={!!highlighted || undefined}
        ref={ref}
      >
        <pre {...styles('pre')}>
          <code {...styles('code')}>
            {lines.map((tokens, index) => (
              // Line position is the identity: text can change on every streaming update.
              <span
                {...styles('line')}
                data-numbered={showLineNumbers || undefined}
                /* biome-ignore lint/suspicious/noArrayIndexKey: Line position identifies a stateless streaming token row. */
                key={index}
              >
                {tokens.map((token, tokenIndex) => (
                  <span
                    {...styles('token', {
                      style: {
                        ...tokenColors(token),
                        ...('fontStyle' in token
                          ? {
                              fontStyle:
                                (token.fontStyle ?? 0) & 1
                                  ? 'italic'
                                  : undefined,
                              fontWeight:
                                (token.fontStyle ?? 0) & 2 ? 'bold' : undefined,
                              textDecoration:
                                (token.fontStyle ?? 0) & 4
                                  ? 'underline'
                                  : undefined,
                            }
                          : {}),
                      } as CSSProperties,
                    })}
                    /* biome-ignore lint/suspicious/noArrayIndexKey: Token spans are stateless positions within a line. */
                    key={tokenIndex}
                  >
                    {token.content}
                  </span>
                ))}
                {index < lines.length - 1 ? '\n' : null}
              </span>
            ))}
          </code>
        </pre>
      </Box>
    );
  },
);
export interface CodeBlockCopyButtonProps
  extends ActionIconProps,
    ElementProps<'button', 'color' | 'onCopy' | 'onError'> {
  code?: string;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  copyLabel?: string;
  copiedLabel?: string;
}
export const CodeBlockCopyButton = factory<{
  props: CodeBlockCopyButtonProps;
  ref: HTMLButtonElement;
}>(({ ref, ..._props }) => {
  const {
    code: providedCode,
    onCopy,
    onError,
    timeout = 2000,
    copyLabel = 'Copy code',
    copiedLabel = 'Copied',
    children,
    onClick,
    ...props
  } = useProps(
    'CodeBlockCopyButton',
    { variant: 'subtle', size: 'sm' },
    _props,
  );
  const contextCode = useContext(CodeContext);
  const code = providedCode ?? contextCode;
  const latestCode = useRef(code);
  latestCode.current = code;
  const [copied, setCopied] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A new code value invalidates copied feedback.
  useEffect(() => {
    setCopied(false);
    clearTimeout(timer.current);
  }, [code]);
  return (
    <ActionIcon
      {...props}
      __staticSelector="CodeBlockCopyButton"
      ref={ref}
      type="button"
      aria-label={props['aria-label'] ?? (copied ? copiedLabel : copyLabel)}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented || pending.current || copied) return;
        pending.current = true;
        try {
          if (code === null)
            throw new Error(
              'CodeBlock.CopyButton requires a CodeBlock parent or a code prop',
            );
          if (!navigator.clipboard?.writeText)
            throw new Error('Clipboard API not available');
          await navigator.clipboard.writeText(code);
          if (mounted.current) {
            setCopied(true);
            timer.current = setTimeout(() => setCopied(false), timeout);
            onCopy?.();
          }
        } catch (error) {
          if (mounted.current)
            onError?.(
              error instanceof Error ? error : new Error(String(error)),
            );
        } finally {
          pending.current = false;
        }
      }}
    >
      {children ?? (
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {copied ? (
            <path d="m5 12 4 4L19 6" />
          ) : (
            <>
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V4H4v12h4" />
            </>
          )}
        </svg>
      )}
    </ActionIcon>
  );
});
export interface CodeBlockLanguageSelectorProps extends SelectProps {}
export const CodeBlockLanguageSelector = factory<{
  props: CodeBlockLanguageSelectorProps;
  ref: HTMLInputElement;
}>(({ ref, ...props }) => (
  <Select
    {...useProps(
      'CodeBlockLanguageSelector',
      {
        size: 'xs',
        variant: 'unstyled',
        allowDeselect: false,
        'aria-label': 'Language',
      },
      props,
    )}
    ref={ref}
  />
));
CodeBlock.displayName = 'CodeBlock';
CodeBlock.classes = classes;
CodeBlockContainer.displayName = 'CodeBlock.Container';
CodeBlockContainer.classes = classes;
CodeBlock.Content = CodeBlockContent;
CodeBlock.Container = CodeBlockContainer;
CodeBlock.Header = CodeBlockHeader;
CodeBlock.Title = CodeBlockTitle;
CodeBlock.Filename = CodeBlockFilename;
CodeBlock.Actions = CodeBlockActions;
CodeBlock.CopyButton = CodeBlockCopyButton;
CodeBlock.LanguageSelector = CodeBlockLanguageSelector;
CodeBlockFilename.displayName = 'CodeBlock.Filename';
CodeBlockContent.displayName = 'CodeBlock.Content';
CodeBlockCopyButton.displayName = 'CodeBlock.CopyButton';
CodeBlockLanguageSelector.displayName = 'CodeBlock.LanguageSelector';
