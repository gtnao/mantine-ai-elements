'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  Button,
  type ButtonCssVariables,
  type ButtonFactory,
  type ButtonProps,
  type ButtonStylesNames,
  type ElementProps,
  type Factory,
  factory,
  Menu,
  type MenuDividerProps,
  type MenuDropdownProps,
  type MenuItemProps,
  type MenuLabelProps,
  type MenuProps,
  type MenuStylesNames,
  type MenuTargetProps,
  type PolymorphicFactory,
  polymorphicFactory,
  useProps,
  useStyles,
} from '@mantine/core';
import { createContext, type MouseEventHandler, useContext } from 'react';
import classes from './OpenIn.module.css';
import { openInProviders } from './providers';

type OpenInItemStylesNames = Extract<
  MenuStylesNames,
  'item' | 'itemLabel' | 'itemSection' | 'itemIndicator'
>;

export interface OpenInProps extends MenuProps {
  query: string;
}
export type OpenInFactory = Factory<{
  props: OpenInProps;
  stylesNames: MenuStylesNames;
  staticComponents: {
    Trigger: typeof OpenInTrigger;
    Target: typeof OpenInTarget;
    Content: typeof OpenInContent;
    Item: typeof OpenInItem;
    Label: typeof OpenInLabel;
    Separator: typeof OpenInSeparator;
    ChatGPT: typeof OpenInChatGPT;
    Claude: typeof OpenInClaude;
    T3: typeof OpenInT3;
    Scira: typeof OpenInScira;
    v0: typeof OpenInv0;
    Cursor: typeof OpenInCursor;
  };
}>;
const QueryContext = createContext<string | undefined>(undefined);
function useQuery() {
  const query = useContext(QueryContext);
  if (query === undefined)
    throw new Error('OpenIn components must be used within OpenIn');
  return query;
}
export const OpenIn = factory<OpenInFactory>((_props) => {
  const props = useProps(
    'OpenIn',
    { width: 240, position: 'bottom-start' },
    _props,
  );
  const {
    query,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
    children,
    ...others
  } = props;
  const getStyles = useStyles<OpenInFactory>({
    name: 'OpenIn',
    props,
    classes,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  const resolved = Object.fromEntries(
    (Object.keys(Menu.classes) as MenuStylesNames[]).map((key) => [
      key,
      getStyles(key),
    ]),
  );
  return (
    <QueryContext.Provider value={query}>
      <Menu
        {...others}
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
      >
        {children}
      </Menu>
    </QueryContext.Provider>
  );
});
export interface OpenInTriggerProps
  extends ButtonProps,
    ElementProps<'button', keyof ButtonProps> {}
export const OpenInTrigger = factory<{
  props: OpenInTriggerProps;
  ref: HTMLButtonElement;
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
}>(({ ref, ..._props }) => {
  const props = useProps('OpenInTrigger', { variant: 'default' }, _props);
  const {
    children,
    rightSection,
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
    ...others
  } = props;
  const getStyles = useStyles<ButtonFactory>({
    name: 'OpenInTrigger',
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
    (Object.keys(Button.classes) as ButtonStylesNames[]).map((key) => [
      key,
      getStyles(key),
    ]),
  );
  return (
    <Menu.Target>
      <Button
        {...others}
        ref={ref}
        type="button"
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
        rightSection={
          rightSection === undefined ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          ) : (
            rightSection
          )
        }
      >
        {children ?? 'Open in chat'}
      </Button>
    </Menu.Target>
  );
});
export interface OpenInTargetProps extends MenuTargetProps {}
/** Use instead of Trigger to supply an entire ref-forwarding target element. */
export const OpenInTarget = Menu.Target;
export interface OpenInContentProps extends MenuDropdownProps {}
export const OpenInContent = factory<{
  props: OpenInContentProps;
  ref: HTMLDivElement;
}>(({ ref, ..._props }) => {
  const { onKeyDown, ...props } = useProps('OpenInContent', {}, _props);
  return (
    <Menu.Dropdown
      {...props}
      ref={ref}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
        )
          return;
        if (
          event.target instanceof Element &&
          event.target.closest('[role="menuitem"]')
        )
          return;
        const items = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            '[role="menuitem"]',
          ),
        ).filter(
          (item) =>
            item.closest('[role="menu"]') === event.currentTarget &&
            !item.matches(':disabled, [aria-disabled="true"]'),
        );
        const target = event.key === 'ArrowDown' ? items[0] : items.at(-1);
        event.preventDefault();
        target?.focus();
      }}
    />
  );
});
export interface OpenInItemProps extends MenuItemProps {}
export type OpenInItemFactory = PolymorphicFactory<{
  props: OpenInItemProps;
  defaultComponent: 'button';
  defaultRef: HTMLButtonElement;
  stylesNames: OpenInItemStylesNames;
}>;
export const OpenInItem = polymorphicFactory<OpenInItemFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('OpenInItem', {}, _props);
    const {
      disabled,
      href,
      onClick,
      onAuxClick,
      className,
      style,
      classNames,
      styles,
      vars,
      ...others
    } = props as OpenInItemProps & {
      href?: string;
      onClick?: MouseEventHandler<HTMLElement>;
      onAuxClick?: MouseEventHandler<HTMLElement>;
    };
    const unavailable = disabled || others['data-disabled'];
    const getStyles = useStyles<OpenInItemFactory>({
      name: 'OpenInItem',
      props,
      classes: {},
      className,
      style,
      classNames,
      styles,
      vars,
    });
    const resolved = Object.fromEntries(
      (['item', 'itemLabel', 'itemSection', 'itemIndicator'] as const).map(
        (key) => [key, getStyles(key)],
      ),
    );
    return (
      <Menu.Item
        {...others}
        ref={ref}
        disabled={disabled}
        data-disabled={unavailable || undefined}
        aria-disabled={unavailable || undefined}
        {...(href === undefined
          ? {}
          : { href: unavailable ? undefined : href })}
        onClick={(event) => {
          if (unavailable) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        onAuxClick={(event) => {
          if (unavailable) {
            event.preventDefault();
            return;
          }
          onAuxClick?.(event);
        }}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [
            key,
            value.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [key, value.style]),
        )}
      />
    );
  },
);
export interface OpenInLabelProps extends MenuLabelProps {}
export const OpenInLabel = factory<{
  props: OpenInLabelProps;
  ref: HTMLDivElement;
  stylesNames: 'label';
}>(({ ref, ..._props }) => {
  const props = useProps('OpenInLabel', {}, _props);
  const { className, style, classNames, styles, vars, ...others } = props;
  const getStyles = useStyles<{
    props: OpenInLabelProps;
    ref: HTMLDivElement;
    stylesNames: 'label';
  }>({
    name: 'OpenInLabel',
    props,
    classes: {},
    className,
    style,
    classNames,
    styles,
    vars,
  });
  return <Menu.Label {...others} {...getStyles('label')} ref={ref} />;
});
export interface OpenInSeparatorProps extends MenuDividerProps {}
export const OpenInSeparator = factory<{
  props: OpenInSeparatorProps;
  ref: HTMLDivElement;
  stylesNames: 'divider';
}>(({ ref, ..._props }) => {
  const props = useProps('OpenInSeparator', {}, _props);
  const { className, style, classNames, styles, vars, ...others } = props;
  const getStyles = useStyles<{
    props: OpenInSeparatorProps;
    ref: HTMLDivElement;
    stylesNames: 'divider';
  }>({
    name: 'OpenInSeparator',
    props,
    classes: {},
    className,
    style,
    classNames,
    styles,
    vars,
  });
  return (
    <Menu.Divider
      role="separator"
      {...others}
      {...getStyles('divider')}
      ref={ref}
    />
  );
});
export interface OpenInChatGPTProps
  extends MenuItemProps,
    ElementProps<'a', keyof MenuItemProps> {}
