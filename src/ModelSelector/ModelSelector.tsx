'use client';

/* Adapted from AI Elements (Apache-2.0); see NOTICE. */
import {
  Box,
  type BoxProps,
  Button,
  type ButtonCssVariables,
  type ButtonFactory,
  type ButtonProps,
  type ButtonStylesNames,
  type ElementProps,
  type Factory,
  factory,
  type ImageProps,
  Kbd,
  type KbdProps,
  Modal,
  type ModalCssVariables,
  type ModalFactory,
  type ModalProps,
  type ModalStylesNames,
  Text,
  type TextProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useId, useMergedRef, useUncontrolled } from '@mantine/hooks';
import { createContext, type Ref, useContext } from 'react';
import { AIImage } from '../Image/Image';
import {
  PromptInputCommand,
  PromptInputCommandEmpty,
  PromptInputCommandGroup,
  PromptInputCommandInput,
  PromptInputCommandItem,
  PromptInputCommandList,
  type PromptInputCommandProps,
  PromptInputCommandSeparator,
} from '../PromptInput/PromptInputCommand';
import classes from './ModelSelector.module.css';

export interface ModelSelectorProps
  extends Omit<
    ModalProps,
    'opened' | 'onClose' | 'onChange' | '__staticSelector'
  > {
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (opened: boolean) => void;
}
export type ModelSelectorFactory = Factory<{
  props: ModelSelectorProps;
  ref: HTMLDivElement;
  stylesNames: ModalStylesNames;
  vars: ModalCssVariables;
  staticComponents: {
    Trigger: typeof ModelSelectorTrigger;
    Content: typeof ModelSelectorContent;
    Dialog: typeof ModelSelectorDialog;
    Input: typeof ModelSelectorInput;
    List: typeof ModelSelectorList;
    Empty: typeof ModelSelectorEmpty;
    Group: typeof ModelSelectorGroup;
    Item: typeof ModelSelectorItem;
    Separator: typeof ModelSelectorSeparator;
    Shortcut: typeof ModelSelectorShortcut;
    Logo: typeof ModelSelectorLogo;
    LogoGroup: typeof ModelSelectorLogoGroup;
    Name: typeof ModelSelectorName;
  };
}>;
interface SelectorContext {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  props: Omit<ModalProps, 'opened' | 'onClose'>;
  ref: Ref<HTMLDivElement> | undefined;
}
const Context = createContext<SelectorContext | null>(null);
function useSelector() {
  const context = useContext(Context);
  if (!context) throw new Error('ModelSelector children require ModelSelector');
  return context;
}
export const ModelSelector = factory<ModelSelectorFactory>(
  ({ ref, ..._props }) => {
    const { opened, defaultOpened, onChange, children, ...props } = useProps(
      'ModelSelector',
      { title: 'Model selector', centered: true, size: 'md' },
      _props,
    );
    const [value, setOpened] = useUncontrolled({
      value: opened,
      defaultValue: defaultOpened,
      finalValue: false,
      onChange,
    });
    const id = useId(props.id);
    return (
      <Context.Provider
        value={{ opened: value, setOpened, props: { ...props, id }, ref }}
      >
        {children}
      </Context.Provider>
    );
  },
);
export interface ModelSelectorTriggerProps
  extends ButtonProps,
    ElementProps<'button', 'color'> {}
export const ModelSelectorTrigger = factory<{
  props: ModelSelectorTriggerProps;
  ref: HTMLButtonElement;
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
}>(({ ref, ..._props }) => {
  const allProps = useProps(
    'ModelSelectorTrigger',
    { variant: 'default' },
    _props,
  );
  const {
    onClick,
    children,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
    ...props
  } = allProps;
  const getStyles = useStyles<ButtonFactory>({
    name: 'ModelSelectorTrigger',
    classes: {},
    props: allProps,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
  });
  const resolved = Object.fromEntries(
    (Object.keys(Button.classes) as ButtonStylesNames[]).map((selector) => [
      selector,
      getStyles(selector),
    ]),
  );
  const context = useSelector();
  return (
    <Button
      {...props}
      unstyled={unstyled}
      classNames={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.className]),
      )}
      styles={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.style]),
      )}
      ref={ref}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={context.opened}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          !props.disabled &&
          !props.loading &&
          !props['data-disabled']
        )
          context.setOpened(true);
      }}
    >
      {children}
    </Button>
  );
});
export interface ModelSelectorContentProps
  extends Omit<ModalProps, 'opened' | 'onClose' | '__staticSelector'> {
  commandProps?: Omit<PromptInputCommandProps, 'children'>;
}
export const ModelSelectorContent = factory<{
  props: ModelSelectorContentProps;
  ref: HTMLDivElement;
  stylesNames: ModalStylesNames;
  vars: ModalCssVariables;
}>(({ ref, ..._props }) => {
  const context = useSelector();
  const { children, commandProps, ...props } = useProps(
    'ModelSelectorContent',
    {},
    _props,
  );
  const mergedRef = useMergedRef(context.ref, ref);
  const combined = {
    ...context.props,
    ...props,
    opened: context.opened,
    onClose: () => context.setOpened(false),
  };
  const { className, style, classNames, styles, vars, unstyled, ...others } =
    combined;
  const getStyles = useStyles<ModalFactory>({
    name: ['ModelSelector', 'ModelSelectorContent'],
    classes: {},
    props: combined,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
  });
  const resolved = Object.fromEntries(
    (Object.keys(Modal.classes) as ModalStylesNames[]).map((selector) => [
      selector,
      getStyles(selector),
    ]),
  );
  return (
    <Modal
      {...others}
      ref={mergedRef}
      unstyled={unstyled}
      classNames={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.className]),
      )}
      styles={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.style]),
      )}
    >
      <PromptInputCommand label="Models" {...commandProps}>
        {children}
      </PromptInputCommand>
    </Modal>
  );
});
export interface ModelSelectorDialogProps extends ModelSelectorProps {
  commandProps?: Omit<PromptInputCommandProps, 'children'>;
}
export const ModelSelectorDialog = factory<{
  props: ModelSelectorDialogProps;
  ref: HTMLDivElement;
}>(({ children, commandProps, ref, ...props }) => (
  <ModelSelector {...props}>
    <ModelSelectorContent ref={ref} commandProps={commandProps}>
      {children}
    </ModelSelectorContent>
  </ModelSelector>
));

