'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
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
  type PopoverFactory,
  type PopoverProps,
  type PopoverStylesNames,
  Progress,
  type ProgressProps,
  type ProgressRootProps,
  RingProgress,
  type RingProgressProps,
  type StylesApiProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import type { LanguageModelUsage } from 'ai';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  AttachmentHoverCard,
  AttachmentHoverCardContent,
  type AttachmentHoverCardContentProps,
  AttachmentHoverCardTrigger,
} from '../Attachments/AttachmentHoverCard';
import classes from './Context.module.css';
import {
  type ContextCosts,
  type ContextProviders,
  estimateContextCosts,
  validCount,
} from './context-cost';

type ContextStylesNames =
  | PopoverStylesNames
  | 'header'
  | 'body'
  | 'footer'
  | 'usage'
  | 'label'
  | 'value'
  | 'stats';
export interface ContextProps
  extends Omit<PopoverProps, keyof StylesApiProps<PopoverFactory>>,
    StylesApiProps<ContextFactory> {
  usedTokens: number;
  maxTokens: number;
  usage?: LanguageModelUsage;
  modelId?: string;
  /** Optional current model catalog; otherwise Tokenlens's bundled catalog is used. */
  providers?: ContextProviders;
  /** Explicit USD estimates. An empty object suppresses automatic estimation. */
  costUSD?: ContextCosts;
  onCostError?: (error: unknown) => void;
  locale?: string;
  openDelay?: number;
  closeDelay?: number;
}
export type ContextFactory = Factory<{
  props: ContextProps;
  stylesNames: ContextStylesNames;
  vars: PopoverFactory['vars'];
  staticComponents: {
    Trigger: typeof ContextTrigger;
    Content: typeof ContextContent;
    ContentHeader: typeof ContextContentHeader;
    ContentBody: typeof ContextContentBody;
    ContentFooter: typeof ContextContentFooter;
    InputUsage: typeof ContextInputUsage;
    OutputUsage: typeof ContextOutputUsage;
    ReasoningUsage: typeof ContextReasoningUsage;
    CacheUsage: typeof ContextCacheUsage;
  };
}>;
interface ContextValue {
  usedTokens: number;
  maxTokens: number;
  usage?: LanguageModelUsage;
  percent: number | undefined;
  cost: ContextCosts;
  locale: string;
  open: () => void;
  disabled: boolean;
  getStyles: ReturnType<typeof useStyles<ContextFactory>>;
}
const ContextState = createContext<ContextValue | null>(null);
function useContextValue() {
  const context = useContext(ContextState);
  if (!context)
    throw new Error('Context components must be used within Context');
  return context;
}
export const Context = factory<ContextFactory>((_props) => {
  const props = useProps(
    'Context',
    { locale: 'en-US', width: 280, radius: 'md', shadow: 'md' },
    _props,
  );
  const {
    usedTokens,
    maxTokens,
    usage,
    modelId,
    providers,
    costUSD,
    onCostError,
    locale = 'en-US',
    opened,
    defaultOpened,
    onChange,
    children,
    classNames,
    styles,
    vars,
    unstyled,
    attributes,
    ...others
  } = props;
  const [value, setValue] = useUncontrolled({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange,
  });
  const [estimate, setEstimate] = useState<{
    modelId: string;
    usage: LanguageModelUsage;
    providers?: ContextProviders;
    cost: ContextCosts;
  }>();
  useEffect(() => {
    if (costUSD !== undefined || !modelId || !usage) return;
    let active = true;
    void estimateContextCosts(modelId, usage, providers).then(
      (cost) => {
        if (active) setEstimate({ modelId, usage, providers, cost });
      },
      (error: unknown) => {
        if (active) onCostError?.(error);
      },
    );
    return () => {
      active = false;
    };
  }, [costUSD, modelId, usage, providers, onCostError]);
  const cost =
    costUSD ??
    (estimate?.modelId === modelId &&
    estimate?.usage === usage &&
    estimate?.providers === providers
      ? estimate?.cost
      : undefined) ??
    {};
  const percent =
    validCount(usedTokens) &&
    validCount(maxTokens) &&
    maxTokens > 0 &&
    Number.isFinite((usedTokens / maxTokens) * 100)
      ? (usedTokens / maxTokens) * 100
      : undefined;
  const getStyles = useStyles<ContextFactory>({
    name: 'Context',
    props,
    classes,
    classNames,
    styles,
    vars,
    unstyled,
    attributes,
  });
  const resolved = Object.fromEntries(
    (['dropdown', 'arrow', 'overlay'] as const).map((key) => [
      key,
      getStyles(key),
    ]),
  );
  return (
    <ContextState.Provider
      value={{
        usedTokens,
        maxTokens,
        usage,
        percent,
        cost,
        locale,
        getStyles,
        disabled: !!others.disabled,
        open: () => {
          if (!others.disabled) setValue(true);
        },
      }}
    >
      <AttachmentHoverCard
        {...others}
        opened={value}
        onChange={setValue}
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
      </AttachmentHoverCard>
    </ContextState.Provider>
  );
});
function formatPercent(context: ContextValue) {
  return context.percent === undefined
    ? '—'
    : new Intl.NumberFormat(context.locale, {
        maximumFractionDigits: 1,
        style: 'percent',
      }).format(context.percent / 100);
}
function formatCount(value: number | undefined, context: ContextValue) {
  return validCount(value)
    ? new Intl.NumberFormat(context.locale, { notation: 'compact' }).format(
        value,
      )
    : '—';
}
function formatCost(value: number | undefined, context: ContextValue) {
  return validCount(value)
    ? new Intl.NumberFormat(context.locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 4,
      }).format(value)
    : '—';
}
export interface ContextTriggerProps
  extends ButtonProps,
    ElementProps<'button', keyof ButtonProps> {
  ringProps?: Omit<RingProgressProps, 'sections'>;
}
export type ContextTriggerFactory = Factory<{
  props: ContextTriggerProps;
  ref: HTMLButtonElement;
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
}>;
export const ContextTrigger = factory<ContextTriggerFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'ContextTrigger',
      { variant: 'subtle', color: 'gray', size: 'compact-sm' },
      _props,
    );
    const {
      children,
      ringProps,
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
    const context = useContextValue();
    const getStyles = useStyles<ButtonFactory>({
      name: 'ContextTrigger',
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
      <AttachmentHoverCardTrigger ref={ref}>
        <Button
          {...others}
          type="button"
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
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented && !disabled && !others.loading)
              context.open();
          }}
        >
          {children ?? (
            <>
              <span>{formatPercent(context)}</span>
              <RingProgress
                size={24}
                thickness={2}
                ml={6}
                aria-hidden="true"
                {...ringProps}
                sections={[
                  {
                    value: Math.min(100, context.percent ?? 0),
                    color: 'currentColor',
                  },
                ]}
              />
            </>
          )}
        </Button>
      </AttachmentHoverCardTrigger>
    );
  },
);
export interface ContextContentProps extends AttachmentHoverCardContentProps {}
export const ContextContent = factory<{
  props: ContextContentProps;
  ref: HTMLDivElement;
}>(({ ref, ...props }) => (
  <AttachmentHoverCardContent
    p={0}
    {...useProps('ContextContent', {}, props)}
    ref={ref}
  />
));
export interface ContextContentHeaderProps
  extends BoxProps,
    ElementProps<'div'> {
  progressProps?: Omit<ProgressRootProps, 'children'> &
    Pick<ProgressProps, 'color' | 'striped' | 'animated'>;
}
export const ContextContentHeader = factory<{
  props: ContextContentHeaderProps;
  ref: HTMLDivElement;
}>(({ ref, ..._props }) => {
  const { children, progressProps, className, style, ...props } = useProps(
    'ContextContentHeader',
    {},
    _props,
  );
  const context = useContextValue();
  const { color, striped, animated, ...progressRootProps } =
    progressProps ?? {};
  return (
    <Box
      {...props}
      {...context.getStyles('header', { className, style })}
      ref={ref}
    >
      {children ?? (
        <>
          <Box {...context.getStyles('stats')}>
            <span>{formatPercent(context)}</span>
            <Box component="span" {...context.getStyles('value')}>
              {formatCount(context.usedTokens, context)} /{' '}
              {formatCount(context.maxTokens, context)}
            </Box>
          </Box>
          <Progress.Root
            size="sm"
            {...progressRootProps}
            role="progressbar"
            aria-label={
              progressRootProps['aria-label'] ?? 'Model context usage'
            }
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              context.percent === undefined
                ? undefined
                : Math.min(100, context.percent)
            }
            aria-valuetext={
              context.percent === undefined
                ? 'Unknown capacity'
                : formatPercent(context)
            }
          >
            <Progress.Section
              value={Math.min(100, context.percent ?? 0)}
              withAria={false}
              color={color}
              striped={striped}
              animated={animated}
            />
          </Progress.Root>
        </>
      )}
    </Box>
  );
});
export interface ContextContentBodyProps
  extends BoxProps,
    ElementProps<'div'> {}
