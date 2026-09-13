# Mantine customization

Use your existing `MantineProvider`, theme colors, and component defaults. Light and dark color schemes follow Mantine automatically.

## Styles API

`PromptInput` exposes `root`, `body`, `footer`, and `tools` selectors through `classNames` and `styles`.

```tsx
<PromptInput
  onSubmit={handleSubmit}
  classNames={{ root: classes.root, footer: classes.footer }}
  styles={{ tools: { gap: 12 } }}
>
  {/* Compose input and actions here. */}
</PromptInput>
```

Textarea and Submit forward their underlying Mantine components' Styles API. Section styling belongs to the root's Styles API.

## Theme defaults

```tsx
import { createTheme, MantineProvider } from '@mantine/core';
import { PromptInput } from 'mantine-ai-elements';

const theme = createTheme({
  primaryColor: 'grape',
  components: {
    PromptInput: PromptInput.extend({
      styles: { root: { borderRadius: 24 }, footer: { padding: 8 } },
    }),
    PromptInputSubmit: PromptInput.Submit.extend({
      defaultProps: { variant: 'light', radius: 'xl' },
    }),
  },
});

<MantineProvider theme={theme}>{/* Your application */}</MantineProvider>
```

The theme keys are `PromptInput`, `PromptInputTextarea`, and `PromptInputSubmit`.

## CSS layers

For predictable application overrides, import the layered variants:

```tsx
import '@mantine/core/styles.layer.css';
import 'mantine-ai-elements/styles.layer.css';
import './app.css';
```

Declare the layer order in `app.css`:

```css
@layer mantine, mantine-ai-elements;
```

Use either ordinary CSS or layer CSS for each package, not both. Unlayered application styles take precedence over layered styles.
