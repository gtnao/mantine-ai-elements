# Image

Render AI SDK-generated image data or an existing URL with Mantine's image styling and fallback behavior.

```tsx
import { Image } from 'mantine-ai-elements';

<Image base64={image.base64} mediaType={image.mediaType} alt="Generated landscape" />
<Image src="/landscape.png" alt="Landscape preview" />
```

Pass either `base64` and `mediaType` together, or a string `src`. The data form matches AI Elements and accepts AI SDK `GeneratedFile` fields. `uint8Array` and `providerMetadata` may be supplied for compatibility; they are not rendered into HTML. Rendering uses the base64 representation.

`AIImage` is an alias of `Image`, useful when your application also imports Mantine Image.

## AI SDK generation

Use `generateImage` on your server with your chosen provider. Send plain image data to the client:

```tsx
// After calling generateImage on the server:
const payload = { base64: result.image.base64, mediaType: result.image.mediaType };
```

AI SDK's `DefaultGeneratedFile` exposes binary representations through getters. Read these fields explicitly instead of spreading the class instance or serializing it directly. A plain payload object can be spread into Image. The current SDK type is `GeneratedFile`; `Experimental_GeneratedImage` is its deprecated alias.

Image does not call a provider or manage generation state. Use your application's pending and error state to display a loader or alert. Storybook uses an actual `DefaultGeneratedFile` containing a local SVG fixture; it requires no API key.

## Mantine customization

Defaults are `radius="md"`, `w="auto"`, `maw="100%"`, and `h="auto"`, preserving the source image's responsive proportions. Use `w`, `h`, `fit`, `radius`, and other Mantine style props to customize it.

```tsx
const theme = createTheme({
  components: {
    AIImage: Image.extend({
      defaultProps: { radius: 'xl' },
      styles: { root: { border: '1px solid var(--mantine-color-default-border)' } },
    }),
  },
});
```

The extension theme key is **AIImage**, keeping its defaults separate from Mantine's **Image** key. Both native Mantine Image styling and the extension's `root` Styles API are respected. You can also pass `styles`, `classNames`, or CSS variables `--image-radius` and `--image-object-fit` through `vars`.

The component is polymorphic: `component` and `renderRoot` support custom image implementations using Mantine conventions. The default ref targets the native image element. Native image attributes such as `loading`, `width`, `height`, `srcSet`, and event callbacks are forwarded.

## Loading failures and accessibility

Use `fallbackSrc` for an alternative image and `onError` to report failures. Fallback state follows the requested source and resets when that source changes, including retries of an earlier URL. It does not replace your application's generation error UI.

Provide descriptive `alt` text for meaningful images. The default is an empty alternative for decorative images. Specifying image dimensions helps reserve layout space while loading; CSS size props control the displayed dimensions.
