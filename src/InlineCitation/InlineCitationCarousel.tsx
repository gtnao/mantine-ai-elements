'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  ActionIcon,
  type ActionIconCssVariables,
  type ActionIconFactory,
  type ActionIconProps,
  type ActionIconStylesNames,
  Box,
  type BoxProps,
  type ElementProps,
  type Factory,
  factory,
  type StylesApiProps,
  useDirection,
  useProps,
  useStyles,
} from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type {
  EmblaCarouselType,
  EmblaOptionsType,
  EmblaPluginType,
} from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { createContext, useContext, useEffect, useState } from 'react';
import classes from './InlineCitation.module.css';

export interface InlineCitationCarouselProps
  extends BoxProps,
    StylesApiProps<InlineCitationCarouselFactory>,
    ElementProps<'div'> {
  opts?: EmblaOptionsType;
  plugins?: EmblaPluginType[];
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: EmblaCarouselType) => void;
}
export type InlineCitationCarouselFactory = Factory<{
  props: InlineCitationCarouselProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'viewport' | 'container' | 'item' | 'header' | 'index';
  staticComponents: {
    Content: typeof InlineCitationCarouselContent;
    Item: typeof InlineCitationCarouselItem;
    Header: typeof InlineCitationCarouselHeader;
    Index: typeof InlineCitationCarouselIndex;
    Prev: typeof InlineCitationCarouselPrev;
    Next: typeof InlineCitationCarouselNext;
  };
}>;
interface CarouselContextValue {
  viewportRef: (node: HTMLDivElement | null) => void;
  api: EmblaCarouselType | undefined;
  current: number;
  count: number;
  canPrev: boolean;
  canNext: boolean;
  orientation: 'horizontal' | 'vertical';
  direction: 'ltr' | 'rtl';
  reducedMotion: boolean;
  getStyles: ReturnType<typeof useStyles<InlineCitationCarouselFactory>>;
}
const CarouselContext = createContext<CarouselContextValue | null>(null);
function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context)
    throw new Error(
      'InlineCitationCarousel children require InlineCitationCarousel',
    );
  return context;
}
export const InlineCitationCarousel = factory<InlineCitationCarouselFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'InlineCitationCarousel',
      { orientation: 'horizontal' },
      _props,
    );
    const {
      opts,
      plugins,
      orientation = 'horizontal',
      setApi,
      children,
      onKeyDown,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const { dir } = useDirection();
    const direction =
      opts?.direction ??
      (others.dir === 'rtl' || others.dir === 'ltr' ? others.dir : dir);
    const reducedMotion = useReducedMotion();
    const [viewportRef, api] = useEmblaCarousel(
      { ...opts, direction, axis: orientation === 'vertical' ? 'y' : 'x' },
      plugins,
    );
    const [state, setState] = useState({
      current: 0,
      count: 0,
      canPrev: false,
      canNext: false,
    });
    useEffect(() => {
      if (!api) return;
      const sync = () => {
        const count = api.slideNodes().length ? api.scrollSnapList().length : 0;
        setState({
          count,
          current: count ? api.selectedScrollSnap() + 1 : 0,
          canPrev: api.canScrollPrev(),
          canNext: api.canScrollNext(),
        });
      };
      sync();
      api.on('select', sync).on('reInit', sync);
      return () => {
        api.off('select', sync).off('reInit', sync);
      };
    }, [api]);
    useEffect(() => {
      if (api) setApi?.(api);
    }, [api, setApi]);
    const getStyles = useStyles<InlineCitationCarouselFactory>({
      name: 'InlineCitationCarousel',
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
      <CarouselContext.Provider
        value={{
          viewportRef,
          api,
          ...state,
          orientation,
          direction,
          reducedMotion: !!reducedMotion,
          getStyles,
        }}
      >
        <Box
          role="region"
          aria-roledescription="carousel"
          aria-label="Citation sources"
          {...others}
          {...getStyles('root')}
          ref={ref}
          dir={direction}
          data-orientation={orientation}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (
              event.defaultPrevented ||
              event.altKey ||
              event.ctrlKey ||
              event.metaKey ||
              event.shiftKey ||
              event.nativeEvent.isComposing
            )
              return;
            if (
              event.target instanceof Element &&
              event.target.closest(
                'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="combobox"], [role="slider"]',
              )
            )
              return;
            const previousKey =
              orientation === 'vertical'
                ? 'ArrowUp'
                : direction === 'rtl'
                  ? 'ArrowRight'
                  : 'ArrowLeft';
            const nextKey =
              orientation === 'vertical'
                ? 'ArrowDown'
                : direction === 'rtl'
                  ? 'ArrowLeft'
                  : 'ArrowRight';
            if (event.key === previousKey || event.key === nextKey) {
              event.preventDefault();
              if (event.key === previousKey) api?.scrollPrev(!!reducedMotion);
              else api?.scrollNext(!!reducedMotion);
            }
          }}
        >
          {children}
        </Box>
      </CarouselContext.Provider>
    );
  },
);
export interface InlineCitationCarouselContentProps
  extends BoxProps,
    ElementProps<'div'> {
  /** Props for the clipping viewport. The forwarded ref belongs to the slide container. */
  viewportProps?: BoxProps & ElementProps<'div'>;
}
export const InlineCitationCarouselContent = factory<{
  props: InlineCitationCarouselContentProps;
  ref: HTMLDivElement;
}>(({ ref, ..._props }) => {
  const {
    viewportProps = {},
    className,
    style,
    ...others
  } = useProps('InlineCitationCarouselContent', {}, _props);
  const context = useCarousel();
  const {
    className: viewportClassName,
    style: viewportStyle,
    ...viewportOthers
  } = viewportProps;
  return (
    <Box
      {...viewportOthers}
      {...context.getStyles('viewport', {
        className: viewportClassName,
        style: viewportStyle,
      })}
      ref={context.viewportRef}
      data-orientation={context.orientation}
    >
      <Box
        {...others}
        {...context.getStyles('container', { className, style })}
        ref={ref}
        data-orientation={context.orientation}
      />
    </Box>
  );
});
export interface InlineCitationCarouselItemProps
  extends BoxProps,
    ElementProps<'div'> {}
