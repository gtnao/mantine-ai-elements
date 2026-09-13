import { PromptInputSubmit } from 'mantine-ai-elements';
import Chat from './chat';
import ConversationDemo from './conversation';

export default function Page() {
  return (
    <main style={{ maxWidth: 640, margin: '48px auto', padding: 16 }}>
      <h1>Mantine AI Elements</h1>
      <Chat />
      <ConversationDemo />
      {/* A direct server-component import verifies the published client boundary. */}
      <div hidden>
        <PromptInputSubmit disabled submitLabel="Server import" />
      </div>
    </main>
  );
}