export const ModelSelectorInput = PromptInputCommandInput;
export const ModelSelectorList = PromptInputCommandList;
export const ModelSelectorEmpty = PromptInputCommandEmpty;
export const ModelSelectorGroup = PromptInputCommandGroup;
export const ModelSelectorItem = PromptInputCommandItem;
export const ModelSelectorSeparator = PromptInputCommandSeparator;
export interface ModelSelectorShortcutProps
  extends KbdProps,
    ElementProps<'kbd'> {}
export const ModelSelectorShortcut = factory<{
  props: ModelSelectorShortcutProps;
  ref: HTMLElement;
}>(({ ref, ...props }) => <Kbd ml="auto" {...props} ref={ref} />);
export interface ModelSelectorLogoProps
  extends Omit<ImageProps, 'src'>,
    ElementProps<'img', keyof ImageProps> {
  provider: string;
  src?: string;
  /** Invert the default monochrome provider logo in dark mode. Defaults to true for models.dev URLs. */
  invertInDark?: boolean;
}
export const ModelSelectorLogo = factory<{
  props: ModelSelectorLogoProps;
  ref: HTMLImageElement;
  stylesNames: 'root';
}>(({ ref, ..._props }) => {
  const props = useProps(
    'ModelSelectorLogo',
    { w: 16, h: 16, radius: 0 },
    _props,
  );
  const {
    provider,
    src,
    alt = `${provider} logo`,
    invertInDark = src === undefined,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
    ...others
  } = props;
  const getStyles = useStyles({
    name: 'ModelSelectorLogo',
    classes: { root: classes.logo },
    props,
    className,
    style,
    classNames,
    styles,
    vars,
    unstyled,
  });
  return (
    <AIImage
      {...others}
      {...getStyles('root')}
      unstyled={unstyled}
      ref={ref}
      src={
        src ?? `https://models.dev/logos/${encodeURIComponent(provider)}.svg`
      }
      alt={alt}
      data-invert={invertInDark || undefined}
    />
  );
});
export interface ModelSelectorLogoGroupProps
  extends BoxProps,
    ElementProps<'div'> {}
export const ModelSelectorLogoGroup = factory<{
  props: ModelSelectorLogoGroupProps;
  ref: HTMLDivElement;
}>(({ ref, className, ...props }) => (
  <Box
    {...props}
    ref={ref}
    className={[classes.logoGroup, className].filter(Boolean).join(' ')}
  />
));
export interface ModelSelectorNameProps
  extends TextProps,
    ElementProps<'span', keyof TextProps> {}
export const ModelSelectorName = factory<{
  props: ModelSelectorNameProps;
  ref: HTMLSpanElement;
}>(({ ref, ...props }) => (
  <Text component="span" truncate flex={1} ta="start" {...props} ref={ref} />
));

ModelSelector.displayName = 'ModelSelector';
ModelSelector.classes = Modal.classes;
ModelSelector.Trigger = ModelSelectorTrigger;
ModelSelector.Content = ModelSelectorContent;
ModelSelector.Dialog = ModelSelectorDialog;
ModelSelector.Input = ModelSelectorInput;
ModelSelector.List = ModelSelectorList;
ModelSelector.Empty = ModelSelectorEmpty;
ModelSelector.Group = ModelSelectorGroup;
ModelSelector.Item = ModelSelectorItem;
ModelSelector.Separator = ModelSelectorSeparator;
ModelSelector.Shortcut = ModelSelectorShortcut;
ModelSelector.Logo = ModelSelectorLogo;
ModelSelector.LogoGroup = ModelSelectorLogoGroup;
ModelSelector.Name = ModelSelectorName;
ModelSelectorTrigger.displayName = 'ModelSelector.Trigger';
ModelSelectorContent.displayName = 'ModelSelector.Content';
ModelSelectorDialog.displayName = 'ModelSelector.Dialog';
ModelSelectorShortcut.displayName = 'ModelSelector.Shortcut';
ModelSelectorLogo.displayName = 'ModelSelector.Logo';
ModelSelectorLogoGroup.displayName = 'ModelSelector.LogoGroup';
ModelSelectorName.displayName = 'ModelSelector.Name';
