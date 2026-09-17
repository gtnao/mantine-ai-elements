# Question

Collect a single choice, several choices, freeform text, or a combination. The application decides what to do with the response and when to replace the question with an answered summary.

```tsx
import { Question } from 'mantine-ai-elements';

<Question selectionMode="multiple" onSubmit={saveAnswer} onSubmitError={showError}>
  <Question.Prompt>What should the project include?</Question.Prompt>
  <Question.Description>Select features and add details if needed.</Question.Description>
  <Question.Options aria-label="Project features">
    <Question.Option value="search">Search</Question.Option>
    <Question.Option value="database">Database</Question.Option>
  </Question.Options>
  <Question.Input aria-label="Additional requirements" />
  <Question.Actions>
    <Question.Submit>Answer</Question.Submit>
  </Question.Actions>
</Question>
```

Import the package stylesheet once alongside Mantine styles. All compound children also have named exports.

## Draft and submission

```ts
interface QuestionValue {
  selectedValues: readonly string[];
  text: string;
}
interface QuestionResponse {
  selectedValues: readonly string[];
  text?: string;
}
```

Use `value` and `onValueChange(value)` for a controlled draft, or `defaultValue` for an uncontrolled initial value. The default draft is empty. `onValueChange` reports selection and text edits; the native form `onChange` remains available separately.

`selectionMode` defaults to `single`. Choosing a different option replaces the selection; clicking the selected option again clears it, matching the AI Elements implementation. `multiple` independently toggles values in selection order. Values are application-defined strings; the component does not filter externally supplied values against currently mounted options.

`onSubmit(response, event)` receives a copy of the selected values, trimmed text (or undefined when empty), and the original form event. Read `event.currentTarget` before awaiting, as with other React events. Empty and whitespace-only responses cannot submit. The component prevents native form navigation and respects cancellation in `onSubmitCapture`.

An asynchronous submit locks all controls until its promise settles. Errors call `onSubmitError` and unlock the form for retry. The draft remains intact on both success and failure. The application can replace the form with a summary, clear a controlled draft, or keep it available. Unmounted forms do not report late errors or update their state. Set `pending` for additional application work and `disabled` to disable the question. Custom controls are not automatically disabled; use their native props.

## AI SDK

AI SDK has no dedicated Question message-part type. Your application can collect the response for a tool, send a user message, or call its own endpoint. The Storybook example uses real `useChat.sendMessage`:

```tsx
<Question
  pending={status === 'submitted' || status === 'streaming'}
  onSubmit={(response) => sendMessage({ text: JSON.stringify(response) })}
>
  {/* Question children */}
</Question>
```

Serialization is an application choice. The component does not hide useChat, implement a tool, or decide whether an answer completes your workflow. AI SDK errors may be reported through its error state rather than a rejected sendMessage promise; display the chat error separately.

## Composition and Mantine customization

The root is a Mantine Box rendered as a form, with a form ref and native form props. Do not nest it inside another form. Its Styles API selectors are `root`, `prompt`, `description`, `options`, and `actions`. Configure `Question.extend(...)` in the Mantine theme or pass styles/classNames directly.

Prompt and Description render Mantine Text paragraphs; Options and Actions render Box containers. They forward Box/native element props and refs, use their root-owned style selectors, and support theme defaultProps under their own component names. Place these children inside Question. Options lays out wrapping choices; Actions lays out wrapping controls aligned to the end.

Option is a Mantine Button with a required `value`, button ref, normal Button props, all public Button style slots, and its own `QuestionOption` theme. The default variant is filled when selected and outline otherwise; an explicit variant overrides this. Children override the visible label. Its HTML type is always button.

Input is a Mantine Textarea controlled by the draft. It accepts textarea props/ref and every public Textarea style slot under the `QuestionInput` theme. Use `label`, `description`, `error`, `autosize`, and `maxRows` normally. Its value/defaultValue belong on the root instead. Custom onChange and option onClick handlers run first and may cancel draft updates with preventDefault.

Submit is a Mantine Button with its own `QuestionSubmit` theme, full Button style slots and ref. Its type is always submit; children default to “Submit”. It disables itself for empty, disabled, or pending questions and shows loading while the built-in submission is pending.

## Keyboard behavior

Single options expose radio semantics; multiple options expose checkbox semantics. Label Options with `aria-label` or `aria-labelledby`, and label the textarea as usual. Buttons support Enter/Space, plus arrows and Home/End within their nearest Options group. Navigation skips disabled/loading options, respects RTL, and stays within the group. Single-mode navigation selects the newly focused option without clearing an already selected option; multiple-mode navigation moves focus only. A custom onKeyDown can cancel navigation.

Options remain individually tabbable, matching Mantine Radio.Card and the upstream button composition. Clicking a selected single option may clear the selection. No private Mantine DOM selectors are used.

## AI Elements mapping

All eight upstream components and both public value/response types are represented. The structured draft and response contract is preserved. Mantine components replace shadcn styling. Added async pending/error handling preserves the draft and prevents duplicate submissions; native form capture handlers and child callbacks can cancel actions. No shadcn or Tailwind setup is required.
