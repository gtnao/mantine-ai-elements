'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  ActionIcon,
  type ActionIconCssVariables,
  type ActionIconProps,
  type ActionIconStylesNames,
  Box,
  Collapse,
  type CollapseProps,
  type ElementProps,
  type Factory,
  Flex,
  type FlexProps,
  factory,
  Paper,
  type PaperCssVariables,
  type PaperProps,
  type StylesApiProps,
  Text,
  type TextCssVariables,
  type TextProps,
  Title,
  type TitleCssVariables,
  type TitleProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useId, useUncontrolled } from '@mantine/hooks';
import { createContext, useContext } from 'react';
import { Shimmer, type ShimmerProps } from '../Shimmer/Shimmer';
import classes from './Plan.module.css';
export interface PlanProps
  extends PaperProps,
    ElementProps<'div', keyof PaperProps | 'onChange'> {
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (opened: boolean) => void;
  isStreaming?: boolean;
  disabled?: boolean;
}
export type PlanFactory = Factory<{
  props: PlanProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
  vars: PaperCssVariables;
  staticComponents: {
    Header: typeof PlanHeader;
    Title: typeof PlanTitle;
    Description: typeof PlanDescription;
    Action: typeof PlanAction;
    Content: typeof PlanContent;
    Footer: typeof PlanFooter;
    Trigger: typeof PlanTrigger;
  };
}>;
const Context = createContext<{
  opened: boolean;
  setOpened: (opened: boolean) => void;
  isStreaming: boolean;
  disabled: boolean;
} | null>(null);
function usePlan() {
  const context = useContext(Context);
  if (!context) throw new Error('Plan components must be used within Plan');
  return context;
}
export const Plan = factory<PlanFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'Plan',
    { withBorder: true, radius: 'lg', isStreaming: false, disabled: false },
    _props,
  );
  const {
    opened: controlled,
    defaultOpened,
    onChange,
    isStreaming,
    disabled,
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
  const [opened, setOpened] = useUncontrolled({
    value: controlled,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange,
  });
  const getStyles = useStyles<PlanFactory>({
    name: 'Plan',
    props,
    classes,
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  return (
    <Context.Provider value={{ opened, setOpened, isStreaming, disabled }}>
      <Paper
        {...others}
        {...getStyles('root')}
        ref={ref}
        unstyled={unstyled}
        data-state={opened ? 'open' : 'closed'}
        data-streaming={isStreaming || undefined}
      >
        {children}
      </Paper>
    </Context.Provider>
  );
});

export interface PlanHeaderProps extends FlexProps {}
export type PlanHeaderFactory = Factory<{
  props: PlanHeaderProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const PlanHeader = factory<PlanHeaderFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'PlanHeader',
    { align: 'flex-start', justify: 'space-between', gap: 'md' },
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
  const getStyles = useStyles<PlanHeaderFactory>({
    name: 'PlanHeader',
    props,
    classes: { root: classes.header },
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  return (
    <Flex {...others} {...getStyles('root')} ref={ref} unstyled={unstyled} />
  );
});
PlanHeader.displayName = 'PlanHeader';
PlanHeader.classes = { root: classes.header };

export interface PlanFooterProps extends FlexProps {}
export type PlanFooterFactory = Factory<{
  props: PlanFooterProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const PlanFooter = factory<PlanFooterFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'PlanFooter',
    { align: 'center', gap: 'xs', wrap: 'wrap' },
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
  const getStyles = useStyles<PlanFooterFactory>({
    name: 'PlanFooter',
    props,
    classes: { root: classes.footer },
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  return (
    <Flex {...others} {...getStyles('root')} ref={ref} unstyled={unstyled} />
  );
});
PlanFooter.displayName = 'PlanFooter';
PlanFooter.classes = { root: classes.footer };

export interface PlanActionProps extends FlexProps {}
export type PlanActionFactory = Factory<{
  props: PlanActionProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const PlanAction = factory<PlanActionFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'PlanAction',
    { align: 'center', gap: 'xs', wrap: 'wrap' },
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
  const getStyles = useStyles<PlanActionFactory>({
    name: 'PlanAction',
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
  return (
    <Flex {...others} {...getStyles('root')} ref={ref} unstyled={unstyled} />
  );
});
PlanAction.displayName = 'PlanAction';
PlanAction.classes = { root: classes.action };

export interface PlanTitleProps extends Omit<TitleProps, 'children'> {
  children: string;
  shimmerProps?: Omit<ShimmerProps, 'children'>;
}
export type PlanTitleFactory = Factory<{
  props: PlanTitleProps;
  ref: HTMLHeadingElement;
  stylesNames: 'root';
  vars: TitleCssVariables;
}>;
export const PlanTitle = factory<PlanTitleFactory>(({ ref, ..._props }) => {
  const props = useProps('PlanTitle', { order: 3 }, _props);
  const {
    children,
    shimmerProps,
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
    ...others
  } = props;
  const { isStreaming } = usePlan();
  const getStyles = useStyles<PlanTitleFactory>({
    name: 'PlanTitle',
    props,
    classes: { root: classes.title },
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  return (
    <Title {...others} {...getStyles('root')} ref={ref} unstyled={unstyled}>
      {isStreaming ? (
        <Shimmer {...shimmerProps} component="span">
          {children}
        </Shimmer>
      ) : (
        children
      )}
    </Title>
  );
});
PlanTitle.displayName = 'PlanTitle';
PlanTitle.classes = { root: classes.title };

export interface PlanDescriptionProps
  extends Omit<TextProps, 'children'>,
    ElementProps<'p', keyof TextProps | 'children'> {
  children: string;
  shimmerProps?: Omit<ShimmerProps, 'children'>;
}
export type PlanDescriptionFactory = Factory<{
  props: PlanDescriptionProps;
  ref: HTMLParagraphElement;
  stylesNames: 'root';
  vars: TextCssVariables;
}>;
export const PlanDescription = factory<PlanDescriptionFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'PlanDescription',
      { size: 'sm', c: 'dimmed', textWrap: 'balance' },
      _props,
    );
    const {
      children,
      shimmerProps,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const { isStreaming } = usePlan();
    const getStyles = useStyles<PlanDescriptionFactory>({
      name: 'PlanDescription',
      props,
      classes: { root: classes.description },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Text {...others} {...getStyles('root')} ref={ref} unstyled={unstyled}>
        {isStreaming ? (
          <Shimmer {...shimmerProps} component="span">
            {children}
          </Shimmer>
        ) : (
          children
        )}
      </Text>
    );
  },
);
PlanDescription.displayName = 'PlanDescription';
PlanDescription.classes = { root: classes.description };

export interface PlanContentProps
  extends Omit<CollapseProps, 'expanded'>,
    StylesApiProps<PlanContentFactory> {}
export type PlanContentFactory = Factory<{
  props: PlanContentProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'body';
}>;
export const PlanContent = factory<PlanContentFactory>(({ ref, ..._props }) => {
  const props = useProps('PlanContent', {}, _props);
  const {
    id: idProp,
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
  const id = useId(idProp);
  const { opened } = usePlan();
  const getStyles = useStyles<PlanContentFactory>({
    name: 'PlanContent',
    props,
    classes: { root: classes.content, body: classes.body },
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  return (
    <Collapse
      role="region"
      aria-label="Plan details"
      {...others}
      {...getStyles('root')}
      ref={ref}
      id={id}
      expanded={opened}
    >
      <Box {...getStyles('body')}>{children}</Box>
    </Collapse>
  );
});
PlanContent.displayName = 'PlanContent';
PlanContent.classes = { root: classes.content, body: classes.body };

export interface PlanTriggerProps
  extends ActionIconProps,
    ElementProps<'button', 'color'> {}
export type PlanTriggerFactory = Factory<{
  props: PlanTriggerProps;
  ref: HTMLButtonElement;
  stylesNames: ActionIconStylesNames;
  vars: ActionIconCssVariables;
}>;
export const PlanTrigger = factory<PlanTriggerFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'PlanTrigger',
    { size: 32, variant: 'subtle', color: 'gray' },
    _props,
  );
  const {
    children,
    disabled,
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
  const context = usePlan();
  const getStyles = useStyles<PlanTriggerFactory>({
    name: 'PlanTrigger',
    props,
    classes: { root: classes.trigger },
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  const resolved = Object.fromEntries(
    (Object.keys(ActionIcon.classes) as ActionIconStylesNames[]).map((key) => [
      key,
      getStyles(key),
    ]),
  );
  return (
    <ActionIcon
      aria-label="Toggle plan"
      {...others}
      ref={ref}
      type="button"
      disabled={disabled || context.disabled}
      aria-expanded={context.opened}
      unstyled={unstyled}
      onClick={(event) => {
        if (disabled || context.disabled || others['data-disabled']) return;
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpened(!context.opened);
      }}
      classNames={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.className]),
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
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m7 9 5-5 5 5M7 15l5 5 5-5" />
        </svg>
      )}
    </ActionIcon>
  );
});
PlanTrigger.displayName = 'PlanTrigger';
PlanTrigger.classes = ActionIcon.classes;
Plan.displayName = 'Plan';
Plan.classes = { root: classes.root };
Plan.Header = PlanHeader;
Plan.Title = PlanTitle;
Plan.Description = PlanDescription;
Plan.Action = PlanAction;
Plan.Content = PlanContent;
Plan.Footer = PlanFooter;
Plan.Trigger = PlanTrigger;
