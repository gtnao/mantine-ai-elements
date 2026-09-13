'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  type BoxProps,
  createVarsResolver,
  getThemeColor,
  type MantineColor,
  type PolymorphicFactory,
  polymorphicFactory,
  type StylesApiProps,
  useProps,
  useStyles,
} from '@mantine/core';
import classes from './Shimmer.module.css';

export interface ShimmerProps extends BoxProps, StylesApiProps<ShimmerFactory> {
  children: string;
  /** Duration of one sweep in seconds. Nonpositive values disable animation. */
  duration?: number;
  /** Gradient width multiplier applied to the text length. */
  spread?: number;
  /** Highlight color; defaults to the Mantine body background. */
  highlightColor?: MantineColor;
}
export type TextShimmerProps = ShimmerProps;
export type ShimmerFactory = PolymorphicFactory<{
  props: ShimmerProps;
  defaultComponent: 'p';
  defaultRef: HTMLParagraphElement;
  stylesNames: 'root';
  vars: {
    root: '--shimmer-duration' | '--shimmer-spread' | '--shimmer-highlight';
  };
}>;
const varsResolver = createVarsResolver<ShimmerFactory>(
  (theme, { children, duration = 2, spread = 2, highlightColor }) => ({
    root: {
      '--shimmer-duration': `${Number.isFinite(duration) && duration > 0 ? duration : 0}s`,
      '--shimmer-spread': `${children.length * (Number.isFinite(spread) ? Math.max(0, spread) : 2)}px`,
      '--shimmer-highlight': highlightColor
        ? getThemeColor(highlightColor, theme)
        : undefined,
    },
  }),
);
export const Shimmer = polymorphicFactory<ShimmerFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('Shimmer', { duration: 2, spread: 2 }, _props);
    const {
      children,
      duration,
      spread: _spread,
      highlightColor: _highlightColor,
      className,
      style,
      classNames,
      styles,
      unstyled,
      vars,
      attributes,
      ...others
    } = props;
    const getStyles = useStyles<ShimmerFactory>({
      name: 'Shimmer',
      props,
      classes,
      className,
      style,
      classNames,
      styles,
      unstyled,
      vars,
      attributes,
      varsResolver,
    });
    return (
      <Box
        component="p"
        {...others}
        {...getStyles('root')}
        ref={ref}
        data-static={!Number.isFinite(duration) || duration <= 0 || undefined}
      >
        {children}
      </Box>
    );
  },
);
Shimmer.displayName = 'Shimmer';
Shimmer.classes = classes;
Shimmer.varsResolver = varsResolver;
