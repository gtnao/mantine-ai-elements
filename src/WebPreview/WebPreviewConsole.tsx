'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  type BoxProps,
  Collapse,
  type CollapseProps,
  type ElementProps,
  type Factory,
  factory,
  type StylesApiProps,
  UnstyledButton,
  type UnstyledButtonProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useId } from '@mantine/hooks';
import type { ReactNode } from 'react';
import { useWebPreview } from './WebPreview';
import classes from './WebPreview.module.css';
export interface WebPreviewLog {
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  id?: string;
}
export interface WebPreviewConsoleProps
  extends BoxProps,
    StylesApiProps<WebPreviewConsoleFactory>,
    ElementProps<'div'> {
  logs?: WebPreviewLog[];
  label?: ReactNode;
  emptyState?: ReactNode;
  /** Defaults to UTC HH:mm:ss to keep server and browser output deterministic. */
  formatTimestamp?: (date: Date) => ReactNode;
  triggerProps?: UnstyledButtonProps &
    ElementProps<'button', keyof UnstyledButtonProps>;
  collapseProps?: Omit<CollapseProps, 'expanded' | 'children'>;
}
export type WebPreviewConsoleFactory = Factory<{
  props: WebPreviewConsoleProps;
  ref: HTMLDivElement;
  stylesNames:
    | 'root'
    | 'trigger'
    | 'chevron'
    | 'content'
    | 'scroll'
    | 'entry'
    | 'timestamp'
    | 'empty';
}>;
export const WebPreviewConsole = factory<WebPreviewConsoleFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'WebPreviewConsole',
      { label: 'Console', emptyState: 'No console output' },
      _props,
    );
    const {
      logs = [],
      label,
      emptyState,
      formatTimestamp,
      triggerProps,
      collapseProps,
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
    const { consoleOpen, setConsoleOpen } = useWebPreview();
    const id = useId();
    const getStyles = useStyles<WebPreviewConsoleFactory>({
      name: 'WebPreviewConsole',
      props,
      classes: {
        root: classes.console,
        trigger: classes.consoleTrigger,
        chevron: classes.chevron,
        content: classes.consoleContent,
        scroll: classes.consoleScroll,
        entry: classes.entry,
        timestamp: classes.timestamp,
        empty: classes.empty,
      },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Box {...others} {...getStyles('root')} ref={ref}>
        <UnstyledButton
          {...triggerProps}
          {...getStyles('trigger', {
            className: triggerProps?.className,
            style: triggerProps?.style,
          })}
          type="button"
          id={`${id}-trigger`}
          aria-expanded={consoleOpen}
          aria-controls={`${id}-content`}
          onClick={(event) => {
            triggerProps?.onClick?.(event);
            if (!event.defaultPrevented && !triggerProps?.disabled)
              setConsoleOpen(!consoleOpen);
          }}
        >
          {label}
          <svg
            {...getStyles('chevron')}
            data-opened={consoleOpen || undefined}
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
        </UnstyledButton>
        <Collapse
          {...collapseProps}
          {...getStyles('content', {
            className: collapseProps?.className,
            style: collapseProps?.style,
          })}
          expanded={consoleOpen}
          id={`${id}-content`}
          role="region"
          aria-labelledby={`${id}-trigger`}
        >
          <Box {...getStyles('scroll')} tabIndex={0}>
            {logs.length === 0 ? (
              <Box {...getStyles('empty')}>{emptyState}</Box>
            ) : (
              logs.map((log, index) => (
                <Box
                  key={log.id ?? index}
                  {...getStyles('entry')}
                  data-level={log.level}
                >
                  <Box
                    component="time"
                    {...getStyles('timestamp')}
                    dateTime={
                      Number.isNaN(log.timestamp.getTime())
                        ? undefined
                        : log.timestamp.toISOString()
                    }
                  >
                    {formatTimestamp
                      ? formatTimestamp(log.timestamp)
                      : Number.isNaN(log.timestamp.getTime())
                        ? '--:--:--'
                        : log.timestamp.toISOString().slice(11, 19)}
                  </Box>{' '}
                  {log.message}
                </Box>
              ))
            )}
            {children}
          </Box>
        </Collapse>
      </Box>
    );
  },
);
WebPreviewConsole.displayName = 'WebPreviewConsole';
WebPreviewConsole.classes = {
  root: classes.console,
  trigger: classes.consoleTrigger,
  chevron: classes.chevron,
  content: classes.consoleContent,
  scroll: classes.consoleScroll,
  entry: classes.entry,
  timestamp: classes.timestamp,
  empty: classes.empty,
};
