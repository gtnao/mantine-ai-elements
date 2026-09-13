'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  type ElementProps,
  type Factory,
  factory,
  Paper,
  type PaperCssVariables,
  type PaperProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useRef } from 'react';
import { SnippetContext } from './Snippet.context';
import classes from './Snippet.module.css';
import { SnippetCopyButton } from './SnippetCopyButton';
import { SnippetAddon, SnippetInput, SnippetText } from './SnippetParts';

export interface SnippetProps
  extends PaperProps,
    ElementProps<'div', keyof PaperProps> {
  code: string;
  /** Disables the input and copy actions. */
  disabled?: boolean;
}
export type SnippetFactory = Factory<{
  props: SnippetProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
  vars: PaperCssVariables;
  staticComponents: {
    Addon: typeof SnippetAddon;
    Text: typeof SnippetText;
    Input: typeof SnippetInput;
    CopyButton: typeof SnippetCopyButton;
  };
}>;
export const Snippet = factory<SnippetFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'Snippet',
    { withBorder: true, radius: 'sm', disabled: false },
    _props,
  );
  const {
    code,
    disabled,
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
  const input = useRef<HTMLInputElement>(null);
  const getStyles = useStyles<SnippetFactory>({
    name: 'Snippet',
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
    <SnippetContext.Provider value={{ code, input, disabled }}>
      <Paper
        role="group"
        {...others}
        {...getStyles('root')}
        ref={ref}
        unstyled={unstyled}
        data-disabled={disabled || undefined}
      >
        {children}
      </Paper>
    </SnippetContext.Provider>
  );
});
Snippet.displayName = 'Snippet';
Snippet.classes = { root: classes.root };

Snippet.Addon = SnippetAddon;
Snippet.Text = SnippetText;
Snippet.Input = SnippetInput;
Snippet.CopyButton = SnippetCopyButton;
