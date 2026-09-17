import { createTheme, MantineProvider } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Task, TaskItemFile } from '../index';
import { ObjectTasks } from '../stories/task-object';

const meta = { title: 'Task', component: Task } satisfies Meta<typeof Task>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: () => (
    <Task>
      <Task.Trigger title="Found project files" />
      <Task.Content>
        <Task.Item>Searching the component directory</Task.Item>
        <Task.Item>
          Read <Task.ItemFile component="span">src/index.ts</Task.ItemFile>
        </Task.Item>
        <Task.Item>Scanning 52 files</Task.Item>
      </Task.Content>
    </Task>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Task: Task.extend({
            styles: {
              body: { borderColor: 'var(--mantine-color-grape-5)' },
              trigger: { color: 'var(--mantine-color-grape-5)' },
            },
          }),
          TaskItemFile: TaskItemFile.extend({ defaultProps: { radius: 'xl' } }),
        },
      })}
    >
      <Task defaultOpened={false}>
        <Task.Trigger
          title="Review the complete public API before publishing the package"
          renderRoot={(props) => <button {...props} type="button" />}
        />
        <Task.Content>
          <Task.Item>
            Inspect{' '}
            <Task.ItemFile component="span">
              a-very-long-component-entry-point-filename.tsx
            </Task.ItemFile>
          </Task.Item>
        </Task.Content>
      </Task>
    </MantineProvider>
  ),
};
export const WithUseObject: Story = { render: () => <ObjectTasks /> };
