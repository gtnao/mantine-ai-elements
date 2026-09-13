# Sandbox

Display generated code and tool output in a collapsible Mantine card with tabs. Sandbox is a presentation component; code execution, approval, and result collection belong to your application's backend.

```tsx
import { CodeBlock, Sandbox } from 'mantine-ai-elements';

<Sandbox>
  <Sandbox.Header title={filename} state={toolPart.state} />
  <Sandbox.Content>
    <Sandbox.Tabs defaultValue="code">
      <Sandbox.TabsBar>
        <Sandbox.TabsList aria-label="Code and output">
          <Sandbox.TabsTrigger value="code">Code</Sandbox.TabsTrigger>
          <Sandbox.TabsTrigger value="output">Output</Sandbox.TabsTrigger>
        </Sandbox.TabsList>
      </Sandbox.TabsBar>
      <Sandbox.TabContent value="code">
        <CodeBlock code={code} language="typescript">
          <CodeBlock.CopyButton />
        </CodeBlock>
      </Sandbox.TabContent>
      <Sandbox.TabContent value="output">{renderOutput(toolPart)}</Sandbox.TabContent>
    </Sandbox.Tabs>
  </Sandbox.Content>
</Sandbox>
```

`filename`, `code`, `toolPart`, and `renderOutput` come from your application. Narrow your AI SDK tool type before accessing its input or output. Do not assume every state contains a completed result.

## Parts

| Export / compound name | API |
| --- | --- |
| `Sandbox` | Paper props; `opened`, `defaultOpened` (true), `onChange`, and `disabled` |
| `SandboxHeader` / `.Header` | Native button props; required `state`, optional ReactNode `title`, `icon`, and `statusBadgeProps` |
| `SandboxContent` / `.Content` | Collapse props except `expanded`, which comes from the parent |
| `SandboxTabs` / `.Tabs` | Mantine Tabs props, including controlled `value` / `onChange`, `defaultValue`, orientation, colors, and panel retention |
| `SandboxTabsBar` / `.TabsBar` | Flex props; container for the tab list and application actions |
| `SandboxTabsList` / `.TabsList` | Native Tabs.List props; provide an accessible label |
| `SandboxTabsTrigger` / `.TabsTrigger` | Native Tabs.Tab props, including required `value`, disabled state, and left/right sections |
| `SandboxTabContent` / `.TabContent` | Native Tabs.Panel props, including required `value` and `keepMounted` |

`SandboxRootProps` is an alias for `SandboxProps`, preserving the upstream type name. All parts have named and compound exports. Use named exports when composing client modules from a Next.js Server Component.

Header and Content require a Sandbox parent. Tabs work independently of Sandbox, while their list, triggers, and panels require a Tabs parent. Opening the disclosure does not select a tab or change tool state. Header `onClick` can cancel opening with `preventDefault()`; disabled headers do not toggle. Header is a non-submit button.

Tabs use Mantine's native `onChange` rather than Radix's `onValueChange`. Native keyboard activation, disabled-tab skipping, looping, vertical orientation, RTL, and `activateTabWithKeyboard` settings remain available. Native tab `onClick` observes activation; it is not a cancellation hook. Use a controlled tab value to own selection decisions. Mantine keeps inactive panels mounted by default; configure `keepMounted` and `keepMountedMode` as needed.

## AI SDK states

Header uses the shared ToolStatusBadge and supports all seven current tool states:

| State | Default label |
| --- | --- |
| `input-streaming` | Pending |
| `input-available` | Running |
| `approval-requested` | Awaiting Approval |
| `approval-responded` | Responded |
| `output-available` | Completed |
| `output-error` | Error |
| `output-denied` | Denied |

Customize or localize the badge with `statusBadgeProps`, including its children. Display errors and denied results in your output renderer. A status badge does not perform tool approval or execute code.

The **With Use Chat** example uses the real `useChat` hook with typed code-tool input/output and a deterministic streaming transport. It demonstrates partial input, stopping, retrying, successful output, tool errors, request errors, and copying source code. Fixture output is supplied by the transport; the demo never evaluates generated code. Replace that transport with your backend to connect an execution service.

## Mantine theme and styles

Each part supports an independent component name and `extend` API. Root exposes `root` and native Paper variables. Header exposes `root`, `icon`, `title`, `status`, and `chevron`. Content exposes `root`. Tabs exposes native `root`, `list`, `tab`, `tabLabel`, `tabSection`, and `panel` selectors plus native Tabs variables. TabsBar exposes `root`; List exposes `list`; Trigger exposes `tab`, `tabLabel`, and `tabSection`; TabContent exposes `panel`.

```tsx
<Sandbox.Tabs defaultValue="code" color="grape">
  <Sandbox.TabsList>
    <Sandbox.TabsTrigger value="code" styles={{ tabLabel: { fontWeight: 700 } }}>
      Code
    </Sandbox.TabsTrigger>
  </Sandbox.TabsList>
  <Sandbox.TabContent value="code">Your code renderer</Sandbox.TabContent>
</Sandbox.Tabs>
```

Native refs and root attributes are forwarded. Customize all tab child selectors through SandboxTabs, or through the corresponding part's styles. Use the parent Tabs `unstyled` setting to remove native tab styling consistently across the group.

## AI Elements mapping

All eight upstream components are provided. Paper, UnstyledButton, Collapse, and Tabs replace shadcn primitives. AI SDK status presentation reuses ToolStatusBadge. Code highlighting/copying is composed with CodeBlock; error rendering is application-owned. Sandbox itself does not include an execution engine, iframe, or stack-trace parser.