export interface OpenInClaudeProps extends OpenInChatGPTProps {}
export interface OpenInT3Props extends OpenInChatGPTProps {}
export interface OpenInSciraProps extends OpenInChatGPTProps {}
export interface OpenInv0Props extends OpenInChatGPTProps {}
export interface OpenInCursorProps extends OpenInChatGPTProps {}
function createProvider(name: string, provider: keyof typeof openInProviders) {
  const Component = factory<{
    props: OpenInChatGPTProps;
    ref: HTMLAnchorElement;
    stylesNames: OpenInItemStylesNames;
  }>(({ ref, ..._props }) => {
    const props = useProps(
      name,
      { target: '_blank', rel: 'noopener noreferrer' },
      _props,
    );
    const {
      children,
      href,
      leftSection,
      rightSection,
      onClick,
      onAuxClick,
      disabled,
      className,
      style,
      classNames,
      styles,
      vars,
      ...others
    } = props;
    const query = useQuery();
    const definition = openInProviders[provider];
    const unavailable = disabled || others['data-disabled'];
    const getStyles = useStyles<OpenInItemFactory>({
      name,
      props,
      classes: {},
      className,
      style,
      classNames,
      styles,
      vars,
    });
    const resolved = Object.fromEntries(
      (['item', 'itemLabel', 'itemSection', 'itemIndicator'] as const).map(
        (key) => [key, getStyles(key)],
      ),
    );
    return (
      <Menu.Item
        {...others}
        component="a"
        ref={ref}
        disabled={disabled}
        data-disabled={unavailable || undefined}
        aria-disabled={unavailable || undefined}
        href={unavailable ? undefined : (href ?? definition.createUrl(query))}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [
            key,
            value.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [key, value.style]),
        )}
        leftSection={
          leftSection === undefined ? (
            <Box component="span" className={classes.icon} aria-hidden="true">
              {definition.icon}
            </Box>
          ) : (
            leftSection
          )
        }
        rightSection={
          rightSection === undefined ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M15 3h6v6m0-6-9 9M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
            </svg>
          ) : (
            rightSection
          )
        }
        onClick={(event) => {
          if (unavailable) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        onAuxClick={(event) => {
          if (unavailable) {
            event.preventDefault();
            return;
          }
          onAuxClick?.(event);
        }}
      >
        {children ?? definition.title}
      </Menu.Item>
    );
  });
  Component.displayName = name;
  return Component;
}
export const OpenInChatGPT = createProvider('OpenInChatGPT', 'chatgpt');
export const OpenInClaude = createProvider('OpenInClaude', 'claude');
export const OpenInT3 = createProvider('OpenInT3', 't3');
export const OpenInScira = createProvider('OpenInScira', 'scira');
export const OpenInv0 = createProvider('OpenInv0', 'v0');
export const OpenInCursor = createProvider('OpenInCursor', 'cursor');
OpenIn.displayName = 'OpenIn';
OpenInTrigger.displayName = 'OpenInTrigger';
OpenInContent.displayName = 'OpenInContent';
OpenInItem.displayName = 'OpenInItem';
OpenInLabel.displayName = 'OpenInLabel';
OpenInSeparator.displayName = 'OpenInSeparator';
OpenIn.classes = classes;
OpenIn.Trigger = OpenInTrigger;
OpenIn.Target = OpenInTarget;
OpenIn.Content = OpenInContent;
OpenIn.Item = OpenInItem;
OpenIn.Label = OpenInLabel;
OpenIn.Separator = OpenInSeparator;
OpenIn.ChatGPT = OpenInChatGPT;
OpenIn.Claude = OpenInClaude;
OpenIn.T3 = OpenInT3;
OpenIn.Scira = OpenInScira;
OpenIn.v0 = OpenInv0;
OpenIn.Cursor = OpenInCursor;
