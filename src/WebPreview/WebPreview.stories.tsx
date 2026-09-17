import { createTheme, MantineProvider } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  WebPreview,
  WebPreviewConsole,
  WebPreviewNavigationButton,
} from '../index';
import { WebPreviewExample } from '../stories/web-preview-example';

const meta = { title: 'WebPreview', component: WebPreview } satisfies Meta<
  typeof WebPreview
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = { render: () => <WebPreviewExample /> };
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          WebPreview: WebPreview.extend({
            defaultProps: { radius: 'xl' },
            styles: { root: { borderColor: 'var(--mantine-color-grape-5)' } },
          }),
          WebPreviewNavigationButton: WebPreviewNavigationButton.extend({
            defaultProps: { color: 'grape', variant: 'light' },
          }),
          WebPreviewConsole: WebPreviewConsole.extend({
            styles: { trigger: { color: 'var(--mantine-color-grape-6)' } },
          }),
        },
      })}
    >
      <WebPreviewExample />
    </MantineProvider>
  ),
};
export const WithUseObject: Story = {
  render: () => <WebPreviewExample generated />,
};
