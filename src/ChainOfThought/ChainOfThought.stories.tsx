import { createTheme, Image, MantineProvider } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ChainOfThought,
  ChainOfThoughtSearchResult,
  ChainOfThoughtStep,
} from '../index';
import { ChainOfThoughtChatExample } from '../stories/chain-of-thought-chat';

const meta = {
  title: 'ChainOfThought',
  component: ChainOfThought,
} satisfies Meta<typeof ChainOfThought>;
export default meta;
type Story = StoryObj<typeof meta>;
const preview =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='120' viewBox='0 0 400 120'%3E%3Crect width='400' height='120' fill='%234c2b7f'/%3E%3Cpath d='M20 100L100 50L180 75L260 30L380 15' fill='none' stroke='%23e599f7' stroke-width='5'/%3E%3C/svg%3E";
function Steps() {
  return (
    <>
      <ChainOfThought.Step
        label="Review reference documents"
        status="complete"
        description="Compare the available component APIs."
      >
        <ChainOfThought.SearchResults>
          <ChainOfThought.SearchResult
            component="a"
            href="https://example.com/reference"
          >
            Reference guide
          </ChainOfThought.SearchResult>
          <ChainOfThought.SearchResult>
            A source title that wraps cleanly when the viewport is narrow
          </ChainOfThought.SearchResult>
        </ChainOfThought.SearchResults>
      </ChainOfThought.Step>
      <ChainOfThought.Step
        label="Inspect the supplied illustration"
        status="complete"
        icon={<span aria-hidden="true">▧</span>}
      >
        <ChainOfThought.Image caption="Illustrative data supplied by the application.">
          <Image
            src={preview}
            alt="An illustrative rising line"
            fit="contain"
            h={120}
          />
        </ChainOfThought.Image>
      </ChainOfThought.Step>
      <ChainOfThought.Step
        label="Summarize the findings"
        description="Prepare a short explanation of the results."
        status="active"
      />
      <ChainOfThought.Step label="Review the final response" status="pending" />
    </>
  );
}
export const Basic: Story = {
  render: () => (
    <ChainOfThought defaultOpened>
      <ChainOfThought.Header />
      <ChainOfThought.Content>
        <Steps />
      </ChainOfThought.Content>
    </ChainOfThought>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          ChainOfThought: ChainOfThought.extend({
            styles: { trigger: { color: 'var(--mantine-color-grape-5)' } },
          }),
          ChainOfThoughtStep: ChainOfThoughtStep.extend({
            styles: {
              line: { borderColor: 'var(--mantine-color-grape-5)' },
              label: { fontWeight: 600 },
            },
          }),
          ChainOfThoughtSearchResult: ChainOfThoughtSearchResult.extend({
            defaultProps: { color: 'grape', radius: 'sm', variant: 'outline' },
          }),
        },
      })}
    >
      <ChainOfThought defaultOpened>
        <ChainOfThought.Header>
          Application progress with Mantine customization
        </ChainOfThought.Header>
        <ChainOfThought.Content>
          <Steps />
        </ChainOfThought.Content>
      </ChainOfThought>
    </MantineProvider>
  ),
};
export const WithUseChat: Story = {
  render: () => <ChainOfThoughtChatExample />,
};
