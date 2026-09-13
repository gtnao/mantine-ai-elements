# PromptInput

Compose an AI SDK message form with text, file attachments, a model picker, and optional shared state. Compound names such as `PromptInput.Textarea` and named exports such as `PromptInputTextarea` refer to the same components. No shadcn or Tailwind setup is required.

## Attachments and AI SDK

```tsx
import {
  Attachment, Attachments, PromptInput, usePromptInputAttachments,
} from 'mantine-ai-elements';

function DraftFiles() {
  const attachments = usePromptInputAttachments();
  return (
    <Attachments variant="inline">
      {attachments.files.map((file) => (
        <Attachment key={file.id} data={file}
          onRemove={() => attachments.remove(file.id)}>
          <Attachment.Preview />
          <Attachment.Info />
          <Attachment.Remove />
        </Attachment>
      ))}
    </Attachments>
  );
}

// sendMessage, status, and stop come from your application's useChat().
<PromptInput
  multiple accept="image/*,.pdf" maxFiles={3} maxFileSize={5 * 1024 * 1024}
  onAttachmentError={(error) => setUploadError(error.message)}
  onSubmit={({ text, files }) => sendMessage({ text, files })}
>
  <PromptInput.Header><DraftFiles /></PromptInput.Header>
  <PromptInput.Body><PromptInput.Textarea aria-label="Message" /></PromptInput.Body>
  <PromptInput.Footer>
    <PromptInput.Tools>
      <PromptInput.ActionMenu>
        <PromptInput.ActionMenuTrigger />
        <PromptInput.ActionMenuContent>
          <PromptInput.ActionAddAttachments />
          <PromptInput.ActionAddScreenshot onCaptureError={setCaptureError} />
        </PromptInput.ActionMenuContent>
      </PromptInput.ActionMenu>
    </PromptInput.Tools>
    <PromptInput.Submit status={status} onStop={() => stop()} />
  </PromptInput.Footer>
</PromptInput>
```

`onSubmit` receives `{ text: string, files: FileUIPart[] }`. Preview files have an additional `id`; submitted files omit it and contain data URLs generated from the original `File` objects. Files can be submitted without text. The component does not upload to storage, select a model, or own your transport. Handle server-side limits and model compatibility in your application.

Picker, textarea paste, form drop, and `usePromptInputAttachments().add(files)` share validation. `accept` supports MIME types, wildcards, and case-insensitive filename extensions. Each rejected category calls `onAttachmentError` with `accept`, `max_file_size`, or `max_files`; valid files from the same batch are still added. Zero limits are enforced. `multiple` controls the native picker; use `maxFiles` to constrain the total. `globalDrop` opts into document-wide drops; use only one global drop owner per page. External `onPaste`/`onDrop` handlers can cancel internal behavior with `preventDefault()`.

The attachment hook exposes `files`, `add`, `remove`, `clear`, `openFileDialog`, and `fileInputRef`. Object URLs are released on removal, successful submission, and owner unmount. Backspace in an empty textarea removes the last attachment. Read/encoding failures are reported through `onSubmitError` and leave remaining attachments available for retry.

## Submission and cancellation

- Enter submits; Shift+Enter inserts a new line; IME confirmation does not submit.
- Empty or whitespace-only text is ignored when there are no attachments. Accepted text is not trimmed.
- Non-controlled text resets at the start of submission, preserving the existing text-only API. Callback failures do not restore it. Use controlled input or a Provider to retain text on failure.
- Successful callbacks remove only submitted files and referenced sources. A newer draft's text, files, and references survive pending work.
- Pending callbacks prevent duplicate submissions. During `submitted` and `streaming`, Enter cannot submit another message.
- During generation, the submit button calls `onStop` when provided, otherwise it is disabled. The waiting spinner still allows stopping.
- `onSubmitError` handles exceptions/rejections from your callback. AI SDK errors belong to `useChat().error`: its `sendMessage` can resolve after handling an error internally. Callback resolution alone does not prove generation succeeded. Return a rejecting promise if attachments must be retained for such a failure.
- External keyboard, paste, drop, button, and menu action handlers can cancel internal handling with `preventDefault()`.

Use one message textarea and one submit control per form. The textarea uses `name="message"`; forms must not be nested. Default labels are `Send message`, `Stop generating`, `Upload files`, and `Add to prompt`; customize these and give your textarea an accessible name.

## Shared state and controlled input

`PromptInputProvider` lifts draft text and attachments above a single active form. `initialInput` is read on mount. Components anywhere below the provider can call `usePromptInputController()` to access `textInput.value`, `setInput`, `clear`, and `attachments`. `useProviderAttachments()` exposes the provider's attachment controller. The picker is registered while its form is mounted; files remain owned by the provider when only the form unmounts.

```tsx
function InsertDraft() {
  const { textInput } = usePromptInputController();
  return <Button onClick={() => textInput.setInput('Summarize these files')}>
    Insert draft
  </Button>;
}

<PromptInputProvider initialInput="An editable draft">
  <InsertDraft />
  <PromptInput onSubmit={handleSubmit}>
    <PromptInput.Textarea aria-label="Message" />
    <PromptInput.Submit />
  </PromptInput>
</PromptInputProvider>
```

Inside a form, `usePromptInputAttachments()` validates with that form's constraints. Outside the form, provider `add` is deliberately unconstrained, as in AI Elements; validate external additions in the application. Provider text clears on successful submission only if it has not been edited since that submission began. Do not also pass `value`/`defaultValue` to a Provider-managed textarea.

Without a Provider, ordinary Mantine `value` and `onChange` leave text ownership with the application:

