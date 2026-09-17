'use client';

import {
  Box,
  type BoxProps,
  Button,
  type ButtonCssVariables,
  type ButtonProps,
  type ButtonStylesNames,
  type ElementProps,
  type Factory,
  factory,
  Group,
  Kbd,
  Menu,
  type MenuDropdownProps,
  type MenuItemProps,
  type MenuProps,
  Select,
  type SelectProps,
  type SelectStylesNames,
  Text,
  Tooltip,
  useProps,
  useStyles,
} from '@mantine/core';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  AttachmentHoverCard,
  AttachmentHoverCardContent,
  AttachmentHoverCardTrigger,
} from '../Attachments/AttachmentHoverCard';
import { captureScreenshot } from './capture-screenshot';
import { usePromptInputAttachments } from './prompt-input-state';

export type PromptInputButtonTooltip =
  | string
  | {
      content: ReactNode;
      shortcut?: string;
      side?: 'top' | 'bottom' | 'left' | 'right';
    };
export interface PromptInputButtonProps
  extends ButtonProps,
    ElementProps<'button', 'color'> {
  tooltip?: PromptInputButtonTooltip;
}
export type PromptInputButtonFactory = Factory<{
  props: PromptInputButtonProps;
  ref: HTMLButtonElement;
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
}>;
export const PromptInputButton = factory<PromptInputButtonFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'PromptInputButton',
      { variant: 'subtle', size: 'compact-sm', type: 'button' },
      _props,
    );
    const {
      tooltip,
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<PromptInputButtonFactory>({
      name: 'PromptInputButton',
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
      (Object.keys(Button.classes) as ButtonStylesNames[]).map((selector) => [
        selector,
        getStyles(selector),
      ]),
    );
    const button = (
      <Button
        {...others}
        ref={ref}
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
      />
    );
    if (!tooltip) return button;
    const options =
      typeof tooltip === 'string' ? { content: tooltip } : tooltip;
    return (
      <Tooltip
        position={options.side ?? 'top'}
        events={{ hover: true, focus: true, touch: false }}
        label={
          <Group gap="xs">
            {options.content}
            {options.shortcut && <Kbd>{options.shortcut}</Kbd>}
          </Group>
        }
      >
        {button}
      </Tooltip>
    );
  },
);
PromptInputButton.displayName = 'PromptInput.Button';

export interface PromptInputActionMenuProps extends MenuProps {}
export const PromptInputActionMenu: typeof Menu = Menu;
export interface PromptInputActionMenuContentProps extends MenuDropdownProps {}
export const PromptInputActionMenuContent: typeof Menu.Dropdown = Menu.Dropdown;
export interface PromptInputActionMenuItemProps
  extends MenuItemProps,
    ElementProps<'button', 'color'> {}
export const PromptInputActionMenuItem: typeof Menu.Item = Menu.Item;
export interface PromptInputActionMenuTriggerProps
  extends PromptInputButtonProps {}
export const PromptInputActionMenuTrigger = factory<{
  props: PromptInputActionMenuTriggerProps;
  ref: HTMLButtonElement;
}>(({ ref, children, ...props }) => (
  <Menu.Target>
    <PromptInputButton aria-label="Add to prompt" {...props} ref={ref}>
      {children ?? '+'}
    </PromptInputButton>
  </Menu.Target>
));
PromptInputActionMenuTrigger.displayName = 'PromptInput.ActionMenuTrigger';
export interface PromptInputActionAddAttachmentsProps
  extends PromptInputActionMenuItemProps {
  label?: string;
}
export const PromptInputActionAddAttachments = factory<{
  props: PromptInputActionAddAttachmentsProps;
  ref: HTMLButtonElement;
}>(({ ref, ..._props }) => {
  const {
    label = 'Add photos or files',
    onClick,
    children,
    ...props
  } = useProps('PromptInputActionAddAttachments', {}, _props);
  const attachments = usePromptInputAttachments();
  return (
    <Menu.Item
      closeMenuOnClick={false}
      {...props}
      ref={ref}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !props.disabled)
          attachments.openFileDialog();
      }}
    >
      {children ?? label}
    </Menu.Item>
  );
});
PromptInputActionAddAttachments.displayName =
  'PromptInput.ActionAddAttachments';