export const InlineCitationCarouselItem = factory<{
  props: InlineCitationCarouselItemProps;
  ref: HTMLDivElement;
}>(({ ref, ..._props }) => {
  const { className, style, ...others } = useProps(
    'InlineCitationCarouselItem',
    {},
    _props,
  );
  const context = useCarousel();
  return (
    <Box
      role="group"
      aria-roledescription="slide"
      {...others}
      {...context.getStyles('item', { className, style })}
      ref={ref}
    />
  );
});
export interface InlineCitationCarouselHeaderProps
  extends BoxProps,
    ElementProps<'div'> {}
export const InlineCitationCarouselHeader = factory<{
  props: InlineCitationCarouselHeaderProps;
  ref: HTMLDivElement;
}>(({ ref, ..._props }) => {
  const { className, style, ...others } = useProps(
    'InlineCitationCarouselHeader',
    {},
    _props,
  );
  return (
    <Box
      {...others}
      {...useCarousel().getStyles('header', { className, style })}
      ref={ref}
    />
  );
});
export interface InlineCitationCarouselIndexProps
  extends BoxProps,
    ElementProps<'div'> {}
export const InlineCitationCarouselIndex = factory<{
  props: InlineCitationCarouselIndexProps;
  ref: HTMLDivElement;
}>(({ ref, ..._props }) => {
  const { className, style, children, ...others } = useProps(
    'InlineCitationCarouselIndex',
    {},
    _props,
  );
  const context = useCarousel();
  return (
    <Box
      aria-live="polite"
      aria-atomic="true"
      {...others}
      {...context.getStyles('index', { className, style })}
      ref={ref}
    >
      {children ?? `${context.current}/${context.count}`}
    </Box>
  );
});
export interface InlineCitationCarouselPrevProps
  extends ActionIconProps,
    ElementProps<'button', keyof ActionIconProps> {}
export interface InlineCitationCarouselNextProps
  extends InlineCitationCarouselPrevProps {}
function createControl(previous: boolean) {
  const name = previous
    ? 'InlineCitationCarouselPrev'
    : 'InlineCitationCarouselNext';
  const Control = factory<{
    props: InlineCitationCarouselPrevProps;
    ref: HTMLButtonElement;
    stylesNames: ActionIconStylesNames;
    vars: ActionIconCssVariables;
  }>(({ ref, ..._props }) => {
    const props = useProps(
      name,
      { variant: 'subtle', color: 'gray', size: 'sm' },
      _props,
    );
    const {
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
    const getStyles = useStyles<ActionIconFactory>({
      name,
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
      (Object.keys(ActionIcon.classes) as ActionIconStylesNames[]).map(
        (key) => [key, getStyles(key)],
      ),
    );
    const context = useCarousel();
    const boundaryDisabled = !(previous ? context.canPrev : context.canNext);
    const reverse = previous !== (context.direction === 'rtl');
    return (
      <ActionIcon
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
        ref={ref}
        type="button"
        aria-label={others['aria-label'] ?? (previous ? 'Previous' : 'Next')}
        disabled={disabled}
        data-disabled={boundaryDisabled || undefined}
        aria-disabled={disabled || boundaryDisabled || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            disabled ||
            boundaryDisabled ||
            others.loading
          )
            return;
          if (previous) context.api?.scrollPrev(context.reducedMotion);
          else context.api?.scrollNext(context.reducedMotion);
        }}
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
            style={{
              transform:
                context.orientation === 'vertical'
                  ? `rotate(${previous ? 90 : -90}deg)`
                  : reverse
                    ? undefined
                    : 'rotate(180deg)',
            }}
          >
            <path d="m12 5-7 7 7 7M5 12h14" />
          </svg>
        )}
      </ActionIcon>
    );
  });
  Control.displayName = name;
  return Control;
}
export const InlineCitationCarouselPrev = createControl(true);
export const InlineCitationCarouselNext = createControl(false);
InlineCitationCarousel.displayName = 'InlineCitationCarousel';
InlineCitationCarouselContent.displayName = 'InlineCitationCarouselContent';
InlineCitationCarouselItem.displayName = 'InlineCitationCarouselItem';
InlineCitationCarouselHeader.displayName = 'InlineCitationCarouselHeader';
InlineCitationCarouselIndex.displayName = 'InlineCitationCarouselIndex';
InlineCitationCarousel.classes = classes;
InlineCitationCarousel.Content = InlineCitationCarouselContent;
InlineCitationCarousel.Item = InlineCitationCarouselItem;
InlineCitationCarousel.Header = InlineCitationCarouselHeader;
InlineCitationCarousel.Index = InlineCitationCarouselIndex;
InlineCitationCarousel.Prev = InlineCitationCarouselPrev;
InlineCitationCarousel.Next = InlineCitationCarouselNext;
