'use client';
import { Button } from '@mantine/core';
import { DefaultGeneratedFile } from 'ai';
import { AIImage } from 'mantine-ai-elements';
import NextImage from 'next/image';
import { useState } from 'react';

const file = new DefaultGeneratedFile({
  data: new TextEncoder().encode(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16"><rect width="24" height="16" fill="#7950f2"/></svg>',
  ),
  mediaType: 'image/svg+xml',
});
export default function ImageExample() {
  const [src, setSrc] = useState('/image-invalid.png');
  return (
    <section data-testid="image-example">
      <AIImage
        base64={file.base64}
        mediaType={file.mediaType}
        alt="Generated image"
        w={96}
      />
      <AIImage
        src={src}
        fallbackSrc="/image-preview.svg"
        alt="Image fallback"
        w={96}
      />
      <AIImage
        component={NextImage}
        src="/image-preview.svg"
        width={24}
        height={16}
        unoptimized
        alt="Next image"
      />
      <Button onClick={() => setSrc('/image-preview.svg')}>
        Replace image source
      </Button>
    </section>
  );
}
