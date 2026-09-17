# OpenIn

Open a text query in another AI chat service using a Mantine Menu. The application supplies the text; OpenIn builds encoded links and keeps native browser navigation behavior.

```tsx
import { OpenIn } from 'mantine-ai-elements';

<OpenIn query={query}>
  <OpenIn.Trigger />
  <OpenIn.Content>
    <OpenIn.Label>Continue with</OpenIn.Label>
    <OpenIn.ChatGPT />
    <OpenIn.Claude />
    <OpenIn.Cursor />
    <OpenIn.T3 />
    <OpenIn.Scira />
    <OpenIn.v0 />
  </OpenIn.Content>
</OpenIn>
```

Import the package stylesheet after Mantine styles. All upstream components also have named exports, including OpenInChatGPT, OpenInv0, and OpenInContent. Use named exports when composing children from a React Server Component.

## Query and destinations

query belongs to the root and is required, including when it is an empty string. Links update when query changes. URLSearchParams encodes spaces, Unicode, line breaks, and reserved characters. OpenIn does not trim or truncate the text, submit through AI SDK, copy attachments, or serialize chat history. Pass a shared PromptInput draft, a selected message, or text your application builds from messages. The PromptInput story demonstrates the shared-draft integration.

The built-in destinations follow the pinned AI Elements implementation:

| Component | Destination | Query parameter |
| --- | --- | --- |
| ChatGPT | https://chatgpt.com/ | prompt, with hints=search |
| Claude | https://claude.ai/new | q |
| Cursor | https://cursor.com/link/prompt | text |
| T3 | https://t3.chat/new | q |
| Scira | https://scira.ai/ | q |
| v0 | https://v0.app/ | q |

The receiving service controls authentication and what happens after navigation; its URL conventions can change. Cursor documents an 8,000-character URL limit in its [deeplink reference](https://prod.cursor.com/docs/reference/deeplinks). For longer text or custom services, provide an application-defined destination or action. The selected query is part of the outgoing URL, so the application should choose what to include.

Provider items accept Menu.Item styling props and anchor props, including href, target, rel, onClick, and onAuxClick. The default target is _blank with rel="noopener noreferrer". An explicit href replaces the generated URL. Children replace the visible label; leftSection and rightSection replace the brand icon and external-link indicator, and null removes a section. Icons are decorative because each item has a text label.

Disabled or data-disabled provider links have no href and ignore click/middle-click activation. The same protection applies to disabled OpenIn.Item anchors. Enabled links retain modified-click and native anchor behavior. preventDefault in onClick cancels navigation; following Mantine Menu behavior, use closeMenuOnClick={false} when the item should also keep the menu open.

## Menu and custom content

OpenIn accepts Mantine Menu props, including opened/defaultOpened/onChange, closeOnItemClick, loop, trigger, transitionProps, and positioning. Default width is 240 and position is bottom-start. It supports Mantine's keyboard navigation, typeahead, Escape, and focus return. Initial arrow navigation skips disabled links.

Trigger is a Mantine Button with a button ref, a default “Open in chat” label, and a chevron. Children replace its contents, and rightSection customizes the chevron. The type is always button. Use Target instead when supplying an entire custom control:

```tsx
<OpenIn query={query}>
  <OpenIn.Target>
    <ActionIcon aria-label="Choose chat service">↗</ActionIcon>
  </OpenIn.Target>
  <OpenIn.Content>{/* items */}</OpenIn.Content>
</OpenIn>
```

Target is Mantine Menu.Target and requires one ref-forwarding element. Use either Target or Trigger per menu. Its theme key is MenuTarget.

Content accepts Menu.Dropdown props and a div ref. Item accepts Menu.Item props, a polymorphic component, and the corresponding ref, so it can render a custom anchor or button. Label and Separator accept Menu.Label/Menu.Divider props and div refs. Separator exposes the separator role. Custom actions can use Item's onClick; custom links can use component="a" and href.

## Mantine styling

OpenIn owns all Menu style selectors, including dropdown, item, itemLabel, itemSection, label, divider, and arrow. Pass styles/classNames/attributes or use OpenIn.extend in the Mantine theme. Native Menu themes still apply. Provider components and OpenInItem also have their own theme keys and item/itemLabel/itemSection/itemIndicator selectors. OpenInTrigger has the complete Button Styles API. OpenInLabel and OpenInSeparator own label and divider selectors; Content uses root menu selectors and its own theme defaultProps.

All twelve AI Elements exports are represented, plus Target for Mantine-style custom triggers. No additional dependencies, shadcn, or Tailwind setup are required. The internal unused GitHub provider in the upstream source is not a public component and is not exposed here.
