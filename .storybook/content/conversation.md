# Conversation

A scrollable message log that follows new content until the reader scrolls up. Add `Conversation.ScrollButton` to let the reader return to the latest message. Set a height, or place it inside a flex container with a bounded height.

```tsx
import { Conversation } from 'mantine-ai-elements';

<Conversation h={400} aria-label="Chat messages">
  <Conversation.Content>
    {messages.length === 0 ? (
      <Conversation.EmptyState />
    ) : messages.map((message) => (
      <div key={message.id}>{/* Render message.parts here */}</div>
    ))}
  </Conversation.Content>
  <Conversation.ScrollButton />
  <Conversation.Download messages={messages} />
</Conversation>
```

Pass `messages` from AI SDK `useChat` directly to Download. Conversation does not create a transport or own messages. The Storybook **With AI SDK** example uses a real `useChat` hook with an API-key-free streaming transport.

## Composition and control

Compound and named exports are equivalent: `ConversationContent`, `ConversationEmptyState`, `ConversationScrollButton`, and `ConversationDownload`.

Conversation retains `use-stick-to-bottom` options: `initial`, `resize`, `mass`, `damping`, `stiffness`, `targetScrollTop`, `instance`, and `contextRef`. Root and Content children may be a render function receiving the scroll context. The package also exports `useStickToBottom` and `useStickToBottomContext`. Use the latter inside Conversation to call `scrollToBottom()` or `stopScroll()`.

Root `ref` identifies the outer element. Content `ref` identifies the observed message container; `viewportRef` identifies the scrolling element. `contextRef` exposes the dependency's imperative scroll state and methods. `initial={false}` disables initial following. Smooth animation is the default; a reduced-motion preference selects instant animation unless an explicit animation option is supplied.

## Styling and accessibility

Root Styles API selectors: `root`, `viewport`, `content`. Use `Conversation.extend` in a Mantine theme, or `classNames`, `styles`, and spacing props. `scrollClassName` applies to the viewport. Content inherits the root Styles API.

EmptyState has its own `root` selector and `ConversationEmptyState` theme key. Set `title`, `description`, and `icon`, or replace its contents with children.

ScrollButton and Download accept Mantine ActionIcon props and Styles API, with theme keys `ConversationScrollButton` and `ConversationDownload`. Their default labels are “Scroll to bottom” and “Download conversation”; override `aria-label` for localization. A custom `onClick` can prevent the default operation with `event.preventDefault()`.

## Markdown export

Download accepts `messages: readonly UIMessage[]`, `filename` (default `conversation.md`), and `formatMessage(message, index)`. `messagesToMarkdown(messages, formatMessage?)` provides the same formatting without downloading. The default joins text parts and labels each role; reasoning, attachments, tools, and metadata are omitted. Supply a formatter to include additional parts.
