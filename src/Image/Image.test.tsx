import { createTheme, MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { DefaultGeneratedFile } from 'ai';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Image } from './Image';

describe('Image', () => {
  it('renders generated-file fields without forwarding binary data or provider metadata', () => {
    const file = new DefaultGeneratedFile({
      data: new Uint8Array([1, 2, 3]),
      mediaType: 'image/png',
      providerMetadata: { demo: { seed: 1 } },
    });
    const ref = createRef<HTMLImageElement>();
    render(
      <MantineProvider
        theme={createTheme({
          components: {
            AIImage: Image.extend({
              defaultProps: { radius: 'xl' },
              styles: { root: { borderWidth: 2 } },
            }),
          },
        })}
      >
        <Image
          ref={ref}
          base64={file.base64}
          mediaType={file.mediaType}
          uint8Array={file.uint8Array}
          providerMetadata={file.providerMetadata}
          alt="Generated chart"
        />
      </MantineProvider>,
    );
    const image = screen.getByRole('img', { name: 'Generated chart' });
    expect(image).toBe(ref.current);
    expect(image).toHaveAttribute('src', 'data:image/png;base64,AQID');
    expect(image).not.toHaveAttribute('uint8Array');
    expect(image).not.toHaveAttribute('providerMetadata');
    expect(image).not.toHaveAttribute('base64');
    expect(image).toHaveStyle({
      borderWidth: '2px',
      '--image-radius': 'var(--mantine-radius-xl)',
    });
  });
  it('uses Mantine fallback behavior, reports errors, and retries when the source changes', () => {
    const error = vi.fn();
    const view = (src: string) => (
      <MantineProvider>
        <Image
          src={src}
          fallbackSrc="/fallback.png"
          alt="Preview"
          onError={error}
          loading="lazy"
        />
      </MantineProvider>
    );
    const { rerender } = render(view('/broken.png'));
    fireEvent.error(screen.getByRole('img', { name: 'Preview' }));
    expect(error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('img', { name: 'Preview' })).toHaveAttribute(
      'src',
      '/fallback.png',
    );
    rerender(view('/replacement.png'));
    expect(screen.getByRole('img', { name: 'Preview' })).toHaveAttribute(
      'src',
      '/replacement.png',
    );
    expect(screen.getByRole('img', { name: 'Preview' })).toHaveAttribute(
      'loading',
      'lazy',
    );
    rerender(view('/broken.png'));
    expect(screen.getByRole('img', { name: 'Preview' })).toHaveAttribute(
      'src',
      '/broken.png',
    );
  });
});
