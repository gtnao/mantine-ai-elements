'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  ActionIcon,
  type ActionIconCssVariables,
  type ActionIconProps,
  type ActionIconStylesNames,
  type ElementProps,
  type Factory,
  factory,
  useProps,
  useStyles,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { useSnippet } from './Snippet.context';
import classes from './Snippet.module.css';
export interface SnippetCopyButtonProps
  extends ActionIconProps,
    ElementProps<'button', 'color' | 'onCopy' | 'onError'> {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  copyLabel?: string;
  copiedLabel?: string;
}
export type SnippetCopyButtonFactory = Factory<{
  props: SnippetCopyButtonProps;
  ref: HTMLButtonElement;
  stylesNames: ActionIconStylesNames;
  vars: ActionIconCssVariables;
}>;
export const SnippetCopyButton = factory<SnippetCopyButtonFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'SnippetCopyButton',
      {
        size: 32,
        variant: 'subtle',
        color: 'gray',
        timeout: 2000,
        copyLabel: 'Copy',
        copiedLabel: 'Copied',
      },
      _props,
    );
    const {
      onCopy,
      onError,
      timeout,
      copyLabel,
      copiedLabel,
      children,
      onClick,
      disabled,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const { code, disabled: groupDisabled } = useSnippet();
    const [copied, setCopied] = useState(false);
    const pending = useRef(false);
    const mounted = useRef(true);
    const latestCode = useRef(code);
    latestCode.current = code;
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        clearTimeout(timer.current);
      };
    }, []);
    // biome-ignore lint/correctness/useExhaustiveDependencies: Copied feedback belongs to the current code value.
    useEffect(() => {
      setCopied(false);
      clearTimeout(timer.current);
    }, [code]);
    const getStyles = useStyles<SnippetCopyButtonFactory>({
      name: 'SnippetCopyButton',
      props,
      classes: { root: classes.copy },
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
    return (
      <ActionIcon
        {...others}
        ref={ref}
        type="button"
        disabled={disabled || groupDisabled}
        unstyled={unstyled}
        aria-label={others['aria-label'] ?? (copied ? copiedLabel : copyLabel)}
        title={others.title ?? (copied ? copiedLabel : copyLabel)}
        data-copied={copied || undefined}
        onClick={async (event) => {
          if (
            disabled ||
            groupDisabled ||
            others['data-disabled'] ||
            props.loading
          )
            return;
          onClick?.(event);
          if (event.defaultPrevented || pending.current || copied) return;
          pending.current = true;
          try {
            if (!navigator.clipboard?.writeText)
              throw new Error('Clipboard API not available');
            await navigator.clipboard.writeText(code);
            if (mounted.current) {
              if (latestCode.current === code) {
                setCopied(true);
                timer.current = setTimeout(() => setCopied(false), timeout);
              }
              onCopy?.();
            }
          } catch (error) {
            if (mounted.current)
              onError?.(
                error instanceof Error ? error : new Error(String(error)),
              );
          } finally {
            pending.current = false;
          }
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
        {children ?? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            {copied ? (
              <path d="m5 12 4 4L19 6" />
            ) : (
              <>
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8V4H4v12h4" />
              </>
            )}
          </svg>
        )}
      </ActionIcon>
    );
  },
);
SnippetCopyButton.displayName = 'SnippetCopyButton';
SnippetCopyButton.classes = ActionIcon.classes;
