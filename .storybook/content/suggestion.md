# Suggestion

Compose a horizontally scrollable row of suggested prompts using Mantine Button and ScrollArea.

```tsx
import { Suggestion, Suggestions } from 'mantine-ai-elements';

<Suggestions>
  <Suggestion suggestion="Explain streaming responses" onClick={setDraft} />
  <Suggestion suggestion="Summarize the conversation" onClick={setDraft}>
    Summarize
  </Suggestion>
</Suggestions>
```

`onClick` receives the original `suggestion` string, including when `children` supplies a different visible label. It does not receive a mouse event. The application decides whether to populate a draft, send immediately, or perform another action. Explicit empty or numeric children are preserved; omitted children use the suggestion text.

## AI SDK and PromptInput

To populate a draft, pass a state setter as `onClick`, and connect that state to `PromptInput.Textarea` using `value` and `onChange`.

To send immediately, connect AI SDK's `sendMessage`:

```tsx
<Suggestion
  suggestion="Explain streaming responses"
  disabled={status === 'submitted' || status === 'streaming'}
  onClick={(text) => { void sendMessage({ text }); }}
/>
```

Use `messages`, `status`, and `error` from `useChat` to display the conversation and request state. See the API-key-free **With AI SDK** story for Conversation, Message, Shimmer, Suggestions, and PromptInput working together with streaming, stop, and error handling. Suggestion does not own async state or automatically disable the list.

## Mantine props and styling

Suggestion accepts Mantine Button props and native button attributes, with the string callback replacing native `onClick`. Defaults are `variant="outline"`, `size="sm"`, `radius="xl"`, and `type="button"`. It therefore does not submit an enclosing form unless you explicitly change its type. `disabled`, `loading`, and `data-disabled` suppress selection. The ref targets the button.

Theme with `Suggestion.extend({ defaultProps, styles, classNames })`. The public Button selectors (`root`, `inner`, `label`, `section`, `loader`) remain available through `styles` and `classNames`. Native Button themes also apply. The extension resolves its own theme and forwards overrides through Mantine's public Styles API.

Suggestions accepts Mantine ScrollArea props, including `viewportRef`, `viewportProps`, `onScrollPositionChange`, and `scrollbars`. Its root ref targets the ScrollArea div. Use `Suggestions.extend` and ScrollArea's selectors (`root`, `viewport`, `content`, `scrollbar`, `thumb`, `corner`) to customize the list. `rowProps` customizes the inner Mantine Group, such as `gap` and padding.

The default is a single non-wrapping row with horizontal scrolling and hidden scrollbars, matching the upstream implementation. Set `type="auto"` to show scrollbars when needed. `className` applies to the root; use `rowProps.className` for the inner row. Keyboard users can Tab to suggestions and activate them with Enter or Space; standard focus scrolling reveals offscreen buttons.

No AI SDK hook, shadcn component, or additional scroll dependency is installed by these components.
