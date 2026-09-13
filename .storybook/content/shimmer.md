# Shimmer

Display an animated text highlight for an application-owned loading state.

```tsx
import { Shimmer } from 'mantine-ai-elements';

<Shimmer duration={2} spread={2}>Thinking about your question…</Shimmer>
```

`children` is a string. `duration` sets seconds per sweep (default `2`); `spread` multiplies the text length to determine the gradient width in pixels (default `2`). Changes to the text update the width automatically. Zero or negative duration stops the animation and displays ordinary text. Negative spread is clamped to zero.

With AI SDK, render Shimmer when your application's `status` is `submitted` or another relevant operation is pending. The component does not call `useChat`, announce status automatically, or manage request state. Add `role="status"` when a live announcement is appropriate.

## Mantine customization

```tsx
<Shimmer component="h2" fz="xl" fw={600} c="grape.7" highlightColor="pink.2">
  Preparing your answer…
</Shimmer>
```

The default element is `p`. Mantine's polymorphic `component` and `renderRoot` replace AI Elements' `as` prop. The ref targets the rendered element. Box spacing, typography, and other style props are supported.

The default base color is Mantine's dimmed text color; the highlight follows the body background in light and dark themes. Use `c` for the base color and `highlightColor` for the highlight. Theme with `Shimmer.extend`, or use the `root` Styles API selector. CSS variables are `--shimmer-duration`, `--shimmer-spread`, and `--shimmer-highlight`.

## Animation and accessibility

The effect retains AI Elements' repeating linear sweep and text-length-based spread. It uses CSS keyframes, so no Motion dependency is required. Reduced-motion preferences and forced-colors mode display readable static text. Text stays available to assistive technology throughout the animation. No additional AI SDK or animation state is required.
