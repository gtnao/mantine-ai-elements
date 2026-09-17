import { useObject } from '@ai-sdk/react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Artifact } from '../index';
import {
  type ArtifactDocument,
  artifactSchema,
  fetchArtifact,
} from './artifact-stream';

export function ArtifactObjectExample() {
  const [opened, setOpened] = useState(true);
  const [validated, setValidated] = useState<ArtifactDocument>();
  const [notice, setNotice] = useState('Generate a report to review.');
  const [actionError, setActionError] = useState<string>();
  const { object, submit, isLoading, error, stop } = useObject({
    api: '/demo/artifact',
    schema: artifactSchema,
    fetch: fetchArtifact,
    onFinish: ({ object, error }) => {
      setValidated(object);
      setNotice(error ? 'Report validation failed.' : 'Report ready.');
      setActionError(error?.message);
    },
  });
  useEffect(() => () => stop(), [stop]);
  const content = [
    object?.title ? `# ${object.title}` : '',
    object?.description,
    object?.steps?.map((step) => `- ${step ?? ''}`).join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n');
  function generate(fail = false) {
    setOpened(true);
    setValidated(undefined);
    setActionError(undefined);
    setNotice('Generating report…');
    submit({ fail });
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setNotice('Report copied.');
      setActionError(undefined);
    } catch {
      setActionError('Copy failed. Select and copy the report text manually.');
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([content], { type: 'text/markdown;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chat-report.md';
    document.body.append(link);
    link.click();
    link.remove();
    // Release after the browser has consumed the download click.
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setNotice('Report downloaded.');
  }
  return (
    <Stack maw={640}>
      <Group>
        <Button disabled={isLoading} onClick={() => generate()}>
          Generate report
        </Button>
        <Button
          variant="default"
          disabled={isLoading}
          onClick={() => generate(true)}
        >
          Simulate failure
        </Button>
        {isLoading && (
          <Button
            variant="default"
            onClick={() => {
              stop();
              setNotice('Stopped. Partial report retained.');
            }}
          >
            Stop report
          </Button>
        )}
        {!opened && (
          <Button variant="default" onClick={() => setOpened(true)}>
            Reopen report
          </Button>
        )}
      </Group>
      {(error || actionError) && (
        <Alert color="red" title="Report error">
          {error?.message ?? actionError}
        </Alert>
      )}
      {opened && (
        <Artifact>
          <Artifact.Header>
            <div>
              <Artifact.Title>
                {object?.title || 'Generated report'}
              </Artifact.Title>
              <Artifact.Description>
                {isLoading
                  ? 'Receiving content…'
                  : validated
                    ? 'Ready to export'
                    : 'Draft'}
              </Artifact.Description>
            </div>
            <Artifact.Actions>
              <Artifact.Action
                label="Copy report"
                tooltip="Copy Markdown"
                disabled={!validated || isLoading}
                onClick={() => void copy()}
              >
                ⧉
              </Artifact.Action>
              <Artifact.Action
                label="Download report"
                tooltip="Download Markdown"
                disabled={!validated || isLoading}
                onClick={download}
              >
                ↓
              </Artifact.Action>
              <Artifact.Close
                label="Close report"
                onClick={() => setOpened(false)}
              />
            </Artifact.Actions>
          </Artifact.Header>
          <Artifact.Content
            mah={280}
            tabIndex={0}
            role="region"
            aria-label="Report content"
          >
            <Text style={{ whiteSpace: 'pre-wrap' }}>
              {content || 'The report will appear here.'}
            </Text>
          </Artifact.Content>
        </Artifact>
      )}
      <Text role="status">{error ? 'Report request failed.' : notice}</Text>
      <Text size="xs" c="dimmed">
        Closing hides the panel while generation continues. Copy and download
        become available after validation.
      </Text>
    </Stack>
  );
}
