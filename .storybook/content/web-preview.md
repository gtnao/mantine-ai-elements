# WebPreview

Compose a preview toolbar, URL input, iframe, and collapsible console using Mantine. The application owns generated content, navigation history, reload behavior, and log collection.

```tsx
import { WebPreview } from 'mantine-ai-elements';

<WebPreview url={previewUrl} onUrlChange={setPreviewUrl} h={480}>
  <WebPreview.Navigation>
    <WebPreview.Url />
    <WebPreview.NavigationButton tooltip="Reload preview" onClick={reload}>
      <ReloadIcon size={16} />
    </WebPreview.NavigationButton>
  </WebPreview.Navigation>
  <WebPreview.Body key={revision} title="Generated application" />
  <WebPreview.Console logs={logs} />
</WebPreview>
```

`previewUrl`, `setPreviewUrl`, `reload`, `revision`, `logs`, and the icon above belong to your application. Incrementing `revision` remounts the iframe to reload its current source. Set a height on the root or its containing layout.

## Root and navigation

`WebPreview` accepts Paper props and exposes `root` styles. Use `defaultUrl` for an initial URL, or controlled `url` with `onUrlChange`. Console state defaults to closed and can be controlled with `consoleOpened` / `onConsoleOpenedChange`, or initialized with `defaultConsoleOpened`.

`WebPreviewNavigation` (`.Navigation`) accepts Flex props and wraps its controls on narrow screens. `WebPreviewNavigationButton` (`.NavigationButton`) accepts polymorphic ActionIcon props, a React element `icon`, `label`, optional `tooltip`, and `tooltipProps`. Its default size is 32px with a subtle gray variant. Tooltips respond to keyboard focus and hover; provide an accessible name through `aria-label`, `label`, or `tooltip`. Native link composition is available with `component="a"` and `href`.

`WebPreviewUrl` (`.Url`) accepts native TextInput props, including labels, descriptions, errors, refs, and Styles API selectors. It edits a draft and commits to the root URL on Enter. Native `onChange` observes draft edits without disabling internal updates. A controlled input `value` remains application-owned. `onKeyDown` can cancel navigation with `preventDefault()`. IME composition, disabled inputs, and read-only inputs do not commit. Enter navigation prevents surrounding form submission. An external root URL change updates the draft.

The URL field does not implement browser history or validate allowed destinations. Validate `onUrlChange` in a controlled application before accepting user-supplied URLs. The example limits navigation to its two local pages; a real application can accept its own generated preview URLs.

## Iframe and execution boundary

`WebPreviewBody` (`.Body`) forwards native iframe attributes and its ref to the iframe. Explicit `src` overrides the root URL. `srcDoc` supplies inline HTML and follows native precedence over `src`. Use `title` to describe the frame for assistive technology. `wrapperProps` customizes the containing Box. Styles selectors are `root` (wrapper), `frame`, and `loading`; top-level class/style props target the iframe, matching upstream.

The default sandbox permits scripts, forms, popups, and presentations:

```text
allow-scripts allow-forms allow-popups allow-presentation
```

It deliberately omits upstream's `allow-same-origin`: script-enabled content served from the parent's origin could otherwise access the parent and remove its sandbox. The default uses an opaque origin, which can prevent storage, cookies, and origin-dependent APIs from working. For a separately hosted preview that requires those capabilities, configure the native `sandbox` prop according to your application's trust boundary. `sandbox=""` applies all restrictions. Serve untrusted generated applications from a separate origin and choose network/resource policies appropriate to that application. The iframe is not a network firewall. See the [HTML iframe sandbox specification](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-sandbox).

`loading` is an application-owned ReactNode overlay, preserving the AI Elements API. Use `frameLoading="lazy"` or `"eager"` for the native iframe loading attribute. `onLoad` does not prove that a remote page loaded successfully; browsers may emit load even when embedding fails. The component does not invent a successful/error state from that event. See [iframe load and error behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#error_and_load_event_behavior).

## Console

`WebPreviewConsole` (`.Console`) accepts `logs` with `level: 'log' | 'warn' | 'error'`, `message: string`, `timestamp: Date`, and optional stable `id`. It renders entries supplied by your application and does not intercept the iframe console or access cross-origin content.

Use `label`, `emptyState`, and `formatTimestamp` for localization. Timestamps default to UTC `HH:mm:ss` for consistent server/client rendering. The optional timestamp formatter can return any ReactNode. Native `triggerProps` and `collapseProps` customize interaction and transitions. Each console panel has unique accessible trigger/content IDs. Its scroll area is keyboard focusable and bounded to 192px by default. Children follow the log entries.

Console selectors are `root`, `trigger`, `chevron`, `content`, `scroll`, `entry`, `timestamp`, and `empty`. Entries expose `data-level` for custom severity styling.

## Mantine customization

All six parts support independent Mantine component defaults through `extend`, native refs/attributes, and Styles API customization. Navigation exposes `root`; NavigationButton exposes native `root`, `icon`, and `loader` slots and ActionIcon variables. URL exposes TextInput's native input/wrapper/label/error/description selectors. Native Paper, TextInput, ActionIcon, Tooltip, and Flex defaults remain available.

Both named and compound exports reference the same components. Use named exports when composing client modules from a Next.js Server Component. Public types include `WebPreviewContextValue` and `WebPreviewLog`; internal context access is not part of the public API.

## Examples and AI SDK

The basic example implements application-owned two-page history, URL commits, reload, fullscreen through Mantine's `useFullscreenElement`, and load-event logs. Its interactive HTML runs in the iframe and demonstrates that parent DOM access is blocked by the default sandbox.

The **With Use Object** story uses the real AI SDK `useObject` hook with a local chunked JSON response and runtime validation. Completed HTML replaces the preview; stop and request failure preserve the previous document. Replace the local `fetch` with your application endpoint. No API key is required for these examples.

## AI Elements mapping

All six upstream components and the context value type are provided. Native Mantine components replace shadcn wrappers. URL draft handling preserves consumer events and adds IME/cancellation behavior. Root URL/console state can be controlled. Timestamps are deterministic by default, and the default sandbox omits `allow-same-origin` as explained above. Back/forward, reload, fullscreen, device sizing, and console capture remain application-owned rather than being inferred from toolbar icons.
