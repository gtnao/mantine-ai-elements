'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  ActionIcon,
  type ActionIconCssVariables,
  type ActionIconProps,
  type ActionIconStylesNames,
  type PolymorphicFactory,
  polymorphicFactory,
  Tooltip,
  type TooltipProps,
  useProps,
  useStyles,
} from '@mantine/core';
import type { ReactNode } from 'react';
import classes from './WebPreview.module.css';
export interface WebPreviewNavigationButtonProps extends ActionIconProps {
  /** Accessible name; falls back to tooltip. Native aria-label takes precedence. */
  label?: string;
  tooltip?: string;
  tooltipProps?: Omit<TooltipProps, 'children' | 'label'>;
  /** Mantine-style icon element. Takes precedence over children. */
  icon?: ReactNode;
}
export type WebPreviewNavigationButtonFactory = PolymorphicFactory<{
  props: WebPreviewNavigationButtonProps;
  defaultComponent: 'button';
  defaultRef: HTMLButtonElement;
  stylesNames: ActionIconStylesNames;
  vars: ActionIconCssVariables;
}>;
export const WebPreviewNavigationButton =
  polymorphicFactory<WebPreviewNavigationButtonFactory>((_props) => {
    const props = useProps(
      'WebPreviewNavigationButton',
      { size: 32, variant: 'subtle', color: 'gray' },
      _props,
    );
    const {
      label,
      tooltip,
      tooltipProps,
      icon,
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
    const getStyles = useStyles<WebPreviewNavigationButtonFactory>({
      name: 'WebPreviewNavigationButton',
      props,
      classes: { root: classes.navigationButton },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (Object.keys(ActionIcon.classes) as ActionIconStylesNames[]).map(
        (key) => [key, getStyles(key)],
      ),
    );
    const button = (
      <ActionIcon
        type="button"
        aria-label={label || tooltip}
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
        {icon ?? children}
      </ActionIcon>
    );
    return tooltip ? (
      <Tooltip
        events={{ hover: true, focus: true, touch: false }}
        {...tooltipProps}
        label={tooltip}
      >
        {button}
      </Tooltip>
    ) : (
      button
    );
  });
WebPreviewNavigationButton.displayName = 'WebPreviewNavigationButton';
WebPreviewNavigationButton.classes = ActionIcon.classes;
