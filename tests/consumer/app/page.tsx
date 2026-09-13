import {
  PromptInputSubmit,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from 'mantine-ai-elements';
import AttachmentExample from './attachments';
import Chat from './chat';
import CodeExample from './code';
import ConfirmationChat from './confirmation';
import ConversationDemo from './conversation';
import ImageExample from './image';
import MessageExample from './message';
import PromptAttachments from './prompt-attachments';
import QuestionExample from './question';
import ShimmerExample from './shimmer';

export default function Page() {
  return (
    <main style={{ maxWidth: 640, margin: '48px auto', padding: 16 }}>
      <h1>Mantine AI Elements</h1>
      <Chat />
      <ConversationDemo />
      <CodeExample />
      <MessageExample />
      <ShimmerExample />
      <AttachmentExample />
      <ImageExample />
      <PromptAttachments />
      <ConfirmationChat />
      <QuestionExample />
      <Sources
        data-testid="sources"
        styles={{ trigger: { color: 'rgb(10, 20, 30)' } }}
      >
        <SourcesTrigger count={1} />
        <SourcesContent transitionDuration={0}>
          <Source
            href="https://example.com/reference"
            title="Reference guide"
          />
        </SourcesContent>
      </Sources>
      <Reasoning
        data-testid="reasoning"
        duration={3}
        styles={{ trigger: { color: 'rgb(120, 20, 150)' } }}
      >
        <ReasoningTrigger />
        <ReasoningContent transitionDuration={0}>
          {'A **packaged** reasoning response.'}
        </ReasoningContent>
      </Reasoning>
      <Tool data-testid="tool" defaultOpened styles={{ body: { padding: 21 } }}>
        <ToolHeader
          type="dynamic-tool"
          toolName="lookup"
          state="output-available"
        />
        <ToolContent transitionDuration={0}>
          <ToolInput input={{ query: 'Mantine' }} />
          <ToolOutput output={false} />
        </ToolContent>
      </Tool>
      {/* A direct server-component import verifies the published client boundary. */}
      <div hidden>
        <PromptInputSubmit disabled submitLabel="Server import" />
      </div>
    </main>
  );
}
