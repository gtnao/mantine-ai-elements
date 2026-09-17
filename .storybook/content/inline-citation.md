# InlineCitation

Put a citation beside a passage and let readers inspect its sources. The card opens on hover, keyboard focus, or activation. Mantine supplies the popover and buttons; Embla supplies carousel layout, dragging, and plugins.

```tsx
import { InlineCitation, InlineCitationCarousel } from 'mantine-ai-elements';

<InlineCitation>
  <InlineCitation.Text>A supported statement.</InlineCitation.Text>
  <InlineCitation.Card>
    <InlineCitation.CardTrigger sources={sources.map((source) => source.url)} />
    <InlineCitation.CardBody>
      <InlineCitationCarousel>
        <InlineCitationCarousel.Header>
          <InlineCitationCarousel.Prev />
          <InlineCitationCarousel.Next />
          <InlineCitationCarousel.Index />
        </InlineCitationCarousel.Header>
        <InlineCitationCarousel.Content>
          {sources.map((source) => (
            <InlineCitationCarousel.Item key={source.id}>
              <InlineCitation.Source {...source}>
                <InlineCitation.Quote>{source.quote}</InlineCitation.Quote>
              </InlineCitation.Source>
            </InlineCitationCarousel.Item>
          ))}
        </InlineCitationCarousel.Content>
      </InlineCitationCarousel>
    </InlineCitation.CardBody>
  </InlineCitation.Card>
</InlineCitation>
```

Import the package stylesheet after Mantine styles. Every child also has a named export, such as InlineCitationCardTrigger and InlineCitationCarouselContent. Use named exports when composing children in a React Server Component.

## AI SDK and citation mapping

AI SDK source-url parts provide sourceId, url, and optional title. They do not identify the text ranges supported by each reference. The application owns that mapping, whether it comes from structured output, a provider-specific citation format, or an association with the entire answer. The useChat example demonstrates the latter with actual streamed source parts. These components do not parse Markdown citations or fetch metadata. Source-document parts require an application-defined route or a custom document preview.

## Card and text

InlineCitation and Text render spans and accept span/Box props, refs, and their own root Styles API. The passage highlights while the citation is hovered or contains focus.

Card accepts Mantine Popover props plus openDelay and closeDelay (both zero by default). Use opened/onChange or defaultOpened. Its default width is 320, radius md, and shadow md. Keep the default portal when placing a citation inside a paragraph: a dropdown contains block elements. Escape and outside interaction close the card; moving between trigger and card preserves it, and selecting card text holds it open on pointer leave. Use one trigger per card.

CardTrigger accepts Button props, a button ref, and readonly sources. The default label uses the first URL's hostname plus the number of additional sources. Empty sources display “unknown”; malformed or relative references display their original text. Children replace the label. The button never submits a form. Activation opens the card, and onClick can cancel that activation; focus and hover are independent opening events. Disabled and loading retain Button behavior. CardBody accepts Popover.Dropdown props and a div ref, with zero padding by default.

Source accepts title, url, description, div/Box props, children, and a div ref. The title and URL truncate; the description clamps to three lines. The URL is text, matching AI Elements: add an Anchor child when navigation is wanted. Quote renders a compact blockquote with a logical border and a blockquote ref.

## Carousel

Carousel exposes Embla opts, plugins, and setApi(api), plus orientation (horizontal or vertical). Orientation owns the engine axis; opts.direction overrides the component dir or Mantine direction. Header is outside the scrolling viewport. Content forwards its ref to the slide container and accepts viewportProps to size the clipping viewport. Vertical viewports default to 16rem; customize their height as needed.

Items occupy one viewport by default. Index displays the selected scroll snap and total snap count, updating on selection and reinitialization, including source additions/removals. Empty content displays 0/0. Custom index children replace the label. Give each item an aria-label when a source position or descriptive name is useful.

Prev and Next are Mantine ActionIcons. At non-looping boundaries they use aria-disabled and ignore activation while preserving focus, so reaching the final source does not close its card. An explicit disabled prop keeps native button disabling. They accept custom children/labels, and respect cancelled onClick handlers. Arrow keys follow orientation and direction; editable controls keep their normal key handling. Buttons and keyboard navigation jump immediately when reduced motion is preferred. The underlying Embla API remains available for application-defined navigation and plugins.

## Mantine customization

Carousel owns root, viewport, container, item, header, and index selectors. Its layout children use these selectors and their own theme defaultProps. Prev/Next have separate theme keys and support the complete ActionIcon Styles API. Card supports dropdown, arrow, and overlay; CardTrigger supports the complete Button Styles API. Source owns root, title, url, and description; Quote owns root. Native Mantine component themes remain available.

All 14 AI Elements exports are represented. Mantine opened/defaultOpened/onChange replace Radix state props. The focusable Button trigger, invalid-URL fallback, boundary-disabled controls, and dynamic index updates extend the upstream behavior. No shadcn, Tailwind, or additional Mantine carousel peer dependency is required.
