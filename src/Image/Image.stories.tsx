import {
  Button,
  createTheme,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DefaultGeneratedFile } from 'ai';
import { useState } from 'react';
import { Image } from './Image';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160"><rect width="240" height="160" fill="#e5dbff"/><path d="M20 140 90 35 140 110 180 60 225 140Z" fill="#7950f2"/><circle cx="195" cy="30" r="16" fill="#fcc419"/></svg>';
const file = new DefaultGeneratedFile({
  data: new TextEncoder().encode(svg),
  mediaType: 'image/svg+xml',
});
const url = `data:${file.mediaType};base64,${file.base64}`;
const meta = {
  title: 'Image',
  component: Image,
  args: {
    base64: file.base64,
    mediaType: file.mediaType,
    alt: 'Purple mountain illustration',
  },
} satisfies Meta<typeof Image>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};
export const FromURL: Story = {
  render: () => (
    <Image src={url} alt="URL image preview" loading="lazy" w={320} />
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          AIImage: Image.extend({
            defaultProps: { radius: 'xl', w: 320 },
            styles: {
              root: { border: '3px solid var(--mantine-color-grape-6)' },
            },
          }),
        },
      })}
    >
      <Image
        base64={file.base64}
        mediaType={file.mediaType}
        alt="Themed illustration"
      />
    </MantineProvider>
  ),
};
export const FallbackAndReplacement: Story = {
  render: () => {
    const [src, setSrc] = useState('data:image/png;base64,aW52YWxpZA==');
    const [failed, setFailed] = useState(false);
    return (
      <Stack align="flex-start">
        <Image
          src={src}
          fallbackSrc={url}
          alt="Preview with fallback"
          onError={() => setFailed(true)}
        />
        <Text role="status">
          {failed
            ? 'The preview could not load; showing a fallback.'
            : 'Preview loaded.'}
        </Text>
        <Button
          onClick={() => {
            setSrc(url);
            setFailed(false);
          }}
        >
          Load replacement
        </Button>
      </Stack>
    );
  },
};
