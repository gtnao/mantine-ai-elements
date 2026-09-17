# ChainOfThought

Display application-supplied progress summaries, source badges, and image previews in a collapsible panel. The component follows AI Elements' seven-part composition with Mantine styling.

```tsx
import { ChainOfThought } from 'mantine-ai-elements';

<ChainOfThought defaultOpened>
  <ChainOfThought.Header>Search and response progress</ChainOfThought.Header>
  <ChainOfThought.Content>
    <ChainOfThought.Step
      label="Review reference documents"
      description="Compare the available component APIs."
      status="complete"
    >
      <ChainOfThought.SearchResults>
        <ChainOfThought.SearchResult component="a" href="/reference">
          Reference guide
        </ChainOfThought.SearchResult>
      </ChainOfThought.SearchResults>
    </ChainOfThought.Step>
    <ChainOfThought.Step label="Write the response" status="active" />
  </ChainOfThought.Content>
</ChainOfThought>
```

The library renders the labels and statuses your application supplies. It does not generate reasoning, derive steps from arbitrary messages, run searches, or infer that an operation succeeded.

## API

| Component | Props and behavior |
| --- | --- |
| `ChainOfThought` | Box props, `opened`, `defaultOpened` (false), `onChange`, and `disabled`. Its ref addresses the root div. |
| `ChainOfThought.Header` | Native UnstyledButton props, polymorphic `component`/`renderRoot`, an optional React node `icon`, and custom label `children`. Defaults to a brain icon, “Chain of Thought”, and an expanding chevron. The default root is a non-submitting button. |
| `ChainOfThought.Content` | Mantine Collapse props except `expanded`, which comes from the root. Each panel receives a unique ID and is labelled by the header. Its ref addresses the collapsible div. Override `aria-label` or `aria-labelledby` when composing without a header. |
| `ChainOfThought.Step` | Required React node `label`, optional React node `description` and `icon`, `children`, and `status: 'complete' | 'active' | 'pending'` (default complete). Includes a connector line and a localized accessible status through `statusLabel`. |
| `ChainOfThought.SearchResults` | Mantine Flex props; defaults to wrapping with compact spacing. |
| `ChainOfThought.SearchResult` | Polymorphic Mantine Badge props, including sections, color, variant, and radius. Defaults to a small light gray badge with normal casing and weight. Use `component="a"` and `href` for a link; supply `target`/`rel` when opening a new tab. |
| `ChainOfThought.Image` | A div containing a padded, rounded media frame and optional string `caption`. Pass an image or other visual as children. `frameProps` customizes the Box frame; `captionProps` customizes its Mantine Text caption. The frame defaults to a maximum height of 22rem and clips overflow. |

Named exports are available for all seven components. Use them when composing children from React Server Components.

Step, SearchResults, SearchResult, and Image also work without a root provider. Header and Content require ChainOfThought. Unlike AI Elements' Lucide component constructor, `Step.icon` takes a React node: write `icon={<SearchIcon />}`. This supports icons from any library without adding an icon dependency.

The header supports Enter/Space, `aria-expanded`, disabled state, and click cancellation via `event.preventDefault()`. Root `disabled` disables disclosure, not arbitrary controls inside the content. Steps expose their state through `data-status` and an accessible status label (“Complete”, “In progress”, or “Pending”). Active labels gain emphasis; pending connector lines are dashed. Set `statusLabel` for localization. The default dot and custom icon wrapper are decorative.

## Mantine customization

Root Styles API selectors are `root`, `trigger`, `icon`, `title`, `chevron`, `content`, and `body`. Customize disclosure layout through `ChainOfThought.extend()` or the root's styles, classNames, and attributes.

Step has its own theme entry and selectors `root`, `icon`, `line`, `body`, `label`, `description`, and `status`. SearchResults exposes `root`; SearchResult exposes all native Badge selectors (`root`, `section`, `label`) and CSS variables; Image exposes `root`, `frame`, and `caption`. Component refs address their outer elements, including the selected element type for polymorphic search results. The image itself remains application-owned; place its ref on the image child.

Long text and source badges wrap on narrow screens. Directional spacing follows RTL. Step entrance and chevron animations respect reduced motion. Image captions do not replace the image's `alt` text; describe meaningful visual content on the image child.

## AI SDK example

The **With use chat** story uses real `useChat`, tool UI parts, source-url parts, and completion callbacks with an API-key-free mock transport. It shows three independent stages:

1. The search tool is complete only when it produces `output-available`; a tool error is displayed as failed and remains pending.
2. Reference badges appear when source-url parts arrive. These fixture URLs are independent of the tool's match count.
3. The reply is complete only after `onFinish` reports neither abort nor error. Stopping keeps the partial reply paused, and starting again resets the current progress.

Tool errors and request errors are separate. The example guards duplicate dispatch before React updates and stops the stream when unmounted. These labels are application progress summaries, not an automatic interpretation of a model's reasoning. Replace the deterministic transport and status mapping with your application's contract.
