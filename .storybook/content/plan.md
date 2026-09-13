# Plan

Present an execution plan with a header, collapsible body, footer actions, and streaming text. Plan follows AI Elements' composition using Mantine Paper, Flex, Title, Text, Collapse, and ActionIcon.

```tsx
import { Button } from '@mantine/core';
import { Plan } from 'mantine-ai-elements';

<Plan defaultOpened isStreaming={isLoading}>
  <Plan.Header>
    <div>
      <Plan.Title>{plan.title || 'Preparing your plan'}</Plan.Title>
      <Plan.Description>{plan.description || 'Receiving details…'}</Plan.Description>
    </div>
    <Plan.Trigger />
  </Plan.Header>
  <Plan.Content>{/* Render your plan steps here. */}</Plan.Content>
  <Plan.Footer justify="flex-end">
    <Plan.Action>
      <Button disabled={!validatedPlan} onClick={() => selectPlan(validatedPlan)}>
        Use this plan
      </Button>
    </Plan.Action>
  </Plan.Footer>
</Plan>
```

Only Plan.Content collapses. The header, description, footer, and action containers stay visible. A plan starts closed unless you provide `defaultOpened` or controlled `opened` and `onChange`. `isStreaming` defaults to false and only adds Shimmer to the title and description; it never forces the plan open or closes it after generation. Your application owns validation, action availability, execution, and persistence.

## Components

| Component | Mantine API and behavior |
| --- | --- |
| `Plan` | Paper props, `opened`, `defaultOpened`, `onChange`, `isStreaming`, and `disabled`. Bordered with `radius="lg"` and no default shadow. Its ref addresses the card div. |
| `Plan.Header` | Flex props; defaults to top alignment with space between the text and controls. Wrap title and description in a div to stack them. |
| `Plan.Title` | Required string children, Mantine Title props, a heading ref, and `shimmerProps`. Defaults to heading order 3; customize `order` and `size`. |
| `Plan.Description` | Required string children, Mantine Text and paragraph props, a paragraph ref, and `shimmerProps`. Defaults to small dimmed text with balanced wrapping. |
| `Plan.Action` | A Flex container for application-owned buttons or other controls. It does not perform an action itself. |
| `Plan.Content` | Mantine Collapse props except `expanded`, which comes from Plan. Its ref addresses the collapsible div. Each content region has a unique ID and the default accessible label “Plan details”; customize `aria-label` or `aria-labelledby` for multiple plans. |
| `Plan.Footer` | Flex props with wrapping and compact gaps; stays visible while the content is closed. |
| `Plan.Trigger` | Mantine ActionIcon props, all native Styles API selectors, and a button ref. Defaults to a subtle gray 32px button with the label “Toggle plan”. `children` replaces its icon. Change `aria-label` to describe your plan. |

Named exports (`PlanHeader`, `PlanTitle`, `PlanDescription`, `PlanAction`, `PlanContent`, `PlanFooter`, and `PlanTrigger`) are also available. Use named children when composing in React Server Components.

The trigger always uses `type="button"`, supports Enter/Space, and exposes `aria-expanded`. It respects `disabled`, `loading`, `data-disabled`, and the root's `disabled`. Prevent toggling with `event.preventDefault()` in `onClick`. Disabling the root affects the toggle; application action buttons remain under your control.

## Styling

Each component exposes its own Mantine theme entry under its full name and supports `.extend()`. Root and layout/text components expose the `root` selector; PlanContent exposes `root` and `body`; PlanTrigger exposes the ActionIcon selectors `root`, `icon`, and `loader`. Native Paper, Flex, Title, Text, and ActionIcon theme defaults still apply. Header/footer padding and body padding can be adjusted through those selectors or component props.

`shimmerProps` customizes the existing Shimmer component's duration, spread, highlight color, and styling. It renders as a span to preserve valid heading and paragraph markup. Shimmer respects reduced motion and forced colors. Long titles and descriptions wrap within the card.

## AI SDK example

The **With use object** story uses the real `useObject` hook with streamed JSON text from a deterministic fetch implementation. Partial title, description, and steps render as they arrive. The example guards missing partial fields, stops requests on unmount, and clears the mock transport's timers and abort listener.

The “Use this plan” action is enabled only when `onFinish` returns a validated complete document. Stopping leaves partial content available for inspection but does not enable the action. Starting another request clears the previously validated document. Request and validation errors are displayed separately. Selecting the plan updates a local message; it does not run a workflow or claim work was executed.

Open/closed state remains independent throughout streaming, stopping, and retrying. Replace the demo fetch and selection callback with your application's endpoint and action when integrating the component.
