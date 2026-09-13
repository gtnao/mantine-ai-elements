import { useChat } from '@ai-sdk/react';
import {
  Anchor,
  Button,
  createTheme,
  Group,
  MantineProvider,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { EmblaCarouselType } from 'embla-carousel';
import { useState } from 'react';
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselNext,
} from '../index';
import { createDemoTransport } from '../stories/demo-transport';

const meta = {
  title: 'InlineCitation',
  component: InlineCitation,
} satisfies Meta<typeof InlineCitation>;
export default meta;
type Story = StoryObj<typeof meta>;
const references = [
  {
    id: 'guide',
    url: 'https://example.com/reference',
    title: 'Reference guide',
    description:
      'Composable components let applications connect streamed answers to the references that support them.',
  },
  {
    id: 'details',
    url: 'https://example.com/details',
    title:
      'A deliberately long reference title covering implementation details and accessibility',
    description:
      'The application determines which sources support a passage. Source URL parts provide metadata; they do not automatically identify inline citation ranges.',
  },
  {
    id: 'local',
    url: '/local/reference',
    title: 'Local reference',
    description:
      'Relative references remain readable. Applications can provide their own navigation links.',
  },
];
function Slides({
  sources = references,
}: {
  sources?: { id: string; url: string; title?: string; description?: string }[];
}) {
  return (
    <InlineCitationCarousel.Content>
      {sources.map((source, index) => (
        <InlineCitationCarousel.Item
          key={source.id}
          aria-label={`Source ${index + 1} of ${sources.length}`}
        >
          <InlineCitation.Source
            title={source.title}
            url={source.url}
            description={source.description}
          >
            <InlineCitation.Quote>
              Keep the evidence close to the answer.
            </InlineCitation.Quote>
            <Anchor
              href={source.url}
              target="_blank"
              rel="noreferrer"
              size="sm"
            >
              Open reference
            </Anchor>
          </InlineCitation.Source>
        </InlineCitationCarousel.Item>
      ))}
    </InlineCitationCarousel.Content>
  );
}
function Header() {
  return (
    <InlineCitationCarousel.Header>
      <InlineCitationCarousel.Prev />
      <InlineCitationCarousel.Next />
      <InlineCitationCarousel.Index />
    </InlineCitationCarousel.Header>
  );
}
function CitationExample() {
  return (
    <Text component="p">
      An answer with{' '}
      <InlineCitation>
        <InlineCitation.Text>supporting evidence</InlineCitation.Text>
        <InlineCitation.Card>
          <InlineCitation.CardTrigger
            sources={references.map((source) => source.url)}
          />
          <InlineCitation.CardBody>
            <InlineCitationCarousel>
              <Header />
              <Slides />
            </InlineCitationCarousel>
          </InlineCitation.CardBody>
        </InlineCitation.Card>
        .
      </InlineCitation>{' '}
      Hover, focus, or tap the citation to inspect its sources.
    </Text>
  );
}
export const Basic: Story = { render: () => <CitationExample /> };
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          InlineCitationCard: InlineCitationCard.extend({
            defaultProps: { radius: 'lg', width: 360 },
            styles: {
              dropdown: { borderColor: 'var(--mantine-color-grape-5)' },
            },
          }),
          InlineCitationCardTrigger: InlineCitationCardTrigger.extend({
            defaultProps: { color: 'grape' },
          }),
          InlineCitationCarousel: InlineCitationCarousel.extend({
            styles: {
              header: { background: 'var(--mantine-color-grape-light)' },
              item: { padding: 24 },
            },
          }),
          InlineCitationCarouselNext: InlineCitationCarouselNext.extend({
            defaultProps: { color: 'grape' },
          }),
        },
      })}
    >
      <CitationExample />
    </MantineProvider>
  ),
};
function CarouselDemo() {
  const [count, setCount] = useState(3);
  const [rtl, setRtl] = useState(false);
  const [vertical, setVertical] = useState(false);
  const [loop, setLoop] = useState(false);
  const [api, setApi] = useState<EmblaCarouselType>();
  return (
    <Stack maw={480}>
      <Group>
        <Switch
          label="Right to left"
          checked={rtl}
          onChange={(event) => setRtl(event.currentTarget.checked)}
        />
        <Switch
          label="Vertical"
          checked={vertical}
          onChange={(event) => setVertical(event.currentTarget.checked)}
        />
        <Switch
          label="Loop"
          checked={loop}
          onChange={(event) => setLoop(event.currentTarget.checked)}
        />
      </Group>
      <Group>
        <Button onClick={() => setCount((value) => Math.max(0, value - 1))}>
          Remove source
        </Button>
        <Button onClick={() => setCount((value) => Math.min(3, value + 1))}>
          Add source
        </Button>
        <Button onClick={() => api?.scrollTo(1)}>Go to second source</Button>
      </Group>
      <InlineCitationCarousel
        dir={rtl ? 'rtl' : 'ltr'}
        orientation={vertical ? 'vertical' : 'horizontal'}
        opts={{ loop }}
        setApi={setApi}
        tabIndex={0}
        styles={{
          root: {
            border: '1px solid var(--mantine-color-default-border)',
            borderRadius: 8,
          },
        }}
      >
        <Header />
        <Slides sources={references.slice(0, count)} />
        <TextInput
          aria-label="Reference notes"
          placeholder="Arrow keys edit text here"
          m="sm"
        />
      </InlineCitationCarousel>
    </Stack>
  );
}
export const Carousel: Story = { render: () => <CarouselDemo /> };
function ChatDemo() {
  const [transport] = useState(() => createDemoTransport({ sources: true }));
  const chat = useChat({ transport });
  return (
    <Stack>
      <Text size="sm" c="dimmed">
        This demo associates the entire answer with its source URL parts.
        Mapping individual passages is application logic.
      </Text>
      <Button
        disabled={chat.status === 'streaming' || chat.status === 'submitted'}
        onClick={() => void chat.sendMessage({ text: 'Find references' })}
      >
        Find references
      </Button>
      {chat.messages
        .filter((message) => message.role === 'assistant')
        .map((message) => {
          const sources = message.parts
            .filter((part) => part.type === 'source-url')
            .map((part) => ({
              id: part.sourceId,
              url: part.url,
              title: part.title,
            }));
          const text = message.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('');
          return (
            <Text component="p" key={message.id}>
              <InlineCitation>
                <InlineCitation.Text>{text}</InlineCitation.Text>
                {sources.length > 0 && (
                  <InlineCitation.Card>
                    <InlineCitation.CardTrigger
                      sources={sources.map((source) => source.url)}
                    />
                    <InlineCitation.CardBody>
                      <InlineCitationCarousel>
                        <Header />
                        <Slides sources={sources} />
                      </InlineCitationCarousel>
                    </InlineCitation.CardBody>
                  </InlineCitation.Card>
                )}
              </InlineCitation>
            </Text>
          );
        })}
      {chat.error && <Text role="alert">{chat.error.message}</Text>}
    </Stack>
  );
}
export const WithAISDK: Story = { render: () => <ChatDemo /> };
