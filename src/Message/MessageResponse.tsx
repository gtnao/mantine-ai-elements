'use client';
import {
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  factory,
  type StylesApiProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { cjk } from '@streamdown/cjk';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import type { MermaidConfig } from '@streamdown/mermaid';
import { type CSSProperties, useMemo } from 'react';
import {
  type Components,
  type DiagramPlugin,
  defaultTranslations,
  type PluginConfig,
  Streamdown,
  type StreamdownProps,
} from 'streamdown';
import 'katex/dist/katex.min.css';
import 'streamdown/styles.css';
import classes from './MessageResponse.module.css';
import { ResponseCode } from './ResponseCode';
import { ResponseImage } from './ResponseImage';
import { ResponseLink } from './ResponseLink';
import { ResponseTable } from './ResponseTable';
import { ResponseContext } from './response-context';

// Defer Mermaid's large module until a diagram actually requests a render.
const mermaid: DiagramPlugin = {
  name: 'mermaid',
  type: 'diagram',
  language: 'mermaid',
  getMermaid: (config) => {
    let currentConfig = config;
    return {
      initialize(nextConfig) {
        currentConfig = nextConfig;
      },
      render: async (id, source) => {
        const module = await import('@streamdown/mermaid');
        return module.mermaid
          .getMermaid(currentConfig as MermaidConfig)
          .render(id, source);
      },
    };
  },
};
const defaults: PluginConfig = { code, cjk, math, mermaid };
const renderers: Components = {
  strong: ({ node: _node, ...props }) => <strong {...props} />,
  code: ResponseCode,
  table: ResponseTable,
  a: ResponseLink,
  img: ResponseImage,
};
export interface MessageResponseProps
  extends BoxProps,
    StylesApiProps<MessageResponseFactory>,
    Omit<StreamdownProps, keyof BoxProps | 'icons' | 'prefix'>,
    ElementProps<'div', keyof StreamdownProps | 'children'> {}
export type MessageResponseFactory = Factory<{
  props: MessageResponseProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const MessageResponse = factory<MessageResponseFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('MessageResponse', {}, _props);
    const {
      className,
      style,
      classNames,
      styles,
      unstyled,
      vars,
      attributes,
      children,
      plugins,
      components,
      translations,
      caret,
      animated,
      mode,
      dir,
      BlockComponent,
      parseMarkdownIntoBlocksFn,
      parseIncompleteMarkdown,
      normalizeHtmlIndentation,
      shikiTheme,
      mermaid: mermaidOptions,
      codeBlockMaxHeight,
      controls,
      isAnimating,
      tableMaxHeight,
      remend,
      linkSafety,
      allowedTags,
      literalTagContent,
      lineNumbers,
      onAnimationStart,
      onAnimationEnd,
      allowElement,
      allowedElements,
      disallowedElements,
      rehypePlugins,
      remarkPlugins,
      remarkRehypeOptions,
      skipHtml,
      unwrapDisallowed,
      urlTransform,
      ...others
    } = props;
    const getStyles = useStyles<MessageResponseFactory>({
      name: 'MessageResponse',
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
    const reducedMotion = useReducedMotion();
    // A supplied plugin object replaces the defaults, matching AI Elements.
    const activePlugins = plugins ?? defaults;
    const mergedComponents = useMemo(
      () => ({ ...renderers, ...components }),
      [components],
    );
    const labels = useMemo(
      () => ({ ...defaultTranslations, ...translations }),
      [translations],
    );
    // Streamdown's memo comparator does not check every renderer/parser prop.
    // A fresh public plugins object ensures changes to these props are observed.
    return (
      <ResponseContext.Provider
        value={{ plugins: activePlugins, translations: labels }}
      >
        <Box {...others} {...getStyles('root')} ref={ref}>
          <Streamdown
            {...{
              mode,
              dir,
              BlockComponent,
              parseMarkdownIntoBlocksFn,
              parseIncompleteMarkdown,
              normalizeHtmlIndentation,
              shikiTheme,
              codeBlockMaxHeight,
              controls,
              isAnimating,
              tableMaxHeight,
              remend,
              linkSafety,
              allowedTags,
              literalTagContent,
              lineNumbers,
              onAnimationStart,
              onAnimationEnd,
              allowElement,
              allowedElements,
              disallowedElements,
              rehypePlugins,
              remarkPlugins,
              remarkRehypeOptions,
              skipHtml,
              unwrapDisallowed,
              urlTransform,
            }}
            mermaid={mermaidOptions}
            animated={reducedMotion ? false : animated}
            components={mergedComponents}
            plugins={{ ...activePlugins }}
            translations={labels}
          >
            {children}
          </Streamdown>
          {caret && isAnimating && mode !== 'static' && (
            <span
              data-message-caret=""
              aria-hidden="true"
              style={
                {
                  '--message-caret': JSON.stringify(
                    caret === 'block' ? ' ▋' : ' ●',
                  ),
                } as CSSProperties
              }
            />
          )}
        </Box>
      </ResponseContext.Provider>
    );
  },
);
MessageResponse.displayName = 'MessageResponse';
MessageResponse.classes = classes;