export interface PromptInputActionAddScreenshotProps
  extends PromptInputActionMenuItemProps {
  label?: string;
  onCaptureError?: (error: unknown) => void;
}
export const PromptInputActionAddScreenshot = factory<{
  props: PromptInputActionAddScreenshotProps;
  ref: HTMLButtonElement;
}>(({ ref, ..._props }) => {
  const {
    label = 'Take screenshot',
    onClick,
    onCaptureError,
    children,
    disabled,
    ...props
  } = useProps('PromptInputActionAddScreenshot', {}, _props);
  const attachments = usePromptInputAttachments();
  const controller = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(Boolean(navigator.mediaDevices?.getDisplayMedia));
    return () => controller.current?.abort();
  }, []);
  return (
    <Menu.Item
      {...props}
      closeMenuOnClick={false}
      ref={ref}
      disabled={disabled || busy || !supported}
      aria-busy={busy || undefined}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled || controller.current) return;
        const capture = new AbortController();
        controller.current = capture;
        setBusy(true);
        try {
          const file = await captureScreenshot(capture.signal);
          if (!capture.signal.aborted) attachments.add([file]);
        } catch (error) {
          if (
            !capture.signal.aborted &&
            !(
              error instanceof DOMException &&
              ['NotAllowedError', 'AbortError'].includes(error.name)
            )
          )
            onCaptureError?.(error);
        } finally {
          controller.current = null;
          if (!capture.signal.aborted) setBusy(false);
        }
      }}
    >
      {children ?? label}
    </Menu.Item>
  );
});
PromptInputActionAddScreenshot.displayName = 'PromptInput.ActionAddScreenshot';

export interface PromptInputSelectProps extends SelectProps {}
export type PromptInputSelectFactory = Factory<{
  props: PromptInputSelectProps;
  ref: HTMLInputElement;
  stylesNames: SelectStylesNames;
}>;
export const PromptInputSelect = factory<PromptInputSelectFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'PromptInputSelect',
      { size: 'xs', variant: 'unstyled', allowDeselect: false },
      _props,
    );
    const { className, style, classNames, styles, vars, unstyled, ...others } =
      props;
    const getStyles = useStyles<PromptInputSelectFactory>({
      name: 'PromptInputSelect',
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
      (Object.keys(Select.classes) as SelectStylesNames[]).map((selector) => [
        selector,
        getStyles(selector),
      ]),
    );
    return (
      <Select
        {...others}
        ref={ref}
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
      />
    );
  },
);
PromptInputSelect.displayName = 'PromptInput.Select';

/** Shares the existing keyboard-accessible hover engine and AttachmentHoverCard theme. */
export const PromptInputHoverCard = AttachmentHoverCard;
export const PromptInputHoverCardTrigger = AttachmentHoverCardTrigger;
export const PromptInputHoverCardContent = AttachmentHoverCardContent;

// Upstream's "Tabs" are layout sections. Use Mantine Tabs for selectable panels.
export interface PromptInputTabProps extends BoxProps, ElementProps<'div'> {}
export const PromptInputTabsList = factory<{
  props: PromptInputTabProps;
  ref: HTMLDivElement;
}>(({ ref, ...props }) => <Box {...props} ref={ref} />);
export const PromptInputTab = factory<{
  props: PromptInputTabProps;
  ref: HTMLDivElement;
}>(({ ref, ...props }) => <Box {...props} ref={ref} />);
export const PromptInputTabBody = factory<{
  props: PromptInputTabProps;
  ref: HTMLDivElement;
}>(({ ref, ...props }) => <Box {...props} ref={ref} />);
export const PromptInputTabItem = factory<{
  props: PromptInputTabProps;
  ref: HTMLDivElement;
}>(({ ref, ...props }) => (
  <Box display="flex" p="xs" fz="xs" {...props} ref={ref} />
));
export interface PromptInputTabLabelProps
  extends BoxProps,
    ElementProps<'h3'> {}
export const PromptInputTabLabel = factory<{
  props: PromptInputTabLabelProps;
  ref: HTMLHeadingElement;
}>(({ ref, ...props }) => (
  <Text
    component="h3"
    size="xs"
    c="dimmed"
    fw={500}
    px="xs"
    mb="xs"
    {...props}
    ref={ref}
  />
));
PromptInputTabsList.displayName = 'PromptInput.TabsList';
PromptInputTab.displayName = 'PromptInput.Tab';
PromptInputTabBody.displayName = 'PromptInput.TabBody';
PromptInputTabItem.displayName = 'PromptInput.TabItem';
PromptInputTabLabel.displayName = 'PromptInput.TabLabel';
