import { createTheme, Group, MantineProvider, Text } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Queue, QueueItemAction, type QueueTodo } from '../index';
import { QueueChatExample } from '../stories/queue-chat';

const meta = { title: 'Queue', component: Queue } satisfies Meta<typeof Queue>;
export default meta;
type Story = StoryObj<typeof meta>;
const todos: QueueTodo[] = [
  {
    id: 'docs',
    title: 'Write the project documentation',
    description: 'Document the public API and examples.',
    status: 'completed',
  },
  { id: 'chat', title: 'Connect the chat transport', status: 'pending' },
  ...Array.from({ length: 9 }, (_, index) => ({
    id: `review-${index}`,
    title: `Review component ${index + 1} with a long description that should remain accessible on a narrow screen`,
    status: 'pending' as const,
  })),
];
function Tasks() {
  const [items, setItems] = useState(todos);
  return (
    <Queue maw={600}>
      <Queue.Section>
        <Queue.SectionTrigger>
          <Queue.SectionLabel count={items.length} label="Tasks" />
        </Queue.SectionTrigger>
        <Queue.SectionContent>
          <Queue.List
            viewportProps={{
              tabIndex: 0,
              'aria-label': 'Queued tasks',
              role: 'region',
            }}
          >
            {items.map((item) => (
              <Queue.Item key={item.id}>
                <Group gap="xs" wrap="nowrap">
                  <Queue.ItemIndicator
                    completed={item.status === 'completed'}
                  />
                  <Queue.ItemContent completed={item.status === 'completed'}>
                    {item.title}
                  </Queue.ItemContent>
                  <Queue.ItemActions>
                    <Queue.ItemAction
                      aria-label={`Remove ${item.title}`}
                      onClick={() =>
                        setItems((current) =>
                          current.filter((task) => task.id !== item.id),
                        )
                      }
                    >
                      ×
                    </Queue.ItemAction>
                  </Queue.ItemActions>
                </Group>
                {item.description && (
                  <Queue.ItemDescription
                    completed={item.status === 'completed'}
                  >
                    {item.description}
                  </Queue.ItemDescription>
                )}
              </Queue.Item>
            ))}
          </Queue.List>
          {items.length === 0 && <Text size="sm">No queued tasks.</Text>}
        </Queue.SectionContent>
      </Queue.Section>
      <Queue.Section defaultOpened={false}>
        <Queue.SectionTrigger>
          <Queue.SectionLabel count={1} label="Message" />
        </Queue.SectionTrigger>
        <Queue.SectionContent>
          <Queue.List>
            <Queue.Item>
              <Queue.ItemContent>
                Use these files as reference.
              </Queue.ItemContent>
              <Queue.ItemAttachment>
                <Queue.ItemImage
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%23674fc9'/%3E%3C/svg%3E"
                  alt="Purple reference square"
                />
                <Queue.ItemFile>
                  component-requirements-and-notes.pdf
                </Queue.ItemFile>
              </Queue.ItemAttachment>
            </Queue.Item>
          </Queue.List>
        </Queue.SectionContent>
      </Queue.Section>
    </Queue>
  );
}
export const Basic: Story = { render: () => <Tasks /> };
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Queue: Queue.extend({
            defaultProps: { radius: 'sm', shadow: undefined },
            styles: { root: { borderColor: 'var(--mantine-color-grape-5)' } },
          }),
          QueueItemAction: QueueItemAction.extend({
            defaultProps: { color: 'grape', variant: 'light' },
            styles: { icon: { fontWeight: 700 } },
          }),
        },
      })}
    >
      <Tasks />
    </MantineProvider>
  ),
};

export const WithUseChat: Story = { render: () => <QueueChatExample /> };
