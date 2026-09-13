import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'Guides',
          ['Getting started', 'PromptInput', 'Customization'],
          '*',
        ],
      },
    },
  },
  globalTypes: {
    colorScheme: {
      toolbar: { title: 'Theme', items: ['light', 'dark'] },
    },
  },
  initialGlobals: { colorScheme: 'light' },
  decorators: [
    (Story, context) => (
      <MantineProvider forceColorScheme={context.globals.colorScheme}>
        <div style={{ maxWidth: 640, margin: '32px auto', padding: 16 }}>
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
};
export default preview;
