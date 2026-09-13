'use client';

import {
  Box,
  type BoxProps,
  type Factory,
  factory,
  type StylesApiProps,
  TextInput,
  type TextInputProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { Command } from 'cmdk';
import {
  type ComponentPropsWithoutRef,
  createContext,
  useContext,
} from 'react';
import classes from './PromptInputCommand.module.css';

export type PromptInputCommandStylesNames =
  | 'root'
  | 'input'
  | 'list'
  | 'empty'
  | 'group'
  | 'item'
  | 'separator';
export interface PromptInputCommandProps
  extends BoxProps,
    StylesApiProps<PromptInputCommandFactory>,
    Omit<
      ComponentPropsWithoutRef<typeof Command>,
      keyof BoxProps | 'asChild'
    > {}
export type PromptInputCommandFactory = Factory<{
  props: PromptInputCommandProps;
  ref: HTMLDivElement;
  stylesNames: PromptInputCommandStylesNames;
  staticComponents: {
    Input: typeof PromptInputCommandInput;
    List: typeof PromptInputCommandList;
    Empty: typeof PromptInputCommandEmpty;
    Group: typeof PromptInputCommandGroup;
    Item: typeof PromptInputCommandItem;
    Separator: typeof PromptInputCommandSeparator;
  };
}>;
const StylesContext = createContext<ReturnType<
  typeof useStyles<PromptInputCommandFactory>
> | null>(null);
function useCommandStyles() {
  const context = useContext(StylesContext);
  if (!context)
    throw new Error('PromptInputCommand children require PromptInputCommand');
  return context;
}
export const PromptInputCommand = factory<PromptInputCommandFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('PromptInputCommand', {}, _props);
    const {
      children,
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
      attributes,
      ...others
    } = props;
    const getStyles = useStyles<PromptInputCommandFactory>({
      name: 'PromptInputCommand',
      classes,
      props,
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
      attributes,
    });
    return (
      <StylesContext.Provider value={getStyles}>
        <Box component={Command} {...others} {...getStyles('root')} ref={ref}>
          {children}
        </Box>
      </StylesContext.Provider>
    );
  },
);
export interface PromptInputCommandInputProps
  extends Omit<TextInputProps, 'value' | 'onChange' | 'defaultValue'> {
  value?: string;
  onValueChange?: (value: string) => void;
}
export const PromptInputCommandInput = factory<{
  props: PromptInputCommandInputProps;
  ref: HTMLInputElement;
}>(({ ref, ..._props }) => {
  const { value, onValueChange, className, style, ...props } = useProps(
    'PromptInputCommandInput',
    { placeholder: 'Search…' },
    _props,
  );
  const getStyles = useCommandStyles();
  return (
    <Command.Input asChild value={value} onValueChange={onValueChange}>
      <TextInput
        {...props}
        {...(props.label || props['aria-label']
          ? { 'aria-labelledby': props['aria-labelledby'] }
          : {})}
        {...getStyles('input', { className, style })}
        ref={ref}
      />
    </Command.Input>
  );
});

export interface PromptInputCommandListProps
  extends BoxProps,
    Omit<
      ComponentPropsWithoutRef<typeof Command.List>,
      keyof BoxProps | 'asChild'
    > {}
export const PromptInputCommandList = factory<{
  props: PromptInputCommandListProps;
  ref: HTMLDivElement;
}>(({ ref, className, style, ...props }) => {
  const getStyles = useCommandStyles();
  return (
    <Box
      component={Command.List}
      {...props}
      {...getStyles('list', { className, style })}
      ref={ref}
    />
  );
});
export interface PromptInputCommandEmptyProps
  extends BoxProps,
    Omit<
      ComponentPropsWithoutRef<typeof Command.Empty>,
      keyof BoxProps | 'asChild'
    > {}
export const PromptInputCommandEmpty = factory<{
  props: PromptInputCommandEmptyProps;
  ref: HTMLDivElement;
}>(({ ref, className, style, ...props }) => {
  const getStyles = useCommandStyles();
  return (
    <Box
      component={Command.Empty}
      {...props}
      {...getStyles('empty', { className, style })}
      ref={ref}
    />
  );
});
export interface PromptInputCommandGroupProps
  extends BoxProps,
    Omit<
      ComponentPropsWithoutRef<typeof Command.Group>,
      keyof BoxProps | 'asChild'
    > {}
export const PromptInputCommandGroup = factory<{
  props: PromptInputCommandGroupProps;
  ref: HTMLDivElement;
}>(({ ref, className, style, ...props }) => {
  const getStyles = useCommandStyles();
  return (
    <Box
      component={Command.Group}
      {...props}
      {...getStyles('group', { className, style })}
      ref={ref}
    />
  );
});
export interface PromptInputCommandItemProps
  extends BoxProps,
    Omit<
      ComponentPropsWithoutRef<typeof Command.Item>,
      keyof BoxProps | 'asChild'
    > {}
export const PromptInputCommandItem = factory<{
  props: PromptInputCommandItemProps;
  ref: HTMLDivElement;
}>(({ ref, className, style, ...props }) => {
  const getStyles = useCommandStyles();
  return (
    <Box
      component={Command.Item}
      {...props}
      {...getStyles('item', { className, style })}
      ref={ref}
    />
  );
});
export interface PromptInputCommandSeparatorProps
  extends BoxProps,
    Omit<
      ComponentPropsWithoutRef<typeof Command.Separator>,
      keyof BoxProps | 'asChild'
    > {}
export const PromptInputCommandSeparator = factory<{
  props: PromptInputCommandSeparatorProps;
  ref: HTMLDivElement;
}>(({ ref, className, style, ...props }) => {
  const getStyles = useCommandStyles();
  return (
    <Box
      component={Command.Separator}
      {...props}
      {...getStyles('separator', { className, style })}
      ref={ref}
    />
  );
});
PromptInputCommand.displayName = 'PromptInput.Command';
PromptInputCommand.classes = classes;
PromptInputCommand.Input = PromptInputCommandInput;
PromptInputCommand.List = PromptInputCommandList;
PromptInputCommand.Empty = PromptInputCommandEmpty;
PromptInputCommand.Group = PromptInputCommandGroup;
PromptInputCommand.Item = PromptInputCommandItem;
PromptInputCommand.Separator = PromptInputCommandSeparator;
PromptInputCommandInput.displayName = 'PromptInput.CommandInput';
PromptInputCommandList.displayName = 'PromptInput.CommandList';
PromptInputCommandEmpty.displayName = 'PromptInput.CommandEmpty';
PromptInputCommandGroup.displayName = 'PromptInput.CommandGroup';
PromptInputCommandItem.displayName = 'PromptInput.CommandItem';
PromptInputCommandSeparator.displayName = 'PromptInput.CommandSeparator';
