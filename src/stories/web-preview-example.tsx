import { useObject } from '@ai-sdk/react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { useFullscreenElement } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';
import { WebPreview, type WebPreviewLog } from '../index';
import { previewDocument } from './web-preview-document';
import { fetchPreview, previewSchema } from './web-preview-stream';

export function WebPreviewExample({
  generated = false,
}: {
  generated?: boolean;
}) {
  const [history, setHistory] = useState(['/demo/welcome']);
  const [position, setPosition] = useState(0);
  const [revision, setRevision] = useState(0);
  const [html, setHtml] = useState(previewDocument('Welcome preview'));
  const [logs, setLogs] = useState<WebPreviewLog[]>([]);
  const [notice, setNotice] = useState('Ready.');
  const [failure, setFailure] = useState<string>();
  const frame = useRef<HTMLIFrameElement>(null);
  const {
    ref: fullscreenRef,
    toggle,
    fullscreen,
  } = useFullscreenElement<HTMLDivElement>();
  const { submit, isLoading, stop, error } = useObject({
    api: '/demo/generate-preview',
    schema: previewSchema,
    fetch: fetchPreview,
    onFinish: ({ object, error }) => {
      if (error) {
        setFailure(error.message);
        setNotice('Preview validation failed.');
        return;
      }
      if (object) {
        setHtml(object.html);
        setRevision((value) => value + 1);
        setNotice('Generated preview ready.');
      }
    },
  });
  useEffect(() => () => stop(), [stop]);
  function navigate(url: string) {
    if (!['/demo/welcome', '/demo/details'].includes(url)) {
      setFailure(
        'This local example supports /demo/welcome and /demo/details.',
      );
      return;
    }
    setHistory((values) => [...values.slice(0, position + 1), url]);
    setPosition(position + 1);
    setHtml(
      previewDocument(
        url.endsWith('details') ? 'Details preview' : 'Welcome preview',
      ),
    );
    setFailure(undefined);
  }
  function move(next: number) {
    setPosition(next);
    setHtml(
      previewDocument(
        history[next]?.endsWith('details')
          ? 'Details preview'
          : 'Welcome preview',
      ),
    );
  }
  function generate(fail = false) {
    setFailure(undefined);
    setNotice('Generating preview…');
    submit({ fail });
  }
  return (
    <Stack>
      {generated && (
        <Group>
          <Button disabled={isLoading} onClick={() => generate()}>
            Generate preview
          </Button>
          <Button
            disabled={isLoading}
            variant="default"
            onClick={() => generate(true)}
          >
            Simulate failure
          </Button>
          {isLoading && (
            <Button
              variant="default"
              onClick={() => {
                stop();
                setNotice('Stopped. Previous preview retained.');
              }}
            >
              Stop generation
            </Button>
          )}
        </Group>
      )}
      {(failure || error) && (
        <Alert color="red" title="Preview error">
          {failure ?? error?.message}
        </Alert>
      )}
      <WebPreview
        ref={fullscreenRef}
        url={history[position]}
        onUrlChange={navigate}
        h={fullscreen ? '100vh' : 480}
        bg="var(--mantine-color-body)"
      >
        <WebPreview.Navigation>
          <WebPreview.NavigationButton
            tooltip="Go back"
            disabled={position === 0 || isLoading}
            onClick={() => move(position - 1)}
          >
            ←
          </WebPreview.NavigationButton>
          <WebPreview.NavigationButton
            tooltip="Go forward"
            disabled={position === history.length - 1 || isLoading}
            onClick={() => move(position + 1)}
          >
            →
          </WebPreview.NavigationButton>
          <WebPreview.NavigationButton
            tooltip="Reload preview"
            onClick={() => setRevision((value) => value + 1)}
          >
            ↻
          </WebPreview.NavigationButton>
          <WebPreview.Url disabled={isLoading} />
          <WebPreview.NavigationButton
            tooltip={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={() =>
              void toggle().catch(() =>
                setFailure('Fullscreen is unavailable in this browser.'),
              )
            }
          >
            ⛶
          </WebPreview.NavigationButton>
        </WebPreview.Navigation>
        <WebPreview.Body
          key={revision}
          ref={frame}
          srcDoc={html}
          title="Interactive preview"
          onLoad={() =>
            setLogs((values) => [
              ...values,
              {
                id: String(values.length),
                level: 'log',
                message: 'Frame load event received.',
                timestamp: new Date(),
              },
            ])
          }
          loading={
            isLoading && (
              <Text bg="var(--mantine-color-body)" p="sm">
                Generating preview…
              </Text>
            )
          }
        />
        <WebPreview.Console logs={logs} />
      </WebPreview>
      <Button
        variant="default"
        disabled={isLoading}
        onClick={() => navigate('/demo/details')}
      >
        Open details
      </Button>
      <Text role="status">{error ? 'Preview request failed.' : notice}</Text>
      <Text size="xs" c="dimmed">
        This local example owns its two-page history. Console entries record
        iframe load events; they do not verify remote-page success or capture
        the iframe console.
      </Text>
    </Stack>
  );
}