```tsx
const [value, setValue] = useState('');
<PromptInput onSubmit={({ text, files }) => {
  sendMessage({ text, files });
  setValue('');
}}>
  <PromptInput.Textarea aria-label="Message" value={value}
    onChange={(event) => setValue(event.currentTarget.value)} />
  <PromptInput.Submit status={status} onStop={() => stop()} />
</PromptInput>
```

## References and command search

`usePromptInputReferencedSources()` provides local `SourceDocumentUIPart & { id: string }` entries with `sources`, `add(singleOrArray)`, `remove`, and `clear`. References are separate from uploaded files. Read them inside the form when building request metadata; they are not silently inserted into `message.files`. Successful submission removes the captured references. `LocalReferencedSourcesContext` is available for custom composition.

```tsx
function ReferencePicker() {
  const references = usePromptInputReferencedSources();
  return (
    <PromptInput.Command label="References" loop>
      <PromptInput.Command.Input aria-label="Search references" />
      <PromptInput.Command.List>
        <PromptInput.Command.Empty>No results.</PromptInput.Command.Empty>
        <PromptInput.Command.Group heading="Docs">
          <PromptInput.Command.Item value="guide" keywords={['manual']}
            onSelect={() => references.add({ type: 'source-document',
              sourceId: 'guide', title: 'Guide', mediaType: 'text/plain' })}>
            Guide
          </PromptInput.Command.Item>
        </PromptInput.Command.Group>
      </PromptInput.Command.List>
    </PromptInput.Command>
  );
}
```

Command uses upstream's unstyled `cmdk` engine with Mantine text input and Styles API. It supports keyword ranking, custom `filter`, `shouldFilter={false}` for application filtering, `loop`, disabled items, separators, groups, and controlled highlighted value (`value`/`onValueChange`). Search text is controlled on `Command.Input`. Selection callbacks belong to `Command.Item.onSelect`; highlight changes are not activation. Item values should be unique and stable. Menus/dialogs remain Mantine-owned; no cmdk Dialog is rendered.

## Controls and Mantine customization

| Component | Props and purpose |
| --- | --- |
| `PromptInput` | Required `onSubmit`; `onSubmitError`; attachment constraints; `multiple`, `globalDrop`, `fileInputLabel`; Box/Styles API/form props and ref |
| `Header`, `Body`, `Footer`, `Tools` | Root-owned `header`, `body`, `footer`, `tools` style slots; Box props and div refs |
| `Textarea` | Mantine Textarea props/ref; defaults: autosize, 2–8 rows, unstyled |
| `Submit` | Mantine ActionIcon/button props/ref; AI SDK status, stop, translated labels |
| `Button` | Mantine Button props/ref; `tooltip` string or `{ content, shortcut, side }`; defaults to a compact subtle button with `type="button"` |
| `ActionMenu`, `ActionMenuContent`, `ActionMenuItem` | Mantine Menu, Menu.Dropdown, Menu.Item; native `opened`/`onChange`, positions, events, and Menu theme |
| `ActionMenuTrigger` | PromptInputButton inside Menu.Target; accepts ref, tooltip, and custom children |
| `ActionAddAttachments`, `ActionAddScreenshot` | Menu.Item props, `label`, cancellable `onClick`; screenshot additionally provides `onCaptureError` |
| `Select` | Full Mantine Select props/ref: `data`, `value`, `onChange`, `renderOption`, `comboboxProps`; defaults to xs, unstyled, no deselection |
| `HoverCard`, `HoverCardTrigger`, `HoverCardContent` | Aliases of the keyboard-accessible AttachmentHoverCard components; use its theme and Mantine Popover props |
| `Command` and its parts | Root-owned `root`, `input`, `list`, `empty`, `group`, `item`, `separator` slots; Command.Input also accepts Mantine TextInput customization |
| `TabsList`, `Tab`, `TabLabel`, `TabBody`, `TabItem` | Box-based layout sections and heading, matching upstream's layout-only helpers; use Mantine Tabs for selectable panels |

Use `theme.components.PromptInput`, `PromptInputTextarea`, `PromptInputSubmit`, `PromptInputButton`, `PromptInputSelect`, and `PromptInputCommand` with `.extend()`. Native Button/Select themes continue to apply beneath extension overrides. Menu aliases use `Menu`, hover aliases use `AttachmentHoverCard`, and layout helpers accept Box props. `classNames`, `styles`, refs, light/dark themes, and the package's regular or layered CSS are supported.

Screenshot capture is an explicit menu action that opens the browser's screen-selection prompt. It is disabled when unsupported. Cancellation is silent; other errors go to `onCaptureError`. Streams are stopped after capture, failure, or unmount. The generated PNG passes through normal attachment validation. A secure context and browser support are required.

## Intentional differences from AI Elements

- Mantine Select's `data`, `renderOption`, and `comboboxProps` replace Radix Select Trigger/Content/Item/Value wrappers. Mantine menu `onClick` replaces Radix `onSelect`; hover uses a single ref-capable child instead of `asChild`.
- File validation uses `onAttachmentError`, keeping the published native form `onError` intact. Mixed invalid batches report rejected categories, and filename extensions are supported.
- Async success only clears the submitted snapshot, preserving newer drafts. Raw Files are retained for conversion even if their preview URL is removed while sending; failed reads never send a broken blob URL.
- `syncHiddenInput` is not exposed: the pinned upstream source explicitly disables it despite an outdated documentation entry. Use the submission payload, not native file form posts.
- The pinned docs mention speech recognition, but that export is absent from the matching source; audio components are outside this package's current scope.
