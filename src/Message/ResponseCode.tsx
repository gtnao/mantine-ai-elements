'use client';
import { Button, Code, Loader } from '@mantine/core';
import {
  type ComponentProps,
  createElement,
  lazy,
  Suspense,
  useContext,
  useMemo,
} from 'react';
import type { ThemedToken } from 'shiki';
import {
  type ExtraProps,
  StreamdownContext,
  useIsCodeFenceIncomplete,
} from 'streamdown';
import { CodeBlock } from '../CodeBlock/CodeBlock';
import {
  type CodeBlockLanguage,
  highlightCodeAsync,
} from '../CodeBlock/highlight';
import { downloadBlob, useResponse } from './response-context';

const Mermaid = lazy(() =>
  import('./ResponseMermaid').then((module) => ({
    default: module.ResponseMermaid,
  })),
);
export function ResponseCode({
  node,
  children,
  className,
  ...props
}: ComponentProps<'code'> & ExtraProps) {
  const { plugins, translations: t } = useResponse();
  const { controls, isAnimating, shikiTheme, lineNumbers, codeBlockMaxHeight } =
    useContext(StreamdownContext);
  const incomplete = useIsCodeFenceIncomplete();
  const language = /language-([^\s]+)/.exec(className ?? '')?.[1] ?? 'text';
  const code =
    typeof children === 'string'
      ? children.replace(/\n$/, '')
      : String(children ?? '');
  const highlighter = useMemo(
    () => (source: string, lang: CodeBlockLanguage) => {
      const plugin = plugins.code;
      if (!plugin) return highlightCodeAsync(source, 'text');
      if (!plugin.supportsLanguage(lang))
        return highlightCodeAsync(source, 'text');
      return new Promise<Awaited<ReturnType<typeof highlightCodeAsync>>>(
        (resolve, reject) => {
          const finish = (
            result: Parameters<
              NonNullable<Parameters<typeof plugin.highlight>[1]>
            >[0],
          ) =>
            resolve({
              tokens: result.tokens.map((line) =>
                line.map(
                  (token) =>
                    ({ ...token, offset: token.offset ?? 0 }) as ThemedToken,
                ),
              ),
              fg: result.fg ?? 'inherit',
              bg: result.bg ?? 'transparent',
            });
          try {
            const result = plugin.highlight(
              { code: source, language: lang, themes: shikiTheme },
              finish,
            );
            if (result) finish(result);
          } catch (error) {
            reject(error);
          }
        },
      );
    },
    [plugins.code, shikiTheme],
  );
  if (!('data-block' in props))
    return <Code className={className}>{children}</Code>;
  const meta =
    typeof node?.properties?.metastring === 'string'
      ? node.properties.metastring
      : undefined;
  const custom = plugins.renderers?.find((renderer) =>
    typeof renderer.language === 'string'
      ? renderer.language === language
      : renderer.language.includes(language),
  );
  if (custom)
    return createElement(custom.component, {
      code,
      language,
      isIncomplete: incomplete,
      meta,
    });
  if (language === 'mermaid' && plugins.mermaid)
    return (
      <Suspense fallback={<Loader size="sm" />}>
        <Mermaid code={code} incomplete={incomplete} />
      </Suspense>
    );
  const config = typeof controls === 'object' ? controls.code : controls;
  const options = typeof config === 'object' ? config : {};
  const copy = config !== false && options.copy !== false;
  const download = config !== false && options.download !== false;
  const callbacks = typeof options.copy === 'object' ? options.copy : {};
  const filename =
    typeof options.download === 'object'
      ? options.download.filename
      : language === 'text'
        ? 'code.txt'
        : `code.${language}`;
  const start = /\bstartLine=(\d+)/.exec(meta ?? '')?.[1];
  return (
    <CodeBlock
      code={code}
      language={language}
      highlighter={highlighter}
      showLineNumbers={lineNumbers && !/\bnoLineNumbers\b/.test(meta ?? '')}
      styles={{
        content: {
          maxHeight:
            codeBlockMaxHeight === 0 || codeBlockMaxHeight === Infinity
              ? undefined
              : codeBlockMaxHeight,
        },
        code: {
          counterReset: `code-line ${start ? Math.max(0, Number(start) - 1) : 0}`,
        },
      }}
    >
      <CodeBlock.Header>
        <CodeBlock.Title>{language}</CodeBlock.Title>
        <CodeBlock.Actions>
          {copy && (
            <CodeBlock.CopyButton
              {...callbacks}
              copyLabel={t.copyCode}
              copiedLabel={t.copied}
              disabled={isAnimating}
            />
          )}
          {download && (
            <Button
              size="compact-xs"
              variant="subtle"
              disabled={isAnimating}
              onClick={() =>
                downloadBlob(new Blob([code], { type: 'text/plain' }), filename)
              }
            >
              {t.downloadFile}
            </Button>
          )}
        </CodeBlock.Actions>
      </CodeBlock.Header>
    </CodeBlock>
  );
}
