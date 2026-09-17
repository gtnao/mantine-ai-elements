# Confirmation

Display an AI SDK tool approval request and its outcome using Mantine Alert and Button. The application supplies the approval object and tool state; the component never marks an action approved on its own.

```tsx
import { Confirmation } from 'mantine-ai-elements';

<Confirmation
  approval={part.approval}
  state={part.state}
  onResponse={addToolApprovalResponse}
  onResponseError={(error) => showError(error)}
>
  <Confirmation.Title>
    <Confirmation.Request>Allow this lookup?</Confirmation.Request>
    <Confirmation.Accepted>You approved this lookup.</Confirmation.Accepted>
    <Confirmation.Rejected>You rejected this lookup.</Confirmation.Rejected>
  </Confirmation.Title>
  <Confirmation.Actions>
    <Confirmation.Action approved={false} reason="Declined" variant="default">
      Reject
    </Confirmation.Action>
    <Confirmation.Action approved>Approve</Confirmation.Action>
  </Confirmation.Actions>
</Confirmation>
```

Import the package stylesheet once with Mantine styles. All compound children also have named exports: `ConfirmationTitle`, `ConfirmationRequest`, `ConfirmationAccepted`, `ConfirmationRejected`, `ConfirmationActions`, and `ConfirmationAction`.

## AI SDK integration

`ConfirmationApproval` uses the installed SDK's tool approval type, including `id`, `approved`, `reason`, and optional request metadata. Both static and dynamic tool approvals are supported. Pass the actual `part.approval` and `part.state`; do not infer approval from a completed network request.

`useChat` provides `addToolApprovalResponse`. To resume the request automatically after all approvals in the last step have responses, configure:

```tsx
import { useChat } from '@ai-sdk/react';
import { lastAssistantMessageIsCompleteWithApprovalResponses } from 'ai';

const chat = useChat({
  transport,
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
});
```

The approval callback receives `{ id, approved, reason }`, compatible with `chat.addToolApprovalResponse`. Wrap it when you need additional request options. Its resolution records the response; it does not guarantee that subsequent tool execution or generation succeeds. The server implements the tool and its approval policy. This component adds no execution backend.

The Storybook example uses real `useChat` approval requests and automatic continuation, including rejection and a retryable submission failure. No model credentials or real data access are required. Pair Confirmation with [Tool](./tool.md) to show inputs, results, and execution errors independently of the approval decision.

## Pending, failures, and custom callbacks

With `onResponse` on the root and `approved` on an action, the first click locks all actions synchronously. Repeated clicks cannot send another response. A successful callback leaves them locked until your application supplies a new approval ID or tool state. `Request` remains visible during this wait; `Accepted` and `Rejected` follow the supplied approval object.

A thrown error or rejected promise unlocks the actions for retry and calls `onResponseError(error)`. Render an error message in your application. Late failures from a previous approval or an unmounted component do not alter the current request. Set root `pending` to disable actions during additional application work. The Alert exposes `aria-busy` while pending.

For AI Elements' direct callback composition, omit `approved` and use the normal `onClick`:

```tsx
<Confirmation approval={part.approval} state={part.state} pending={saving}>
  <Confirmation.Actions>
    <Confirmation.Action onClick={() => submitApproval(false)}>Reject</Confirmation.Action>
    <Confirmation.Action onClick={() => submitApproval(true)}>Approve</Confirmation.Action>
  </Confirmation.Actions>
</Confirmation>
```

In this mode the application owns submission, errors, and duplicate prevention through `pending`. An action with `approved` but no root `onResponse` is disabled. `onClick` runs before built-in dispatch and can cancel it with `event.preventDefault()`. Disabled, loading, and data-disabled buttons do not dispatch. The HTML button type is always `button`.

## Visibility

- Without an approval, or during `input-streaming` / `input-available`, the root renders nothing.
- Request and Actions render during `approval-requested`.
- Accepted renders when `approval.approved === true` in response/output states.
- Rejected renders when `approval.approved === false` in response/output states.
- Response/output states are `approval-responded`, `output-available`, `output-denied`, and `output-error`.

An approved tool can fail during execution. The accepted decision remains visible in `output-error`; display the execution error separately with Tool.Output. This corrects an upstream case that otherwise left the confirmation body empty.

## Mantine customization

The root accepts Mantine Alert props, its div ref, all public Alert Styles API slots, and CSS variables. `Confirmation.extend(...)` configures its theme; native Alert defaults and styling still apply. Use Alert's `title`, `icon`, `color`, `radius`, or close controls normally. Closing an Alert is an application UI action, not an approval response.

`Confirmation.Title` is descriptive Text rendered as a div. It accepts Text props/ref and its own `root` Styles API; use Alert's `title` prop for a separate alert heading. `Confirmation.Actions` accepts Group props/ref and its `root` Styles API and group variables. Its defaults are right alignment, wrapping, a small gap, and top spacing. Both keep their native Mantine component themes and support their own theme keys.

`Confirmation.Action` accepts Button props/ref, every public Button style slot and CSS variable, and its own theme configuration through `Confirmation.Action.extend(...)` or the named export. Use `children`, `leftSection`, `variant`, and `loading` to match your application.

Request, Accepted, and Rejected are conditional children with no extra DOM wrapper. Place icons and translated text inside them. Keep action buttons inside Confirmation so they share its state and pending lock. The Alert announces changes; native buttons support keyboard interaction.

## AI Elements mapping

All upstream components are represented. `approval` and `state` retain the AI SDK data contract. Mantine props replace shadcn/Tailwind styling. Direct `onClick` remains available; `onResponse` / `approved` add shared submission protection without hiding `useChat`. No shadcn or Tailwind setup is required.
