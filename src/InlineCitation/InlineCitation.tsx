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
  type PopoverStylesNames,
  type StylesApiProps,
  Text,
  useProps,
  useStyles,
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { createContext, useContext } from 'react';
import {
  AttachmentHoverCard,
  AttachmentHoverCardContent,
  type AttachmentHoverCardContentProps,
  type AttachmentHoverCardProps,
  AttachmentHoverCardTrigger,
} from '../Attachments/AttachmentHoverCard';
import classes from './InlineCitation.module.css';

export interface InlineCitationProps
  extends BoxProps,
    StylesApiProps<InlineCitationFactory>,
    ElementProps<'span'> {}
export type InlineCitationFactory = Factory<{
  props: InlineCitationProps;
  ref: HTMLSpanElement;
  stylesNames: 'root';
  staticComponents: {
    Text: typeof InlineCitationText;
    Card: typeof InlineCitationCard;
    CardTrigger: typeof InlineCitationCardTrigger;
    CardBody: typeof InlineCitationCardBody;
    Source: typeof InlineCitationSource;
    Quote: typeof InlineCitationQuote;
  };
}>;
export const InlineCitation = factory<InlineCitationFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('InlineCitation', {}, _props);
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
    const getStyles = useStyles<InlineCitationFactory>({
      name: 'InlineCitation',
      props,
      classes: { root: classes.citation },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Box component="span" {...others} {...getStyles('root')} ref={ref} />
    );
  },
);
export interface InlineCitationTextProps
  extends BoxProps,
    StylesApiProps<InlineCitationTextFactory>,
    ElementProps<'span'> {}
