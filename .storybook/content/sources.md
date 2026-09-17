# Sources

Group the references used in an answer behind a disclosure. Source links use Mantine Anchor; the application supplies the count, URLs, and titles.

```tsx
import { Source, Sources } from 'mantine-ai-elements';

<Sources>
  <Sources.Trigger count={sources.length} />
  <Sources.Content>
    {sources.map((source) => (
      <Source key={source.sourceId} href={source.url} title={source.title} />
    ))}
  </Sources.Content>
</Sources>
```

Import the package stylesheet once with Mantine styles. SourcesTrigger and SourcesContent are also named exports; Source is additionally available as Sources.Source.

## AI SDK

Filter `message.parts` for `type === 'source-url'`. Those parts provide `sourceId`, `url`, and optional `title`. Use sourceId for the key. Your provider and server must send sources; this component does not search the web or fetch link metadata. The Storybook example feeds real source-url chunks through useChat.

A `source-document` part provides a title, media type, and optional filename, but no URL. Render document sources with custom children or [Attachments](./attachments.md), or supply an application-owned document route. Do not treat a document source ID as a URL.

## Disclosure

Sources accepts Box/div props, a div ref, and Mantine `opened`, `defaultOpened`, `onChange(opened)`, and `disabled`. It starts closed. Changing the source count does not change the open state. Zero sources still render the trigger; the application can hide an empty collection when appropriate.

Trigger accepts UnstyledButton/button props and a button ref. It displays “Used N sources” (singular for one). Children replace its entire contents for custom wording, localization, or icons. Its type is always button, its onClick can cancel toggling with preventDefault, and native disabled behavior is preserved.

Content forwards Mantine Collapse props and its div ref. The root controls expanded. It supports transitionDuration, keepMounted, and keepMountedMode. Multiple Content children are supported; each has a unique ID and a region labelled by the shared trigger. Use one trigger per root. You may supply content IDs and an explicit trigger aria-controls list if needed.

## Links and customization

Source accepts normal Anchor/anchor props, an anchor ref, a polymorphic component, and its own root Styles API. The default target is `_blank` with `rel="noreferrer"`; override target and rel for your application. Links retain ordinary Mantine Anchor navigation behavior. The title supplies both the visible label and native title attribute; an absent/empty title falls back to href. Children replace the complete link content. The optional icon replaces the default book icon; icon={null} removes it.

Sources exposes root, trigger, chevron, content, and body style selectors. Body owns spacing inside Collapse. Use Sources.extend(...) in the Mantine theme or pass styles/classNames directly. Source has a separate theme key and root style selector while retaining the native Anchor theme and variables. Link text wraps to fit narrow containers.

Trigger/Content use their own theme defaultProps and root-owned style selectors. Default disclosure buttons support Enter/Space. Collapse follows Mantine's respectReducedMotion setting; the chevron also honors the browser preference.

## AI Elements mapping

All four upstream exports are represented. Mantine disclosure props replace the underlying Radix state convention. Custom trigger/link content and navigation props remain available. The count-one label and missing-title fallback improve default labels. No shadcn or Tailwind setup is required.
