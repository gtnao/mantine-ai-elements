import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationQuote,
  InlineCitationSource,
  InlineCitationText,
  OpenIn,
  OpenInChatGPT,
  OpenInClaude,
  OpenInContent,
  OpenInCursor,
  OpenInItem,
  OpenInLabel,
  OpenInScira,
  OpenInSeparator,
  OpenInT3,
  OpenInTrigger,
  OpenInv0,
  Plan,
  PlanAction,
  PlanContent,
  PlanDescription,
  PlanFooter,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
  PromptInputSubmit,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from 'mantine-ai-elements';
import AttachmentExample from './attachments';
import { ChainOfThoughtChatExample } from './chain-of-thought-chat';
import Chat from './chat';
import CodeExample from './code';
import ConfirmationChat from './confirmation';
import ContextExample from './context';
import ConversationDemo from './conversation';
import ImageExample from './image';
import MessageExample from './message';
import { PlanObjectExample } from './plan-object';
import PromptAttachments from './prompt-attachments';
import QuestionExample from './question';
import { QueueChatExample } from './queue';
import ShimmerExample from './shimmer';
import { ObjectTasks } from './task-object';

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
      <ContextExample />
      <ChainOfThought data-testid="packaged-chain">
        <ChainOfThoughtHeader>Packaged progress</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep label="Read references" status="active">
            <ChainOfThoughtSearchResults>
              <ChainOfThoughtSearchResult
                component="a"
                href="/reference"
                styles={{ label: { fontWeight: 700 } }}
              >
                Packaged source
              </ChainOfThoughtSearchResult>
            </ChainOfThoughtSearchResults>
            <ChainOfThoughtImage caption="Preview caption">
              <span>Visual placeholder</span>
            </ChainOfThoughtImage>
          </ChainOfThoughtStep>
        </ChainOfThoughtContent>
      </ChainOfThought>
      <section data-testid="packaged-chain-chat">
        <ChainOfThoughtChatExample />
      </section>
      <Plan data-testid="packaged-plan">
        <PlanHeader>
          <div>
            <PlanTitle>Packaged plan</PlanTitle>
            <PlanDescription>
              A plan composed in a server component.
            </PlanDescription>
          </div>
          <PlanTrigger />
        </PlanHeader>
        <PlanContent styles={{ body: { paddingInline: 23 } }}>
          Plan steps
        </PlanContent>
        <PlanFooter>
          <PlanAction>Persistent footer</PlanAction>
        </PlanFooter>
      </Plan>
      <section data-testid="packaged-plan-object">
        <PlanObjectExample />
      </section>
      <Task
        data-testid="packaged-task"
        defaultOpened={false}
        styles={{ body: { borderInlineStartWidth: 3 } }}
      >
        <TaskTrigger title="Packaged task" />
        <TaskContent>
          <TaskItem>
            Read <TaskItemFile component="span">package.json</TaskItemFile>
          </TaskItem>
        </TaskContent>
      </Task>
      <section data-testid="packaged-task-object">
        <ObjectTasks />
      </section>
      <section data-testid="packaged-queue-chat">
        <QueueChatExample />
      </section>
      <Checkpoint
        data-testid="packaged-checkpoint"
        styles={{ line: { opacity: 0.4 } }}
      >
        <CheckpointIcon size={24} />
        <CheckpointTrigger tooltip="Restore the saved chat">
          Packaged checkpoint
        </CheckpointTrigger>
      </Checkpoint>
      <OpenIn
        query="A packaged query & Unicode 日本語"
        styles={{ dropdown: { borderRadius: 17 } }}
      >
        <OpenInTrigger>Open packaged query</OpenInTrigger>
        <OpenInContent>
          <OpenInLabel>Services</OpenInLabel>
          <OpenInChatGPT disabled />
          <OpenInClaude />
          <OpenInCursor />
          <OpenInT3 />
          <OpenInScira />
          <OpenInv0 />
          <OpenInSeparator />
          <OpenInItem component="a" href="/custom-assistant">
            Custom assistant
          </OpenInItem>
        </OpenInContent>
      </OpenIn>
      <p data-testid="inline-citation">
        <InlineCitation>
          <InlineCitationText>A packaged citation.</InlineCitationText>
          <InlineCitationCard transitionProps={{ duration: 0 }}>
            <InlineCitationCardTrigger
              sources={['https://example.com/one', 'https://example.com/two']}
            />
            <InlineCitationCardBody>
              <InlineCitationCarousel styles={{ header: { padding: 19 } }}>
                <InlineCitationCarouselHeader>
                  <InlineCitationCarouselPrev />
                  <InlineCitationCarouselNext />
                  <InlineCitationCarouselIndex />
                </InlineCitationCarouselHeader>
                <InlineCitationCarouselContent>
                  <InlineCitationCarouselItem>
                    <InlineCitationSource
                      title="Packaged source one"
                      url="https://example.com/one"
                    >
                      <InlineCitationQuote>Evidence one.</InlineCitationQuote>
                    </InlineCitationSource>
                  </InlineCitationCarouselItem>
                  <InlineCitationCarouselItem>
                    <InlineCitationSource
                      title="Packaged source two"
                      url="https://example.com/two"
                    />
                  </InlineCitationCarouselItem>
                </InlineCitationCarouselContent>
              </InlineCitationCarousel>
            </InlineCitationCardBody>
          </InlineCitationCard>
        </InlineCitation>
      </p>
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