export type InlineCitationTextFactory = Factory<{
  props: InlineCitationTextProps;
  ref: HTMLSpanElement;
  stylesNames: 'root';
}>;
export const InlineCitationText = factory<InlineCitationTextFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('InlineCitationText', {}, _props);
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
    const getStyles = useStyles<InlineCitationTextFactory>({
      name: 'InlineCitationText',
      props,
      classes: { root: classes.citationText },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Box component="span" {...others} {...getStyles('root')} ref={ref} />
    );
  },
);
export interface InlineCitationCardProps extends AttachmentHoverCardProps {}
export type InlineCitationCardFactory = Factory<{
  props: InlineCitationCardProps;
  stylesNames: PopoverStylesNames;
  vars: PopoverFactory['vars'];
  staticComponents: {
    Trigger: typeof InlineCitationCardTrigger;
    Body: typeof InlineCitationCardBody;
  };
}>;
const CardContext = createContext<{
  open: () => void;
  disabled: boolean;
} | null>(null);
export const InlineCitationCard = factory<InlineCitationCardFactory>(
  (_props) => {
    const props = useProps(
      'InlineCitationCard',
      { width: 320, radius: 'md', shadow: 'md' },
      _props,
    );
    const {
      opened,
      defaultOpened,
      onChange,
      children,
      classNames,
      styles,
      vars,
      unstyled,
      ...others
    } = props;
    const [value, setValue] = useUncontrolled({
      value: opened,
      defaultValue: defaultOpened,
      finalValue: false,
      onChange,
    });
    const getStyles = useStyles<PopoverFactory>({
      name: 'InlineCitationCard',
      props,
      classes: { dropdown: classes.card },
      classNames,
      styles,
      vars,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (['dropdown', 'arrow', 'overlay'] as const).map((key) => [
        key,
        getStyles(key),
      ]),
    );
    return (
      <CardContext.Provider
        value={{
          open: () => {
            if (!others.disabled) setValue(true);
          },
          disabled: !!others.disabled,
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
        >
          {children}
        </AttachmentHoverCard>
      </CardContext.Provider>
    );
  },
);
export interface InlineCitationCardTriggerProps
  extends ButtonProps,
    ElementProps<'button', keyof ButtonProps> {
  sources: readonly string[];
}
export type InlineCitationCardTriggerFactory = Factory<{
  props: InlineCitationCardTriggerProps;
  ref: HTMLButtonElement;
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
}>;
export const InlineCitationCardTrigger =
  factory<InlineCitationCardTriggerFactory>(({ ref, ..._props }) => {
    const props = useProps(
      'InlineCitationCardTrigger',
      { variant: 'light', color: 'gray', size: 'compact-xs', radius: 'xl' },
      _props,
    );
    const {
      sources,
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
    const context = useContext(CardContext);
    if (!context)
      throw new Error('InlineCitationCardTrigger requires InlineCitationCard');
    const getStyles = useStyles<ButtonFactory>({
      name: 'InlineCitationCardTrigger',
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
      (Object.keys(Button.classes) as ButtonStylesNames[]).map((key) => [
        key,
        getStyles(key),
      ]),
    );
    let label = sources[0] || 'unknown';
    try {
      label = new URL(label).hostname || label;
    } catch {
      /* Relative and malformed references remain readable. */
    }
    if (sources.length > 1) label += ` +${sources.length - 1}`;
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
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented && !disabled && !others.loading)
              context.open();
          }}
        >
          {children ?? label}
        </Button>
      </AttachmentHoverCardTrigger>
    );
  });
export interface InlineCitationCardBodyProps
  extends AttachmentHoverCardContentProps {}
export const InlineCitationCardBody = factory<{
  props: InlineCitationCardBodyProps;
  ref: HTMLDivElement;
}>(({ ref, ...props }) => (
  <AttachmentHoverCardContent
    p={0}
    {...useProps('InlineCitationCardBody', {}, props)}
    ref={ref}
  />
));
export interface InlineCitationSourceProps
  extends BoxProps,
    StylesApiProps<InlineCitationSourceFactory>,
    ElementProps<'div', 'title'> {
  title?: string;
  url?: string;
  description?: string;
}
export type InlineCitationSourceFactory = Factory<{
  props: InlineCitationSourceProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'title' | 'url' | 'description';
}>;
export const InlineCitationSource = factory<InlineCitationSourceFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('InlineCitationSource', {}, _props);
    const {
      title,
      url,
      description,
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
    const getStyles = useStyles<InlineCitationSourceFactory>({
      name: 'InlineCitationSource',
      props,
      classes: { root: classes.source },
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
        {title && (
          <Text
            component="h4"
            size="sm"
            fw={500}
            truncate
            {...getStyles('title')}
          >
            {title}
          </Text>
        )}
        {url && (
          <Text size="xs" c="dimmed" truncate {...getStyles('url')}>
            {url}
          </Text>
        )}
        {description && (
          <Text size="sm" lineClamp={3} {...getStyles('description')}>
            {description}
          </Text>
        )}
        {children}
      </Box>
    );
  },
);
export interface InlineCitationQuoteProps
  extends BoxProps,
    StylesApiProps<InlineCitationQuoteFactory>,
    ElementProps<'blockquote'> {}
export type InlineCitationQuoteFactory = Factory<{
  props: InlineCitationQuoteProps;
  ref: HTMLQuoteElement;
  stylesNames: 'root';
}>;
export const InlineCitationQuote = factory<InlineCitationQuoteFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('InlineCitationQuote', {}, _props);
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
    const getStyles = useStyles<InlineCitationQuoteFactory>({
      name: 'InlineCitationQuote',
      props,
      classes: { root: classes.quote },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Box
        component="blockquote"
        {...others}
        {...getStyles('root')}
        ref={ref}
      />
    );
  },
);
InlineCitation.displayName = 'InlineCitation';
InlineCitationText.displayName = 'InlineCitationText';
InlineCitationCard.displayName = 'InlineCitationCard';
InlineCitationCardTrigger.displayName = 'InlineCitationCardTrigger';
InlineCitationCardBody.displayName = 'InlineCitationCardBody';
InlineCitationSource.displayName = 'InlineCitationSource';
InlineCitationQuote.displayName = 'InlineCitationQuote';
InlineCitation.classes = { root: classes.citation };
InlineCitationText.classes = { root: classes.citationText };
InlineCitationCard.classes = { dropdown: classes.card, arrow: '', overlay: '' };
InlineCitationSource.classes = {
  root: classes.source,
  title: '',
  url: '',
  description: '',
};
InlineCitationQuote.classes = { root: classes.quote };
InlineCitation.Text = InlineCitationText;
InlineCitation.Card = InlineCitationCard;
InlineCitation.CardTrigger = InlineCitationCardTrigger;
InlineCitation.CardBody = InlineCitationCardBody;
InlineCitation.Source = InlineCitationSource;
InlineCitation.Quote = InlineCitationQuote;
InlineCitationCard.Trigger = InlineCitationCardTrigger;
InlineCitationCard.Body = InlineCitationCardBody;
