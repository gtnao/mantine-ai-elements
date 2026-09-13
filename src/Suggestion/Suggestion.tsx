'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Button,
  type ButtonCssVariables,
  type ButtonProps,
  type ButtonStylesNames,
  type ElementProps,
  type Factory,
  factory,
  Group,
  type GroupProps,
  ScrollArea,
  type ScrollAreaProps,
  type ScrollAreaStylesNames,
  useProps,
  useStyles,
} from '@mantine/core';

export interface SuggestionProps
  extends ButtonProps,
    ElementProps<'button', 'color' | 'onClick'> {
  suggestion: string;
  /** Receives the suggestion value, even when the visible label is customized. */
  onClick?: (suggestion: string) => void;
}
export type SuggestionFactory = Factory<{
  props: SuggestionProps;
  ref: HTMLButtonElement;
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
}>;
export const Suggestion = factory<SuggestionFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'Suggestion',
    { variant: 'outline', size: 'sm', radius: 'xl', type: 'button' },
    _props,
  );
  const {
    suggestion,
    onClick,
    children,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
    ...others
  } = props;
  const getStyles = useStyles<SuggestionFactory>({
    name: 'Suggestion',
    classes: {},
    props,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
  });
  // Resolve the extension's theme before forwarding each public Button slot.
  // Button retains its own theme and CSS-variable resolver.
  const resolved = Object.fromEntries(
    (Object.keys(Button.classes) as ButtonStylesNames[]).map((selector) => [
      selector,
      getStyles(selector),
    ]),
  );
  return (
    <Button
      {...others}
      ref={ref}
      unstyled={unstyled}
      classNames={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.className]),
      )}
      styles={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.style]),
      )}
      onClick={() => {
        if (!others.disabled && !others.loading && !others['data-disabled'])
          onClick?.(suggestion);
      }}
    >
      {children ?? suggestion}
    </Button>
  );
});
Suggestion.displayName = 'Suggestion';

export interface SuggestionsProps extends ScrollAreaProps {
  /** Mantine Group props for the horizontal row. Root props belong to ScrollArea. */
  rowProps?: Omit<GroupProps, 'children'>;
}
export type SuggestionsFactory = Factory<{
  props: SuggestionsProps;
  ref: HTMLDivElement;
  stylesNames: ScrollAreaStylesNames;
  vars: { root: '--scrollarea-scrollbar-size' };
}>;
export const Suggestions = factory<SuggestionsFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'Suggestions',
    { scrollbars: 'x', type: 'never', w: '100%' },
    _props,
  );
  const {
    children,
    rowProps,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
    ...others
  } = props;
  const getStyles = useStyles<SuggestionsFactory>({
    name: 'Suggestions',
    classes: {},
    props,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
  });
  const resolved = Object.fromEntries(
    (Object.keys(ScrollArea.classes) as ScrollAreaStylesNames[]).map(
      (selector) => [selector, getStyles(selector)],
    ),
  );
  return (
    <ScrollArea
      {...others}
      ref={ref}
      unstyled={unstyled}
      classNames={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.className]),
      )}
      styles={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.style]),
      )}
    >
      <Group gap="xs" wrap="nowrap" w="max-content" miw="100%" {...rowProps}>
        {children}
      </Group>
    </ScrollArea>
  );
});
Suggestions.displayName = 'Suggestions';
