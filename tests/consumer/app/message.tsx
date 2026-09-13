'use client';
import { Message } from 'mantine-ai-elements';

const markdown =
  '# Rendered answer\n\n| Name | Value |\n| --- | --- |\n| Total | 42 |\n\n$$x^2$$\n\n```mermaid\ngraph LR\n A --> B\n```';
export default function MessageExample() {
  return (
    <Message from="assistant" mt="xl" data-testid="message-example">
      <Message.Branch>
        <Message.Branch.Content>
          <Message.Content key="full">
            <Message.Response>{markdown}</Message.Response>
          </Message.Content>
          <Message.Content key="short">An alternative answer.</Message.Content>
        </Message.Branch.Content>
        <Message.Branch.Selector>
          <Message.Branch.Previous />
          <Message.Branch.Page />
          <Message.Branch.Next />
        </Message.Branch.Selector>
      </Message.Branch>
    </Message>
  );
}
