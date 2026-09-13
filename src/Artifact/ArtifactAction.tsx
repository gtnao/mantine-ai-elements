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
import classes from './Artifact.module.css';
export interface ArtifactActionProps extends ActionIconProps {
  /** Accessible name; falls back to tooltip. Native aria-label takes precedence. */
  label?: string;
  tooltip?: string;
  tooltipProps?: Omit<TooltipProps, 'children' | 'label'>;
  /** Mantine-style icon element. Takes precedence over children. */
  icon?: ReactNode;
}
export interface ArtifactCloseProps extends ArtifactActionProps {}

export type ArtifactActionFactory = PolymorphicFactory<{
  props: ArtifactActionProps;
  defaultComponent: 'button';
  defaultRef: HTMLButtonElement;
  stylesNames: ActionIconStylesNames;
  vars: ActionIconCssVariables;
}>;
export const ArtifactAction = polymorphicFactory<ArtifactActionFactory>(
  (_props) => {
    const props = useProps(
      'ArtifactAction',
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
    const getStyles = useStyles<ArtifactActionFactory>({
      name: 'ArtifactAction',
      props,
      classes: { root: classes.action },
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
  },
);
ArtifactAction.displayName = 'ArtifactAction';
ArtifactAction.classes = ActionIcon.classes;

export type ArtifactCloseFactory = PolymorphicFactory<{
  props: ArtifactCloseProps;
  defaultComponent: 'button';
  defaultRef: HTMLButtonElement;
  stylesNames: ActionIconStylesNames;
  vars: ActionIconCssVariables;
}>;
export const ArtifactClose = polymorphicFactory<ArtifactCloseFactory>(
  (_props) => {
    const props = useProps(
      'ArtifactClose',
      { size: 32, variant: 'subtle', color: 'gray', label: 'Close' },
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
    const getStyles = useStyles<ArtifactCloseFactory>({
      name: 'ArtifactClose',
      props,
      classes: { root: classes.action },
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
        {icon ?? children ?? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        )}
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
  },
);
ArtifactClose.displayName = 'ArtifactClose';
ArtifactClose.classes = ActionIcon.classes;
