# Context

Show context-window utilization, AI SDK token usage, and estimated USD cost in a Mantine popover. Context does not count tokens or choose a model: the application supplies the usage and capacity.

```tsx
import { Context } from 'mantine-ai-elements';

<Context
  usedTokens={usage.totalTokens ?? 0}
  maxTokens={modelContextLimit}
  usage={usage}
  modelId={modelId}
>
  <Context.Trigger />
  <Context.Content>
    <Context.ContentHeader />
    <Context.ContentBody>
      <Context.InputUsage />
      <Context.OutputUsage />
      <Context.ReasoningUsage />
      <Context.CacheUsage />
    </Context.ContentBody>
    <Context.ContentFooter />
  </Context.Content>
</Context>
```

Import package styles after Mantine styles. All ten components also have named exports, such as ContextTrigger and ContextContentHeader. Use named exports when composing from a React Server Component.

## AI SDK usage

The usage prop is the installed AI SDK's LanguageModelUsage. Input and output counts are totals; reasoning lives in outputTokenDetails.reasoningTokens, and cache reads/writes live in inputTokenDetails.cacheReadTokens/cacheWriteTokens. InputUsage and OutputUsage show their totals. ReasoningUsage and CacheUsage are subsets of those totals, not additional consumption; CacheUsage includes both reads and writes. Zero or unreported rows are omitted unless custom children are supplied.

Client useChat messages do not automatically contain provider usage. Send it as application-defined message metadata from your server. For example, with an appropriately typed message:

```tsx
return result.toUIMessageStreamResponse({
  messageMetadata: ({ part }) => {
    if (part.type === 'finish') {
      return { usage: part.totalUsage, modelId, maxTokens };
    }
  },
});
```

Read message.metadata on the client and pass its usage into Context. The Storybook example streams real useChat messages with deterministic, fictional usage metadata on completion. A stopped response may not report usage; preserve that distinction in your UI. Decide whether the display represents the last model call, an aggregated tool loop, or another application-defined scope. Summing usage across requests does not measure the current prompt's context occupancy.

## Capacity and interaction

usedTokens and maxTokens control the displayed utilization. The default trigger shows a percentage and Mantine RingProgress. The header shows compact counts and a Mantine Progress meter. An over-capacity percentage stays visible while the meter is clamped to 100%. Non-positive or invalid capacity, invalid usage counts, and non-finite ratios display a dash; the meter announces unknown capacity. locale defaults to en-US.

Context accepts Mantine Popover props, opened/defaultOpened/onChange, openDelay, and closeDelay. Delays default to zero; width defaults to 280, radius to md, and shadow to md. Focus, hover, or activation opens the card. Escape and outside interaction close it; moving between the trigger and card preserves it. Content is portaled by default. Use one trigger per root.

Trigger accepts Button props and a button ref. Its type is always button; onClick can cancel activation. Focus and hover are separate opening events. Children replace the button contents, following Mantine's Button API. ringProps customizes RingProgress except its sections. Content accepts Popover.Dropdown props and a div ref; default padding is zero. Header/body/footer/usage helpers accept Box/div props and div refs. Their children replace default contents, including explicit zero. Header's progressProps customizes Progress.Root and the color/striped/animated options of its section; Context controls value and accessibility state.

## Cost estimates

With modelId and usage, Context lazily loads Tokenlens's pricing helpers and bundled model catalog. It makes no automatic metadata fetch. IDs accept provider/model, provider:model, or providerless model names; qualify the provider when model names overlap. The static catalog is a snapshot, and may omit models or have outdated prices. These values are estimates, not billing records.

For current or private model pricing, pass providers using the exported ContextProviders type. This accepts Tokenlens's models.dev-compatible provider object or catalog. The bundled catalog is not loaded when providers is supplied. Your application owns fetching, caching, and updating that data.

Alternatively, supply costUSD using the exported ContextCosts type. It accepts inputUSD, outputUSD, reasoningUSD, cacheReadUSD, cacheWriteUSD, and totalUSD. Input/output costs include their respective cache/reasoning subsets. The supplied object replaces automatic estimation; costUSD={{}} deliberately disables it. This also supports server-calculated costs without loading Tokenlens in the browser.

The adapter partitions AI SDK's inclusive counters before passing them to Tokenlens, avoiding double charges for cached or reasoning tokens. If no separate reasoning rate exists, the estimate uses the output rate for that subset. Missing rates for consumed categories, unknown models, missing totals, or contradictory counters leave the affected totals unknown. Unreported detail counts are treated as zero for estimation; pass server costs when provider-specific billing cannot be represented by these categories. The footer shows a dash for unknown cost, while known free usage displays $0.00. Detail rows omit unavailable cost estimates. Formatting uses USD with up to four decimal places.

Estimates update when model, usage, or providers changes. Pending and failed estimates remain unknown; stale asynchronous results are ignored. Use onCostError for module-loading or calculation errors if the application needs reporting. Custom footer children can replace “Estimated total” or its entire content.

## Mantine customization

Context owns dropdown, arrow, overlay, header, body, footer, usage, label, value, and stats style selectors. Pass styles/classNames/attributes or use Context.extend in the theme. Layout children use these root selectors and their own theme defaultProps. Trigger has a separate ContextTrigger theme key and the complete Button Styles API. RingProgress and Progress retain native Mantine styling; the themed story demonstrates a custom trigger and footer.

All ten AI Elements exports are represented. Differences include current AI SDK nested usage fields, Mantine state/trigger conventions, a Mantine progress ring, cache-write accounting, non-duplicated cost estimates, and explicit unknown values. No shadcn or Tailwind setup is needed.
