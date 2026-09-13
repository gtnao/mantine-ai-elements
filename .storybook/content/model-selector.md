# ModelSelector

A searchable model picker composed with Mantine Modal, Button, and the same command engine used by PromptInput. Supply your own model catalog and decide what selection means for the application.

```tsx
const [opened, setOpened] = useState(false);
const [model, setModel] = useState('fast');

<ModelSelector opened={opened} onChange={setOpened}>
  <ModelSelector.Trigger>{model}</ModelSelector.Trigger>
  <ModelSelector.Content title="Choose a model">
    <ModelSelector.Input aria-label="Search models" data-autofocus />
    <ModelSelector.List>
      <ModelSelector.Empty>No models found.</ModelSelector.Empty>
      <ModelSelector.Group heading="Available">
        <ModelSelector.Item value="fast" keywords={['quick']}
          onSelect={(value) => { setModel(value); setOpened(false); }}>
          <ModelSelector.Name>Fast</ModelSelector.Name>
        </ModelSelector.Item>
      </ModelSelector.Group>
    </ModelSelector.List>
  </ModelSelector.Content>
</ModelSelector>
```

Pass the chosen model to your own AI SDK request, for example `sendMessage({ text, files }, { body: { model } })`. Selection does not invoke a provider or replace your transport. The **With AI SDK** story demonstrates a real `useChat` instance with a deterministic transport.

## State and composition

`opened`, `defaultOpened`, and `onChange(opened)` control the modal. Without `opened`, the root manages visibility. Selection is independent: items invoke `onSelect(value)` and the application chooses whether to close. A highlighted command item is not necessarily the selected model. Stable, unique item values avoid changes caused by provider names or logo alt text.

`Content` wraps children in a command palette. `commandProps` accepts `filter`, `shouldFilter`, `loop`, controlled highlighted `value`/`onValueChange`, and Styles API overrides. Search text can be controlled separately through `Input.value` and `Input.onValueChange`. Items support keywords, disabled state, and `forceMount`; groups and separators retain cmdk behavior. Custom filtering and remote catalogs remain application-owned.

`Dialog` is a standalone convenience component combining root and content, suitable for externally controlled keyboard shortcuts. It accepts the same modal state props and `commandProps`; no Trigger is required. `Shortcut` displays a Mantine Kbd hint and does not register a global listener. See the **Keyboard Dialog** story for a listener with cleanup.

Mantine supplies focus trapping, Escape/outside-click dismissal, scroll locking, portals, and focus restoration. Add `data-autofocus` to the search input when you want it focused initially. `title` defaults to a visible **Model selector** heading, with a Mantine close button. Translate the title, input label, empty state, close-button label, and provider alternatives as needed.

## API and themes

| Component | Mantine integration |
| --- | --- |
| `ModelSelector` | Modal props except required `opened`/`onClose`; optional `opened`, `defaultOpened`, `onChange`; modal root ref and Styles API |
| `Trigger` | Mantine Button props/ref; always `type="button"`; cancellable `onClick`, disabled/loading support |
| `Content` | Modal props override root settings; root ref; `commandProps` customizes the inner palette |
| `Dialog` | Standalone root/content; same modal state and `commandProps` |
| `Input`, `List`, `Empty`, `Group`, `Item`, `Separator` | Aliases of PromptInputCommand parts, retaining refs and command behavior |
| `Name` | Mantine Text span with flex growth and truncation |
| `Logo` | `provider` string; defaults to `https://models.dev/logos/<provider>.svg`; optional `src`, `alt`, `invertInDark`, Mantine Image props and img ref |
| `LogoGroup` | Box props/ref with overlapping images |
| `Shortcut` | Mantine Kbd props/ref with trailing alignment |

Modal Styles API overrides use `theme.components.ModelSelector` or `ModelSelectorContent`; triggers use `ModelSelectorTrigger`, and logos use `ModelSelectorLogo`. For command styling use `Content.commandProps` or the shared `PromptInputCommand` theme. The regular Mantine Modal and Button themes are preserved. Native Text/Kbd themes and direct props style the small layout helpers.

Provider logos are loaded from models.dev at runtime by default, matching upstream. Use `src` for local assets, private deployments, or custom providers, and `fallbackSrc` for load failures. Default provider logos invert in dark mode; custom URLs do not invert unless `invertInDark` is set. No model list or provider API key is built into the package. A provider string does not guarantee that the external service has a logo for it.

## Differences from AI Elements

- Mantine `opened`/`defaultOpened`/`onChange` replace Radix dialog state props.
- Trigger accepts Mantine Button props and custom children instead of Radix `asChild` composition.
- The title and close button are visible by default, following Mantine Modal conventions. Modal behavior, dimensions, transitions, portal settings, and Styles API are configurable.
- The command engine is shared with PromptInput rather than bringing in shadcn components. Its controlled highlight and search values remain distinct from the application-selected model.
- Logo source/alternative text and inversion are customizable; provider names are encoded as a single URL path segment.
