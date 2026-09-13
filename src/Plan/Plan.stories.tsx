import { Button, createTheme, List, MantineProvider } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plan, PlanContent, PlanTrigger } from '../index';
import { PlanObjectExample } from '../stories/plan-object';

const meta = { title: 'Plan', component: Plan } satisfies Meta<typeof Plan>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: () => (
    <Plan>
      <Plan.Header>
        <div>
          <Plan.Title>Build the chat interface</Plan.Title>
          <Plan.Description>
            Review the implementation steps before starting.
          </Plan.Description>
        </div>
        <Plan.Trigger />
      </Plan.Header>
      <Plan.Content>
        <List>
          <List.Item>Create the layout</List.Item>
          <List.Item>Connect the transport</List.Item>
          <List.Item>Verify keyboard interaction</List.Item>
        </List>
      </Plan.Content>
      <Plan.Footer justify="flex-end">
        <Plan.Action>
          <Button variant="default">Edit plan</Button>
        </Plan.Action>
      </Plan.Footer>
    </Plan>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Plan: Plan.extend({
            defaultProps: { radius: 'sm' },
            styles: { root: { borderColor: 'var(--mantine-color-grape-5)' } },
          }),
          PlanContent: PlanContent.extend({
            styles: { body: { paddingInline: 28 } },
          }),
          PlanTrigger: PlanTrigger.extend({
            defaultProps: { color: 'grape', variant: 'light' },
          }),
        },
      })}
    >
      <Plan defaultOpened isStreaming>
        <Plan.Header>
          <div>
            <Plan.Title order={2} size="h4" shimmerProps={{ duration: 3 }}>
              Review a detailed implementation plan for the accessible chat
              interface
            </Plan.Title>
            <Plan.Description>
              Check behavior, public types, keyboard navigation, and package
              installation before the next release.
            </Plan.Description>
          </div>
          <Plan.Trigger aria-label="Show or hide implementation steps" />
        </Plan.Header>
        <Plan.Content>
          Adjust the theme through Mantine component defaults and Styles API
          selectors.
        </Plan.Content>
      </Plan>
    </MantineProvider>
  ),
};
export const WithUseObject: Story = { render: () => <PlanObjectExample /> };
