'use client';
import { Button, Image, Stack, Text } from '@mantine/core';
import { type ComponentProps, useContext, useState } from 'react';
import { type ExtraProps, StreamdownContext } from 'streamdown';
import { downloadBlob, useResponse } from './response-context';
export function ResponseImage({
  node: _node,
  src,
  alt,
  onError,
  ...props
}: ComponentProps<'img'> & ExtraProps) {
  const { controls, isAnimating } = useContext(StreamdownContext);
  const { translations: t } = useResponse();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const config = typeof controls === 'object' ? controls.image : controls;
  if (
    typeof src !== 'string' ||
    src.startsWith('streamdown:') ||
    failedSource === src
  )
    return (
      <Text component="span" c="dimmed">
        {alt ?? t.imageNotAvailable}
      </Text>
    );
  const canDownload =
    config !== false &&
    (typeof config !== 'object' || config.download !== false);
  return (
    <Stack
      component="span"
      gap="xs"
      style={{ display: 'inline-flex', maxWidth: '100%' }}
    >
      <Image
        {...props}
        src={src}
        alt={alt ?? ''}
        fit="contain"
        onError={(event) => {
          setFailedSource(src);
          onError?.(event);
        }}
      />
      <span>
        {canDownload && (
          <Button
            variant="subtle"
            size="compact-xs"
            disabled={isAnimating}
            loading={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const response = await fetch(src);
                if (!response.ok)
                  throw new Error(`Image download failed (${response.status})`);
                downloadBlob(
                  await response.blob(),
                  new URL(src, window.location.href).pathname
                    .split('/')
                    .pop() || 'image',
                );
                setError('');
              } catch (cause) {
                setError(
                  cause instanceof Error ? cause.message : String(cause),
                );
              } finally {
                setLoading(false);
              }
            }}
          >
            {t.downloadImage}
          </Button>
        )}
        {error && (
          <Text component="span" c="red" role="alert">
            {error}
          </Text>
        )}
      </span>
    </Stack>
  );
}
