'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  factory,
  Input,
  type InputCssVariables,
  type InputProps,
  type InputStylesNames,
  InputWrapperContext,
  type PolymorphicFactory,
  polymorphicFactory,
  type StylesApiProps,
  Text,
  type TextCssVariables,
  type TextProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import { useContext } from 'react';
import { useSnippet } from './Snippet.context';
import classes from './Snippet.module.css';
export interface SnippetAddonProps
  extends BoxProps,
    StylesApiProps<SnippetAddonFactory>,
    ElementProps<'div'> {
  align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end';
}
export type SnippetAddonFactory = Factory<{
  props: SnippetAddonProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const SnippetAddon = factory<SnippetAddonFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('SnippetAddon', { align: 'inline-start' }, _props);
    const {
      align,
      onClick,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const context = useSnippet();
    const getStyles = useStyles<SnippetAddonFactory>({
      name: 'SnippetAddon',
      props,
      classes: { root: classes.addon },
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
        role="group"
        {...others}
        {...getStyles('root')}
        ref={ref}
        data-align={align}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            context.disabled ||
            (event.target as HTMLElement).closest(
              'button,a,input,select,textarea,[role="button"],[contenteditable="true"]',
            )
          )
            return;
          context.input?.current?.focus();
        }}
      />
    );
  },
);
SnippetAddon.displayName = 'SnippetAddon';
SnippetAddon.classes = { root: classes.addon };
export interface SnippetTextProps extends TextProps {}
export type SnippetTextFactory = PolymorphicFactory<{
  props: SnippetTextProps;
  defaultComponent: 'span';
  defaultRef: HTMLSpanElement;
  stylesNames: 'root';
  vars: TextCssVariables;
}>;
export const SnippetText = polymorphicFactory<SnippetTextFactory>((_props) => {
  const props = useProps(
    'SnippetText',
    { size: 'sm', c: 'dimmed', fw: 400 },
    _props,
  );
  const {
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
    ...others
  } = props;
  const getStyles = useStyles<SnippetTextFactory>({
    name: 'SnippetText',
    props,
    classes: { root: classes.text },
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  return (
    <Text
      component="span"
      {...others}
      {...getStyles('root')}
      unstyled={unstyled}
    />
  );
});
SnippetText.displayName = 'SnippetText';
SnippetText.classes = { root: classes.text };
export interface SnippetInputProps
  extends InputProps,
    ElementProps<
      'input',
      keyof InputProps | 'value' | 'defaultValue' | 'readOnly'
    > {}
export type SnippetInputFactory = Factory<{
  props: SnippetInputProps;
  ref: HTMLInputElement;
  stylesNames: InputStylesNames;
  vars: InputCssVariables;
  ctx: { offsetTop: boolean | undefined; offsetBottom: boolean | undefined };
}>;
export const SnippetInput = factory<SnippetInputFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('SnippetInput', { variant: 'unstyled' }, _props);
    const {
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      disabled,
      ...others
    } = props;
    const context = useSnippet();
    const mergedRef = useMergedRef(ref, context.input);
    const wrapperContext = useContext(InputWrapperContext);
    const getStyles = useStyles<SnippetInputFactory>({
      name: 'SnippetInput',
      stylesCtx: {
        offsetTop: wrapperContext?.offsetTop,
        offsetBottom: wrapperContext?.offsetBottom,
      },
      rootSelector: 'wrapper',
      props,
      classes: { wrapper: classes.wrapper, input: classes.input },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (Object.keys(Input.classes) as InputStylesNames[]).map((key) => [
        key,
        getStyles(key),
      ]),
    );
    return (
      <Input
        {...others}
        ref={mergedRef}
        readOnly
        value={context.code}
        disabled={disabled || context.disabled}
        unstyled={unstyled}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [
            key,
            value.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [key, value.style]),
        )}
        attributes={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [
            key,
            Object.fromEntries(
              Object.entries(value).filter(
                ([name]) => name !== 'className' && name !== 'style',
              ),
            ),
          ]),
        )}
      />
    );
  },
);
SnippetInput.displayName = 'SnippetInput';
SnippetInput.classes = Input.classes;
