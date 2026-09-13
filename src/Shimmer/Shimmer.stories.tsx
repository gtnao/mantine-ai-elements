import { Button, createTheme, MantineProvider, Stack } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Shimmer } from './Shimmer';

const meta = {
  title: 'Shimmer',
  component: Shimmer,
  args: { children: 'Thinking about your question…' },
} satisfies Meta<typeof Shimmer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};
export const DurationsAndElements: Story = {
  render: () => (
    <Stack align="flex-start">
      <Shimmer component="h2" fz="xl" fw={700} duration={1}>
        A quick response
      </Shimmer>
      <Shimmer duration={4} spread={3}>
        Taking time to check the details…
      </Shimmer>
      <Shimmer component="span" duration={0}>
        Animation paused
      </Shimmer>
    </Stack>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Shimmer: Shimmer.extend({
            defaultProps: {
              c: 'grape.7',
              highlightColor: 'pink.2',
              duration: 3,
            },
            styles: { root: { fontWeight: 600 } },
          }),
        },
      })}
    >
      <Shimmer>Looking for a useful answer…</Shimmer>
    </MantineProvider>
  ),
};
export const ChangingText: Story = {
  render: () => {
    const [finished, setFinished] = useState(false);
    return (
      <Stack align="flex-start">
        <Shimmer role="status" duration={finished ? 0 : 2}>
          {finished ? 'Ready' : 'Processing your request…'}
        </Shimmer>
        <Button onClick={() => setFinished((value) => !value)}>
          Toggle status
        </Button>
      </Stack>
    );
  },
};
