import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  stories: ['./*.mdx', '../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs'],
  staticDirs: ['../.docs-public'],
  core: { disableTelemetry: true },
};
export default config;
