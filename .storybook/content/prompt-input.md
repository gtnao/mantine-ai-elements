# PromptInput

Compose a form with a textarea, optional toolbar content, and a submit button. Both `PromptInput.Textarea` and named exports such as `PromptInputTextarea` refer to the same components.

## API

| Component | Props and purpose |
| --- | --- |
| `PromptInput` | Required `onSubmit(message, event): void \| Promise<void>`; optional `onSubmitError(error)`; Mantine Box and Styles API props; form attributes and ref |
| `PromptInput.Textarea` | Mantine Textarea props and ref; defaults to `autosize`, `minRows={2}`, `maxRows={8}`, `variant="unstyled"` |
| `PromptInput.Body` | Input region; Mantine Box props and div ref |
| `PromptInput.Footer` | Layout for actions and submit; Mantine Box props and div ref |
| `PromptInput.Tools` | Region for ordinary Mantine buttons or menus; Mantine Box props and div ref |
| `PromptInput.Submit` | Mantine ActionIcon/button props and ref; `status?: ChatStatus`, `onStop?: () => void`, `submitLabel`, `stopLabel` |

The submit labels default to `Send message` and `Stop generating`. Pass translated labels and a textarea `aria-label` or visible `label` for your application.

```ts
interface PromptInputMessage {
  text: string;
  files: FileUIPart[];
}
```

The payload matches AI Elements and can be passed to `sendMessage`. This version supports text only and always supplies `files: []`. Attachments, model selectors, and a shared input provider are not implemented.

## Submission and cancellation

- Enter submits; Shift+Enter inserts a new line; IME confirmation does not submit.
- Blank or whitespace-only text is ignored. Accepted text is not trimmed.
- Non-controlled input resets at the start of submission. Text typed while the callback is pending remains intact.
- Callback failures do not restore non-controlled text. Use controlled input when you need to retain the draft on failure.
- Pending callbacks prevent duplicate submissions. During `submitted` and `streaming`, Enter cannot submit another message.
- During generation, the button calls `onStop` when provided, otherwise it is disabled. The waiting spinner still allows stopping.
- `onSubmitError` handles errors thrown or rejected by your callback. Handle AI SDK errors separately through `useChat().error`.
- External `onKeyDown` and `onClick` handlers can call `preventDefault()` to cancel internal handling.

Use one message textarea and one submit control per form. The textarea uses `name="message"` for payload collection. Forms must not be nested.

## Controlled input

With `value` and `onChange`, the application owns the draft and decides when to clear it.

```tsx
const [value, setValue] = useState('');

<PromptInput onSubmit={({ text, files }) => {
  sendMessage({ text, files });
  setValue('');
}}>
  <PromptInput.Textarea
    aria-label="Message"
    value={value}
    onChange={(event) => setValue(event.currentTarget.value)}
  />
  <PromptInput.Footer>
    <PromptInput.Tools />
    <PromptInput.Submit status={status} onStop={() => stop()} />
  </PromptInput.Footer>
</PromptInput>
```

This example clears immediately. If you clear after an asynchronous operation, ensure you do not erase a newer draft. Callback resolution alone is not a guarantee that AI generation succeeded; consult AI SDK's error/status state.

## Upstream compatibility

Inspired by AI Elements, with Mantine primitives and styling. It is not a drop-in replacement for shadcn-specific props. The generation and duplicate-submission guards deliberately prevent accidental resubmission.
