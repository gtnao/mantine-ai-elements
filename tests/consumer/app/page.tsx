import {
  PromptInputSubmit,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from 'mantine-ai-elements';
import AttachmentExample from './attachments';
import Chat from './chat';
import CodeExample from './code';
import ConversationDemo from './conversation';
import ImageExample from './image';
import MessageExample from './message';
import PromptAttachments from './prompt-attachments';
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
      {/* A direct server-component import verifies the published client boundary. */}
      <div hidden>
        <PromptInputSubmit disabled submitLabel="Server import" />
      </div>
    </main>
  );
}
