# CodeBlock

Syntax-highlighted code with Mantine styling, optional line numbers, composable headers, and clipboard feedback. Shiki loads on demand; readable plain text is present during server rendering and while language data loads.

```tsx
import { CodeBlock } from 'mantine-ai-elements';

<CodeBlock code={'const answer = 42;'} language="typescript" showLineNumbers>
  <CodeBlock.Header>
    <CodeBlock.Title>
      <CodeBlock.Filename>answer.ts</CodeBlock.Filename>
    </CodeBlock.Title>
    <CodeBlock.Actions>
      <CodeBlock.CopyButton onError={(error) => console.error(error)} />
    </CodeBlock.Actions>
  </CodeBlock.Header>
</CodeBlock>
```

## Composition

Root requires `code` and `language`; header children render before the code. Named exports such as `CodeBlockHeader` and `CodeBlockCopyButton` are equivalent to compound members.

`CodeBlock.Container` supplies layout and the root Styles API without automatically rendering code. Place `CodeBlock.Content code={code} language={language}` anywhere inside it. Content also works standalone. When using CopyButton outside CodeBlock, pass its `code` explicitly.

Root Styles API selectors: `root`, `header`, `title`, `filename`, `actions`, `content`, `pre`, `code`, `line`, and `token`. Configure these with `CodeBlock.extend`, `classNames`, or `styles`. Root and sections expose DOM refs. CopyButton accepts Mantine ActionIcon props and theme defaults under `CodeBlockCopyButton`. LanguageSelector accepts Mantine Select props, including its Styles API; wrapper defaults can be set under `CodeBlockLanguageSelector`, and underlying Select theme styles still apply.

## Highlighting

Bundled Shiki languages and aliases are supported. Unknown language names render as plain text. Light and dark token colors follow Mantine's color-scheme attribute; no Tailwind configuration or `dark` class is needed. Changing code or language invalidates the previous result immediately. An optional `highlighter(code, language)` promise callback supplies custom tokenization (also used by MessageResponse to respect Streamdown plugins and themes). `onHighlightError` reports a failed asynchronous load while raw text remains visible.

`highlightCodeAsync(code, language)` resolves to `{ tokens, fg, bg }` for custom renderers. `highlightCode(code, language, callback?, onError?)` returns a cached result synchronously or `null` while loading, matching the upstream helper's calling convention. The cache stores up to 100 snippets of at most 100,000 characters each. Identical concurrent requests share a promise; failed requests can be retried.

## Clipboard

CopyButton copies the original source without line numbers. `onCopy` runs on success; `onError` receives clipboard failures or an unavailable Clipboard API. Feedback lasts `timeout` milliseconds (default 2000). `copyLabel`, `copiedLabel`, and `aria-label` allow localization. A pending copy prevents duplicate writes. `onClick` can cancel copying with `event.preventDefault()`.

## Language selection

The application owns the selected language and corresponding source:

```tsx
<CodeBlock.LanguageSelector
  w={140}
  value={language}
  onChange={(value) => value && setLanguage(value)}
  data={[
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
  ]}
/>
```

This intentionally uses Mantine's Select API instead of the upstream shadcn selector wrappers:

| AI Elements | Mantine equivalent |
| --- | --- |
| `LanguageSelector value/onValueChange` | `LanguageSelector value/onChange` |
| `LanguageSelectorTrigger` | Select input props and `styles.input` |
| `LanguageSelectorValue` | Selected item's `label`, or `placeholder` |
| `LanguageSelectorContent` | `comboboxProps` and `styles.dropdown` |
| `LanguageSelectorItem` | `data` entries and `renderOption` |

Use Mantine Combobox directly inside Actions for a custom trigger or richer composition. Language selection does not rewrite code or choose a model automatically.