export const ContextContentBody = factory<{
  props: ContextContentBodyProps;
  ref: HTMLDivElement;
}>(({ ref, ..._props }) => {
  const { className, style, ...props } = useProps(
    'ContextContentBody',
    {},
    _props,
  );
  return (
    <Box
      {...props}
      {...useContextValue().getStyles('body', { className, style })}
      ref={ref}
    />
  );
});
export interface ContextContentFooterProps
  extends BoxProps,
    ElementProps<'div'> {}
export const ContextContentFooter = factory<{
  props: ContextContentFooterProps;
  ref: HTMLDivElement;
}>(({ ref, ..._props }) => {
  const { children, className, style, ...props } = useProps(
    'ContextContentFooter',
    {},
    _props,
  );
  const context = useContextValue();
  return (
    <Box
      {...props}
      {...context.getStyles('footer', { className, style })}
      ref={ref}
    >
      {children ?? (
        <>
          <Box component="span" {...context.getStyles('label')}>
            Estimated total
          </Box>
          <Box component="span" {...context.getStyles('value')}>
            {formatCost(context.cost.totalUSD, context)}
          </Box>
        </>
      )}
    </Box>
  );
});
export interface ContextInputUsageProps extends BoxProps, ElementProps<'div'> {}
export interface ContextOutputUsageProps extends ContextInputUsageProps {}
export interface ContextReasoningUsageProps extends ContextInputUsageProps {}
export interface ContextCacheUsageProps extends ContextInputUsageProps {}
function createUsage(kind: 'Input' | 'Output' | 'Reasoning' | 'Cache') {
  const name = `Context${kind}Usage`;
  const Component = factory<{
    props: ContextInputUsageProps;
    ref: HTMLDivElement;
  }>(({ ref, ..._props }) => {
    const { children, className, style, ...props } = useProps(name, {}, _props);
    const context = useContextValue();
    const { usage, cost } = context;
    const cacheRead = usage?.inputTokenDetails.cacheReadTokens;
    const cacheWrite = usage?.inputTokenDetails.cacheWriteTokens;
    const tokens =
      kind === 'Input'
        ? usage?.inputTokens
        : kind === 'Output'
          ? usage?.outputTokens
          : kind === 'Reasoning'
            ? usage?.outputTokenDetails.reasoningTokens
            : cacheRead === undefined && cacheWrite === undefined
              ? undefined
              : (cacheRead ?? 0) + (cacheWrite ?? 0);
    const costValue =
      kind === 'Input'
        ? cost.inputUSD
        : kind === 'Output'
          ? cost.outputUSD
          : kind === 'Reasoning'
            ? cost.reasoningUSD
            : validCount(cost.cacheReadUSD) && validCount(cost.cacheWriteUSD)
              ? cost.cacheReadUSD + cost.cacheWriteUSD
              : undefined;
    if (children === undefined && (!validCount(tokens) || tokens === 0))
      return null;
    return (
      <Box
        {...props}
        {...context.getStyles('usage', { className, style })}
        ref={ref}
      >
        {children !== undefined ? (
          children
        ) : (
          <>
            <Box component="span" {...context.getStyles('label')}>
              {kind}
            </Box>
            <Box component="span" {...context.getStyles('value')}>
              {formatCount(tokens, context)}
              {validCount(costValue) && (
                <> · {formatCost(costValue, context)}</>
              )}
            </Box>
          </>
        )}
      </Box>
    );
  });
  Component.displayName = name;
  return Component;
}
export const ContextInputUsage = createUsage('Input');
export const ContextOutputUsage = createUsage('Output');
export const ContextReasoningUsage = createUsage('Reasoning');
export const ContextCacheUsage = createUsage('Cache');
Context.displayName = 'Context';
ContextTrigger.displayName = 'ContextTrigger';
ContextContent.displayName = 'ContextContent';
ContextContentHeader.displayName = 'ContextContentHeader';
ContextContentBody.displayName = 'ContextContentBody';
ContextContentFooter.displayName = 'ContextContentFooter';
Context.classes = classes;
Context.Trigger = ContextTrigger;
Context.Content = ContextContent;
Context.ContentHeader = ContextContentHeader;
Context.ContentBody = ContextContentBody;
Context.ContentFooter = ContextContentFooter;
Context.InputUsage = ContextInputUsage;
Context.OutputUsage = ContextOutputUsage;
Context.ReasoningUsage = ContextReasoningUsage;
Context.CacheUsage = ContextCacheUsage;
